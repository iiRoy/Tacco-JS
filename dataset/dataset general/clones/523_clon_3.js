// This module provides a flexible data storage mechanism with automatic eviction.
// Entries are stored with a timestamp, and removal policies ensure the oldest or least
// accessed data is purged when capacity limits are reached.

// Configuration options for the eviction strategy.
const StoragePolicy = {
  FIXED_CAPACITY: 0, // Eviction based on a set number of items.
  DYNAMIC_MEMORY: 1, // Eviction based on approximate memory footprint.
};

// Internal utility for managing memory statistics in Node.js environments.
let _cachedProcessMemory = 0;
let _memoryUpdateIntervalId = null;
const MEMORY_REFRESH_INTERVAL_MS = 30 * 1000; // Recalculate memory usage every 30 seconds.

/**
 * Recalculates and stores the current heap usage.
 * Only applicable in Node.js environments.
 * @returns {number} The updated heap total in bytes.
 */
function _recomputeCurrentHeapUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    _cachedProcessMemory = process.memoryUsage().heapTotal;
  } else {
    // Fallback for non-Node environments or if memoryUsage is unavailable.
    // In a real-world scenario, this might log a warning or use a different metric.
    _cachedProcessMemory = 0;
  }
  return _cachedProcessMemory;
}

/**
 * Retrieves the last known heap memory usage.
 * Initializes a periodic update mechanism if not already running.
 * @returns {number} The heap total in bytes.
 */
function _obtainCurrentMemorySnapshot() {
  if (_memoryUpdateIntervalId === null) {
    // Start periodic updates. The first call updates immediately.
    _memoryUpdateIntervalId = setInterval(_recomputeCurrentHeapUsage, MEMORY_REFRESH_INTERVAL_MS);
    return _recomputeCurrentHeapUsage();
  }
  return _cachedProcessMemory;
}


/**
 * Constructs a new EvictionStore instance.
 * @param {number} maxCapacity - The maximum number of items or memory threshold.
 * @param {string} [policyName='FIXED_CAPACITY'] - The name of the eviction policy.
 */
function EvictionStore(maxCapacity, policyName) {
  // Ensure the constructor is called with 'new'.
  if (!(this instanceof EvictionStore)) {
    return new EvictionStore(maxCapacity, policyName);
  }

  // Sanitize and set the eviction policy.
  const selectedPolicy = policyName || 'FIXED_CAPACITY';
  this._maxCapacity = maxCapacity;
  this._currentPolicy = StoragePolicy[selectedPolicy.toUpperCase()];

  if (this._currentPolicy === undefined) {
    console.warn(`EvictionStore: Unknown policy '${selectedPolicy}'. Defaulting to FIXED_CAPACITY.`);
    this._currentPolicy = StoragePolicy.FIXED_CAPACITY;
  }

  // Internal data structures:
  // _itemRegistry: Maps keys to { value, positionInOrder }.
  // _accessChronology: An array of keys, ordered from least recently used to most recently used.
  this._itemRegistry = Object.create(null);
  this._accessChronology = [];
}

EvictionStore.prototype = {
  /**
   * Helper to reorder an item to the end of the access chronology.
   * @param {string|number} entryKey - The key of the item to reorder.
   * @param {object} itemRecord - The item's record from _itemRegistry.
   * @private
   */
  _repositionEntryToFront: function(entryKey, itemRecord) {
    // Remove from its current position
    this._accessChronology.splice(itemRecord.positionInOrder, 1);
    // Add to the end (most recently used)
    itemRecord.positionInOrder = this._accessChronology.length;
    this._accessChronology.push(entryKey);
  },

  /**
   * Stores a data item in the cache or updates an existing one.
   * Triggers eviction if capacity limits are exceeded.
   * @param {string|number} entryKey - The unique key for the data item.
   * @param {*} dataPayload - The actual data to be stored.
   */
  depositEntry: function(entryKey, dataPayload) {
    if (entryKey === null || entryKey === undefined) {
      console.error("EvictionStore.depositEntry: Key cannot be null or undefined.");
      return;
    }

    let existingRecord = this._itemRegistry[entryKey];

    if (existingRecord !== undefined) {
      // Item already exists, update its value and move to the end of chronology.
      existingRecord.itemValue = dataPayload;
      this._repositionEntryToFront(entryKey, existingRecord);
    } else {
      // New item: check for eviction before adding.
      let itemsToEvict = this._calculateEvictionQuantity();
      if (itemsToEvict > 0) {
        this._performEviction(itemsToEvict);
      }

      // Add the new item.
      this._itemRegistry[entryKey] = {
        positionInOrder: this._accessChronology.length,
        itemValue: dataPayload,
      };
      this._accessChronology.push(entryKey);
    }
  },

  /**
   * Retrieves a data item from the cache.
   * If found, the item is marked as recently used.
   * @param {string|number} queryKey - The key of the item to retrieve.
   * @returns {*} The stored data payload, or undefined if not found.
   */
  fetchItem: function(queryKey) {
    if (queryKey === null || queryKey === undefined) {
      return undefined;
    }

    let retrievedRecord = this._itemRegistry[queryKey];

    if (retrievedRecord !== undefined) {
      // Item found, reorder it to the end (most recently used).
      this._repositionEntryToFront(queryKey, retrievedRecord);
      return retrievedRecord.itemValue;
    } else {
      return undefined; // Item not in store.
    }
  },

  /**
   * Checks if an item exists in the cache.
   * @param {string|number} checkKey - The key of the item to check.
   * @returns {boolean} True if the item is present, false otherwise.
   */
  hasEntry: function(checkKey) {
    return this._itemRegistry[checkKey] !== undefined;
  },

  /**
   * Determines how many items need to be evicted based on the current policy and capacity.
   * @returns {number} The number of items to evict.
   * @private
   */
  _calculateEvictionQuantity: function() {
    let currentItemCount = this._accessChronology.length;
    let requiredEvictions = 0;

    switch (this._currentPolicy) {
      case StoragePolicy.FIXED_CAPACITY:
        requiredEvictions = Math.max(0, (currentItemCount + 1 - this._maxCapacity));
        break;

      case StoragePolicy.DYNAMIC_MEMORY:
        const currentHeap = _obtainCurrentMemorySnapshot();
        // Log for debugging memory-based eviction, but keep it concise.
        if (currentHeap >= this._maxCapacity) {
          // Evict half of the current items to make significant room.
          requiredEvictions = Math.floor(currentItemCount / 2);
          // Ensure at least one item is evicted if overloaded, unless already empty.
          if (requiredEvictions === 0 && currentItemCount > 0) {
            requiredEvictions = 1;
          }
        }
        break;

      default:
        console.error(`EvictionStore: Unrecognized eviction policy '${this._currentPolicy}'. Cannot determine eviction quantity.`);
        requiredEvictions = 1; // Default to evicting one item to prevent infinite growth.
    }
    return requiredEvictions;
  },

  /**
   * Performs the actual eviction of the oldest items.
   * @param {number} count - The number of items to evict.
   * @private
   */
  _performEviction: function(count) {
    if (count <= 0) {
      return;
    }

    // Iterate and remove from the beginning of _accessChronology (oldest).
    for (let i = 0; i < count; i++) {
      if (this._accessChronology.length === 0) {
        break; // No more items to evict.
      }
      const oldestKey = this._accessChronology.shift(); // Remove from front.
      delete this._itemRegistry[oldestKey]; // Remove from registry.
    }
  },

  /**
   * Clears the entire store.
   */
  clear: function() {
    this._itemRegistry = Object.create(null);
    this._accessChronology = [];
  },

  /**
   * Returns the current number of items in the store.
   * @returns {number}
   */
  size: function() {
    return this._accessChronology.length;
  },

  /**
   * Disposes of any resources held by the store, like interval timers.
   * This is important for preventing memory leaks in long-running applications.
   */
  dispose: function() {
    // The memory monitor is global, so individual instance disposal does not stop it.
    // A separate global cleanup function is provided for that purpose.
  }
};

// Expose the EvictionStore class.
module.exports = EvictionStore;

// Optional: Add a global cleanup function for the memory timer if needed.
// This is outside the scope of a single instance.
module.exports.cleanupMemoryMonitor = function() {
  if (_memoryUpdateIntervalId !== null) {
    clearInterval(_memoryUpdateIntervalId);
    _memoryUpdateIntervalId = null;
    _cachedProcessMemory = 0;
  }
};