var cacheVault = {};

/*
 * Module utilities section
 */
function attemptUnpack(inputData) {
  try {
    /*
     * Attempt to parse JSON.
     * If already a string or parse fails, return as is.
     */
    return JSON.parse(inputData);
  } catch(issue) {
    return inputData;
  }
}

function attemptPack(valueToProcess) {
  try {
    valueToProcess = typeof valueToProcess === 'string'
      ? valueToProcess
      : JSON.stringify(valueToProcess);
    return valueToProcess;
  } catch(issue) {
    return valueToProcess;
  }
}

function isStoreOperational(persistenceKind) {
  try {
    return persistenceKind in window && window[persistenceKind] !== null;
  }
  catch (issue) {
    return false;
  }
}

cacheVault.active = isStoreOperational('localStorage');
// This flag indicates if the underlying storage mechanism is available.

/*
 * Least Recently Used (LRU) logic.
 * These operations are designed for small data chunks
 * and are blocking by design.
 */
// Initialize the access order list within the local storage.
// This list will track the sequence of item usage.
localStorage.setItem('accessLog', '[]');

function hasSufficientCapacity(payloadBytes) {
  return payloadBytes < cacheVault.remaining();
}

function promoteItem(resourceIdentifier) {
  // Do not track the access log key itself.
  var orderQueue = attemptUnpack(localStorage.getItem('accessLog'));
  var identifierPosition = orderQueue.indexOf(resourceIdentifier);

  if (resourceIdentifier !== 'accessLog' && identifierPosition > -1) {
    orderQueue.splice(identifierPosition, 1);
    orderQueue.push(resourceIdentifier);
    localStorage.setItem('accessLog', attemptPack(orderQueue));
  }

  if (resourceIdentifier !== 'accessLog' && identifierPosition === -1) {
    orderQueue.push(resourceIdentifier);
    localStorage.setItem('accessLog', attemptPack(orderQueue));
  }
  return orderQueue;
}

function reclaimSpace(bytesToFree) {
  // Continue freeing up space until the required amount is met or exceeded.
  while (bytesToFree > 0) {
    var orderQueue = attemptUnpack(localStorage.getItem('accessLog'));
    var oldestIdentifier = orderQueue.shift();
    localStorage.setItem('accessLog', attemptPack(orderQueue));
    var spaceReleased = calculateByteCount(oldestIdentifier);
    bytesToFree -= spaceReleased;
    delete localStorage[oldestIdentifier];
  }
}

/*
 * Data size and capacity management routines.
 */

// The maximum allowed storage space, typically 5MB.
// Set slightly lower to account for overhead and browser variations.
var MAX_STORAGE_BYTES = 1024 * 1024 * 4.5;

function calculateByteCount(dataString) {
  // Ensure the input is treated as a string for accurate length calculation.
  dataString = String(dataString);

  var totalBytes = 0;
  for (var idx = 0; idx < dataString.length; idx++) {
    var charValue = dataString.charCodeAt(idx);
    totalBytes += charValue < (1 << 7) ? 1 :
                  charValue < (1 << 11) ? 2 :
                  charValue < (1 << 16) ? 3 :
                  charValue < (1 << 21) ? 4 :
                  charValue < (1 << 26) ? 5 :
                  charValue < (1 << 31) ? 6 : Number.NaN;
  }
  return totalBytes;
}

cacheVault.occupancy = function retrieveOccupiedSize() {
  var allKeys = Object.keys(localStorage);
  var identifiersSize = calculateByteCount(allKeys.join(''));
  var storedContent, contentCollection = [];
  for (var idx = 0; idx < allKeys.length; idx++) {
    storedContent = localStorage.getItem(allKeys[idx]);
    contentCollection.push(storedContent);
  }
  var contentSize = calculateByteCount(contentCollection.join(''));
  return identifiersSize + contentSize;
};

cacheVault.remaining = function getAvailableCapacity() {
  return MAX_STORAGE_BYTES - this.occupancy();
};

/*
 * Interface for storing and retrieving data in the cache.
 */
cacheVault.store = function persistData(itemKey, storedContent, onComplete) {
  // Asynchronous operation for non-blocking UI.
  setTimeout(function() {
    // Convert the content to a string representation before storing.
    storedContent = attemptPack(storedContent);
    var payloadBytes = calculateByteCount(itemKey + storedContent);
    if (!hasSufficientCapacity(payloadBytes)) {
      reclaimSpace(payloadBytes);
    }
    promoteItem(itemKey);
    localStorage.setItem(itemKey, storedContent);
    if (typeof onComplete === 'function') onComplete();
  }, 0);
};

cacheVault.fetch = function fetchData(itemKey, completionHandler) {
  setTimeout(function() {
    var storedContent = localStorage.getItem(itemKey);
    if (storedContent) {
      promoteItem(itemKey);
      completionHandler(attemptUnpack(storedContent)); // Callback with the parsed data
    } else {
      completionHandler(); // Indicate cache miss by calling with no arguments
    }
  }, 0);
};