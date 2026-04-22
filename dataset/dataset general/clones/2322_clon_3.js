const Aether = {};

Aether.statusCodes = {
    IDLE: 'IDLE',
    ACTIVE: 'ACTIVE',
    FETCHING: 'FETCHING',
    VOID: 'VOID'
};

Aether.CurrentSelection = {
    selectedAlbum: null
};

Aether.ModuleControllers = {
    PerformerDirectory: function(viewModel, httpClient) {
        httpClient.get('/api/performers').then(function(response) {
            const responseData = response.data;
            if (responseData && responseData.results) {
                viewModel.performers = responseData.results;
                document.querySelector('#artist-display-name').textContent = 'Harmony Hub';
                document.title = 'AetherStream » Harmony Hub';
            }
        }).catch(function(error) {
            console.error('Failed to retrieve performer list:', error);
            viewModel.performers = [];
        });

        if (Aether.PlaybackEngine.audioElement.playbackProgressHandler) {
            Aether.PlaybackEngine.audioElement.removeEventListener(
                'timeupdate',
                Aether.PlaybackEngine.audioElement.playbackProgressHandler,
                false
            );
            Aether.PlaybackEngine.audioElement.playbackProgressHandler = null;
        }
    },

    PerformerDetail: function(viewModel, httpClient, routeParams) {
        const performerIdentifier = routeParams.performerSlug;
        const trackIdentifier = routeParams.trackSlug;

        let itemFoundInCollection = false;

        if (performerIdentifier) {
            httpClient.get(`/api/performers/${performerIdentifier}?full_details=true`).then(function(response) {
                const performerData = response.data;
                if (performerData) {
                    viewModel.performerDetails = performerData;

                    if (trackIdentifier) {
                        const collections = performerData.collections || [];
                        for (const collection of collections) {
                            if (collection.uniqueId === trackIdentifier) {
                                viewModel.currentCollection = collection;
                                itemFoundInCollection = true;
                                break;
                            }
                        }
                        if (!itemFoundInCollection && collections.length > 0) {
                            viewModel.currentCollection = collections[0];
                        }
                    } else if (performerData.collections && performerData.collections.length > 0) {
                        viewModel.currentCollection = performerData.collections[0];
                    } else {
                        viewModel.currentCollection = null;
                        console.warn('No collections found for performer:', performerIdentifier);
                    }

                    document.querySelector('#artist-display-name').textContent = performerData.name;
                    document.title = `AetherStream » ${performerData.name}`;
                }
            }).catch(function(error) {
                console.error(`Error fetching performer details for ${performerIdentifier}:`, error);
                viewModel.performerDetails = null;
            });

            if (!Aether.PlaybackEngine.audioElement.playbackProgressHandler) {
                Aether.PlaybackEngine.audioElement.playbackProgressHandler = function() {
                    Aether.TrackQueue.refreshPlaybackState();
                    viewModel.$evalAsync(function() {
                        viewModel.playerState = Aether.PlaybackEngine;
                    });
                };
            }
            Aether.PlaybackEngine.audioElement.addEventListener('timeupdate', Aether.PlaybackEngine.audioElement.playbackProgressHandler, false);

            Aether.PlaybackEngine.audioElement.addEventListener('loadedmetadata', function() {
                Aether.TrackQueue.configureMetadata();
                viewModel.$evalAsync(function() {
                    viewModel.playerState = Aether.PlaybackEngine;
                });
            }, false);
        } else {
            console.error('Performer identifier is missing in route parameters.');
        }

        viewModel.queueInfo = Aether.TrackQueue;
        viewModel.playerState = Aether.PlaybackEngine;
    }
};

Aether.TrackQueue = {
    queuedItems: [],
    currentIndex: 0,
    stopAtIndex: -1,

    settings: {
        loopPlayback: false,
        mediaType: 'audio/ogg'
    },

    isCurrentlyPlaying: function() {
        return Aether.PlaybackEngine.isActive();
    },

    refreshPlaybackTime: function() {
        const currentTimeInSeconds = Aether.PlaybackEngine.audioElement.currentTime;
        const totalDurationInSeconds = Aether.PlaybackEngine.audioElement.duration;

        let minutesElapsed = Math.floor(currentTimeInSeconds / 60);
        let secondsElapsed = Math.round(currentTimeInSeconds % 60);

        let formattedSeconds = secondsElapsed < 10 ? `0${secondsElapsed}` : `${secondsElapsed}`;

        const timeDisplayElement = document.getElementById('playback-time-elapsed');
        const progressBarElement = document.getElementById('playback-progress-bar');

        const progressPercentage = (totalDurationInSeconds > 0) ?
            ((currentTimeInSeconds / totalDurationInSeconds) * 100).toFixed(2) : 0;

        if (timeDisplayElement && progressBarElement) {
            timeDisplayElement.textContent = `${minutesElapsed}:${formattedSeconds}`;
            progressBarElement.style.width = `${progressPercentage}%`;
        }
    },

    enqueueCollection: function(albumDetails) {
        const collectionTracks = albumDetails.tracks || [];
        const initialQueueLength = this.queuedItems.length;

        for (const trackItem of collectionTracks) {
            this.appendOne(trackItem);
        }

        return initialQueueLength;
    },

    configureMetadata: function() {
        Aether.PlaybackEngine.updateMediaMetadata();
    },

    refreshPlaybackState: function() {
        Aether.PlaybackEngine.refreshProgress();
    },

    appendOne: function(trackItem) {
        this.queuedItems.push(trackItem);
        if (!Aether.PlaybackEngine.currentMedia) {
            Aether.PlaybackEngine.loadMedia(trackItem);
        }
    },

    dequeueItem: function(itemIndex) {
        if (itemIndex < 0 || itemIndex >= this.queuedItems.length) {
            console.warn('Attempted to remove track with invalid index:', itemIndex);
            return;
        }

        const isCurrentItem = this.currentIndex === itemIndex;
        const isLastItemInQueue = itemIndex === this.queuedItems.length - 1;
        const wasActive = this.isCurrentlyPlaying();

        this.queuedItems.splice(itemIndex, 1);

        if (isCurrentItem) {
            if (this.queuedItems.length === 0) {
                this.currentIndex = 0;
                this.haltPlayback();
            } else {
                if (this.currentIndex >= this.queuedItems.length) {
                    this.currentIndex = Math.max(0, this.queuedItems.length - 1);
                }
                this.haltPlayback();
                if (this.settings.loopPlayback) {
                    this.reloadCurrentTrack();
                    if (!wasActive) {
                        this.pausePlayback();
                    }
                } else {
                    this.loadCurrentTrack();
                    if (wasActive) {
                        this.startPlayback(this.currentIndex);
                    }
                }
            }
        } else if (itemIndex < this.currentIndex) {
            this.currentIndex--;
        }

        if (this.stopAtIndex === itemIndex) {
            this.stopAtIndex = -1;
        }
    },
    
    reloadCurrentTrack: function() {
        if (this.queuedItems.length > 0 && this.currentIndex < this.queuedItems.length) {
            Aether.PlaybackEngine.loadMedia(this.queuedItems[this.currentIndex]);
            Aether.PlaybackEngine.initiatePlay();
        }
    },

    loadCurrentTrack: function() {
        if (this.queuedItems.length > 0 && this.currentIndex < this.queuedItems.length) {
            Aether.PlaybackEngine.loadMedia(this.queuedItems[this.currentIndex]);
        }
    },

    startPlayback: function(trackIndex) {
        if (!this.isCurrentlyPlaying()) {
            this.currentIndex = trackIndex !== undefined ? trackIndex : 0;
            if (this.currentIndex < 0 || this.currentIndex >= this.queuedItems.length) {
                console.warn('Attempted to start playback with invalid index:', this.currentIndex);
                this.currentIndex = 0;
                if (this.queuedItems.length === 0) return;
            }
            Aether.PlaybackEngine.loadMedia(this.queuedItems[this.currentIndex]);
            Aether.PlaybackEngine.initiatePlay();
        }
    },

    continuePlayback: function() {
        if (!this.isCurrentlyPlaying() && this.queuedItems.length > 0) {
            Aether.PlaybackEngine.initiatePlay();
        }
    },

    playNext: function() {
        let isPlayerActive = this.isCurrentlyPlaying();

        if (this.queuedItems.length === 0) {
            console.warn('Cannot play next: Queue is empty.');
            Aether.PlaybackEngine.pausePlayback();
            return;
        }

        if (this.currentIndex === this.queuedItems.length - 1) {
            this.currentIndex = 0;
            if (!this.settings.loopPlayback) {
                isPlayerActive = false;
                Aether.PlaybackEngine.pausePlayback();
                return;
            }
        } else {
            this.currentIndex++;
        }

        if (isPlayerActive) {
            Aether.PlaybackEngine.loadMedia(this.queuedItems[this.currentIndex]);
            Aether.PlaybackEngine.initiatePlay();
        } else {
            Aether.PlaybackEngine.loadMedia(this.queuedItems[this.currentIndex]);
        }
    },

    playPrevious: function() {
        let isPlayerActive = this.isCurrentlyPlaying();
        
        if (this.queuedItems.length === 0) {
            console.warn('Cannot play previous: Queue is empty.');
            Aether.PlaybackEngine.pausePlayback();
            return;
        }

        if (this.currentIndex === 0) {
            this.currentIndex = this.queuedItems.length - 1;
            if (!this.settings.loopPlayback) {
                isPlayerActive = false;
                Aether.PlaybackEngine.pausePlayback();
                return;
            }
        } else {
            this.currentIndex--;
        }

        if (isPlayerActive) {
            Aether.PlaybackEngine.loadMedia(this.queuedItems[this.currentIndex]);
            Aether.PlaybackEngine.initiatePlay();
        } else {
            Aether.PlaybackEngine.loadMedia(this.queuedItems[this.currentIndex]);
        }
    },

    pausePlayback: function() {
        if (this.isCurrentlyPlaying()) {
            Aether.PlaybackEngine.pausePlayback();
        }
    },

    haltPlayback: function() {
        Aether.PlaybackEngine.pausePlayback();
        Aether.PlaybackEngine.audioElement.src = '';
        Aether.PlaybackEngine.engineState = Aether.statusCodes.VOID;
    }
};

Aether.PlaybackEngine = {
    currentMedia: null,
    audioElement: new Audio(),
    mediaBitrate: 0,
    engineState: Aether.statusCodes.VOID,

    playbackProgress: {
        minutes: 0,
        secondsDisplay: '00',
        progressRatio: 0
    },

    mediaDuration: {
        minutes: 0,
        secondsDisplay: '00'
    },

    isActive: function() {
        return this.engineState === Aether.statusCodes.ACTIVE;
    },

    loadMedia: function(mediaItem) {
        const mediaType = Aether.TrackQueue.settings.mediaType;
        let mediaPath = mediaItem.sources ? mediaItem.sources[mediaType] : null;

        if (!mediaPath) {
            console.error(`No media path found for type '${mediaType}' in item:`, mediaItem);
            this.currentMedia = null;
            this.engineState = Aether.statusCodes.VOID;
            return;
        }

        if (mediaPath.startsWith('/')) {
            mediaPath = '/api' + mediaPath;
        }

        this.currentMedia = mediaItem;
        this.mediaBitrate = mediaItem.bitrate || 0;
        this.audioElement.src = mediaPath;
        this.audioElement.load();
        this.engineState = Aether.statusCodes.IDLE;
    },

    updateMediaMetadata: function() {
        const totalDurationSeconds = this.audioElement.duration;
        let roundedSeconds = Math.round(totalDurationSeconds % 60);

        this.mediaDuration.minutes = Math.floor(totalDurationSeconds / 60);
        this.mediaDuration.secondsDisplay = roundedSeconds < 10 ? `0${roundedSeconds}` : `${roundedSeconds}`;
    },

    refreshProgress: function() {
        const currentTime = this.audioElement.currentTime;
        const totalDuration = this.audioElement.duration;
        let currentSecondsRounded = Math.round(currentTime % 60);

        this.playbackProgress.minutes = Math.floor(currentTime / 60);
        this.playbackProgress.secondsDisplay = currentSecondsRounded < 10 ? `0${currentSecondsRounded}` : `${currentSecondsRounded}`;
        this.playbackProgress.progressRatio = (totalDuration > 0) ? (currentTime / totalDuration) * 100 : 0;
    },

    togglePlayback: function() {
        if (this.currentMedia) {
            if (this.isActive()) {
                this.pausePlayback();
            } else {
                this.initiatePlay();
            }
        } else {
            console.warn('Attempted to toggle playback without a loaded media item.');
        }
    },

    initiatePlay: function() {
        if (!this.currentMedia) {
            console.warn('Cannot play: No media item is loaded.');
            this.engineState = Aether.statusCodes.VOID;
            return;
        }
        this.engineState = Aether.statusCodes.ACTIVE;
        this.audioElement.play().catch(e => {
            console.error('Audio playback failed:', e);
            this.engineState = Aether.statusCodes.IDLE;
        });
    },

    pausePlayback: function() {
        this.engineState = Aether.statusCodes.IDLE;
        this.audioElement.pause();
    }
};

Aether.PlaybackEngine.audioElement.addEventListener('ended', function() {
    Aether.TrackQueue.playNext();
}, false);

Aether.ModuleControllers.PerformerDirectory.$inject = ['viewModel', 'httpClient'];
Aether.ModuleControllers.PerformerDetail.$inject = ['viewModel', 'httpClient', 'routeParams'];