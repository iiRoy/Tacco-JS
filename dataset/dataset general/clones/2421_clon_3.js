const EventDispatcher = require('events').EventEmitter;

/**
 * @class PlaybackOrchestrator
 * @description Manages a sequential list of media items, coordinating their playback
 *              through an external audio engine and dispatching relevant events.
 * @extends EventDispatcher
 */
const PlaybackOrchestrator = function() {
    // Enforce instantiation with 'new' keyword for proper context binding.
    if (!(this instanceof PlaybackOrchestrator)) {
        return new PlaybackOrchestrator();
    }

    // Call the parent constructor to ensure event emission capabilities are inherited.
    EventDispatcher.call(this);

    /**
     * @private
     * @type {Array<any>} The internal buffer holding media items awaiting playback.
     */
    this.mediaBuffer = [];

    /**
     * @private
     * @type {object|null} A reference to the external audio playback engine.
     *                      Expected to have a 'play' method, and optionally a 'stop' method.
     */
    this.audioEngine = null;
};

// Establish the prototype chain, linking PlaybackOrchestrator's prototype to EventEmitter's prototype.
const orchestratorPrototype = Object.create(EventDispatcher.prototype);
PlaybackOrchestrator.prototype = orchestratorPrototype;
// Correct the constructor reference on the prototype.
PlaybackOrchestrator.prototype.constructor = PlaybackOrchestrator;

/**
 * @private
 * Initiates or resumes playback of the first item in the media buffer,
 * provided an audio engine is configured and the buffer is not empty.
 * Emits 'playbackStarted' or 'playbackStopped' events as appropriate.
 */
orchestratorPrototype._triggerPlayback = function() {
    // If an audio engine is available and there are items in the buffer.
    if (this.audioEngine && this.mediaBuffer.length > 0) {
        const currentItem = this.mediaBuffer[0];
        this.audioEngine.play(currentItem);
        this.emit('playbackStarted', currentItem);
    } else if (this.audioEngine && typeof this.audioEngine.stop === 'function') {
        // If buffer is empty but engine is active, attempt to stop playback.
        this.audioEngine.stop();
        this.emit('playbackStopped');
    }
};

/**
 * Adds one or more media items to the end of the playback buffer.
 * If the buffer was empty before this operation and items are added,
 * playback of the first item will be attempted.
 *
 * @param {any|Array<any>} itemsToAdd - The media item(s) to be added. Can be a single item
 *                                       or an array of items. Null/undefined items are skipped.
 * @returns {number} The new total count of items in the media buffer.
 */
orchestratorPrototype.enqueueItems = function(itemsToAdd) {
    const previousBufferCount = this.mediaBuffer.length;
    let itemsSuccessfullyAdded = 0;

    // Validate the incoming content to prevent adding null/undefined.
    if (itemsToAdd === null || typeof itemsToAdd === 'undefined') {
        console.warn('[PlaybackOrchestrator] Attempted to enqueue null or undefined content. Operation skipped.');
        return this.mediaBuffer.length;
    }

    // Process arrays of items.
    if (Array.isArray(itemsToAdd)) {
        for (const mediaItem of itemsToAdd) {
            if (mediaItem !== null && typeof mediaItem !== 'undefined') {
                this.mediaBuffer.push(mediaItem);
                itemsSuccessfullyAdded++;
            } else {
                console.warn('[PlaybackOrchestrator] Skipping null/undefined item within an array.');
            }
        }
    } else {
        // Process a single item.
        this.mediaBuffer.push(itemsToAdd);
        itemsSuccessfullyAdded++;
    }

    // If items were added and the buffer was initially empty, try to start playback.
    if (itemsSuccessfullyAdded > 0 && previousBufferCount === 0) {
        this._triggerPlayback();
    }

    // Emit an event indicating that new items have been added to the buffer.
    if (itemsSuccessfullyAdded > 0) {
        this.emit('itemsEnqueued', itemsToAdd);
    }

    return this.mediaBuffer.length;
};

/**
 * Provides a read-only snapshot of the current media items in the playback buffer.
 *
 * @returns {Array<any>} A new array containing all items currently in the buffer.
 */
orchestratorPrototype.retrieveBufferContents = function() {
    // Return a shallow copy to prevent external modification of the internal buffer.
    return [...this.mediaBuffer];
};

/**
 * Completely clears all media items from the playback buffer.
 * If playback was active, it will be stopped.
 *
 * @returns {Array<any>} An empty array, reflecting the cleared state of the buffer.
 */
orchestratorPrototype.purgeBuffer = function() {
    const itemsBeforePurge = this.mediaBuffer; // Keep a reference to items being cleared.
    this.mediaBuffer = []; // Reset the buffer to an empty array.

    // If there were items previously and an audio engine is configured, stop playback.
    if (itemsBeforePurge.length > 0 && this.audioEngine && typeof this.audioEngine.stop === 'function') {
        this.audioEngine.stop();
        this.emit('playbackStopped');
    }

    this.emit('bufferPurged', itemsBeforePurge); // Notify listeners about the cleared items.
    return this.mediaBuffer;
};

/**
 * Determines if the playback buffer currently contains no media items.
 *
 * @returns {boolean} `true` if the buffer is empty, `false` otherwise.
 */
orchestratorPrototype.isBufferEmpty = function() {
    return this.mediaBuffer.length === 0;
};

/**
 * Determines if the playback buffer contains one or more media items.
 * This is the logical inverse of `isBufferEmpty()`.
 *
 * @returns {boolean} `true` if the buffer contains items, `false` otherwise.
 */
orchestratorPrototype.hasBufferContent = function() {
    return this.mediaBuffer.length > 0;
};

/**
 * Advances playback to the next item in the buffer by removing the current item
 * and initiating playback of the subsequent item, if available.
 * Emits 'itemCompleted' for the removed item and 'playbackAdvanced' for the action.
 */
orchestratorPrototype.skipToNextItem = function() {
    // Guard clause: if the buffer is empty, there's nothing to advance.
    if (this.isBufferEmpty()) {
        console.log('[PlaybackOrchestrator] Cannot advance playback; buffer is empty.');
        this.emit('playbackActionFailed', 'BufferEmpty');
        return;
    }

    // Remove the first item, signifying it has completed playback.
    const completedMediaItem = this.mediaBuffer.shift();
    this.emit('itemCompleted', completedMediaItem);

    // If there are still items remaining, attempt to play the next one.
    if (this.hasBufferContent()) {
        this._triggerPlayback();
    } else {
        // If the buffer is now empty, ensure the audio engine stops playback.
        if (this.audioEngine && typeof this.audioEngine.stop === 'function') {
            this.audioEngine.stop();
            this.emit('playbackStopped');
        }
    }
    this.emit('playbackAdvanced');
};

/**
 * Configures or updates the external audio player engine responsible for media playback.
 * This engine must provide a 'play' method. Optionally, it can have a 'stop' method.
 *
 * @param {object} externalPlayerEngine - An object representing the media player,
 *                                        expected to have a `play(mediaItem)` method.
 * @returns {PlaybackOrchestrator} The current instance of the orchestrator for method chaining.
 * @throws {Error} If the provided `externalPlayerEngine` is invalid or lacks a `play` method.
 */
orchestratorPrototype.configurePlayer = function(externalPlayerEngine) {
    // Comprehensive validation for the player engine.
    if (!externalPlayerEngine || typeof externalPlayerEngine !== 'object' || typeof externalPlayerEngine.play !== 'function') {
        throw new Error('Invalid player engine provided. It must be an object with at least a "play" method.');
    }

    this.audioEngine = externalPlayerEngine;
    this.emit('playerEngineConfigured', externalPlayerEngine);

    // If the buffer already contains items, attempt to start playback with the newly configured engine.
    if (this.hasBufferContent()) {
        this._triggerPlayback();
    }

    return this;
};

// Export a singleton instance of the PlaybackOrchestrator for module consumers.
module.exports.globalSequencerInstance = new PlaybackOrchestrator();