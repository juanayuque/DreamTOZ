function renderListView() {
    const content = document.getElementById("content");
    const grouped = getGroupedByRegion();

    content.innerHTML = "";

    for (const region in grouped) {
        const regionHeader = document.createElement("h3");
        regionHeader.textContent = region;
        content.appendChild(regionHeader);

        const ul = document.createElement("ul");

        grouped[region].forEach(song => {
            const li = document.createElement("li");
            li.textContent = song.city;
            li.style.cursor = "pointer";
            li.style.margin = "4px 0";
            li.addEventListener("click", () => playSong(song));
            ul.appendChild(li);
        });

        content.appendChild(ul);
    }
}

function renderPaletteView() {
    const content = document.getElementById("content");
    const grouped = getGroupedByRegion();

    content.innerHTML = "";

    for (const region in grouped) {
        const regionHeader = document.createElement("h3");
        regionHeader.textContent = region;
        content.appendChild(regionHeader);

        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.flexWrap = "wrap";
        wrapper.style.gap = "1rem";
        wrapper.style.marginBottom = "2rem";

        grouped[region].forEach(song => {
            const img = document.createElement("img");
            img.src = song.image;
            img.alt = song.city;
            img.title = song.city;
            img.style.width = "60px";
            img.style.height = "60px";
            img.style.borderRadius = "50%";
            img.style.cursor = "pointer";
            img.style.objectFit = "cover";
            img.style.transition = "transform 0.2s";

            img.addEventListener("mouseenter", () => img.style.transform = "scale(1.1)");
            img.addEventListener("mouseleave", () => img.style.transform = "scale(1)");
            img.addEventListener("click", () => playSong(song));

            wrapper.appendChild(img);
        });

        content.appendChild(wrapper);
    }
}
function renderMapView() {
    const content = document.getElementById("content");
    content.innerHTML = `<p style="margin-bottom: 1rem;">(Map layout is a playful visual approximation – not geographically accurate!)</p>`;

    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(120px, 1fr))";
    grid.style.gap = "1rem";

    songs.forEach(song => {
        const tile = document.createElement("div");
        tile.style.border = "1px solid #ddd";
        tile.style.borderRadius = "10px";
        tile.style.padding = "10px";
        tile.style.background = "#fff";
        tile.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
        tile.style.cursor = "pointer";
        tile.style.textAlign = "center";

        const img = document.createElement("img");
        img.src = song.image;
        img.alt = song.city;
        img.style.width = "100%";
        img.style.borderRadius = "6px";

        const label = document.createElement("div");
        label.textContent = song.city;
        label.style.marginTop = "0.5rem";
        label.style.fontWeight = "500";
        label.style.fontSize = "0.9rem";

        tile.appendChild(img);
        tile.appendChild(label);
        tile.addEventListener("click", () => playSong(song));

        grid.appendChild(tile);
    });

    content.appendChild(grid);
}