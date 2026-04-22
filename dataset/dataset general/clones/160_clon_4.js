const GlobalFramework = (function() {
    let feedRegistry = {};
    let startupHooks = [];
    let recordStores = {};

    class DataCursor {
        constructor(entries) {
            this.entries = entries;
        }
        count() {
            return this.entries.length;
        }
        retrieveAll() {
            return [...this.entries];
        }
    }

    class RecordStore {
        constructor(key) {
            this.id = key;
            this.records = [];
            recordStores[key] = this;
        }
        find(query = {}) {
            return new DataCursor(this.records);
        }
        addEntry(data) {
            this.records.push({ uniqueId: Math.random().toString(36).substring(2, 9), ...data });
        }
        countRecords() {
            return this.records.length;
        }
    }

    const framework = {
        RecordStore: RecordStore,
        registerDataFeed: function(name, handler) {
            feedRegistry[name] = handler;
        },
        initiateServerProcess: function(callback) {
            startupHooks.push(callback);
        },
        performServerStartup: function() {
            startupHooks.forEach(hook => hook());
        },
        retrieveFeed: function(name) {
            const handler = feedRegistry[name];
            return handler ? handler() : new DataCursor([]);
        },
        isClientEnvironment: typeof window !== 'undefined' && typeof document !== 'undefined',
        isServerEnvironment: typeof process !== 'undefined' && process.versions != null && process.versions.node != null
    };

    return framework;
})();

const SystemLogger = {
    emit: function(...messages) {
        if (GlobalFramework.isClientEnvironment) {
            console.log("[CLIENT]", ...messages);
        } else if (GlobalFramework.isServerEnvironment) {
            console.log("[SERVER]", ...messages);
        } else {
            console.log("[UNKNOWN_ENV]", ...messages);
        }
    }
};

const TuneRegistry = new GlobalFramework.RecordStore("tunes");
const TrackSequence = new GlobalFramework.RecordStore("tracks");

GlobalFramework.registerDataFeed("tunesData", function() {
    return TuneRegistry.find();
});

GlobalFramework.registerDataFeed("sequenceData", function() {
    return TrackSequence.find();
});

const UserInterfaceManager = (function() {
    let customGreeting = "Greetings from the soundscape.";
    let clickActions = {};

    return {
        setGreetingMessage: function(messageFunc) {
            customGreeting = messageFunc();
        },
        getGreetingMessage: function() {
            return customGreeting;
        },
        registerInteraction: function(identifier, actionType, behavior) {
            if (actionType === 'click') {
                clickActions[identifier] = behavior;
            }
        },
        simulateClick: function(identifier, data = {}) {
            if (clickActions[identifier]) {
                SystemLogger.emit("Simulating click for:", identifier);
                clickActions[identifier].call(data);
            }
        }
    };
})();


if (GlobalFramework.isClientEnvironment) {
    SystemLogger.emit("CLIENT_MODULE_LOADED");

    UserInterfaceManager.setGreetingMessage(function() {
        return "Welcome to the audio zone.";
    });

    UserInterfaceManager.registerInteraction('inputElement', 'click', function() {
        if (typeof SystemLogger !== 'undefined')
            SystemLogger.emit("Input activated:", this);
    });

} else if (GlobalFramework.isServerEnvironment) {
    SystemLogger.emit("SERVER_COMPONENT_INITIALIZING");
    SystemLogger.emit("TUNE_COUNT_CURRENT:", TuneRegistry.countRecords());
    SystemLogger.emit("SEQUENCE_COUNT_CURRENT:", TrackSequence.countRecords());
    SystemLogger.emit("SERVER_READY");

    GlobalFramework.initiateServerProcess(function() {
        SystemLogger.emit("SERVER_STARTUP_SEQUENCE");

        const currentTuneCount = TuneRegistry.find().count();
        if (currentTuneCount === 0) {
            SystemLogger.emit("NO_TUNES_FOUND_INITIATING_SEED");

            const mediaDataJSON = `
            [{
                "titlePiece": "Bound - Zen Bound Ingame Music",
                "performer": "Ghost Monkey",
                "audioSections": [{
                    "pieceTitle": "Care",
                    "resourceURL": "music/blue.mp3"
                },
                {
                    "pieceTitle": "Rope and Wood",
                    "resourceURL": "music/jazz.mp3"
                },
                {
                    "pieceTitle": "Problem Solvent",
                    "resourceURL": "music/minimalish.mp3"
                },
                {
                    "pieceTitle": "Unpaint My Skin",
                    "resourceURL": "music/slower.mp3"
                },
                {
                    "pieceTitle": "Nostalgia",
                    "resourceURL": "music/blue.mp3"
                },
                {
                    "pieceTitle": "Interludum",
                    "resourceURL": "music/jazz.mp3"
                },
                {
                    "pieceTitle": "Grind",
                    "resourceURL": "music/minimalish.mp3"
                },
                {
                    "pieceTitle": "Diagrams",
                    "resourceURL": "music/slower.mp3"
                },
                {
                    "pieceTitle": "Hare",
                    "resourceURL": "music/blue.mp3"
                },
                {
                    "pieceTitle": "Carefree",
                    "resourceURL": "music/jazz.mp3"
                },
                {
                    "pieceTitle": "Tunnel At The End Of Light",
                    "resourceURL": "music/minimalish.mp3"
                }]
            },
            {
                "titlePiece": "Where the Earth Meets the Sky",
                "performer": "Tom Heasley",
                "audioSections": [{
                    "pieceTitle": "Ground Zero",
                    "resourceURL": "music/blue.mp3"
                },
                {
                    "pieceTitle": "Western Sky",
                    "resourceURL": "music/jazz.mp3"
                },
                {
                    "pieceTitle": "Monterey Bay",
                    "resourceURL": "music/minimalish.mp3"
                },
                {
                    "pieceTitle": "Where the Earth Meets the Sky",
                    "resourceURL": "music/slower.mp3"
                }]
            }]`;

            const parsedMediaData = JSON.parse(mediaDataJSON);
            SystemLogger.emit("PARSED_MEDIA_DATA:", parsedMediaData);

            TrackSequence.addEntry({ collectionEntries: [] });
            
            parsedMediaData.forEach(item => {
                SystemLogger.emit("ADDING_TUNE_ENTRY");
                TuneRegistry.addEntry(item);
            });
        }
    });

    GlobalFramework.performServerStartup();
}