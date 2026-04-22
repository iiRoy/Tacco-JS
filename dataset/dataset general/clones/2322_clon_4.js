const AuralCanvas = {};

AuralCanvas.PlaybackState = {
    MUTE: 'SILENT',
    ACTIVE: 'PLAYING',
    DORMANT: 'PAUSED',
    EMPTY: 'UNLOADED'
};

class DataFetcher {
    async retrieve(destination) {
        try {
            const reply = await fetch(destination);
            if (!reply.ok) {
                throw new Error(`Connection issue! status: ${reply.status}`);
            }
            return await reply.json();
        } catch (mishap) {
            console.error('Data acquisition failed:', mishap);
            throw mishap;
        }
    }
}

class DisplayManager {
    constructor(primaryTitleElement, mainHeaderElement, timeIndicatorElement, progressIndicatorElement) {
        this.primaryTitleEl = primaryTitleElement;
        this.mainHeaderEl = mainHeaderElement;
        this.timeIndicatorEl = timeIndicatorElement;
        this.progressIndicatorEl = progressIndicatorElement;
    }

    setPageHeader(text) {
        if (this.primaryTitleEl) {
            this.primaryTitleEl.textContent = `AuralCanvas :: ${text}`;
        }
    }

    setMainHeading(text) {
        if (this.mainHeaderEl) {
            this.mainHeaderEl.textContent = text;
        }
    }

    updatePlaybackVisuals(elapsedMins, elapsedSecs, completionRatio) {
        if (this.timeIndicatorEl) {
            const formattedSecs = String(elapsedSecs).padStart(2, '0');
            this.timeIndicatorEl.textContent = `${elapsedMins}:${formattedSecs}`;
        }
        if (this.progressIndicatorEl) {
            this.progressIndicatorEl.style.width = `${completionRatio}%`;
        }
    }
}

class MediaCore {
    constructor() {
        this._audioSource = new Audio();
        this._currentMediaAsset = null;
        this._mediaStatus = AuralCanvas.PlaybackState.EMPTY;
        this._elapsedTimeData = { minutes: 0, seconds: '00', percent: 0 };
        this._totalTimeData = { minutes: 0, seconds: '00' };

        this.onVisualUpdate = null;
        this.onAssetMetadataReady = null;
        this.onAssetEnded = null;

        this._configureListeners();
    }

    _configureListeners() {
        this._audioSource.addEventListener('timeupdate', () => {
            this._refreshTimingData();
            if (this.onVisualUpdate) {
                this.onVisualUpdate(
                    this._elapsedTimeData.minutes,
                    this._elapsedTimeData.seconds,
                    this._elapsedTimeData.percent
                );
            }
        }, false);

        this._audioSource.addEventListener('loadedmetadata', () => {
            this._setTotalDurationData();
            if (this.onAssetMetadataReady) {
                this.onAssetMetadataReady(this._totalTimeData.minutes, this._totalTimeData.seconds);
            }
        }, false);

        this._audioSource.addEventListener('ended', () => {
            this._mediaStatus = AuralCanvas.PlaybackState.DORMANT;
            if (this.onAssetEnded) {
                this.onAssetEnded();
            }
        }, false);
    }

    _refreshTimingData() {
        const currentSecs = Math.floor(this._audioSource.currentTime % 60);
        this._elapsedTimeData.minutes = Math.floor(this._audioSource.currentTime / 60);
        this._elapsedTimeData.seconds = String(currentSecs).padStart(2, '0');
        this._elapsedTimeData.percent = (this._audioSource.currentTime / this._audioSource.duration) * 100;
    }

    _setTotalDurationData() {
        const totalSecs = Math.floor(this._audioSource.duration % 60);
        this._totalTimeData.minutes = Math.floor(this._audioSource.duration / 60);
        this._totalTimeData.seconds = String(totalSecs).padStart(2, '0');
    }

    prepareAsset(assetDetails, mediaFormat = 'audio/ogg') {
        const assetPath = assetDetails.mediaSources[mediaFormat];
        if (!assetPath) {
            console.error('No media source found for format:', mediaFormat, assetDetails);
            return;
        }

        let fullAssetPath = assetPath;
        if (fullAssetPath.startsWith('/')) {
            fullAssetPath = '/api' + fullAssetPath;
        }

        this._currentMediaAsset = assetDetails;
        this._audioSource.src = fullAssetPath;
        this._audioSource.load();
        this._mediaStatus = AuralCanvas.PlaybackState.DORMANT;
    }

    startPlaying() {
        if (this._currentMediaAsset && this._mediaStatus !== AuralCanvas.PlaybackState.ACTIVE) {
            console.info(`Commencing playback: "${this._currentMediaAsset.title}"`);
            this._mediaStatus = AuralCanvas.PlaybackState.ACTIVE;
            this._audioSource.play();
        } else if (!this._currentMediaAsset) {
            console.warn('Cannot start playback: No media asset loaded.');
        }
    }

    stopPlaying() {
        if (this._mediaStatus === AuralCanvas.PlaybackState.ACTIVE) {
            console.log('Pausing playback');
            this._mediaStatus = AuralCanvas.PlaybackState.DORMANT;
            this._audioSource.pause();
        }
    }

    togglePlaying() {
        if (this._currentMediaAsset) {
            if (this.isCurrentlyActive()) {
                this.stopPlaying();
            } else {
                this.startPlaying();
            }
        } else {
            console.log('No media asset to toggle playback.');
        }
    }

    isCurrentlyActive() {
        return this._mediaStatus === AuralCanvas.PlaybackState.ACTIVE;
    }

    getAssetStatus() {
        return {
            asset: this._currentMediaAsset,
            status: this._mediaStatus,
            elapsed: { ...this._elapsedTimeData },
            duration: { ...this._totalTimeData }
        };
    }

    clearVisualUpdateCallback() {
        this.onVisualUpdate = null;
    }
}

class SequenceManager {
    constructor(mediaEngine) {
        this._mediaEngine = mediaEngine;
        this._assetSequence = [];
        this._currentSequenceIndex = 0;
        this._sequenceOptions = { cycleQueue: false, defaultMediaFormat: 'audio/ogg' };
    }

    addContentCollection(contentItems) {
        const initialSequenceLength = this._assetSequence.length;
        contentItems.forEach(item => {
            this.addSingleContent(item);
            console.log(`Queued "${item.title}"`);
        });
        return initialSequenceLength;
    }

    addSingleContent(item) {
        this._assetSequence.push(item);
        if (!this._mediaEngine.getAssetStatus().asset) {
            this._mediaEngine.prepareAsset(item, this._sequenceOptions.defaultMediaFormat);
        }
    }

    removeContentAtIndex(idx) {
        const wasCurrentAsset = this._currentSequenceIndex === idx;
        const wasLastAsset = idx === this._assetSequence.length - 1;
        const wasPlaying = this._mediaEngine.isCurrentlyActive();

        this._assetSequence.splice(idx, 1);

        if (wasCurrentAsset) {
            this._mediaEngine.stopPlaying();
            if (this._assetSequence.length === 0) {
                this._currentSequenceIndex = 0;
                this._mediaEngine.prepareAsset(null);
            } else {
                if (wasLastAsset) {
                    this._currentSequenceIndex = 0;
                }
                this._currentSequenceIndex = Math.min(this._currentSequenceIndex, this._assetSequence.length - 1);
                this._loadAndOptionallyPlayCurrent(wasPlaying);
            }
        } else if (idx < this._currentSequenceIndex) {
            this._currentSequenceIndex--;
        }
    }

    _loadAndOptionallyPlayCurrent(shouldInitiatePlay) {
        if (this._assetSequence.length > 0) {
            const currentItem = this._assetSequence[this._currentSequenceIndex];
            this._mediaEngine.prepareAsset(currentItem, this._sequenceOptions.defaultMediaFormat);
            if (shouldInitiatePlay) {
                this._mediaEngine.startPlaying();
            }
        }
    }

    beginSequence(startPosition = 0) {
        if (this._assetSequence.length > 0) {
            this._currentSequenceIndex = startPosition;
            this._loadAndOptionallyPlayCurrent(true);
        }
    }

    continueSequencePlayback() {
        if (!this._mediaEngine.isCurrentlyActive() && this._assetSequence.length > 0) {
            console.info('Resuming sequence playback');
            this._mediaEngine.startPlaying();
        }
    }

    advanceToNextAsset() {
        const wasPlaying = this._mediaEngine.isCurrentlyActive();
        let nextIdx;

        if (this._currentSequenceIndex === this._assetSequence.length - 1) {
            nextIdx = 0;
            if (!this._sequenceOptions.cycleQueue) {
                this._mediaEngine.stopPlaying();
                return;
            }
        } else {
            nextIdx = this._currentSequenceIndex + 1;
        }
        this._currentSequenceIndex = nextIdx;
        this._loadAndOptionallyPlayCurrent(wasPlaying);
    }

    retreatToPreviousAsset() {
        const wasPlaying = this._mediaEngine.isCurrentlyActive();
        let prevIdx;

        if (this._currentSequenceIndex === 0) {
            prevIdx = this._assetSequence.length - 1;
            if (!this._sequenceOptions.cycleQueue) {
                 if (this._assetSequence.length > 0 && wasPlaying && this._currentSequenceIndex === 0) {
                    this._loadAndOptionallyPlayCurrent(true);
                }
                return;
            }
        } else {
            prevIdx = this._currentSequenceIndex - 1;
        }
        this._currentSequenceIndex = prevIdx;
        this._loadAndOptionallyPlayCurrent(wasPlaying);
    }

    pauseSequencePlayback() {
        this._mediaEngine.stopPlaying();
    }

    endSequencePlayback() {
        this._mediaEngine.stopPlaying();
        this._mediaEngine.prepareAsset(null);
    }

    getCurrentAsset() {
        return this._assetSequence[this._currentSequenceIndex] || null;
    }

    getAllAssets() {
        return [...this._assetSequence];
    }
}

AuralCanvas.CurrentFocus = {
    contentItem: null
};

AuralCanvas.ApplicationModules = {
    CatalogView: function(dataService, displayService, mediaEngineInstance) {
        dataService.retrieve('/api/performers')
            .then(data => {
                console.log('Catalog entries:', data.items);
                displayService.setMainHeading('Sound Catalog');
                displayService.setPageHeader('Sound Catalog');
            })
            .catch(error => console.error('Failed to retrieve catalog:', error));

        mediaEngineInstance.clearVisualUpdateCallback();
    },

    ContentView: function(dataService, displayService, mediaEngineInstance, sequenceManagerInstance, viewParameters) {
        const performerIdentifier = viewParameters.performerId;
        const trackIdentifier = viewParameters.trackId;
        let contentDataStore = {};

        if (performerIdentifier) {
            dataService.retrieve(`/api/performers/${performerIdentifier}?fulltree=true`)
                .then(data => {
                    contentDataStore = data;
                    let chosenCollection = data.collections[0];

                    if (trackIdentifier) {
                        const locatedCollection = data.collections.find(collection =>
                            collection.tracks.some(track => track.slug === trackIdentifier)
                        );
                        if (locatedCollection) {
                            chosenCollection = locatedCollection;
                        }
                    }

                    AuralCanvas.CurrentFocus.contentItem = chosenCollection;

                    displayService.setMainHeading(data.name);
                    displayService.setPageHeader(data.name);

                    if (chosenCollection && chosenCollection.tracks) {
                        sequenceManagerInstance.addContentCollection(chosenCollection.tracks);
                    }
                })
                .catch(error => console.error('Failed to load content view:', error));

            if (!mediaEngineInstance.onVisualUpdate) {
                mediaEngineInstance.onVisualUpdate = (mins, secs, percent) => {
                    displayService.updatePlaybackVisuals(mins, secs, percent);
                    AuralCanvas.currentPlaybackStatus = mediaEngineInstance.getAssetStatus();
                };
            }

            if (!mediaEngineInstance.onAssetMetadataReady) {
                mediaEngineInstance.onAssetMetadataReady = (mins, secs) => {
                    console.log('Asset metadata ready. Duration:', mins, secs);
                    AuralCanvas.currentPlaybackStatus = mediaEngineInstance.getAssetStatus();
                };
            }

            mediaEngineInstance.onAssetEnded = () => {
                sequenceManagerInstance.advanceToNextAsset();
            };
        }

        AuralCanvas.currentSequence = sequenceManagerInstance;
        AuralCanvas.currentMediaState = mediaEngineInstance;
    }
};

AuralCanvas.initializeSystem = function(domHooks, routeDirectives) {
    const dataAccess = new DataFetcher();
    const uiDisplay = new DisplayManager(
        domHooks.pageTitle,
        domHooks.mainHeadline,
        domHooks.timeElapsed,
        domHooks.progressBar
    );
    const mediaCoreEngine = new MediaCore();
    const trackSequence = new SequenceManager(mediaCoreEngine);

    AuralCanvas.dataService = dataAccess;
    AuralCanvas.displayService = uiDisplay;
    AuralCanvas.mediaEngine = mediaCoreEngine;
    AuralCanvas.sequenceService = trackSequence;

    if (routeDirectives.view === 'catalog') {
        AuralCanvas.ApplicationModules.CatalogView(dataAccess, uiDisplay, mediaCoreEngine);
    } else if (routeDirectives.view === 'content' && routeDirectives.performerId) {
        AuralCanvas.ApplicationModules.ContentView(dataAccess, uiDisplay, mediaCoreEngine, trackSequence, routeDirectives);
    }
};

// Example usage of the initializeSystem function, assuming DOM elements exist:
// AuralCanvas.initializeSystem({
//     pageTitle: document.getElementsByTagName('title')[0],
//     mainHeadline: document.getElementById('artistname'),
//     timeElapsed: document.getElementById('timeelapsed'),
//     progressBar: document.getElementById('progressbar')
// }, {
//     view: 'content',
//     performerId: 'some-artist-slug',
//     trackId: 'some-song-slug'
// });