// This module manages temporary information,
// discarding the oldest entries as needed.

var policyTypes = {
  itemCount: 0, // Policy based on number of items
  memorySize: 1, // Policy based on total memory consumption
};

function ResourcePool(maxCapacity, cachePolicy) {
  if (!this instanceof ResourcePool) {
    return new ResourcePool(maxCapacity, cachePolicy);
  }

  cachePolicy = cachePolicy || 'itemCount'; // Default policy for resource management
  this.maxCapacity = maxCapacity;
  this.currentPolicy = policyTypes[cachePolicy];

  // `entryMap` holds key-value pairs: {payload, sequenceIndex}.
  //   - payload: The actual data stored.
  //   - sequenceIndex: Its current position in the `keyOrder` array.
  this.entryMap = Object.create(null);
  this.keyOrder = []; // Ordered list of keys, from least recently accessed to most recently accessed.
}

ResourcePool.prototype = {
  storeEntry: function addOrUpdateEntry(recordIdentifier, valueToStore) {
    if (this.entryMap[recordIdentifier] !== undefined) {
      // Item already exists, update its content and move it to the end of the access sequence.
      this.keyOrder.splice(this.entryMap[recordIdentifier].sequenceIndex, 1);

      // Place the updated element at the very end of `keyOrder`.
      this.entryMap[recordIdentifier].sequenceIndex = this.keyOrder.length;
      this.entryMap[recordIdentifier].payload = valueToStore;
      this.keyOrder.push(recordIdentifier);
    } else {
      // New item, first check if eviction is necessary due to capacity limits.
      var removalCount = this.determineRemovalCount();
      for (var k = 0; k < removalCount; k++) {
        // Evict the least recently used item (the first one in `keyOrder`).
        delete this.entryMap[this.keyOrder[0]];
        this.keyOrder.shift();
      }

      this.entryMap[recordIdentifier] = {
        sequenceIndex: this.keyOrder.length,
        payload: valueToStore,
      };
      this.keyOrder.push(recordIdentifier);
    }
  },

  fetchEntry: function retrieveItemData(recordIdentifier) {
    if (this.entryMap[recordIdentifier] !== undefined) {
      // Item exists, update its position to reflect recent usage.
      this.keyOrder.splice(this.entryMap[recordIdentifier].sequenceIndex, 1);
      // Move to the end of the access sequence, marking it as most recently used.
      this.entryMap[recordIdentifier].sequenceIndex = this.keyOrder.length;
      this.keyOrder.push(recordIdentifier);
      return this.entryMap[recordIdentifier].payload;
    } else {
      return null;
    }
  },

  entryExists: function checkPresence(recordIdentifier) {
    return this.entryMap[recordIdentifier] !== undefined;
  },

  // Calculates how many entries should be removed to stay within defined limits.
  determineRemovalCount: function evictionHeuristic() {
    if (this.currentPolicy === policyTypes.itemCount) {
      // For item count policy, remove excess items beyond maxCapacity.
      return Math.max(0, (this.keyOrder.length - this.maxCapacity));
    } else if (this.currentPolicy === policyTypes.memorySize) {
      if (retrieveMemoryUsage() >= this.maxCapacity) {
        console.log('MEMORY_BASED_EVICTION_POLICY_ACTIVE: Current memory:', retrieveMemoryUsage());
        // If memory limit is reached, remove approximately half of the items.
        return (this.keyOrder.length >>> 1); // Unsigned right shift for integer division
      } else {
        return 0; // No eviction needed based on memory.
      }
    } else {
      console.error("Unknown eviction policy '" + this.currentPolicy + "' encountered for resource pool.");
      return 1; // Default to removing one item in case of unknown policy.
    }
  },
};

// Global variable tracking current memory usage in bytes.
var currentMemoryUsage;
var memoryMonitorId;

function retrieveMemoryUsage() {
  if (memoryMonitorId == null) {
    // Initiate periodic recalculation of heap usage every 60,000 milliseconds.
    memoryMonitorId = setInterval(calculateCurrentMemoryUsage, 60 * 1000);
    return calculateCurrentMemoryUsage(); // Return immediate calculation.
  } else {
    return currentMemoryUsage; // Return cached value.
  }
}

function calculateCurrentMemoryUsage() {
  return currentMemoryUsage = process.memoryUsage().heapTotal;
}

module.exports = ResourcePool;