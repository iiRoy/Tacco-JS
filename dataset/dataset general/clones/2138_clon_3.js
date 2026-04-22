class EventEmitter {
    constructor() {
        this.eventListeners = new Map();
    }

    on(eventName, callback) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, new Set());
        }
        this.eventListeners.get(eventName).add(callback);
        return this;
    }

    off(eventName, callback) {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName).delete(callback);
        }
        return this;
    }

    emit(eventName, ...args) {
        if (this.eventListeners.has(eventName)) {
            // Create a shallow copy to prevent issues if listeners modify the Set during iteration
            const callbacksToExecute = Array.from(this.eventListeners.get(eventName));
            callbacksToExecute.forEach(callback => {
                try {
                    callback.apply(this, args);
                } catch (error) {
                    console.error(`Error in event listener for '${eventName}':`, error);
                }
            });
        }
        return this;
    }
}

class MediaItemDescriptor {
    constructor(codecType, rawTrackData) {
        // Basic validation for essential track data
        if (!rawTrackData || typeof rawTrackData.source !== 'string') {
            throw new Error('Invalid track data provided: missing source URL.');
        }
        if (!codecType) {
            throw new Error('Codec type must be specified for media item.');
        }

        this.codec = codecType;
        this.sourceUrl = rawTrackData.source;
        this.itemIdentifier = rawTrackData.name || MediaItemDescriptor.extractNameFromUrl(rawTrackData.source);
        this.itemArtist = rawTrackData.artist || 'Unknown Artist';
        this.duration = rawTrackData.duration || 0; // Default duration in seconds
        this.associatedElement = null; // Reference to the DOM element representing this item
    }

    // Static helper to extract a displayable name from a URL
    static extractNameFromUrl(url) {
        const lastSlashIndex = url.lastIndexOf('/');
        let fileName = url.substring(lastSlashIndex + 1);
        const dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0) {
            fileName = fileName.substring(0, dotIndex);
        }
        return decodeURIComponent(fileName.replace(/_/g, ' '));
    }
}

class AudioCompatibilityChecker {
    constructor() {
        this.audioElement = document.createElement('audio');
    }

    // Checks if a given MIME type (codec) is supported by the browser's HTML5 audio capabilities.
    isCodecSupported(codec = 'audio/mpeg') {
        if (!this.audioElement || !this.audioElement.canPlayType) {
            console.warn("HTML5 audio API or canPlayType method not available.");
            return false;
        }
        // canPlayType returns 'probably', 'maybe', or '' (empty string for not supported)
        return this.audioElement.canPlayType(codec).includes('probably');
    }
}

class TrackListManager extends EventEmitter {
    // Default configuration settings for the playlist manager instance
    static DEFAULT_SETTINGS = {
        containerClass: "playback-sequence",     // CSS class for the main container element
        rootId: null,                            // Optional unique ID for the container element
        targetContainer: document.body,          // Parent DOM element to append the playlist to
        preferredCodec: null,                    // Explicitly set preferred audio codec (e.g., "audio/mpeg")
        initialItems: [],                        // Array of initial track data objects to load
        supportedCodecs: ["audio/ogg", "audio/mpeg"], // Ordered list of codecs to check for compatibility
        mediaPlayerInstance: null,               // Reference to the external media player object
        autoInject: true,                        // Automatically add the playlist to the DOM on initialization
        // Callback function for when a playback error occurs
        onPlaybackFailure: (errDetails) => {
            console.error("TrackListManager: Playback failure encountered.", errDetails);
        },
        // Callback function for when a track starts playing
        onItemActivated: (activeItem) => {
            console.info("TrackListManager: Item started playing:", activeItem.itemIdentifier);
            // Visually highlight the active track element
            if (activeItem.associatedElement && activeItem.associatedElement.parentElement) {
                TrackListManager._deactivateAllItems(activeItem.associatedElement.parentElement);
                activeItem.associatedElement.classList.add("active-item");
            }
        },
        itemElementClass: "sequence-item"       // CSS class for individual track list item elements
    };

    /**
     * Constructs a new TrackListManager instance.
     * @param {object} userSettings - User-provided configuration to override defaults.
     */
    constructor(userSettings = {}) {
        super(); // Initialize EventEmitter capabilities

        // Merge default settings with any user-provided overrides
        this.config = { ...TrackListManager.DEFAULT_SETTINGS, ...userSettings };

        // Perform essential configuration validation early in the constructor
        this._validateInitialConfiguration();

        this.managedItems = new Map();      // Stores MediaItemDescriptor objects, keyed by their unique identifier
        this.itemDisplayNodes = [];         // Stores references to the DOM elements representing each track

        this.audioCompatibilityChecker = new AudioCompatibilityChecker();

        // Determine the optimal audio format if not explicitly set in configuration
        this.currentCodec = this.config.preferredCodec || this._determineOptimalCodec();
        if (!this.currentCodec) {
            throw new Error("No supported audio codec found for playback. Initialization failed.");
        }

        // Create the main ordered list container element for the playlist
        this.rootElement = document.createElement('ol');
        this.rootElement.id = this.config.rootId || `playback-sequence-${TrackListManager._generateUniqueId()}`;
        this.rootElement.className = this.config.containerClass;

        // Populate the playlist with any initial items provided in the configuration
        this.loadItemsFromData(this.config.initialItems);

        // Assign the media player instance and set up its event listeners
        this.assignMediaPlayer(this.config.mediaPlayerInstance);

        // If the autoInject option is enabled, render the playlist into the DOM immediately
        if (this.config.autoInject) {
            this.renderIntoDOM();
        }

        // Bind custom event handlers provided in the configuration to the internal event system
        this.on('playbackFailure', this.config.onPlaybackFailure);
        this.on('itemActivated', this.config.onItemActivated);
    }

    // --- Private Helper Methods for Internal Operations ---

    /**
     * Validates and normalizes essential configuration properties during initialization.
     * @private
     */
    _validateInitialConfiguration() {
        // Ensure targetContainer is a valid HTMLElement, attempting to resolve from string ID if needed
        if (!(this.config.targetContainer instanceof HTMLElement)) {
            const resolvedTarget = document.getElementById(this.config.targetContainer);
            if (resolvedTarget instanceof HTMLElement) {
                this.config.targetContainer = resolvedTarget;
            } else {
                console.warn("TrackListManager: Invalid or unresolvable 'targetContainer' provided. Defaulting to document.body.");
                this.config.targetContainer = document.body;
            }
        }
        // Ensure initialItems is an array
        if (!Array.isArray(this.config.initialItems)) {
            console.warn("TrackListManager: 'initialItems' must be an array. Ignoring provided value and using an empty array.");
            this.config.initialItems = [];
        }
    }

    /**
     * Generates a reasonably unique hexadecimal ID string.
     * @private
     * @returns {string} A unique identifier.
     */
    static _generateUniqueId() {
        return Math.floor(Math.random() * 0xFFFFFFFF).toString(16);
    }

    /**
     * Removes the 'active-item' class from all children of a given parent DOM element.
     * This is typically used to ensure only one item is highlighted at a time.
     * @param {HTMLElement} parentElement - The parent container of the list items.
     * @private
     */
    static _deactivateAllItems(parentElement) {
        if (parentElement) {
            parentElement.querySelectorAll('.active-item').forEach(el => {
                el.classList.remove('active-item');
            });
        }
    }

    /**
     * Centralized handler for errors that occur during playback attempts.
     * Emits a 'playbackFailure' event with detailed error information.
     * @param {Error} errorObject - The error that occurred during playback.
     * @param {MediaItemDescriptor} failedItem - The media item that failed to play.
     * @private
     */
    _handlePlayAttemptError(errorObject, failedItem) {
        console.error(`TrackListManager: Playback failed for item '${failedItem.itemIdentifier}':`, errorObject);
        this.emit("playbackFailure", {
            message: errorObject.message,
            code: "PLAYBACK_INIT_ERROR",
            item: failedItem,
            originalError: errorObject
        });
    }

    /**
     * Configures and attaches event listeners to the external media player instance.
     * This method is called internally after a player is assigned.
     * @returns {TrackListManager} This instance for chaining.
     * @private
     */
    _configurePlayerListeners() {
        if (this.activePlayerInstance && typeof this.activePlayerInstance.on === 'function') {
            // Define the handler once to ensure 'this' context is correctly bound
            this._playerPlayHandler = (trackInfo) => {
                // Assuming the player's 'play' event provides an object with 'itemIdentifier'
                const playedItem = this.managedItems.get(trackInfo.itemIdentifier);
                if (playedItem) {
                    this.emit("itemActivated", playedItem);
                } else {
                    console.warn(`TrackListManager: Player reported playing item '${trackInfo.itemIdentifier}', but it's not found in the managed list.`);
                }
            };
            this.activePlayerInstance.on("play", this._playerPlayHandler); // Attach the listener
        } else {
            console.warn("TrackListManager: No valid media player instance provided or it lacks an 'on' method for event subscription.");
        }
        return this;
    }

    /**
     * Determines the most suitable audio codec from the configured list of supported codecs.
     * @returns {string|null} The supported codec string (e.g., "audio/mpeg"), or null if none are found.
     * @private
     */
    _determineOptimalCodec() {
        for (const codec of this.config.supportedCodecs) {
            if (this.audioCompatibilityChecker.isCodecSupported(codec)) {
                return codec;
            }
        }
        return null; // No supported codec found
    }

    // --- Public Interface Methods ---

    /**
     * Retrieves the main container DOM element of the playlist.
     * @returns {HTMLElement} The playlist's root DOM element (an <ol> element).
     */
    getContainerNode() {
        return this.rootElement;
    }

    /**
     * Executes a provided callback function once for each managed media item.
     * @param {Function} callback - The function to execute. It receives (item: MediaItemDescriptor, key: string, map: Map) as arguments.
     */
    forEachItem(callback) {
        this.managedItems.forEach(callback);
    }

    /**
     * Assigns an external media player instance to this manager and sets up its event listeners.
     * This method should be called if the player is initialized after the TrackListManager.
     * @param {object} playerInstance - The media player object, expected to have 'on', 'pause', and 'play' methods.
     * @returns {TrackListManager} This instance for chaining.
     */
    assignMediaPlayer(playerInstance) {
        this.activePlayerInstance = playerInstance;
        return this._configurePlayerListeners();
    }

    /**
     * Appends the playlist container and its constituent item nodes to the configured target DOM element.
     * @returns {TrackListManager} This instance for chaining.
     */
    renderIntoDOM() {
        // Prevent re-injecting if already part of the DOM
        if (!this.rootElement.parentElement) {
            this.config.targetContainer.appendChild(this.rootElement);
            // Append all existing item display nodes
            this.itemDisplayNodes.forEach(node => this.rootElement.appendChild(node));
        } else {
            console.info("TrackListManager: Playlist container is already rendered in the DOM.");
        }
        return this;
    }

    /**
     * Populates the playlist with multiple items from an array of raw track data objects.
     * @param {Array<object>} rawTrackDataArray - An array where each object describes a track (e.g., { source: 'url', name: 'title' }).
     * @returns {TrackListManager} This instance for chaining.
     */
    loadItemsFromData(rawTrackDataArray) {
        if (!Array.isArray(rawTrackDataArray) || rawTrackDataArray.length === 0) {
            console.info("TrackListManager: No track data array provided or array is empty. No items loaded.");
            return this;
        }

        for (const itemData of rawTrackDataArray) {
            this.addSequenceItem(itemData);
        }
        return this;
    }

    /**
     * Adds a single media item to the managed sequence and creates its corresponding DOM element.
     * @param {object} rawItemData - Raw data object describing the media item.
     * @returns {TrackListManager} This instance for chaining.
     */
    addSequenceItem(rawItemData) {
        try {
            // Create a new internal descriptor object for the media item
            const newItem = new MediaItemDescriptor(this.currentCodec, rawItemData);

            // Store the new item in our map, keyed by its unique identifier
            this.managedItems.set(newItem.itemIdentifier, newItem);

            // Create and store the DOM element for this item
            const itemNode = this._createItemDisplayNode(newItem);
            newItem.associatedElement = itemNode; // Link the DOM element back to the descriptor
            this.itemDisplayNodes.push(itemNode);

            // If the playlist is already rendered, append the new item's DOM node immediately
            if (this.rootElement.parentElement) {
                this.rootElement.appendChild(itemNode);
            }
        } catch (error) {
            console.error(`TrackListManager: Failed to add item '${rawItemData.name || rawItemData.source || "unknown"}':`, error.message);
            this.emit("playbackFailure", {
                message: error.message,
                code: "ADD_ITEM_ERROR",
                itemData: rawItemData,
                originalError: error
            });
        }
        return this;
    }

    /**
     * Creates a DOM list item element (<li>) for a given media item descriptor.
     * @param {MediaItemDescriptor} itemDetails - The media item's descriptor object.
     * @returns {HTMLElement} The newly created list item DOM element.
     * @private
     */
    _createItemDisplayNode(itemDetails) {
        const listItem = document.createElement('li');
        listItem.className = this.config.itemElementClass;
        // Construct display text: "Title (Artist)" or "Title"
        listItem.textContent = itemDetails.itemArtist !== 'Unknown Artist'
            ? `${itemDetails.itemIdentifier} (${itemDetails.itemArtist})`
            : itemDetails.itemIdentifier;

        // Store a reference to the item's identifier on the DOM element for easy retrieval
        listItem.dataset.itemId = itemDetails.itemIdentifier;

        this._attachItemEventListeners(listItem, itemDetails);
        return listItem;
    }

    /**
     * Attaches click event listeners to a track's DOM element to handle playback initiation.
     * @param {HTMLElement} itemNode - The DOM element representing the track.
     * @param {MediaItemDescriptor} itemDetails - The associated media item descriptor.
     * @private
     */
    _attachItemEventListeners(itemNode, itemDetails) {
        itemNode.addEventListener('click', () => {
            console.log(`TrackListManager: User clicked to play item: ${itemDetails.itemIdentifier}`);
            // Ensure a player instance exists and has a 'play' method
            if (!this.activePlayerInstance || typeof this.activePlayerInstance.play !== 'function') {
                console.warn("TrackListManager: No active media player or 'play' method available to handle click.");
                this._handlePlayAttemptError(new Error("Media player is not ready or configured."), itemDetails);
                return;
            }
            try {
                // Assuming the player has a `pause()` and `play(itemDescriptor)` method
                // Pause current playback, then initiate play for the clicked item
                if (typeof this.activePlayerInstance.pause === 'function') {
                    this.activePlayerInstance.pause();
                }
                this.activePlayerInstance.play(itemDetails); // Pass the full descriptor object to the player
            } catch (error) {
                this._handlePlayAttemptError(error, itemDetails);
            }
        });
    }

    /**
     * Sanitizes and formats a raw file name or URL segment into a displayable title.
     * This method's logic is largely integrated into `MediaItemDescriptor` now.
     * @param {string} rawName - The raw string to format.
     * @returns {string} The formatted title.
     * @deprecated This method is mostly superseded by `MediaItemDescriptor.extractNameFromUrl`.
     */
    sanitizeItemTitle(rawName) {
        let cleanName = rawName;

        // Remove file extension (e.g., .mp3, .ogg)
        const lastDot = cleanName.lastIndexOf('.');
        if (lastDot > 0) {
            cleanName = cleanName.substring(0, lastDot);
        }

        // Replace underscores with spaces for readability
        cleanName = cleanName.replace(/_/g, ' ');

        // Extract name after the last path separator (e.g., /path/to/file -> file)
        const lastSlash = cleanName.lastIndexOf('/');
        if (lastSlash > -1) {
            cleanName = cleanName.substring(lastSlash + 1);
        }

        // Decode URI components in case of URL-encoded characters
        return decodeURIComponent(cleanName);
    }
}