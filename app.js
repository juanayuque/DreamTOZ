(function () {
    const { useEffect, useMemo, useRef, useState } = React;
    const h = React.createElement;

    const regionOrder = ["Victoria Island", "World Tour", "Orbis Boat"];

    function groupSongs(songList) {
        return regionOrder.map((region) => ({
            region,
            songs: songList.filter((song) => song.region === region)
        }));
    }

    function App() {
        const audioRef = useRef(null);
        const sequenceTimerRef = useRef(null);
        const songsList = window.songs || [];
        const groupedSongs = useMemo(() => groupSongs(window.songs || []), []);
        const [selectedSong, setSelectedSong] = useState(null);
        const [view, setView] = useState("lists");
        const [isSequencePlaying, setIsSequencePlaying] = useState(false);
        const [openRegions, setOpenRegions] = useState(() => new Set(regionOrder));

        useEffect(() => {
            songsList.forEach((song) => {
                const audio = new Audio(song.file);
                audio.preload = "auto";
            });

            return () => stopSequence();
        }, []);

        function playSong(song, keepSequenceRunning) {
            if (!keepSequenceRunning) {
                stopSequence();
            }

            setSelectedSong(song);

            requestAnimationFrame(() => {
                if (!audioRef.current) return;
                audioRef.current.src = song.file;
                audioRef.current.play().catch(() => {});
            });
        }

        function stopSequence() {
            if (sequenceTimerRef.current) {
                clearInterval(sequenceTimerRef.current);
                sequenceTimerRef.current = null;
            }
            setIsSequencePlaying(false);
        }

        function playSongsInOrder() {
            if (isSequencePlaying) {
                stopSequence();
                return;
            }

            let nextIndex = 0;
            setIsSequencePlaying(true);
            playSong(songsList[nextIndex], true);

            sequenceTimerRef.current = setInterval(() => {
                nextIndex += 1;

                if (nextIndex >= songsList.length) {
                    stopSequence();
                    return;
                }

                playSong(songsList[nextIndex], true);
            }, 3000);
        }

        return h(
            React.Fragment,
            null,
            h(
                "header",
                { className: "site-nav" },
                h(
                    "div",
                    { className: "nav-inner" },
                    h(
                        "a",
                        { href: "index.html", className: "brand" },
                        h("img", { src: "maple-leaf.png", alt: "" }),
                        h("span", null, "Dream MS Tower of Oz Music")
                    ),
                    h(
                        "nav",
                        { className: "nav-links", "aria-label": "Main navigation" },
                        h("a", { href: "index.html", className: "active" }, "Songs"),
                        h("a", { href: "practice.html" }, "Practice"),
                        h("a", { href: "gamemaster.html" }, "Game Master")
                    )
                )
            ),
            h(
                "main",
                { className: "app-shell" },
                h(
                    "section",
                    { className: "player-panel" },
                    h("p", { className: "eyebrow" }, "Tower Of Oz Songs"),
                    h("h1", null, selectedSong ? selectedSong.city : "Pick a town"),
                    h(
                        "p",
                        { className: "region-label" },
                        selectedSong ? selectedSong.region : "Choose by image or by list"
                    ),
                    h(
                        "div",
                        { className: "featured-image" },
                        selectedSong
                            ? h("img", { src: selectedSong.image, alt: selectedSong.city })
                            : h("span", null, "No song selected")
                    ),
                    h("audio", {
                        ref: audioRef,
                        controls: true,
                        className: "native-audio"
                    })
                ),
                h(
                    "section",
                    { className: "song-browser" },
                    h(
                        "div",
                        { className: "browser-toolbar" },
                        h("h2", null, "Song List"),
                        h(
                            "button",
                            {
                                className: isSequencePlaying ? "sequence-button active" : "sequence-button",
                                type: "button",
                                onClick: playSongsInOrder
                            },
                            isSequencePlaying ? "Stop ordered play" : "Play all in order"
                        ),
                        h(
                            "div",
                            { className: "view-toggle", role: "group", "aria-label": "View options" },
                            h(
                                "button",
                                {
                                    className: view === "images" ? "active" : "",
                                    type: "button",
                                    onClick: () => setView("images")
                                },
                                "Images"
                            ),
                            h(
                                "button",
                                {
                                    className: view === "lists" ? "active" : "",
                                    type: "button",
                                    onClick: () => setView("lists")
                                },
                                "Lists"
                            )
                        )
                    ),
                    view === "images"
                        ? h(ImageView, { groups: groupedSongs, selectedSong, onSelect: playSong })
                        : h(ListView, {
                            groups: groupedSongs,
                            openRegions,
                            selectedSong,
                            onSelect: playSong,
                            onToggle: (region, isOpen) => {
                                setOpenRegions((current) => {
                                    const next = new Set(current);
                                    if (isOpen) {
                                        next.add(region);
                                    } else {
                                        next.delete(region);
                                    }
                                    return next;
                                });
                            }
                        })
                )
            )
        );
    }

    function ImageView({ groups, selectedSong, onSelect }) {
        return h(
            "div",
            { className: "image-view" },
            groups.map((group) =>
                h(
                    "section",
                    { className: "region-block", key: group.region },
                    h("div", { className: "region-heading" }, h("h2", null, group.region), h("span", null, group.songs.length)),
                    h(
                        "div",
                        { className: "image-grid" },
                        group.songs.map((song) =>
                            h(
                                "button",
                                {
                                    className: selectedSong === song ? "song-card active" : "song-card",
                                    type: "button",
                                    key: `${group.region}-${song.city}`,
                                    onClick: () => onSelect(song)
                                },
                                h("img", { src: song.image, alt: song.city }),
                                h("span", null, song.city)
                            )
                        )
                    )
                )
            )
        );
    }

    function ListView({ groups, openRegions, selectedSong, onSelect, onToggle }) {
        return h(
            "div",
            { className: "list-view" },
            groups.map((group) =>
                h(
                    "details",
                    {
                        className: "song-list",
                        key: group.region,
                        open: openRegions.has(group.region),
                        onToggle: (event) => onToggle(group.region, event.currentTarget.open)
                    },
                    h("summary", null, h("span", null, group.region), h("strong", null, group.songs.length)),
                    h(
                        "div",
                        { className: "list-options" },
                        group.songs.map((song) =>
                            h(
                                "button",
                                {
                                    className: selectedSong === song ? "text-song active" : "text-song",
                                    type: "button",
                                    key: `${group.region}-${song.city}`,
                                    onClick: () => onSelect(song)
                                },
                                song.city
                            )
                        )
                    )
                )
            )
        );
    }

    ReactDOM.createRoot(document.getElementById("root")).render(h(App));
})();
