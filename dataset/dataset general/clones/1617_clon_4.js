const cacheManager = {};

function deserializeContent(rawText) {
  try {
    return JSON.parse(rawText);
  } catch (error) {
    return rawText;
  }
}

function serializeContent(itemValue) {
  try {
    return typeof itemValue === 'string' ? itemValue : JSON.stringify(itemValue);
  } catch (error) {
    return String(itemValue);
  }
}

function measureDataPayload(inputVal) {
    const textRepresentation = String(inputVal);
    let totalPayloadSize = 0;
    for (let charIndex = 0; charIndex < textRepresentation.length; charIndex++) {
        const charCodeValue = textRepresentation.charCodeAt(charIndex);
        totalPayloadSize += (charCodeValue < (1 << 7)) ? 1 :
                            (charCodeValue < (1 << 11)) ? 2 :
                            (charCodeValue < (1 << 16)) ? 3 :
                            (charCodeValue < (1 << 21)) ? 4 :
                            (charCodeValue < (1 << 26)) ? 5 :
                            (charCodeValue < (1 << 31)) ? 6 : NaN;
    }
    return totalPayloadSize;
}

const MAXIMUM_CAPACITY_BYTES = 1024 * 1024 * 4.5;
const dataStore = new Map(); // Simulates localStorage for key-value storage
const accessOrder = new Set(); // Stores keys in LRU order, Set maintains insertion order

cacheManager.isOperational = true; // Equivalent to storage.works

cacheManager.currentOccupancy = function() {
  let accumulatedSize = 0;
  for (const [keyIdentifier, storedContent] of dataStore.entries()) {
    accumulatedSize += measureDataPayload(keyIdentifier);
    accumulatedSize += measureDataPayload(storedContent);
  }
  return accumulatedSize;
};

cacheManager.remainingCapacity = function() {
  return MAXIMUM_CAPACITY_BYTES - this.currentOccupancy();
};

function isSufficientSpaceAvailable(requiredBytes) {
  return requiredBytes < cacheManager.remainingCapacity();
}

function updateAccessOrder(keyIdentifier) {
  if (accessOrder.has(keyIdentifier)) {
    accessOrder.delete(keyIdentifier);
  }
  accessOrder.add(keyIdentifier);
}

function evictOldestItems(targetSpaceNeeded) {
  let currentNeeded = targetSpaceNeeded;
  while (currentNeeded > 0 && accessOrder.size > 0) {
    const oldestKey = accessOrder.values().next().value; // Get the first (oldest) key
    accessOrder.delete(oldestKey); // Remove from order tracker

    const storedValue = dataStore.get(oldestKey);
    if (storedValue !== undefined) {
      const freedBytes = measureDataPayload(oldestKey) + measureDataPayload(storedValue);
      currentNeeded -= freedBytes;
      dataStore.delete(oldestKey); // Remove from data storage
    }
  }
}

cacheManager.putItem = function(keyIdentifier, payloadValue, completionCallback) {
  Promise.resolve().then(() => {
    const processedPayload = serializeContent(payloadValue);
    const requiredSize = measureDataPayload(keyIdentifier) + measureDataPayload(processedPayload);

    if (!isSufficientSpaceAvailable(requiredSize)) {
      evictOldestItems(requiredSize);
    }

    updateAccessOrder(keyIdentifier);
    dataStore.set(keyIdentifier, processedPayload);

    if (typeof completionCallback === 'function') {
      completionCallback();
    }
  });
};

cacheManager.retrieveItem = function(keyIdentifier, completionCallback) {
  Promise.resolve().then(() => {
    const storedData = dataStore.get(keyIdentifier);
    if (storedData !== undefined) {
      updateAccessOrder(keyIdentifier);
      completionCallback(deserializeContent(storedData));
    } else {
      completionCallback();
    }
  });
};