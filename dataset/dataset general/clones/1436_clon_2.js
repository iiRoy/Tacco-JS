// This module provides a mechanism for caching information using a Redis backend.
// It creates a new instance of a key-value storage system.
//
// @param dbConnection A client instance for interacting with the Redis database.
// @param restrictedKeyFunc A callback function that generates a unique,
//                          user-specific key for a given resource path.
//                          This could be, for example, a cryptographic hash
//                          of a user's session token combined with the resource's URI.
module.exports = function CacheManager(dbConnection, restrictedKeyFunc) {
  // Method to insert data into the cache.
  this.insertData = function(itemIdentifier, isRestricted, payload, completionHandler) {
    try {
      // Determine the appropriate storage key based on whether the data is restricted.
      var entryKey = isRestricted ? restrictedKeyFunc(itemIdentifier) : itemIdentifier;

      // Serialize the payload to a JSON string, excluding any functions.
      var stringifiedData = JSON.stringify(payload, function(objKey, objVal) {
        return (typeof objVal === 'function')
          ? null
          : objVal;
      });

      // Store the serialized data in the Redis database.
      dbConnection.set(entryKey, stringifiedData, completionHandler);
    }
    catch (operationError) {
      // If an error occurs during the process, pass it to the completion handler.
      completionHandler(operationError);
    }
  };

  // Method to retrieve data from the cache.
  this.retrieveData = function(itemIdentifier, completionHandler) {
    // First, attempt to fetch data from the user-specific (restricted) cache.
    dbConnection.get(restrictedKeyFunc(itemIdentifier), function(issue, cachedItem) {
      if (issue) {
        return completionHandler(issue);
      }
      if (cachedItem) {
        return completionHandler(null, JSON.parse(cachedItem));
      }

      // If not found in the restricted cache, look in the general (public) cache.
      dbConnection.get(itemIdentifier, function(issue, cachedItem) {
        if (issue) {
          return completionHandler(issue);
        }
        return completionHandler(null, JSON.parse(cachedItem));
      });
    });
  };

  // Method to completely empty the cache.
  this.emptyStore = function(completionHandler) {
    dbConnection.flushdb(completionHandler);
  };
};