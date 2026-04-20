const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

global.window = {};
require("../songs.js");

const songs = global.window.songs || [];
const targetRate = 4096;
const windowSeconds = 5;
const stepSeconds = 1;
const windowSampleCount = targetRate * windowSeconds;
const stepSampleCount = targetRate * stepSeconds;
const matchFrequencies = createMatchFrequencies();
const root = path.resolve(__dirname, "..");

function decodeSong(file) {
    const result = spawnSync("ffmpeg", [
        "-v",
        "error",
        "-i",
        path.join(root, file),
        "-ac",
        "1",
        "-ar",
        String(targetRate),
        "-f",
        "f32le",
        "pipe:1"
    ], {
        encoding: "buffer",
        maxBuffer: 1024 * 1024 * 200
    });

    if (result.status !== 0) {
        const detail = result.error ? result.error.message : Buffer.from(result.stderr || "").toString();
        throw new Error(`ffmpeg failed for ${file}: ${detail}`);
    }

    return new Float32Array(result.stdout.buffer, result.stdout.byteOffset, result.stdout.byteLength / 4);
}

function buildSongWindows(song, samples) {
    const windows = [];

    if (samples.length <= windowSampleCount) {
        windows.push({
            city: song.city,
            region: song.region,
            offset: 0,
            feature: roundFeature(makeFeature(padSamples(samples, windowSampleCount)))
        });
        return windows;
    }

    for (let start = 0; start + windowSampleCount <= samples.length; start += stepSampleCount) {
        windows.push({
            city: song.city,
            region: song.region,
            offset: start / targetRate,
            feature: roundFeature(makeFeature(samples.subarray(start, start + windowSampleCount)))
        });
    }

    return windows;
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

function roundFeature(feature) {
    return feature.map((value) => Number(value.toFixed(6)));
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

const windows = [];

for (const song of songs) {
    process.stdout.write(`Fingerprinting ${song.city}...\n`);
    windows.push(...buildSongWindows(song, decodeSong(song.file)));
}

const output = {
    version: 1,
    targetRate,
    windowSeconds,
    stepSeconds,
    matchFrequencies,
    songCount: songs.length,
    referenceCount: windows.length,
    references: windows
};

fs.writeFileSync(path.join(root, "fingerprints.json"), `${JSON.stringify(output)}\n`);
process.stdout.write(`Wrote fingerprints.json with ${windows.length} reference samples for ${songs.length} songs.\n`);
