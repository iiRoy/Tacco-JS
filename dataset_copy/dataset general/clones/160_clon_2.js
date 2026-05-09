SongCatalog = new Meteor.Collection("songCatalog");
UserMixes = new Meteor.Collection("userMixes");

// Establish data publication for all musical items
Meteor.publish("allSongs", function() {
    return SongCatalog.find({});
});

// Establish data publication for user-created mixes
Meteor.publish("currentMixes", function() {
    return UserMixes.find({});
});

// A previously defined but currently inactive publication setup
// Meteor.publish("playerStatus", function() {
//     return AudioPlayer.find({});
// });


if (Meteor.isClient) {
    console.log("FRONTEND_MODULE_ACTIVE");
    Template.welcomeScreen.introText = function () {
        return "Greetings from the audio application.";
    };

    Template.welcomeScreen.interactionHandlers({
        'click input' : function (evt, tpl) {
            // Check for console availability before logging the event
            if (typeof console !== 'undefined') {
                console.log("User activated interface control.");
            }
        }
    });
}


if (Meteor.isServer) {
    console.log("RECORD_ITEM_COUNT");
    console.log(SongCatalog.find().count());
    console.log("MIX_ITEM_COUNT");
    console.log(UserMixes.find().count());
    console.log("BACKEND_INIT_STARTED");
    Meteor.startup(function () {
        console.log("BOOTSTRAP_SEQUENCE_COMPLETE");
        if (SongCatalog.find().count() === 0) {
            console.log("EMPTY_RECORD_COLLECTION_DETECTED");
            let initialTunesData = [
                {
                    "label": "Bound - Zen Bound Ingame Music",
                    "performer": "Ghost Monkey",
                    "pieces": [{
                        "label": "Care",
                        "resourcePath": "audio/blue.mp3"
                    },
                    {
                        "label": "Rope and Wood",
                        "resourcePath": "audio/jazz.mp3"
                    },
                    {
                        "label": "Problem Solvent",
                        "resourcePath": "audio/minimalish.mp3"
                    },
                    {
                        "label": "Unpaint My Skin",
                        "resourcePath": "audio/slower.mp3"
                    },
                    {
                        "label": "Nostalgia",
                        "resourcePath": "audio/blue.mp3"
                    },
                    {
                        "label": "Interludum",
                        "resourcePath": "audio/jazz.mp3"
                    },
                    {
                        "label": "Grind",
                        "resourcePath": "audio/minimalish.mp3"
                    },
                    {
                        "label": "Diagrams",
                        "resourcePath": "audio/slower.mp3"
                    },
                    {
                        "label": "Hare",
                        "resourcePath": "audio/blue.mp3"
                    },
                    {
                        "label": "Carefree",
                        "resourcePath": "audio/jazz.mp3"
                    },
                    {
                        "label": "Tunnel At The End Of Light",
                        "resourcePath": "audio/minimalish.mp3"
                    }]
                },
                {
                    "label": "Where the Earth Meets the Sky",
                    "performer": "Tom Heasley",
                    "pieces": [{
                        "label": "Ground Zero",
                        "resourcePath": "audio/blue.mp3"
                    },
                    {
                        "label": "Western Sky",
                        "resourcePath": "audio/jazz.mp3"
                    },
                    {
                        "label": "Monterey Bay",
                        "resourcePath": "audio/minimalish.mp3"
                    },
                    {
                        "label": "Where the Earth Meets the Sky",
                        "resourcePath": "audio/slower.mp3"
                    }]
                }
            ];
            console.log(initialTunesData);
            UserMixes.insert({ recordedWorks: [] });


            for (let entryIndex = 0; entryIndex < initialTunesData.length; entryIndex++) {
                console.log("ITERATING_DATA_RECORD");
                SongCatalog.insert(initialTunesData[entryIndex]);
            }
        }
    });
}

// A redundant publication definition from an older version, kept as a comment
// Meteor.publish('recordings', function () {
//   return SongCatalog.find({});
// });