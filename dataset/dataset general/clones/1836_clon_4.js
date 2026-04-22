const createDataDepository = (optionsObject = {}) => {
  'use strict';

  const identityEncoder = (contentString) => contentString;
  const identityDecoder = (contentString) => contentString;

  let assignedDepotKey = 'PackageStore';
  let activeEncoder = identityEncoder;
  let activeDecoder = identityDecoder;

  if (optionsObject.depotIdentifier) {
    assignedDepotKey = String(optionsObject.depotIdentifier);
  }

  if (typeof optionsObject.encodeFunction === 'function') {
    activeEncoder = optionsObject.encodeFunction;
  }

  if (typeof optionsObject.decodeFunction === 'function') {
    activeDecoder = optionsObject.decodeFunction;
  }

  const retrieveDataStructure = () => {
    const rawStoredString = window.localStorage.getItem(assignedDepotKey);
    if (rawStoredString === null) {
      return {};
    }
    const decodedString = activeDecoder(rawStoredString);
    return JSON.parse(decodedString);
  };

  const persistDataStructure = (currentDataMap) => {
    const stringifiedData = JSON.stringify(currentDataMap);
    const encodedData = activeEncoder(stringifiedData);
    window.localStorage.setItem(assignedDepotKey, encodedData);
  };

  return {
    storeEntry: (entryLabel, entryValue) => {
      const currentMap = retrieveDataStructure();
      currentMap[entryLabel] = entryValue;
      persistDataStructure(currentMap);
    },

    fetchEntry: (entryLabel) => {
      const currentMap = retrieveDataStructure();
      return currentMap[entryLabel] ?? null;
    },

    removeSpecificEntry: (entryLabel) => {
      const currentMap = retrieveDataStructure();
      if (Object.prototype.hasOwnProperty.call(currentMap, entryLabel)) {
        delete currentMap[entryLabel];
        persistDataStructure(currentMap);
      }
    },

    eraseAllDepotContent: () => {
      window.localStorage.removeItem(assignedDepotKey);
    },

    countTotalEntries: () => {
      const currentMap = retrieveDataStructure();
      return Object.keys(currentMap).length;
    },

    retrieveKeyByIndex: (indexPosition) => {
      const currentMap = retrieveDataStructure();
      const allLabels = Object.keys(currentMap);
      return allLabels[indexPosition] ?? null;
    }
  };
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = createDataDepository;
}