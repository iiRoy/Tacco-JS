const DataStashCreator = function(dataStore, secretKeyGenerator) {
  const contentSerializer = (payload) => {
    const replacerFunction = (keyIdentifier, processedValue) => (typeof processedValue === 'function') ? null : processedValue;
    return JSON.stringify(payload, replacerFunction);
  };

  const contentDeserializer = (serializedPayload) => {
    return JSON.parse(serializedPayload);
  };

  const secureDataOperation = (operationFn, identifier, payload, resultHandler) => {
    try {
      operationFn(identifier, payload, resultHandler);
    } catch (incident) {
      resultHandler(incident);
    }
  };

  this.depositEntry = function(resourceLocator, isRestricted, contentPayload, completionHandler) {
    const determineIdentifier = (restrictedFlag) => restrictedFlag ? secretKeyGenerator(resourceLocator) : resourceLocator;
    const effectiveIdentifier = determineIdentifier(isRestricted);
    const preparedContent = contentSerializer(contentPayload);
    
    secureDataOperation(dataStore.set.bind(dataStore), effectiveIdentifier, preparedContent, completionHandler);
  };

  this.retrieveEntry = function(resourceLocator, completionHandler) {
    const orderedKeySequence = [
      secretKeyGenerator(resourceLocator),
      resourceLocator
    ];

    const processKeyAttempt = (index) => {
      if (index >= orderedKeySequence.length) {
        return completionHandler(null, null); // No content found after all attempts
      }

      const currentKey = orderedKeySequence[index];
      dataStore.get(currentKey, (issueDetail, retrievedData) => {
        if (issueDetail) {
          return completionHandler(issueDetail);
        }
        if (retrievedData !== null && retrievedData !== undefined) {
          return completionHandler(null, contentDeserializer(retrievedData));
        }
        // If data is null/undefined, try the next key in the sequence
        processKeyAttempt(index + 1);
      });
    };

    processKeyAttempt(0); // Initiate the retrieval process with the first key
  };

  this.clearAll = function(completionHandler) {
    dataStore.flushdb(completionHandler);
  };
};

module.exports = DataStashCreator;