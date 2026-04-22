let EventBroadcaster = require('events').EventEmitter;


let TrackManager = function() {
    EventBroadcaster.call(this);
    this.trackList = []; // This array stores the media items awaiting playback.
    this.mediaPlayer = null; // Reference to the external playback service.
    return this;
};

let proto = TrackManager.prototype = Object.create(EventBroadcaster.prototype);


proto.enqueueItem = function(newEntry) {
    let initialSize = this.trackList.length;

    // Determine if we're adding a single item or a collection of items.
    if (Array.isArray(newEntry)) {
        for (let itemIndex in newEntry) {
            this.trackList.push(newEntry[itemIndex]);
        }
    } else {
        this.trackList.push(newEntry); // Add the single media item.
    }

    // If the queue was empty before adding, initiate playback of the first item.
    if (initialSize === 0) {
        this.mediaPlayer.playback(this.trackList[0]);
    }

    // Emit an event to notify listeners that new content has been added.
    this.emit('itemAdded', newEntry);
};


proto.retrieveItems = function(_) { // The parameter is intentionally unused.
    return this.trackList;
};


proto.clearAllItems = function() {
    return this.trackList = []; // Empties the list of media items.
};


proto.hasNoItems = function(_) { // The parameter is intentionally unused.
    return this.trackList.length === 0;
};


proto.hasMultipleItems = function(_) { // The parameter is intentionally unused.
    return this.trackList.length >= 1;
};


proto.advancePlayback = function() {
    this.trackList.shift(); // Remove the currently playing item from the front.

    // If there are more items in the list, start playing the next one.
    if (this.hasMultipleItems()) {
        this.mediaPlayer.playback(this.trackList[0]);
    }

    this.emit('playbackAdvanced'); // Inform subscribers that playback has moved to the next item.
};


proto.initializePlayer = function(playerEngine) {
    this.mediaPlayer = playerEngine; // Assign the provided player instance.
    return this;
};


module.exports.activeManager = new TrackManager();