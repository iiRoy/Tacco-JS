class MediaCollectionManager {
    #collectionStore;
    #activeEntityIdentifier;
    #externalSystems;

    constructor(initialSourceData, externalIntegrationPoints) {
        this.#externalSystems = externalIntegrationPoints;
        this.#collectionStore = new Map();
        this.#activeEntityIdentifier = null;

        const persistedState = this.#externalSystems.dataStorage.retrieve('contentCollectionState');
        let processedData;

        if (persistedState) {
            try {
                processedData = JSON.parse(persistedState);
            } catch (e) {
                console.error("Data retrieval error, falling back to initial configuration.", e);
                processedData = initialSourceData;
            }
        } else {
            processedData = initialSourceData;
        }

        processedData.forEach((item, idx) => {
            const entityKey = item.entityId || `entity-${Date.now()}-${idx}`;
            this.#collectionStore.set(entityKey, {
                entityId: entityKey,
                entityName: item.name,
                entityDescription: item.description,
                isActive: item.selected || false,
                currentTrackIndex: item.currentTrack !== undefined ? item.currentTrack : 0,
                trackUnits: item.tracks.map(track => ({
                    trackTitle: track.title,
                    trackResourceURL: track.url,
                    playbackCommand: track.action || 'Play',
                    currentStatus: track.status || ''
                }))
            });
            if (item.selected) {
                this.#activeEntityIdentifier = entityKey;
            }
        });

        if (!this.#activeEntityIdentifier && this.#collectionStore.size > 0) {
            const firstEntry = this.#collectionStore.values().next().value;
            this.#activeEntityIdentifier = firstEntry.entityId;
            firstEntry.isActive = true;
        }
        this.#externalSystems.domInterface.setElementVisibility('#mainDisplayArea', 'visible');
    }

    #syncPersistentState() {
        const serializableData = Array.from(this.#collectionStore.values()).map(entity => ({
            entityId: entity.entityId,
            name: entity.entityName,
            description: entity.entityDescription,
            selected: entity.isActive,
            currentTrack: entity.currentTrackIndex,
            tracks: entity.trackUnits.map(unit => ({
                title: unit.trackTitle,
                url: unit.trackResourceURL,
                action: unit.playbackCommand,
                status: unit.currentStatus
            }))
        }));
        this.#externalSystems.dataStorage.store('contentCollectionState', JSON.stringify(serializableData));
        this.#externalSystems.userFeedback.notify('Data Saved!');
    }

    retrieveAllContentEntities() {
        return Array.from(this.#collectionStore.values());
    }

    retrieveEntityCount() {
        return this.#collectionStore.size;
    }

    fetchCurrentlyActiveEntity() {
        if (!this.#activeEntityIdentifier) return null;
        return this.#collectionStore.get(this.#activeEntityIdentifier);
    }

    activateContentEntity(entityKey) {
        this.#externalSystems.domInterface.setElementVisibility('#mainDisplayArea', 'visible');

        if (this.#activeEntityIdentifier && this.#collectionStore.has(this.#activeEntityIdentifier)) {
            this.#collectionStore.get(this.#activeEntityIdentifier).isActive = false;
        }

        if (this.#collectionStore.has(entityKey)) {
            const newActive = this.#collectionStore.get(entityKey);
            newActive.isActive = true;
            this.#activeEntityIdentifier = entityKey;
        }
    }

    aggregateAllTrackItems() {
        return Array.from(this.#collectionStore.values()).flatMap(entity => entity.trackUnits);
    }

    controlTrackPlayback(mediaUnit) {
        const playerContainer = this.#externalSystems.domInterface.getElement('#playerPanel');
        const soundEngine = this.#externalSystems.audioPlayerControl;

        if (mediaUnit.playbackCommand === 'Play') {
            soundEngine.loadMedia(mediaUnit.trackResourceURL, {
                artworkDisplay: false,
                autoStart: true,
                commentsEnabled: false,
                purchaseOption: false,
                likeOption: false,
                shareOption: false,
                playCountDisplay: false,
                userDisplay: false,
            });

            this.aggregateAllTrackItems().filter(unit => unit.playbackCommand === 'Stop')
                .forEach(unit => {
                    unit.playbackCommand = 'Play';
                    unit.currentStatus = '';
                });

            mediaUnit.playbackCommand = 'Stop';
            mediaUnit.currentStatus = 'playing';
            this.#externalSystems.domInterface.showVisualElement(playerContainer);
        } else if (mediaUnit.playbackCommand === 'Stop') {
            soundEngine.pauseMedia();
            mediaUnit.playbackCommand = 'Play';
            mediaUnit.currentStatus = '';
            this.#externalSystems.domInterface.hideVisualElement(playerContainer);
        }
    }

    initiatePlaylistPlayback() {
        const activeEntity = this.fetchCurrentlyActiveEntity();
        if (!activeEntity || activeEntity.trackUnits.length === 0) return;

        const firstTrackToPlay = activeEntity.trackUnits[activeEntity.currentTrackIndex];
        this.controlTrackPlayback(firstTrackToPlay);

        this.#externalSystems.audioPlayerControl.registerMediaEvent(
            this.#externalSystems.audioPlayerControl.Events.MEDIA_COMPLETE,
            () => {
                this.advanceToNextTrack(activeEntity.entityId);
            }
        );
    }

    advanceToNextTrack(entityKey) {
        const activeEntity = this.#collectionStore.get(entityKey);
        if (!activeEntity || activeEntity.trackUnits.length === 0) {
            this.#externalSystems.domInterface.hideVisualElement(this.#externalSystems.domInterface.getElement('#playerPanel'));
            if (activeEntity) activeEntity.currentTrackIndex = 0;
            return;
        }

        activeEntity.currentTrackIndex++;

        if (activeEntity.currentTrackIndex >= activeEntity.trackUnits.length) {
            activeEntity.currentTrackIndex = 0;
            this.#externalSystems.audioPlayerControl.pauseMedia();
            this.#externalSystems.domInterface.hideVisualElement(this.#externalSystems.domInterface.getElement('#playerPanel'));
            return;
        }

        const nextTrack = activeEntity.trackUnits[activeEntity.currentTrackIndex];
        this.controlTrackPlayback(nextTrack);
    }

    async addNewTrackItem(trackCaption, trackSourceURL) {
        const activeEntity = this.fetchCurrentlyActiveEntity();
        if (!activeEntity) return;

        const trackFormLoader = this.#externalSystems.domInterface.getElement('#trackAdditionLoader');
        const trackInputForm = this.#externalSystems.domInterface.getElement('#trackAdditionForm');

        this.#externalSystems.domInterface.showVisualElement(trackFormLoader);

        try {
            const resolvedInfo = await this.#externalSystems.apiClient.resolveExternalURL(trackSourceURL);
            if (resolvedInfo && resolvedInfo.kind === 'track') {
                const fullResourceLink = this.#externalSystems.playerBaseLink + resolvedInfo.id;
                activeEntity.trackUnits.push({
                    playbackCommand: 'Play',
                    trackTitle: trackCaption,
                    trackResourceURL: fullResourceLink
                });
            } else {
                this.#externalSystems.userFeedback.notify('Error: Supplied URL is not a valid track.');
            }
        } catch (error) {
            this.#externalSystems.userFeedback.notify(`Failed to add track: ${error.message}`);
        } finally {
            this.#externalSystems.domInterface.hideVisualElement(trackFormLoader);
            this.#externalSystems.domInterface.hideVisualElement(trackInputForm);
        }
    }

    modifyTrackDetails(mediaUnit, newCaption) {
        if (newCaption) {
            mediaUnit.trackTitle = newCaption;
        }
    }

    removeTrackFromActiveEntity(mediaUnit) {
        const activeEntity = this.fetchCurrentlyActiveEntity();
        if (!activeEntity) return;

        if (this.#externalSystems.userFeedback.confirmAction(`Confirm deletion of "${mediaUnit.trackTitle}"?`)) {
            activeEntity.trackUnits = activeEntity.trackUnits.filter(unit => unit !== mediaUnit);
        }
    }

    registerNewContentEntity(entityName, entityDescription) {
        this.#externalSystems.domInterface.setElementVisibility('#mainDisplayArea', 'visible');

        if (this.#activeEntityIdentifier && this.#collectionStore.has(this.#activeEntityIdentifier)) {
            this.#collectionStore.get(this.#activeEntityIdentifier).isActive = false;
        }

        const newEntityKey = `entity-${Date.now()}-${this.#collectionStore.size}`;
        const newEntity = {
            entityId: newEntityKey,
            entityName: entityName,
            entityDescription: entityDescription,
            isActive: true,
            trackUnits: [],
            currentTrackIndex: 0
        };
        this.#collectionStore.set(newEntityKey, newEntity);
        this.#activeEntityIdentifier = newEntityKey;

        this.#externalSystems.domInterface.hideVisualElement(this.#externalSystems.domInterface.getElement('#newEntityFormContainer'));
    }

    updateEntityTitle(newTitle) {
        const activeEntity = this.fetchCurrentlyActiveEntity();
        if (activeEntity && newTitle) {
            activeEntity.entityName = newTitle;
        }
    }

    updateEntityDescription(newDescription) {
        const activeEntity = this.fetchCurrentlyActiveEntity();
        if (activeEntity && newDescription) {
            activeEntity.entityDescription = newDescription;
        }
    }

    deleteCurrentlyActiveEntity() {
        const activeEntity = this.fetchCurrentlyActiveEntity();
        if (!activeEntity) return;

        if (this.#externalSystems.userFeedback.confirmAction(`Are you sure you want to delete "${activeEntity.entityName}"?`)) {
            this.#collectionStore.delete(activeEntity.entityId);
            this.#activeEntityIdentifier = null;
            this.#externalSystems.domInterface.setElementVisibility('#mainDisplayArea', 'hidden');
        }
    }

    saveCurrentStateToStorage() {
        this.#syncPersistentState();
    }

    restoreInitialConfiguration() {
        this.#collectionStore.clear();
        this.#activeEntityIdentifier = null;
        this.#externalSystems.initialDataSet.forEach((item, idx) => {
            const entityKey = item.entityId || `entity-${Date.now()}-${idx}`;
            this.#collectionStore.set(entityKey, {
                entityId: entityKey,
                entityName: item.name,
                entityDescription: item.description,
                isActive: item.selected || false,
                currentTrackIndex: item.currentTrack !== undefined ? item.currentTrack : 0,
                trackUnits: item.tracks.map(track => ({
                    trackTitle: track.title,
                    trackResourceURL: track.url,
                    playbackCommand: track.action || 'Play',
                    currentStatus: track.status || ''
                }))
            });
            if (item.selected) {
                this.#activeEntityIdentifier = entityKey;
            }
        });
        if (!this.#activeEntityIdentifier && this.#collectionStore.size > 0) {
            const firstEntry = this.#collectionStore.values().next().value;
            this.#activeEntityIdentifier = firstEntry.entityId;
            firstEntry.isActive = true;
        }
        this.#syncPersistentState();
    }
}

const globalInitialDataForApp = window.dummy_data || [];
const soundCloudPlayerInstance = window.widget;
const soundCloudWidgetEvents = window.SC && window.SC.Widget && window.SC.Widget.Events;
const soundCloudAPIKey = window.CLIENT_ID;
const soundCloudPlayerBaseURL = window.newWidgetUrl;

const domManipulationModule = {
    getElement: (cssSelector) => document.querySelector(cssSelector),
    setElementVisibility: (cssSelector, displayValue) => {
        const targetElement = document.querySelector(cssSelector);
        if (targetElement) {
            targetElement.style.visibility = displayValue;
        }
    },
    showVisualElement: (elementReference) => {
        if (elementReference) {
            elementReference.style.display = '';
            elementReference.style.opacity = '1';
            elementReference.style.transition = 'opacity 0.3s ease-in-out';
        }
    },
    hideVisualElement: (elementReference) => {
        if (elementReference) {
            elementReference.style.opacity = '0';
            elementReference.style.transition = 'opacity 0.3s ease-in-out';
            setTimeout(() => {
                elementReference.style.display = 'none';
            }, 300);
        }
    }
};

const persistentStorageModule = {
    retrieve: (keyName) => localStorage.getItem(keyName),
    store: (keyName, dataValue) => localStorage.setItem(keyName, dataValue)
};

const userInteractionModule = {
    notify: (messageText) => alert(messageText),
    promptForInput: (messageText, defaultValue) => prompt(messageText, defaultValue),
    confirmAction: (messageText) => confirm(messageText)
};

const externalAPIClientModule = {
    resolveExternalURL: async (urlToResolve) => {
        const resolutionURL = `https://api.soundcloud.com/resolve.json?url=${encodeURIComponent(urlToResolve)}&client_id=${soundCloudAPIKey}`;
        const response = await fetch(resolutionURL);
        if (!response.ok) {
            throw new Error(`External API request failed: ${response.statusText}`);
        }
        return await response.json();
    }
};

const applicationBootstrap = (function() {
    let mainApplicationManager;

    function startApplicationInitialization() {
        const integratedSystems = {
            dataStorage: persistentStorageModule,
            domInterface: domManipulationModule,
            userFeedback: userInteractionModule,
            apiClient: externalAPIClientModule,
            audioPlayerControl: soundCloudPlayerInstance,
            playerBaseLink: soundCloudPlayerBaseURL,
            apiAuthenticationKey: soundCloudAPIKey,
            initialDataSet: globalInitialDataForApp
        };

        if (integratedSystems.audioPlayerControl && soundCloudWidgetEvents) {
            integratedSystems.audioPlayerControl.Events = { MEDIA_COMPLETE: soundCloudWidgetEvents.FINISH };
            integratedSystems.audioPlayerControl.registerMediaEvent = (eventName, eventHandler) => {
                if (integratedSystems.audioPlayerControl.bind) {
                    integratedSystems.audioPlayerControl.bind(eventName, eventHandler);
                } else {
                    console.warn("Audio player lacks 'bind' method for event registration.");
                }
            };
        } else {
            integratedSystems.audioPlayerControl = {
                loadMedia: (url, options) => console.log(`Mock Audio: Loading ${url} with options:`, options),
                pauseMedia: () => console.log('Mock Audio: Paused'),
                registerMediaEvent: (eventName, handler) => console.log(`Mock Audio: Registered event ${eventName}`),
                Events: { MEDIA_COMPLETE: 'mockMediaComplete' }
            };
        }

        mainApplicationManager = new MediaCollectionManager(globalInitialDataForApp, integratedSystems);
        window.applicationModel = mainApplicationManager;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startApplicationInitialization);
    } else {
        startApplicationInitialization();
    }

    return {
        getAppController: () => mainApplicationManager
    };
})();