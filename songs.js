const songs = [
    {
        region: "Victoria Island",
        city: "Lith Harbor",
        file: "Music TOZ/[MapleStory BGM] Lith Harbor_ Above the Treetops.mp3",
        image: "images/lithharbor.jpg"
    },
    {
        region: "Victoria Island",
        city: "Henesys",
        file: "Music TOZ/[MapleStory BGM] Henesys_ Floral Life.mp3",
        image: "images/henesys.jpg"
    },
    {
        region: "Victoria Island",
        city: "Kerning City",
        file: "Music TOZ/[MapleStory BGM] Kerning City_ Bad Guys.mp3",
        image: "images/kerningcity.jpg"
    },
    {
        region: "Victoria Island",
        city: "Perion",
        file: "Music TOZ/[MapleStory BGM] Perion_ Nightmare.mp3",
        image: "images/perion.jpg"
    },
    {
        region: "Victoria Island",
        city: "Ellinia",
        file: "Music TOZ/[MapleStory BGM] Ellinia_ When the Morning Comes.mp3",
        image: "images/ellinia.jpg"
    },
    {
        region: "Victoria Island",
        city: "Nautilus Harbor",
        file: "Music TOZ/[MapleStory BGM] Nautilus.mp3",
        image: "images/nautilus.jpg"
    },
    {
        region: "Victoria Island",
        city: "Rien",
        file: "Music TOZ/[MapleStory BGM] Rien Village.mp3",
        image: "images/rien.jpg"
    },
    {
        region: "Victoria Island",
        city: "Sleepywood",
        file: "Music TOZ/[MapleStory BGM] Sleepywood.mp3",
        image: "images/sleepywood.jpg"
    },
    {
        region: "Victoria Island",
        city: "Florina Beach",
        file: "Music TOZ/[MapleStory BGM] Florina Beach_ Beachway.mp3",
        image: "images/florinabeach.jpg"
    },
    {
        region: "Victoria Island",
        city: "Amoria",
        file: "Music TOZ/[MapleStory BGM] Amoria.mp3",
        image: "images/amoria.jpg"
    },
    {
        region: "World Tour",
        city: "New Leaf City",
        file: "Music TOZ/[MapleStory BGM] New Leaf City_ Town.mp3",
        image: "images/newleafcity.jpg"
    },
    {
        region: "World Tour",
        city: "CBD",
        file: "Music TOZ/[MapleStory BGM] Singapore_ CBD Town.mp3",
        image: "images/cbd.jpg"
    },
    {
        region: "World Tour",
        city: "Boat Quay Town",
        file: "Music TOZ/[MapleStory BGM] Singapore_ Boat Quay Town.mp3",
        image: "images/boatquaytown.jpg"
    },
    {
        region: "World Tour",
        city: "Kampung Village",
        file: "Music TOZ/[MapleStory BGM] Malaysia_ Kuala Lumpur Kampung Village.mp3",
        image: "images/kampungvillage.jpg"
    },
    {
        region: "World Tour",
        city: "Golden Temple",
        file: "Music TOZ/[MapleStory BGM] Golden Temple Town.mp3",
        image: "images/goldentemple.jpg"
    },
    {
        region: "World Tour",
        city: "Shanghai",
        file: "Music TOZ/[MapleStory BGM] China_ Go Shanghai (Original Version).mp3",
        image: "images/shanghai.jpg"
    },
    {
        region: "World Tour",
        city: "Mushroom Shrine",
        file: "Music TOZ/[MapleStory BGM] Mushroom Shrine_ Feeling.mp3",
        image: "images/mushroomshrine.jpg"
    },
    {
        region: "World Tour",
        city: "Showa",
        file: "Music TOZ/[MapleStory BGM] Showa_ Yume.mp3",
        image: "images/showa.jpg"
    },
    {
        region: "Orbis Boat",
        city: "Orbis",
        file: "Music TOZ/[MapleStory BGM] Orbis_ Shinin' Harbor.mp3",
        image: "images/orbis.jpg"
    },
    {
        region: "Orbis Boat",
        city: "Leafre",
        file: "Music TOZ/[MapleStory BGM] Leafre.mp3",
        image: "images/leafre.jpg"
    },
    {
        region: "Orbis Boat",
        city: "Ludibrium",
        file: "Music TOZ/[MapleStory BGM] Ludibrium_ Fantastic Thinking.mp3",
        image: "images/ludibrium.jpg"
    },
    {
        region: "Orbis Boat",
        city: "Omega Sector",
        file: "Music TOZ/[MapleStory BGM] Omega Sector_ Let's March.mp3",
        image: "images/omegasector.jpg"
    },
    {
        region: "Orbis Boat",
        city: "Ereve",
        file: "Music TOZ/[MapleStory BGM] Ereve_ Queen's Garden.mp3",
        image: "images/ereve.jpg"
    },
    {
        region: "Orbis Boat",
        city: "Ariant",
        file: "Music TOZ/[MapleStory BGM] Ariant.mp3",
        image: "images/ariant.jpg"
    },
    {
        region: "Orbis Boat",
        city: "Magatia",
        file: "Music TOZ/[MapleStory BGM] Magatia_ Dispute.mp3",
        image: "images/magatia.jpg"
    },
    {
        region: "Orbis Boat",
        city: "Mu Lung",
        file: "Music TOZ/[MapleStory BGM] Mu Lung Hill.mp3",
        image: "images/mulung.jpg"
    },
    {
        region: "Orbis Boat",
        city: "Herb Town",
        file: "Music TOZ/[MapleStory BGM] Herb Town_ White Herb.mp3",
        image: "images/herbtown.jpg"
    },
    {
        region: "Orbis Boat",
        city: "Korean Folk Town",
        file: "Music TOZ/[MapleStory BGM] Korean Folk Town_ Downtown.mp3",
        image: "images/koreanfolktown.jpg"
    },
    {
        region: "Orbis Boat",
        city: "Aquarium",
        file: "Music TOZ/[MapleStory BGM] Aquarium.mp3",
        image: "images/aquarium.jpg"
    },
    {
        region: "Orbis Boat",
        city: "El Nath",
        file: "Music TOZ/[MapleStory BGM] El Nath_ Snowy Village.mp3",
        image: "images/elnath.jpg"
    },
    {
        region: "Orbis Boat",
        city: "Temple Of Time",
        file: "Music TOZ/[MapleStory BGM] Temple of Time.mp3",
        image: "images/templeoftime.jpg"
    },
    {
        region: "Orbis Boat",
        city: "Ellin Forest",
        file: "Music TOZ/[MapleStory BGM] Ellin Forest.mp3",
        image: "images/ellinforest.jpg"
    }
];

window.songs = songs;

function getGroupedByRegion() {
    return songs.reduce((grouped, song) => {
        if (!grouped[song.region]) {
            grouped[song.region] = [];
        }
        grouped[song.region].push(song);
        return grouped;
    }, {});
}
