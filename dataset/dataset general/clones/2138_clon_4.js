class EventNexus {
    constructor() {
        this._subscribers = new Map();
    }
    register(eventName, handler) {
        if (!this._subscribers.has(eventName)) {
            this._subscribers.set(eventName, new Set());
        }
        this._subscribers.get(eventName).add(handler);
        return () => this.deregister(eventName, handler);
    }
    deregister(eventName, handler) {
        if (this._subscribers.has(eventName)) {
            this._subscribers.get(eventName).delete(handler);
        }
    }
    dispatch(eventName, payload) {
        if (this._subscribers.has(eventName)) {
            this._subscribers.get(eventName).forEach(handler => {
                try {
                    handler(payload);
                } catch (e) {
                    console.error(`Event handler for '${eventName}' failed:`, e);
                }
            });
        }
    }
}

class AudioFormatInspector {
    constructor() {
        this._testElement = new Audio();
    }
    supports(mimeType) {
        if (!this._testElement || !this._testElement.canPlayType) {
            console.log("AudioFormatInspector: HTML5 audio element not available.");
            return false;
        }
        const result = this._testElement.canPlayType(mimeType);
        return result === "probably" || result === "maybe";
    }
}

class MediaContentItem {
    constructor(bestCodec, rawData) {
        this.uid = rawData.id || `track-${Math.random().toString(36).substring(2, 9)}`;
        this.title = rawData.name;
        this.artistInfo = rawData.artist;
        this.sourceUrl = rawData.src;
        this.currentCodec = bestCodec;
        this.displayLabel = this.artistInfo ? `${this.title} (${this.artistInfo})` : this.title;
        this.domNode = null;
    }
}

class AuralContentHandler {
    constructor(setupOptions) {
        console.log("AuralContentHandler::constructor(%o)", setupOptions);

        this._eventPublisher = new EventNexus();

        this._config = {
            elementClass: "media-sequence",
            elementId: false,
            insertionTarget: null,
            chosenCodec: false,
            contentItems: [],
            availableCodecs: ["audio/ogg", "audio/mpeg"],
            mediaPlayer: null,
            onPlaybackError: (err) => {
                console.error("AuralContentHandler::onPlaybackError(%o)", err);
            },
            onContentStart: (item) => {
                console.log("AuralContentHandler::onContentStart(%o)", item);
                this._clearActiveState();
                if (item && item.domNode) {
                    item.domNode.classList.add("active-content");
                }
            }
        };
        Object.assign(this._config, setupOptions);

        if (this._config.insertionTarget === null) {
            this._config.insertionTarget = document.body;
        }

        this._audioInspector = new AudioFormatInspector();
        if (!this._audioInspector.supports("audio/ogg") && !this._audioInspector.supports("audio/mpeg")) {
            throw new Error("HTML5 audio playback is not supported by this browser.");
        }

        this._config.chosenCodec = this._config.chosenCodec || this._determineOptimalCodec();
        if (!this._config.chosenCodec) {
            throw new Error("No supported audio format could be determined.");
        }

        this._mediaPlayerInstance = this._config.mediaPlayer;

        this._rootContainer = document.createElement('ul');
        this._rootContainer.id = this._config.elementId ? this._config.elementId : `media-sequence-${Math.floor(Math.random() * 1000000000).toString(16)}`;
        this._rootContainer.className = this._config.elementClass;

        this._processedItems = new Map();
        this._itemDomNodes = [];

        this._buildInitialContent(this._config.contentItems);
        this._setupMediaEngineListeners();
    }

    getOutputElement() {
        return this._rootContainer;
    }

    attachToPage() {
        this._config.insertionTarget.appendChild(this._rootContainer);
        this._itemDomNodes.forEach(node => this._rootContainer.appendChild(node));
        return this;
    }

    assignPlayer(newPlayer) {
        this._mediaPlayerInstance = newPlayer;
        this._setupMediaEngineListeners();
        return this;
    }

    traverseItems(callback) {
        this._processedItems.forEach(callback);
    }

    appendSingleItem(itemData) {
        try {
            const newItem = new MediaContentItem(this._config.chosenCodec, itemData);
            this._processedItems.set(newItem.uid, newItem);
            const itemNode = this._generateItemNode(newItem);
            newItem.domNode = itemNode;
            this._itemDomNodes.push(itemNode);
            if (this._rootContainer.parentNode) {
                this._rootContainer.appendChild(itemNode);
            }
        } catch (e) {
            console.error("Unable to add content item %o: %s", itemData, e);
        }
        return this;
    }

    _determineOptimalCodec() {
        console.log("AuralContentHandler::_determineOptimalCodec()");
        for (const codec of this._config.availableCodecs) {
            console.log(`Checking support for: ${codec}`);
            if (this._audioInspector.supports(codec)) {
                return codec;
            }
        }
        return null;
    }

    _buildInitialContent(dataArray) {
        console.log("AuralContentHandler::_buildInitialContent(%o)", dataArray);
        dataArray.forEach(itemData => {
            this.appendSingleItem(itemData);
        });
    }

    _generateItemNode(itemObject) {
        const listItem = document.createElement('li');
        listItem.className = "content-item";
        listItem.textContent = itemObject.displayLabel;
        listItem.dataset.contentUid = itemObject.uid;
        this._attachNodeInteractions(listItem, itemObject);
        return listItem;
    }

    _attachNodeInteractions(node, itemObject) {
        node.addEventListener("click", () => {
            console.log("Clicked on content item %o", itemObject);
            try {
                if (this._mediaPlayerInstance && typeof this._mediaPlayerInstance.pause === 'function') {
                    this._mediaPlayerInstance.pause();
                }
                if (this._mediaPlayerInstance && typeof this._mediaPlayerInstance.play === 'function') {
                    this._mediaPlayerInstance.play(itemObject);
                } else {
                    throw new Error("Media player not configured or lacks 'play' method.");
                }
            } catch (e) {
                this._eventPublisher.dispatch("playbackIssue", {
                    message: e.message,
                    code: "1",
                    item: itemObject
                });
                this._config.onPlaybackError({
                    message: e.message,
                    code: "1",
                    item: itemObject
                });
            }
        });
    }

    _setupMediaEngineListeners() {
        console.log("AuralContentHandler::_setupMediaEngineListeners()");
        if (this._mediaPlayerInstance && typeof this._mediaPlayerInstance.on === 'function') {
            if (this._playerListenerCleanup) {
                this._playerListenerCleanup();
            }

            this._playerListenerCleanup = this._mediaPlayerInstance.on("play", (playedItem) => {
                this._eventPublisher.dispatch("playbackStarted", playedItem);
                this._config.onContentStart(playedItem);
            });
        }
        return this;
    }

    _clearActiveState() {
        this._itemDomNodes.forEach(node => {
            node.classList.remove("active-content");
        });
    }

    _deriveFriendlyTitle(fullPath) {
        let cleanName = fullPath.substring(0, fullPath.lastIndexOf("."));
        cleanName = cleanName.replace(/_/g, " ");

        if (cleanName.includes("/")) {
            cleanName = cleanName.substring(cleanName.lastIndexOf("/") + 1);
        }

        try {
            return decodeURIComponent(cleanName);
        } catch (e) {
            return cleanName;
        }
    }
}