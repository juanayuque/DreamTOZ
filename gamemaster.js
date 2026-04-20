const targetRate = 4096;
const windowSeconds = 5;
const minimumSampleSeconds = 5;
const maximumSampleSeconds = 15;
const sampleStepSeconds = 1;
const windowSampleCount = targetRate * windowSeconds;
const minimumSampleCount = targetRate * minimumSampleSeconds;
const maximumSampleCount = targetRate * maximumSampleSeconds;
const sampleStepCount = targetRate * sampleStepSeconds;
const matchFrequencies = createMatchFrequencies();
const silenceRmsThreshold = 0.003;
const gateChunkSeconds = 0.5;
const gateSampleCount = targetRate * gateChunkSeconds;
let winnerConfidenceThreshold = 85;
const featureGroups = [
    { key: "rhythm", label: "Rhythm and onset", start: 0, end: 33 }
];

let audioContext = null;
let mediaStream = null;
let mediaSource = null;
let processor = null;
let silentGain = null;
let referenceWindows = [];
let referencesBySong = new Map();
let liveSamples = [];
let gateSamples = [];
let isListening = false;
let isWaitingForAudio = false;
let nextAnalysisSampleCount = minimumSampleCount;

const listenBtn = document.getElementById("listenBtn");
const thresholdSelect = document.getElementById("thresholdSelect");
const nextBtn = document.getElementById("nextBtn");
const stopBtn = document.getElementById("stopBtn");
const statusText = document.getElementById("statusText");
const winnerBanner = document.getElementById("winnerBanner");
const winnerName = document.getElementById("winnerName");
const winnerRegion = document.getElementById("winnerRegion");
const matchPanel = document.getElementById("matchPanel");
const matchName = document.getElementById("matchName");
const matchRegion = document.getElementById("matchRegion");
const confidenceText = document.getElementById("confidenceText");
const confidenceFill = document.getElementById("confidenceFill");
const matchList = document.getElementById("matchList");
const debugList = document.getElementById("debugList");

listenBtn.addEventListener("click", startListening);
nextBtn.addEventListener("click", startNextRound);
stopBtn.addEventListener("click", stopListening);
thresholdSelect.addEventListener("change", () => {
    winnerConfidenceThreshold = Number(thresholdSelect.value);
    setStatus(`Winner threshold set to ${winnerConfidenceThreshold}%.`);
});
listenBtn.disabled = true;
nextBtn.disabled = true;
loadMatcher();

async function loadMatcher() {
    listenBtn.disabled = true;
    referenceWindows = [];
    setStatus("Loading prebuilt matcher...");

    try {
        const fingerprints = window.prebuiltFingerprints || await fetchFingerprints();
        referenceWindows = fingerprints.references.map((reference) => ({
            song: {
                city: reference.city,
                region: reference.region
            },
            offset: reference.offset,
            feature: reference.feature
        }));
        referencesBySong = groupReferencesBySong(referenceWindows);
        setStatus(`Matcher ready: ${fingerprints.songCount} songs, ${fingerprints.referenceCount} reference samples.`);
        listenBtn.disabled = false;
    } catch (error) {
        setStatus("Could not load the prebuilt matcher.");
    }
}

async function fetchFingerprints() {
    const response = await fetch("fingerprints.json");
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}

async function startListening() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        setStatus("Screen audio capture is not supported in this browser.");
        return;
    }

    try {
        mediaStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        });
    } catch (error) {
        setStatus("Audio sharing was cancelled.");
        return;
    }

    if (!mediaStream.getAudioTracks().length) {
        mediaStream.getTracks().forEach((track) => track.stop());
        mediaStream = null;
        setStatus("No audio track was shared. Enable audio in the browser picker.");
        return;
    }

    listenBtn.disabled = true;
    nextBtn.disabled = true;
    stopBtn.disabled = false;

    if (!referenceWindows.length) {
        setStatus("Matcher is not ready yet.");
        stopListening();
        return;
    }

    audioContext = audioContext || new AudioContext();
    await audioContext.resume();

    liveSamples = [];
    gateSamples = [];
    nextAnalysisSampleCount = minimumSampleCount;
    isListening = false;
    isWaitingForAudio = true;
    mediaSource = audioContext.createMediaStreamSource(mediaStream);
    processor = audioContext.createScriptProcessor(4096, 1, 1);
    silentGain = audioContext.createGain();
    silentGain.gain.value = 0;

    processor.onaudioprocess = handleAudioProcess;
    mediaSource.connect(processor);
    processor.connect(silentGain);
    silentGain.connect(audioContext.destination);

    mediaStream.getTracks().forEach((track) => {
        track.addEventListener("ended", stopListening);
    });

    clearMatch("Sampling shared audio.");
    setStatus("Waiting for audible game audio...");
}

function startNextRound() {
    if (!mediaStream || !referenceWindows.length) {
        listenBtn.disabled = !referenceWindows.length;
        nextBtn.disabled = true;
        stopBtn.disabled = true;
        setStatus("Start checking when ready.");
        return;
    }

    liveSamples = [];
    gateSamples = [];
    nextAnalysisSampleCount = minimumSampleCount;
    isListening = false;
    isWaitingForAudio = true;
    listenBtn.disabled = true;
    nextBtn.disabled = true;
    stopBtn.disabled = false;
    clearMatch("Sampling shared audio.");
    setStatus("Waiting for audible game audio...");
}

function stopListening() {
    isListening = false;
    isWaitingForAudio = false;

    if (processor) {
        processor.disconnect();
        processor.onaudioprocess = null;
        processor = null;
    }

    if (mediaSource) {
        mediaSource.disconnect();
        mediaSource = null;
    }

    if (silentGain) {
        silentGain.disconnect();
        silentGain = null;
    }

    if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        mediaStream = null;
    }

    liveSamples = [];
    gateSamples = [];
    nextAnalysisSampleCount = minimumSampleCount;
    listenBtn.disabled = !referenceWindows.length;
    nextBtn.disabled = true;
    stopBtn.disabled = true;
    setStatus(referenceWindows.length ? "Stopped. Start a new sample when ready." : "Matcher is not ready yet.");
}

function handleAudioProcess(event) {
    if (!isListening && !isWaitingForAudio) return;

    const input = event.inputBuffer.getChannelData(0);
    const chunk = downsampleInput(input, audioContext.sampleRate);

    if (isWaitingForAudio) {
        handleAudioGate(chunk);
        return;
    }

    for (let index = 0; index < chunk.length; index += 1) {
        liveSamples.push(chunk[index]);
    }

    if (liveSamples.length >= nextAnalysisSampleCount) {
        const sample = liveSamples.slice(0, nextAnalysisSampleCount);
        const result = analyzeSample(sample);

        if (result && result.confidence > winnerConfidenceThreshold) {
            declareWinner(result.best);
            return;
        }

        if (nextAnalysisSampleCount >= maximumSampleCount) {
            liveSamples = [];
            nextAnalysisSampleCount = minimumSampleCount;
            isListening = false;
            listenBtn.disabled = true;
            nextBtn.disabled = false;
            stopBtn.disabled = false;
            setStatus(`No winner above ${winnerConfidenceThreshold}% after ${maximumSampleSeconds} seconds. Click Next to check again.`);
            return;
        }

        nextAnalysisSampleCount = Math.min(nextAnalysisSampleCount + minimumSampleCount, maximumSampleCount);

        if (result) {
            setStatus(`Verdict updated. Continuing to ${nextAnalysisSampleCount / targetRate} seconds.`);
        }
    }
}

function handleAudioGate(chunk) {
    for (let index = 0; index < chunk.length; index += 1) {
        gateSamples.push(chunk[index]);
    }

    const maxGateSamples = gateSampleCount * 2;
    if (gateSamples.length > maxGateSamples) {
        gateSamples.splice(0, gateSamples.length - maxGateSamples);
    }

    if (gateSamples.length < gateSampleCount) return;

    const recentGate = gateSamples.slice(gateSamples.length - gateSampleCount);
    if (getRms(recentGate) < silenceRmsThreshold) return;

    isWaitingForAudio = false;
    isListening = true;
    liveSamples = [...recentGate];
    gateSamples = [];
    nextAnalysisSampleCount = minimumSampleCount;
    setStatus(`Audio detected. Checking at ${minimumSampleSeconds}, 10, and ${maximumSampleSeconds} seconds.`);
}

function analyzeSample(sample) {
    const rms = getRms(sample);

    if (rms < silenceRmsThreshold) {
        clearMatch("No audio detected.");
        setStatus("No audible game audio was detected in the sample.");
        isWaitingForAudio = true;
        isListening = false;
        liveSamples = [];
        gateSamples = [];
        return null;
    }

    const sampleWindows = [];
    for (let start = 0; start + windowSampleCount <= sample.length; start += sampleStepCount) {
        sampleWindows.push(makeFeature(sample.slice(start, start + windowSampleCount)));
    }

    const matches = Array.from(referencesBySong.values())
        .map((entry) => scoreSongSequence(entry, sampleWindows))
        .sort((left, right) => right.score - left.score);

    return renderMatches(matches.slice(0, 3));
}

function scoreSongSequence(entry, sampleWindows) {
    const references = entry.references;

    if (sampleWindows.length > references.length) {
        const scores = sampleWindows.map((feature) =>
            Math.max(...references.map((reference) => dotProduct(feature, reference.feature)))
        );

        return {
            song: entry.song,
            score: average(scores),
            groupScores: scoreLooseFeatureGroups(sampleWindows, references)
        };
    }

    let bestScore = -Infinity;
    let bestStart = 0;

    for (let start = 0; start <= references.length - sampleWindows.length; start += 1) {
        let total = 0;

        for (let index = 0; index < sampleWindows.length; index += 1) {
            total += dotProduct(sampleWindows[index], references[start + index].feature);
        }

        const score = total / sampleWindows.length;
        if (score > bestScore) {
            bestScore = score;
            bestStart = start;
        }
    }

    return {
        song: entry.song,
        score: bestScore,
        groupScores: scoreAlignedFeatureGroups(sampleWindows, references, bestStart)
    };
}

function scoreAlignedFeatureGroups(sampleWindows, references, start) {
    return Object.fromEntries(featureGroups.map((group) => {
        const scores = sampleWindows.map((feature, index) =>
            scoreFeatureGroup(feature, references[start + index].feature, group)
        );
        return [group.key, average(scores)];
    }));
}

function scoreLooseFeatureGroups(sampleWindows, references) {
    return Object.fromEntries(featureGroups.map((group) => {
        const scores = sampleWindows.map((feature) =>
            Math.max(...references.map((reference) => scoreFeatureGroup(feature, reference.feature, group)))
        );
        return [group.key, average(scores)];
    }));
}

function scoreFeatureGroup(left, right, group) {
    return cosineSimilarity(left.slice(group.start, group.end), right.slice(group.start, group.end));
}

function cosineSimilarity(left, right) {
    let dot = 0;
    let leftTotal = 0;
    let rightTotal = 0;

    for (let index = 0; index < left.length; index += 1) {
        dot += left[index] * right[index];
        leftTotal += left[index] * left[index];
        rightTotal += right[index] * right[index];
    }

    const length = Math.sqrt(leftTotal) * Math.sqrt(rightTotal);
    return length ? dot / length : 0;
}

function getRms(samples) {
    let total = 0;
    for (let index = 0; index < samples.length; index += 1) {
        total += samples[index] * samples[index];
    }
    return Math.sqrt(total / samples.length);
}

function clearMatch(message) {
    winnerBanner.hidden = true;
    matchPanel.classList.remove("winner");
    matchName.textContent = "No match yet";
    matchRegion.textContent = message;
    confidenceText.textContent = "0%";
    confidenceFill.style.width = "0%";
    matchList.innerHTML = "<li>Waiting for audible shared audio.</li>";
    debugList.innerHTML = "<p>No sample analyzed yet.</p>";
}

function renderMatches(matches) {
    const best = matches[0];
    if (!best) return null;

    const runnerUpScore = matches[1] ? matches[1].score : 0;
    const confidence = getConfidence(best.score, runnerUpScore);
    const runnerUp = matches[1] || null;
    winnerBanner.hidden = true;
    matchPanel.classList.remove("winner");
    matchName.textContent = best.song.city;
    matchRegion.textContent = best.song.region;
    confidenceText.textContent = `${confidence}%`;
    confidenceFill.style.width = `${confidence}%`;

    matchList.innerHTML = "";
    matches.forEach((match) => {
        const item = document.createElement("li");
        const score = getDisplayScore(match.score, best.score);
        item.innerHTML = `${match.song.city} <span>${match.song.region}, score ${score}</span>`;
        matchList.appendChild(item);
    });

    renderDebugBreakdown(best, runnerUp);
    setStatus(confidence >= 50 ? "Match updated." : "Weak match. Try sharing louder, cleaner audio.");
    return { best, confidence };
}

function renderDebugBreakdown(best, runnerUp) {
    debugList.innerHTML = "";

    featureGroups.forEach((group) => {
        const bestScore = best.groupScores ? best.groupScores[group.key] : 0;
        const runnerScore = runnerUp && runnerUp.groupScores ? runnerUp.groupScores[group.key] : 0;
        const displayScore = Math.round(clamp((bestScore + 1) / 2 * 100, 0, 100));
        const gap = Math.round((bestScore - runnerScore) * 100);
        const row = document.createElement("div");
        row.className = "debug-row";

        const name = document.createElement("span");
        name.textContent = group.label;

        const meter = document.createElement("div");
        meter.className = "debug-meter";
        const fill = document.createElement("span");
        fill.style.width = `${displayScore}%`;
        meter.appendChild(fill);

        const detail = document.createElement("small");
        detail.textContent = `score ${displayScore}, gap ${gap > 0 ? "+" : ""}${gap}`;

        row.appendChild(name);
        row.appendChild(meter);
        row.appendChild(detail);
        debugList.appendChild(row);
    });
}

function declareWinner(best) {
    isListening = false;
    isWaitingForAudio = false;
    liveSamples = [];
    gateSamples = [];
    nextAnalysisSampleCount = minimumSampleCount;
    winnerName.textContent = best.song.city;
    winnerRegion.textContent = best.song.region;
    winnerBanner.hidden = false;
    matchPanel.classList.add("winner");
    matchName.textContent = best.song.city;
    matchRegion.textContent = `Winner declared: ${best.song.region}`;
    confidenceText.textContent = "0%";
    confidenceFill.style.width = "0%";
    listenBtn.disabled = true;
    nextBtn.disabled = false;
    stopBtn.disabled = false;
    setStatus(`Winner declared: ${best.song.city}. Click Next when you are ready.`);
}

function groupReferencesBySong(references) {
    const grouped = new Map();

    references.forEach((reference) => {
        const existing = grouped.get(reference.song.city);
        if (existing) {
            existing.references.push(reference);
            return;
        }

        grouped.set(reference.song.city, {
            song: reference.song,
            references: [reference]
        });
    });

    return grouped;
}

function getConfidence(bestScore, runnerUpScore) {
    const scoreStrength = clamp((bestScore - 0.55) / 0.35, 0, 1);
    const separation = clamp((bestScore - runnerUpScore) / 0.08, 0, 1);
    return Math.round(clamp(scoreStrength * 60 + separation * 39, 0, 99));
}

function getDisplayScore(score, bestScore) {
    const relative = bestScore === 0 ? 0 : score / bestScore;
    return Math.round(clamp(relative * 100, 0, 100));
}

function average(values) {
    return values.reduce((total, value) => total + value, 0) / values.length;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function downsampleInput(input, sourceRate) {
    if (sourceRate === targetRate) {
        return Array.from(input);
    }

    const sampleCount = Math.max(1, Math.floor(input.length * targetRate / sourceRate));
    const output = new Array(sampleCount);

    for (let index = 0; index < sampleCount; index += 1) {
        const sourcePosition = index * sourceRate / targetRate;
        const sourceIndex = Math.floor(sourcePosition);
        const nextIndex = Math.min(sourceIndex + 1, input.length - 1);
        const amount = sourcePosition - sourceIndex;
        output[index] = input[sourceIndex] * (1 - amount) + input[nextIndex] * amount;
    }

    return output;
}

function makeFeature(samples) {
    const input = samples.length === windowSampleCount ? samples : padSamples(samples, windowSampleCount);
    let mean = 0;
    for (let index = 0; index < input.length; index += 1) {
        mean += input[index];
    }
    mean /= input.length;

    const powers = matchFrequencies.map((frequency) => {
        const coefficient = 2 * Math.cos(2 * Math.PI * frequency / targetRate);
        let previous = 0;
        let previous2 = 0;

        for (let index = 0; index < input.length; index += 1) {
            const envelope = 0.5 - 0.5 * Math.cos(2 * Math.PI * index / (input.length - 1));
            const current = (input[index] - mean) * envelope + coefficient * previous - previous2;
            previous2 = previous;
            previous = current;
        }

        const power = previous2 * previous2 + previous * previous - coefficient * previous * previous2;
        return Math.max(0, power);
    });

    const rhythm = makeRhythmFeature(input, mean);

    return normalizeVector(rhythm);
}

function makeRhythmFeature(input, mean) {
    const frameCount = 16;
    const frameSize = Math.floor(input.length / frameCount);
    const energies = [];

    for (let frame = 0; frame < frameCount; frame += 1) {
        let total = 0;
        const start = frame * frameSize;
        const end = frame === frameCount - 1 ? input.length : start + frameSize;

        for (let index = start; index < end; index += 1) {
            const value = input[index] - mean;
            total += value * value;
        }

        energies.push(Math.log1p(Math.sqrt(total / Math.max(1, end - start))));
    }

    const onsets = [];
    for (let index = 1; index < energies.length; index += 1) {
        onsets.push(Math.max(0, energies[index] - energies[index - 1]));
    }

    const onsetMean = onsets.reduce((total, value) => total + value, 0) / onsets.length;
    const onsetMax = Math.max(...onsets);

    return normalizeVector([
        ...normalizeVector(energies),
        ...normalizeVector(onsets),
        onsetMean,
        onsetMax
    ]);
}

function normalizeVector(values) {
    const mean = values.reduce((total, value) => total + value, 0) / values.length;
    const centered = values.map((value) => value - mean);
    const length = Math.sqrt(centered.reduce((total, value) => total + value * value, 0)) || 1;
    return centered.map((value) => value / length);
}

function dotProduct(left, right) {
    let total = 0;
    for (let index = 0; index < left.length; index += 1) {
        total += left[index] * right[index];
    }
    return total;
}

function padSamples(samples, length) {
    const output = new Float32Array(length);
    output.set(samples.slice(0, length));
    return output;
}

function createMatchFrequencies() {
    const count = 36;
    const minFrequency = 80;
    const maxFrequency = 1900;
    const ratio = Math.pow(maxFrequency / minFrequency, 1 / (count - 1));
    return Array.from({ length: count }, (_, index) => Math.round(minFrequency * Math.pow(ratio, index)));
}

function setStatus(message) {
    statusText.textContent = message;
}
