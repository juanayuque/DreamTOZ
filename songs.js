const songs = [
    { city: "Temple of Time", file: "Music TOZ/[MapleStory BGM] Temple of Time.mp3", image: "images/templeoftime.jpg" },
    { city: "Amoria", file: "Music TOZ/[MapleStory BGM] Amoria.mp3", image: "images/amoria.jpg" },
    { city: "Aquarium", file: "Music TOZ/[MapleStory BGM] Aquarium.mp3", image: "images/aquarium.jpg" },
    { city: "Ariant", file: "Music TOZ/[MapleStory BGM] Ariant.mp3", image: "images/ariant.jpg" },
    { city: "Shanghai", file: "Music TOZ/[MapleStory BGM] China_ Go Shanghai (Original Version).mp3", image: "images/shanghai.jpg" },
    { city: "El Nath", file: "Music TOZ/[MapleStory BGM] El Nath_ Snowy Village.mp3", image: "images/elnath.jpg" },
    { city: "Ellin Forest", file: "Music TOZ/[MapleStory BGM] Ellin Forest.mp3", image: "images/ellinforest.jpg" },
    { city: "Ellinia", file: "Music TOZ/[MapleStory BGM] Ellinia_ When the Morning Comes.mp3", image: "images/ellinia.jpg" },
    { city: "Ereve", file: "Music TOZ/[MapleStory BGM] Ereve_ Queen's Garden.mp3", image: "images/ereve.jpg" },
    { city: "Florina Beach", file: "Music TOZ/[MapleStory BGM] Florina Beach_ Beachway.mp3", image: "images/florinabeach.jpg" },
    { city: "Golden Temple", file: "Music TOZ/[MapleStory BGM] Golden Temple Town.mp3", image: "images/goldentemple.jpg" },
    { city: "Henesys", file: "Music TOZ/[MapleStory BGM] Henesys_ Floral Life.mp3", image: "images/henesys.jpg" },
    { city: "Herb Town", file: "Music TOZ/[MapleStory BGM] Herb Town_ White Herb.mp3", image: "images/herbtown.jpg" },
    { city: "Kerning City", file: "Music TOZ/[MapleStory BGM] Kerning City_ Bad Guys.mp3", image: "images/kerningcity.jpg" },
    { city: "Korean Folk Town", file: "Music TOZ/[MapleStory BGM] Korean Folk Town_ Downtown.mp3", image: "images/koreanfolktown.jpg" },
    { city: "Leafre", file: "Music TOZ/[MapleStory BGM] Leafre.mp3", image: "images/leafre.jpg" },
    { city: "Lith Harbor", file: "Music TOZ/[MapleStory BGM] Lith Harbor_ Above the Treetops.mp3", image: "images/lithharbor.jpg" },
    { city: "Ludibrium", file: "Music TOZ/[MapleStory BGM] Ludibrium_ Fantastic Thinking.mp3", image: "images/ludibrium.jpg" },
    { city: "Magatia", file: "Music TOZ/[MapleStory BGM] Magatia_ Dispute.mp3", image: "images/magatia.jpg" },
    { city: "Kuala Lumpur", file: "Music TOZ/[MapleStory BGM] Malaysia_ Kuala Lumpur Kampung Village.mp3", image: "images/kampungvillage.jpg" },
    { city: "Mu Lung", file: "Music TOZ/[MapleStory BGM] Mu Lung Hill.mp3", image: "images/mulung.jpg" },
    { city: "Mushroom Shrine", file: "Music TOZ/[MapleStory BGM] Mushroom Shrine_ Feeling.mp3", image: "images/mushroomshrine.jpg" },
    { city: "Nautilus", file: "Music TOZ/[MapleStory BGM] Nautilus.mp3", image: "images/nautilus.jpg" },
    { city: "New Leaf City", file: "Music TOZ/[MapleStory BGM] New Leaf City_ Town.mp3", image: "images/newleafcity.jpg" },
    { city: "Omega Sector", file: "Music TOZ/[MapleStory BGM] Omega Sector_ Let's March.mp3", image: "images/omegasector.jpg" },
    { city: "Orbis", file: "Music TOZ/[MapleStory BGM] Orbis_ Shinin' Harbor.mp3", image: "images/orbis.jpg" },
    { city: "Perion", file: "Music TOZ/[MapleStory BGM] Perion_ Nightmare.mp3", image: "images/perion.jpg" },
    { city: "Rien Village", file: "Music TOZ/[MapleStory BGM] Rien Village.mp3", image: "images/rien.jpg" },
    { city: "Showa", file: "Music TOZ/[MapleStory BGM] Showa_ Yume.mp3", image: "images/showa.jpg" },
    { city: "BoatQuayTown", file: "Music TOZ/[MapleStory BGM] Singapore_ Boat Quay Town.mp3", image: "images/boatquaytown.jpg" },
    { city: "Sleepywood", file: "Music TOZ/[MapleStory BGM] Sleepywood.mp3", image: "images/sleepywood.jpg" }
];

const cityName = document.getElementById("cityName");
const cityImage = document.getElementById("cityImage");
const audioPlayer = document.getElementById("audioPlayer");
const imagePalette = document.getElementById("imagePalette");

function loadPalette() {
    songs.forEach(song => {
        const img = document.createElement("img");
        img.src = song.image;
        img.alt = song.city;
        img.addEventListener("click", () => playSong(song));
        imagePalette.appendChild(img);
    });
}

function playSong(song) {
    cityName.textContent = song.city;
    cityImage.src = song.image;
    cityImage.style.display = "block";
    audioPlayer.src = song.file;
    audioPlayer.style.display = "block";
    audioPlayer.play();
}

loadPalette();