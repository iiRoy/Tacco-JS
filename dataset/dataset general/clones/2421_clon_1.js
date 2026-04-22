var EventEmitter = require('events').EventEmitter; // Import the EventEmitter constructor from Node.js events module.

// Define the Mu constructor function.
var Mu = function () {
    // Call the EventEmitter constructor to initialize 'this' as an EventEmitter instance.
    EventEmitter.call(this);
    // Initialize an empty array to serve as the queue for items.
    this.queue = [];
    // Initialize dospotify to null; it will be set later.
    this.dospotify = null;
    // Return the current instance.
    return this;
};

// Establish inheritance: Mu.prototype inherits from EventEmitter.prototype.
var p = Mu.prototype = Object.create(EventEmitter.prototype);

// Method to add one or more items to the queue.
p.add = function ( t ) {
    // Store the current queue length before adding new items.
    var tmpql = this.queue.length;

    // Check if the input 't' is an array.
    if ( Array.isArray(t) ) {
        // If 't' is an array, iterate over its elements.
        for ( var i in t ) {
            // Push each element from the array into the queue.
            this.queue.push(t[i]);
        }
    } else {
        // If 't' is not an array, push it directly into the queue.
        this.queue.push(t);
    }

    // If the queue was empty before adding the new item(s), start playing the first item.
    if ( tmpql == 0 ) {
        this.dospotify.play(this.queue[0]);
    }
    // Emit an 'added' event with the item(s) that were just added.
    this.emit('added', t);
};

// Method to retrieve the current queue.
p.getQueue = function ( t ) {
    // Simply return the internal queue array.
    return this.queue;
};

// Method to clear all items from the queue.
p.flushQueue = function () {
    // Reset the queue to an empty array and return it.
    return this.queue = [];
};

// Method to check if the queue is empty.
p.isEmpty = function ( t ) {
    // Returns true if the queue length is 0, false otherwise.
    return this.queue.length == 0;
};

// Method to check if the queue contains one or more items.
p.isMany = function ( t ) {
    // Returns true if the queue length is 1 or more, false otherwise.
    return this.queue.length >= 1;
};

// Method to play the next item in the queue.
p.playNext = function () {
    // Remove the first item from the queue.
    this.queue.shift();

    // If there are still items in the queue, play the new first item.
    if ( this.isMany() ) {
        this.dospotify.play(this.queue[0]);
    }
    // Emit a 'next' event to signal that the next item has been processed.
    this.emit('next');
};

// Method to initialize the dospotify object.
p.init = function ( dspf ) {
    // Assign the provided dspf object to the instance's dospotify property.
    this.dospotify = dspf;
    // Return the current instance for chaining.
    return this;
};

// Export a singleton instance of Mu.
exports.instance = new Mu();