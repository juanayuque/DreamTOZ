const songs = [
    { city: "Temple of Time", region: "Ossyria", file: "Music TOZ/[MapleStory BGM] Temple of Time.mp3", image: "images/templeoftime.jpg" },
    { city: "Amoria", region: "Victoria", file: "Music TOZ/[MapleStory BGM] Amoria.mp3", image: "images/amoria.jpg" },
    { city: "Aquarium", region: "Ossyria", file: "Music TOZ/[MapleStory BGM] Aquarium.mp3", image: "images/aquarium.jpg" },
    { city: "Ariant", region: "Ossyria", file: "Music TOZ/[MapleStory BGM] Ariant.mp3", image: "images/ariant.jpg" },
    { city: "Shanghai", region: "World Tour", file: "Music TOZ/[MapleStory BGM] China_ Go Shanghai (Original Version).mp3", image: "images/shanghai.jpg" },
    { city: "El Nath", region: "Ossyria", file: "Music TOZ/[MapleStory BGM] El Nath_ Snowy Village.mp3", image: "images/elnath.jpg" },
    { city: "Ellin Forest", region: "Ossyria", file: "Music TOZ/[MapleStory BGM] Ellin Forest.mp3", image: "images/ellinforest.jpg" },
    { city: "Ellinia", region: "Victoria", file: "Music TOZ/[MapleStory BGM] Ellinia_ When the Morning Comes.mp3", image: "images/ellinia.jpg" },
    { city: "Ereve", region: "Ossyria", file: "Music TOZ/[MapleStory BGM] Ereve_ Queen's Garden.mp3", image: "images/ereve.jpg" },
    { city: "Florina Beach", region: "Victoria", file: "Music TOZ/[MapleStory BGM] Florina Beach_ Beachway.mp3", image: "images/florinabeach.jpg" },
    { city: "Golden Temple", region: "World Tour", file: "Music TOZ/[MapleStory BGM] Golden Temple Town.mp3", image: "images/goldentemple.jpg" },
    { city: "Henesys", region: "Victoria", file: "Music TOZ/[MapleStory BGM] Henesys_ Floral Life.mp3", image: "images/henesys.jpg" },
    { city: "Herb Town", region: "Ossyria", file: "Music TOZ/[MapleStory BGM] Herb Town_ White Herb.mp3", image: "images/herbtown.jpg" },
    { city: "Kerning City", region: "Victoria", file: "Music TOZ/[MapleStory BGM] Kerning City_ Bad Guys.mp3", image: "images/kerningcity.jpg" },
    { city: "Korean Folk Town", region: "Ossyria", file: "Music TOZ/[MapleStory BGM] Korean Folk Town_ Downtown.mp3", image: "images/koreanfolktown.jpg" },
    { city: "Leafre", region: "Ossyria", file: "Music TOZ/[MapleStory BGM] Leafre.mp3", image: "images/leafre.jpg" },
    { city: "Lith Harbor", region: "Victoria", file: "Music TOZ/[MapleStory BGM] Lith Harbor_ Above the Treetops.mp3", image: "images/lithharbor.jpg" },
    { city: "Ludibrium", region: "Ossyria", file: "Music TOZ/[MapleStory BGM] Ludibrium_ Fantastic Thinking.mp3", image: "images/ludibrium.jpg" },
    { city: "Magatia", region: "Ossyria", file: "Music TOZ/[MapleStory BGM] Magatia_ Dispute.mp3", image: "images/magatia.jpg" },
    { city: "Kampung Village", region: "World Tour", file: "Music TOZ/[MapleStory BGM] Malaysia_ Kuala Lumpur Kampung Village.mp3", image: "images/kampungvillage.jpg" },
    { city: "Mu Lung", region: "Ossyria", file: "Music TOZ/[MapleStory BGM] Mu Lung Hill.mp3", image: "images/mulung.jpg" },
    { city: "Mushroom Shrine", region: "World Tour", file: "Music TOZ/[MapleStory BGM] Mushroom Shrine_ Feeling.mp3", image: "images/mushroomshrine.jpg" },
    { city: "Nautilus", region: "Victoria", file: "Music TOZ/[MapleStory BGM] Nautilus.mp3", image: "images/nautilus.jpg" },
    { city: "New Leaf City", region: "Victoria", file: "Music TOZ/[MapleStory BGM] New Leaf City_ Town.mp3", image: "images/newleafcity.jpg" },
    { city: "Omega Sector", region: "Ossyria", file: "Music TOZ/[MapleStory BGM] Omega Sector_ Let's March.mp3", image: "images/omegasector.jpg" },
    { city: "Orbis", region: "Ossyria", file: "Music TOZ/[MapleStory BGM] Orbis_ Shinin' Harbor.mp3", image: "images/orbis.jpg" },
    { city: "Perion", region: "Victoria", file: "Music TOZ/[MapleStory BGM] Perion_ Nightmare.mp3", image: "images/perion.jpg" },
    { city: "Rien", region: "Victoria", file: "Music TOZ/[MapleStory BGM] Rien Village.mp3", image: "images/rien.jpg" },
    { city: "Showa", region: "World Tour", file: "Music TOZ/[MapleStory BGM] Showa_ Yume.mp3", image: "images/showa.jpg" },
    { city: "BoatQuayTown", region: "World Tour", file: "Music TOZ/[MapleStory BGM] Singapore_ Boat Quay Town.mp3", image: "images/boatquaytown.jpg" },
    { city: "CBD", region: "World Tour", file: "Music TOZ/[MapleStory BGM] Singapore_ CBD Town.mp3", image: "images/cbd.jpg" },
    { city: "Sleepywood", region: "Victoria", file: "Music TOZ/[MapleStory BGM] Sleepywood.mp3", image: "images/sleepywood.jpg" }
];

function getGroupedByRegion() {
    const grouped = {};
    songs.forEach(song => {
        if (!grouped[song.region]) grouped[song.region] = [];
        grouped[song.region].push(song);
    });
    return grouped;
}