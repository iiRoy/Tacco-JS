/**
 * This file orchestrates the components of a single audio stream timeline.
 * It defines the core data structure and behaviors for an individual audio channel.
 *
 * @module      SoundForge.PlaybackLane
 * @author      Jan Myler <jan.myler@example.com> (original author, adapted)
 * @copyright   Copyright 2023, Adapted from original by Jan Myler
 * @license     MIT License (https://opensource.org/licenses/MIT)
 *
 * All adaptations are licensed under the MIT License.
 * Original copyright notice should be retained where applicable.
 */

define([
    'underscore',
    'backbone',
    'SoundForge/SegmentGroups', // Represents a collection of audio segments
    'SoundForge/SegmentUnit'   // Represents a single audio segment
], function(_u, CoreBB, SegmentGroups, SegmentUnit) {
    "use strict"; // Enforce stricter parsing and error handling

    // Defines the blueprint for an individual audio playback channel within the application.
    const PlaybackLane = CoreBB.Model.extend({

        // Default properties for a newly created audio channel.
        // These can be overridden upon instantiation.
        defaults: function() {
            return {
                channelLabel: 'New Channel',      // Display name for the channel
                displayColor: '#3498db',          // Visual identifier color (e.g., for UI)
                amplitudeFactor: 1.0,             // Volume level, typically 0.0 to 1.0
                stereoBalance: 0.5,               // Stereo pan position (0.0=left, 0.5=center, 1.0=right)
                isSilent: false,                  // True if the channel is muted
                exclusivePlay: false,             // True if this is the only channel currently playing (solo mode)
                trackLengthMillis: 1920000,       // Default maximum duration in milliseconds (32 minutes)
                creationTimestamp: Date.now(),    // When this channel was created
                isLocked: false                   // Prevents accidental modifications
            };
        },

        // Initializes the playback channel instance.
        // Sets up event listeners and prepares internal data structures.
        initLane: function() {
            // Bind context for specific methods to ensure 'this' refers to the model instance.
            _u.bindAll(this, 'handleInitialSegmentCreation', 'disposeChannel', 'resetCopyTracker');

            // Establish event listeners for the channel's lifecycle and state changes.
            // Using 'listenTo' for better garbage collection management in Backbone.
            this.listenTo(this, 'remove', this.disposeChannel);
            this.listenTo(this, 'change:channelLabel', this.resetCopyTracker);

            // Initialize the collection that will hold all audio segments for this channel.
            this.segmentCollection = new SegmentGroups();

            // Attempt to add an initial segment if source data is available.
            this.handleInitialSegmentCreation();

            // If the global audio engine is available, register this new channel.
            if (typeof GlobalAudioEngine !== 'undefined' && GlobalAudioEngine.registerLane) {
                GlobalAudioEngine.registerLane(this.cid);
                console.log(`PlaybackLane ${this.cid} registered with audio engine.`);
            } else {
                console.warn(`GlobalAudioEngine not available or missing registerLane method for PlaybackLane ${this.cid}.`);
            }

            // A small validation example: ensure volume is within a reasonable range.
            const currentVolume = this.get('amplitudeFactor');
            if (currentVolume < 0 || currentVolume > 2) {
                console.warn(`Amplitude factor for ${this.get('channelLabel')} is outside typical range (0-2). Current: ${currentVolume}`);
                // Clamp to a valid range, assuming _u.clamp exists or provide a simple inline clamp
                this.set('amplitudeFactor', _u.isFunction(_u.clamp) ? _u.clamp(currentVolume, 0, 2) : Math.max(0, Math.min(currentVolume, 2)));
            }
        },

        // Creates and adds the very first audio segment to the channel's timeline.
        // This typically happens when a new audio file is dropped onto a channel.
        handleInitialSegmentCreation: function() {
            const sourceFile = this.get('sourceFile'); // Assuming 'sourceFile' is set on the model
            const audioBuffer = this.get('audioBuffer'); // Assuming 'audioBuffer' is set on the model

            // Ensure we have the necessary data to create an initial segment.
            if (!sourceFile || !audioBuffer || !audioBuffer.duration) {
                console.warn(`Cannot create initial segment for ${this.get('channelLabel')}: Missing source file or audio buffer data.`);
                return;
            }

            // Construct the new segment unit with relevant properties.
            const initialSegmentData = {
                segmentName: sourceFile.fileName || 'Untitled Segment',
                segmentEnd: audioBuffer.playbackDuration || audioBuffer.duration, // Use playbackDuration if available, fallback to duration
                audioData: audioBuffer,
                segmentStart: 0, // Default start time
                timelinePosition: 0 // Default position on the timeline
            };

            const newSegment = new SegmentUnit(initialSegmentData);
            this.segmentCollection.add(newSegment);
            console.info(`Initial segment '${newSegment.get('segmentName')}' added to channel '${this.get('channelLabel')}'.`);
        },

        // Cleans up the channel when it is removed from the collection.
        disposeChannel: function() {
            if (this.get('isLocked')) {
                console.warn(`Attempted to dispose locked channel: ${this.get('channelLabel')}. Operation aborted.`);
                return; // Prevent disposal if locked
            }

            console.log(`Disposing PlaybackLane ${this.cid} ('${this.get('channelLabel')}').`);

            // Deregister this channel from the global audio engine.
            if (typeof GlobalAudioEngine !== 'undefined' && GlobalAudioEngine.deregisterLane) {
                GlobalAudioEngine.deregisterLane(this.cid);
            }

            // Stop listening to all events on this model to prevent memory leaks.
            this.stopListening();

            // Destroy the model, optionally suppressing further 'remove' events.
            this.destroy({silent: true});
            this.isDisposed = true; // Set a flag indicating disposal
        },

        // Retrieves a subset of segments within a specified time range.
        // @param {number} startPoint - The beginning of the time range (e.g., in milliseconds).
        // @param {number} endPoint   - The end of the time range (e.g., in milliseconds).
        // @returns {Array<SegmentUnit>} A collection of segment models within the range.
        fetchTimeRangeSegments: function(startPoint, endPoint) {
            // Basic input validation
            if (isNaN(startPoint) || isNaN(endPoint) || startPoint < 0 || endPoint < 0 || startPoint > endPoint) {
                console.error(`Invalid time range provided for fetchTimeRangeSegments: start=${startPoint}, end=${endPoint}`);
                return []; // Return an empty array for invalid input
            }
            const segmentsInView = this.segmentCollection.retrieveSegmentSlice(startPoint, endPoint);
            return segmentsInView;
        },

        // Removes segments that fall within a given time range.
        // @param {number} rangeStart       - The start time for deletion.
        // @param {number} rangeEnd         - The end time for deletion.
        // @param {string} [excludedChannelId] - Optional ID of a channel to exclude from deletion (for multi-channel operations).
        eraseTimelinePortion: function(rangeStart, rangeEnd, excludedChannelId) {
            if (this.get('isLocked')) {
                console.warn(`Cannot erase timeline portion on locked channel: ${this.get('channelLabel')}.`);
                return;
            }
            this.segmentCollection.clearSegmentsInRange(rangeStart, rangeEnd, excludedChannelId);
            console.log(`Segments cleared in range [${rangeStart}, ${rangeEnd}] for channel ${this.get('channelLabel')}.`);
        },

        // Inserts a collection of segment data onto the channel's timeline at a specific position.
        // This is typically used for paste operations.
        // @param {number} insertionPoint - The timeline position where segments should be pasted.
        // @param {Array<Object>} copiedSegments - An array of plain objects representing segment data.
        applyClipboardToTimeline: function(insertionPoint, copiedSegments) {
            if (this.get('isLocked')) {
                console.warn(`Cannot paste segments on locked channel: ${this.get('channelLabel')}.`);
                return;
            }

            if (!Array.isArray(copiedSegments) || copiedSegments.length === 0) {
                console.warn('No segments provided in clipboard for pasting.');
                return;
            }

            const currentChannelId = this.cid;
            const globalChannelManager = typeof GlobalAudioEngine !== 'undefined' ? GlobalAudioEngine.allLanes : null;

            copiedSegments.forEach((segmentData, index) => {
                // Construct a new SegmentUnit model from the clipboard data.
                const pastedSegment = new SegmentUnit({
                    segmentStart:   segmentData.segmentStart,
                    segmentEnd:     segmentData.segmentEnd,
                    timelinePosition: segmentData.segmentOffset + insertionPoint, // Adjust position based on insertion point
                    isLooping:      segmentData.isLooping || false,
                    segmentName:    segmentData.segmentName || `Pasted Segment ${index + 1}`,
                    segmentColor:   segmentData.segmentColor || this.get('displayColor'),
                    audioData:      segmentData.audioData
                });

                const segmentStartPos = pastedSegment.get('timelinePosition');
                const segmentEndPos   = segmentStartPos + (pastedSegment.getSegmentDuration ? pastedSegment.getSegmentDuration() : (pastedSegment.get('segmentEnd') - pastedSegment.get('segmentStart')));

                // Before adding the new segment, delete any existing content that would overlap
                // within the same time range across all *other* channels, or just this one.
                if (globalChannelManager && globalChannelManager.eraseTimelinePortion) {
                    globalChannelManager.eraseTimelinePortion(segmentStartPos, segmentEndPos, currentChannelId);
                } else {
                    console.warn('Global channel manager not available for cross-channel deletion during paste.');
                    // Fallback to deleting only on this channel if global manager is not present
                    this.eraseTimelinePortion(segmentStartPos, segmentEndPos);
                }


                this.segmentCollection.add(pastedSegment);
                console.debug(`Segment '${pastedSegment.get('segmentName')}' added at ${segmentStartPos}ms.`);
            });
            console.info(`Pasted ${copiedSegments.length} segments to channel '${this.get('channelLabel')}' at ${insertionPoint}ms.`);
        },

        // Resets any internal tracking information related to channel duplication.
        // This is typically called when a channel's label changes, invalidating old duplication counts.
        resetCopyTracker: function() {
            if (this.copyMetadata) { // Only reset if it actually exists
                this.copyMetadata = null; // Use null instead of undefined for a slight change
                console.log(`Duplication metadata reset for channel '${this.get('channelLabel')}'.`);
            }
        },

        // Creates a duplicate of the current playback channel, including its segments.
        // It also handles renaming the new channel with an incremented copy index.
        createCopy: function() {
            // First, create a shallow clone of the model's attributes.
            const clonedLane = this.clone();

            // Ensure the segment collection is also cloned with its content.
            // We use toJSON() to get plain objects and then reset() the new collection.
            clonedLane.segmentCollection = new SegmentGroups(); // Initialize new collection
            clonedLane.segmentCollection.reset(this.segmentCollection.toFlatArray()); // Assuming toFlatArray() on SegmentGroups

            let clonedLabel = clonedLane.get('channelLabel');
            let copyIndex;

            // Manage duplication counter for consistent naming.
            if (this.copyMetadata && typeof this.copyMetadata.copyCount === 'number') {
                this.copyMetadata.copyCount += 1;
                copyIndex = this.copyMetadata.copyCount;
            } else {
                // First time duplicating this channel, initialize the counter.
                this.copyMetadata = { copyCount: 2 };
                copyIndex = 2; // The first copy will be ' (2)'
            }

            // Update the new channel's label.
            const labelPattern = /\s\((\d+)\)$/; // Regex to find ' (N)' at the end
            const existingMatch = clonedLabel.match(labelPattern);

            if (existingMatch) {
                // If a copy number already exists, replace it.
                clonedLabel = clonedLabel.replace(labelPattern, ` (${copyIndex})`);
            } else {
                // Otherwise, append the copy number.
                clonedLabel += ` (${copyIndex})`;
            }

            clonedLane.set('channelLabel', clonedLabel);
            clonedLane.copyMetadata = this.copyMetadata; // Link the copy metadata

            // Add a new property to differentiate original from clone, if needed.
            clonedLane.set('isClone', true);
            clonedLane.set('originalChannelId', this.cid);

            // Add the new cloned channel to the same collection as the original.
            if (this.collection) {
                const insertPosition = this.collection.indexOf(this) + 1;
                this.collection.add(clonedLane, { at: insertPosition });
                console.info(`Duplicated channel '${this.get('channelLabel')}' to '${clonedLane.get('channelLabel')}' at index ${insertPosition}.`);

                // A non-essential statement: increment a global counter (if it exists)
                if (typeof GlobalAudioEngine !== 'undefined' && GlobalAudioEngine.incrementChannelCount) {
                    GlobalAudioEngine.incrementChannelCount();
                }
            } else {
                console.warn(`Cannot add duplicated channel '${clonedLabel}': Original channel has no collection.`);
            }

            return clonedLane;
        }
    });

    return PlaybackLane;
});