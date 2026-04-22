const { EventEmitter: EventConduit } = require('events');

const initiateMediaControl = () => {
    let mediaPlaylist = [];
    let playbackDevice = null;
    const internalNotifier = new EventConduit();

    const beginCurrentPlayback = () => {
        if (playbackDevice && mediaPlaylist.length > 0) {
            playbackDevice.play(mediaPlaylist[0]);
        }
    };

    const controllerInterface = {
        appendMediaItem: (inputContent) => {
            const initialPlaylistLength = mediaPlaylist.length;
            const itemsToAppend = Array.isArray(inputContent) ? inputContent : [inputContent];
            mediaPlaylist = mediaPlaylist.concat(itemsToAppend);

            if (initialPlaylistLength === 0 && mediaPlaylist.length > 0) {
                beginCurrentPlayback();
            }
            internalNotifier.emit('media_appended', inputContent);
        },

        retrieveCurrentPlaylist: () => {
            return [...mediaPlaylist];
        },

        emptyPlaylist: () => {
            const oldPlaylist = mediaPlaylist;
            mediaPlaylist = [];
            return oldPlaylist;
        },

        isPlaylistDepleted: () => {
            return mediaPlaylist.length === 0;
        },

        hasMultipleEntries: () => {
            return mediaPlaylist.length > 0;
        },

        advanceToNextMedia: () => {
            if (mediaPlaylist.length > 0) {
                const removedItem = mediaPlaylist[0];
                mediaPlaylist = mediaPlaylist.slice(1);

                if (mediaPlaylist.length > 0) {
                    beginCurrentPlayback();
                }
                internalNotifier.emit('media_advanced', removedItem);
            }
        },

        setupPlaybackDevice: (deviceInstance) => {
            playbackDevice = deviceInstance;
            return controllerInterface;
        },

        subscribeToEvents: (eventName, callbackFunction) => {
            internalNotifier.on(eventName, callbackFunction);
        },
        unsubscribeFromEvents: (eventName, callbackFunction) => {
            internalNotifier.off(eventName, callbackFunction);
        },
        signalEvent: (eventName, ...args) => {
            internalNotifier.emit(eventName, ...args);
        }
    };

    return controllerInterface;
};

exports.unifiedMediaControl = initiateMediaControl();