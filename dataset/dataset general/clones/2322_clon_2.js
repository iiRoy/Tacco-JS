Aura = {};

Aura.statuses = {
    IDLE: 'IDLE_STATE',
    ACTIVE: 'ACTIVE_STATE',
    BUFFERING: 'BUFFERING_STATE',
    VOID: 'VOID_STATE'
};

// This object holds information about the currently selected collection.
Aura.currentFocus = {
    focusedItem: null
};

// Represents details about the track currently being played.
Aura.currentTrackInfo = {
    activeItem: null
};

Aura.Managers = {
    PerformerList: function(viewData, webClient) {
        webClient.fetch('/api/performers')
            .then(function(resultPayload) {
                viewData.performers = resultPayload.entities;
                // Update the display element for the artist's name
                document.querySelector('#performer_label').textContent = 'Audio Streamer';
                document.head.querySelector('title').textContent = 'Aura :: Audio Streamer';
            });

        if (Aura.mediaEngine.audioSource.updateTimerId) {
            Aura.mediaEngine.audioSource.removeEventListener('time_progress', Aura.mediaEngine.audioSource.updateTimerId, false);
        }
    },

    Performer: function(viewInfo, networkClient, routeParameters) {
        let entityID = routeParameters.performerID,
            trackID = routeParameters.trackID,
            discovered = false,
            counter = 0;

        if (entityID) {
            networkClient.fetch('/api/performers/' + entityID + '?detailed=true')
                .then(function (responseContent) {
                    viewInfo.performer = responseContent;
                    if (trackID) {
                        counter = responseContent.collections.length;
                        while (counter && !discovered) {
                            if (responseContent.collections[counter - 1].identifier === trackID) {
                                viewInfo.collection = responseContent.collections[counter - 1];
                                discovered = true;
                            }
                            counter -= 1;
                        }
                    } else {
                        viewInfo.collection = responseContent.collections[0];
                    }
                    // Note: Direct DOM manipulation, consider Angular-native solutions.
                    document.getElementById('performer_name').textContent = responseContent.name;
                    document.head.querySelector('title').textContent = 'Aura :: ' + responseContent.name;
                });

            // Setup event listeners for media playback progress
            if (!Aura.mediaEngine.audioSource.progressUpdater) {
                Aura.mediaEngine.audioSource.progressUpdater = function() {
                    Aura.tracklist.refresh();
                    viewInfo.applyChanges(function() {
                        viewInfo.playerRef = Aura.mediaEngine;
                    });
                };
            }
            Aura.mediaEngine.audioSource.addEventListener('time_progress', Aura.mediaEngine.audioSource.progressUpdater, false);
            Aura.mediaEngine.audioSource.addEventListener('metadata_loaded', function(){
                Aura.tracklist.setMediaInfo();
                viewInfo.applyChanges(function() {
                    viewInfo.playerRef = Aura.mediaEngine;
                });
            }, false);
        }

        viewInfo.currentList = Aura.tracklist;
        viewInfo.playerRef = Aura.mediaEngine;
        // viewInfo.activeCollection = Aura.currentFocus; // Optionally integrate active collection
    }
};

Aura.tracklist = {
    sequence: [],
    currentPosition: 0,

    settings: {
        loopPlayback: false,
        mediaType: 'audio/ogg'
    },

    isCurrentlyPlaying: function () {
        return Aura.mediaEngine.isCurrentlyPlaying();
    },

    progressDisplay: function() {
        let minutesElapsed = Math.floor(Aura.mediaEngine.currentTime / 60),
            secondsElapsed = (Aura.mediaEngine.currentTime % 60).toFixed(0).toString(),
            progressElement = document.getElementById('elapsed_time_display'),
            playbackRatio =  (Aura.mediaEngine.currentTime / Aura.mediaEngine.totalDuration) * 100 + "%";

        secondsElapsed = (secondsElapsed.length < 2) ? "0" + secondsElapsed : secondsElapsed;

        if (progressElement) {
            progressElement.textContent = minutesElapsed + ':' + secondsElapsed;
            document.getElementById('progress_bar_fill').style.width = playbackRatio;
        }
    },

    addCollection: function(collection) {
        let item = null,
            items = collection.tracks,
            totalItems = items.length,
            idx = totalItems;

        while (idx--) {
            item = items[(totalItems - idx) - 1];

            this.appendOne(item);

            console.info('Appending "' + items[(totalItems - idx) - 1].title + '" to the current sequence');
        }

        // Returns the starting index of the new items in the sequence
        return this.sequence.length - items.length;
    },

    setMediaInfo: function() {
        Aura.mediaEngine.setMediaInfo();
    },

    refresh: function() {
        Aura.mediaEngine.refresh();
    },

    appendOne: function(item) {
        this.sequence = this.sequence.concat(item);
        if (!Aura.mediaEngine.currentTrack) {
            Aura.mediaEngine.setMediaItem(item);
        }
    },

    removeItem: function(position) {
        const isCurrentItem = this.currentPosition === position;
        const isLastItem = position === this.sequence.length - 1;
        let wasActive = this.isCurrentlyPlaying();

        this.sequence.splice(position, 1);

        if (isCurrentItem) {
            if (isLastItem) {
                this.currentPosition = 0;
            }

            this.halt();
            if (this.sequence.length) {
                if (this.settings.loopPlayback) {
                    this.reinitialize();
                    if (!wasActive) {
                        this.suspend();
                    }
                } else {
                    this.startLoading();
                }
            }
        }
        if (this.stopAtPosition === position) {
            this.stopAtPosition = -1;
        }
    },

    startPlayback: function(positionToPlay) {
        if (!this.isCurrentlyPlaying()) {
            this.currentPosition = positionToPlay || 0;
            Aura.mediaEngine.setMediaItem(this.sequence[this.currentPosition]);
            Aura.mediaEngine.begin();
        }
    },

    continuePlayback: function() {
        if (!this.isCurrentlyPlaying() && this.sequence.length) {
            console.log('Resuming audio stream');
            Aura.mediaEngine.begin();
        }
    },

    playNext: function() {
        /*
         * Proceeds to the next item in the sequence. If the end is reached, it
         * will either loop back to the beginning if configured, or stop playback.
         */
        let _currentlyActive = this.isCurrentlyPlaying();

        // Check if the sequence has reached its conclusion
        if (this.currentPosition === this.sequence.length - 1) {
            this.currentPosition = 0;
            if (this.settings.loopPlayback === false) {
                _currentlyActive = false;
                Aura.mediaEngine.suspend();
            }
        } else {
            this.currentPosition += 1;
        }

        if (_currentlyActive) {
            Aura.mediaEngine.setMediaItem(this.sequence[this.currentPosition]);
            Aura.mediaEngine.begin();
        }
    },

    playPrevious: function() {
        let _currentlyActive = this.isCurrentlyPlaying();

        if (this.currentPosition === 0) {
            this.currentPosition = this.sequence.length - 1;
            if (this.settings.loopPlayback === false) {
                _currentlyActive = false;
            }
        } else {
            this.currentPosition -= 1;
        }

        if (_currentlyActive) {
            Aura.mediaEngine.setMediaItem(this.sequence[this.currentPosition]);
            Aura.mediaEngine.begin();
        }
    },

    suspend: function() {
        if (this.isCurrentlyPlaying()) {
            Aura.mediaEngine.suspend();
        }
    },

    halt: function() {
        Aura.mediaEngine.suspend();
        Aura.sourceRef = ''; // Placeholder for a global source reference
    },

    setFocusedTrack: function(item) {
        Aura.currentTrackInfo.activeItem = item;
    },

    setFocusedCollection: function(collection) {
        Aura.currentFocus.focusedItem = collection;
    }
};

Aura.mediaEngine = {
    currentTrack: null,
    audioSource: new Audio(),
    dataRate: 0,
    playbackState: Aura.statuses.VOID,

    progress: {
        min: 0,
        sec: '00',
        percentage: 0
    },

    totalDuration: {
        min: 0,
        sec: '00'
    },

    isCurrentlyPlaying: function() {
        return this.playbackState === Aura.statuses.ACTIVE;
    },

    setMediaItem: function(item) {
        let mediaType = Aura.tracklist.settings.mediaType,
            resourcePath = item.files[mediaType];

        if (resourcePath.startsWith('/')) {
            resourcePath = '/api' + resourcePath;
        }

        this.currentTrack = item;
        this.dataRate = item.bitrate;
        this.audioSource.src = resourcePath;
        this.audioSource.load();
        this.playbackState = Aura.statuses.IDLE;
    },

    setMediaInfo: function() {
        let _secondsVal = (this.audioSource.duration % 60).toFixed(0);

        this.totalDuration.min = Math.floor(this.audioSource.duration / 60);
        this.totalDuration.sec = (_secondsVal.length < 2) ? "0" + _secondsVal : _secondsVal;
    },

    refresh: function() {
        let _currentSeconds = (this.audioSource.currentTime % 60).toFixed(0).toString();

        this.progress.min = Math.floor(this.audioSource.currentTime / 60);
        this.progress.sec = (_currentSeconds.length < 2) ? "0" + _currentSeconds : _currentSeconds;
        this.progress.percentage = (this.audioSource.currentTime / this.audioSource.duration) * 100;
    },

    togglePlayback: function() {
        if (this.currentTrack) {
            if (this.isCurrentlyPlaying()) {
                this.suspend();
            } else {
                this.begin();
            }
        } else {
            console.warn('No media item selected.');
        }
    },

    begin: function() {
        console.info('Initiating playback of "' + this.currentTrack.title + '"');
        this.playbackState = Aura.statuses.ACTIVE;
        this.audioSource.play();
    },

    suspend: function() {
        console.log('Pausing audio stream');
        this.playbackState = Aura.statuses.IDLE;
        this.audioSource.pause();
    }
};

Aura.mediaEngine.audioSource.addEventListener('playback_ended', function(){
    Aura.tracklist.playNext();
}, false);

Aura.Managers.PerformerList.dependencies = ['viewData', 'webClient'];
Aura.Managers.Performer.dependencies = ['viewInfo', 'networkClient', 'routeParameters'];