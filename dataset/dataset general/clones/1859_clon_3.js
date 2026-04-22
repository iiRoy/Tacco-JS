/**
 * @module dataStoreFacade
 * @description
 * This module provides a robust interface for interacting with a NoSQL document database,
 * specifically tailored for asynchronous operations within a client-side environment.
 * All exposed methods utilize an options object for flexible parameter passing.
 * @see requestOptions
 */

/**
 * @name requestOptions
 * @field
 * @property {Function} onSuccess Callback invoked upon successful completion of a database operation.
 *    Receives the parsed response data from the server.
 * @property {Function} onFailure Callback executed when a database operation encounters an error.
 *    Typically receives the XMLHttpRequest object for detailed error inspection (status, responseText).
 * @property {String} userName Optional username for authenticated requests.
 * @property {String} passKey Optional password or token for authenticated requests.
 * @property {Number[]} successStatusCodes An array of HTTP status codes considered successful for a specific request.
 */

var dataStoreFacade = {};

(function(apiHandler) {

  // --- Internal Utility Functions ---

  /**
   * Generates a simple pseudo-unique ID.
   * @private
   * @returns {string} A unique identifier string.
   */
  function generateUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Retrieves a reference to the user-specific database.
   * @private
   * @param {Function} completionCallback Function to call with the user database object.
   */
  function fetchUserDatabaseReference(completionCallback) {
    apiHandler.getSessionDetails({
      onSuccess: function(sessionInfo) {
        const userDbRef = apiHandler.getDatabaseInterface(sessionInfo.info.authentication_db);
        completionCallback(userDbRef);
      }
    });
  }

  /**
   * Prepares a user document for storage, handling ID generation and password hashing.
   * @private
   * @param {Object} userDocument The raw user document.
   * @param {string} newPasskey The plaintext password to hash.
   * @returns {Object|null} The prepared user document, or null if hashing is required but unavailable.
   */
  function transformUserDataForStorage(userDocument, newPasskey) {
    if (!userDocument || typeof userDocument !== 'object') {
      console.error("Invalid user document provided for transformation.");
      return null;
    }

    // Ensure SHA-1 hashing utility is available if a new password is provided.
    if (newPasskey && typeof window.sha1Hasher === "undefined") {
      console.error("User document creation with password requires 'sha1Hasher' to be loaded.");
      return null;
    }

    const userIdentifierPrefix = "org.couchdb.user:";
    userDocument._id = userDocument._id || `${userIdentifierPrefix}${userDocument.name}`;

    if (newPasskey) {
      // Apply password cryptography using a salt
      userDocument.salt = generateUniqueId();
      userDocument.hashedCredential = window.sha1Hasher(newPasskey + userDocument.salt);
    }

    userDocument.recordType = "user"; // Renamed 'type' to 'recordType'
    userDocument.roles = userDocument.roles || []; // Ensure roles array exists

    return userDocument;
  }

  /**
   * Encodes a document ID for use in a URL path, handling special design document IDs.
   * @private
   * @param {string} documentKey The document ID to encode.
   * @returns {string} The URL-encoded document ID.
   */
  function sanitizeDocumentKey(documentKey) {
    const keyParts = documentKey.split("/");
    if (keyParts[0] === "_design") {
      keyParts.shift(); // Remove "_design"
      return "_design/" + encodeURIComponent(keyParts.join('/'));
    }
    return encodeURIComponent(documentKey);
  }

  /**
   * List of valid query parameters for database views.
   * @private
   * @type {string[]}
   */
  const validViewParameters = [
    "key", "startkey", "startkey_docid", "endkey", "endkey_docid", "limit",
    "stale", "descending", "skip", "group", "group_level", "reduce",
    "include_docs", "inclusive_end"
  ];

  /**
   * Serializes an object of view parameters into a URL query string.
   * @private
   * @param {Object} parameterObject The object containing view parameters.
   * @returns {string} The URL-encoded query string.
   */
  function serializeViewParams(parameterObject) {
    const querySegments = [];
    for (const paramKey in parameterObject) {
      if (validViewParameters.includes(paramKey)) { // Using Array.prototype.includes
        querySegments.push(`${encodeURIComponent(paramKey)}=${encodeURIComponent(JSON.stringify(parameterObject[paramKey]))}`);
      }
    }
    return querySegments.join('&');
  }

  /**
   * Core asynchronous request utility. This is a simplified stand-in for a full AJAX implementation.
   * In a real application, this would use `XMLHttpRequest`, `fetch`, or a library like Axios.
   * @param {Object} requestConfig Configuration for the HTTP request.
   * @param {string} requestConfig.url The target URL.
   * @param {string} [requestConfig.method='GET'] HTTP method (e.g., 'GET', 'POST', 'PUT', 'DELETE').
   * @param {Object|string} [requestConfig.data] Data to send with the request (for POST/PUT).
   * @param {Object} [requestConfig.headers={}] Custom HTTP headers.
   * @param {string} [requestConfig.userName] Username for basic authentication.
   * @param {string} [requestConfig.passKey] Password for basic authentication.
   * @param {number[]} [requestConfig.successStatusCodes=[200]] Expected success codes.
   * @param {Object} userOptions User-provided options object containing onSuccess/onFailure callbacks.
   * @private
   */
  function makeRequest(requestConfig, userOptions) {
    const defaultRequestConfig = {
      method: 'GET',
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      successStatusCodes: [200]
    };

    const mergedConfig = { ...defaultRequestConfig,
      ...requestConfig
    };
    const options = userOptions || {};

    // Simulate an async operation. In a real scenario, this would be XHR/fetch.
    setTimeout(() => {
      console.log(`Simulating ${mergedConfig.method} request to: ${mergedConfig.url}`);
      console.log('Request Data:', mergedConfig.data);
      console.log('Request Headers:', mergedConfig.headers);
      console.log('User Options:', options);

      // Simple mock success/failure logic
      const isSuccess = Math.random() > 0.1; // 90% chance of success
      const mockResponse = {
        status: isSuccess ? (mergedConfig.successStatusCodes[0] || 200) : 500,
        responseText: isSuccess ? JSON.stringify({
          message: 'Operation completed successfully (simulated).'
        }) : JSON.stringify({
          error: 'Simulated error',
          reason: 'Something went wrong.'
        }),
        info: {
          authentication_db: '_users'
        } // For session info mock
      };

      if (options.onSuccess && mergedConfig.successStatusCodes.includes(mockResponse.status)) {
        options.onSuccess(JSON.parse(mockResponse.responseText));
      } else if (options.onFailure) {
        options.onFailure(mockResponse); // Pass mock XHR-like object
      } else {
        console.warn(`Request to ${mergedConfig.url} finished but no handler for ${isSuccess ? 'success' : 'failure'}.`);
      }
    }, 100);
  }


  // --- Public API Properties ---

  /**
   * The base URL for the database server, e.g., 'http://localhost:5984'.
   * This property must be set before making any requests.
   * @type {string}
   */
  apiHandler.baseEndpoint = '';

  // --- Public API Functions ---

  /**
   * Fetches a list of all available databases on the server.
   * @param {requestOptions} options Configuration and callback options.
   */
  apiHandler.retrieveAllDatabases = function(options) {
    if (!this.baseEndpoint) {
      console.error("baseEndpoint is not set. Cannot retrieve all databases.");
      options.onFailure && options.onFailure({
        status: 0,
        responseText: "Base endpoint not configured."
      });
      return;
    }
    makeRequest({
      url: `${this.baseEndpoint}/_all_dbs`
    }, options);
  };

  /**
   * Retrieves information about the server or a specific database.
   * Include a 'dbIdentifier' field in options to query a database.
   * @param {requestOptions & {dbIdentifier?: string}} options Configuration and callback options.
   */
  apiHandler.getSystemOrDatabaseInfo = function(options) {
    if (!this.baseEndpoint) {
      console.error("baseEndpoint is not set. Cannot get system/database info.");
      options.onFailure && options.onFailure({
        status: 0,
        responseText: "Base endpoint not configured."
      });
      return;
    }
    const targetUrl = `${this.baseEndpoint}/${options.dbIdentifier ? encodeURIComponent(options.dbIdentifier) : ''}`;
    makeRequest({
      url: targetUrl
    }, options);
  };

  /**
   * Manages server configuration settings.
   * @param {requestOptions} options Configuration and callback options.
   * @param {string} [section] The configuration section (e.g., 'couchdb').
   * @param {string} [key] The configuration key within the section.
   * @param {*} [value] The new value to set. If null, the key is deleted. If undefined, it's a GET request.
   */
  apiHandler.manageConfigurationSettings = function(options, section, key, value) {
    if (!this.baseEndpoint) {
      console.error("baseEndpoint is not set. Cannot manage configuration.");
      options.onFailure && options.onFailure({
        status: 0,
        responseText: "Base endpoint not configured."
      });
      return;
    }

    let requestUrl = `${this.baseEndpoint}/_config/`;
    let requestMethod = "GET";
    let requestData = null;

    if (section) {
      requestUrl += `${encodeURIComponent(section)}/`;
      if (key) {
        requestUrl += encodeURIComponent(key);
      }
    }

    if (value === null) {
      requestMethod = "DELETE";
    } else if (value !== undefined) {
      requestMethod = "PUT";
      requestData = JSON.stringify(value);
    }

    makeRequest({
      method: requestMethod,
      url: requestUrl,
      data: requestData
    }, options);
  };

  /**
   * Authenticates a user with the server.
   * @param {requestOptions} options Configuration and callback options.
   * @param {string} userLoginName The username for authentication.
   * @param {string} userPasskey The password for authentication.
   */
  apiHandler.authenticateUser = function(options, userLoginName, userPasskey) {
    if (!userLoginName || !userPasskey) {
      console.error("Username and password are required for authentication.");
      options.onFailure && options.onFailure({
        status: 400,
        responseText: "Missing credentials."
      });
      return;
    }
    // Combine authentication details with other options
    const authOptions = {
      userName: userLoginName,
      passKey: userPasskey,
      ...options
    };
    this.getSessionDetails(authOptions);
  };

  /**
   * Terminates the current user session.
   * @param {requestOptions} options Configuration and callback options.
   */
  apiHandler.terminateSession = function(options) {
    if (!this.baseEndpoint) {
      console.error("baseEndpoint is not set. Cannot terminate session.");
      options.onFailure && options.onFailure({
        status: 0,
        responseText: "Base endpoint not configured."
      });
      return;
    }
    makeRequest({
      method: "DELETE",
      url: `${this.baseEndpoint}/_session`,
      userName: "_", // Dummy credentials for logout as per CouchDB API
      passKey: "_"
    }, options);
  };

  /**
   * Retrieves details about the current user session.
   * @param {requestOptions} options Configuration and callback options.
   */
  apiHandler.getSessionDetails = function(options) {
    if (!this.baseEndpoint) {
      console.error("baseEndpoint is not set. Cannot get session details.");
      options.onFailure && options.onFailure({
        status: 0,
        responseText: "Base endpoint not configured."
      });
      return;
    }
    makeRequest({
      url: `${this.baseEndpoint}/_session`,
      headers: {
        "Accept": "application/json"
      }
    }, options);
  };

  /**
   * Registers a new user.
   * @param {Object} userDetails Document containing user information (e.g., name).
   * @param {string} userPassword The plaintext password for the new user.
   * @param {requestOptions} [options={}] Configuration and callback options.
   */
  apiHandler.registerNewUser = function(userDetails, userPassword, options = {}) {
    if (!userDetails || !userDetails.name || !userPassword) {
      console.error("User details (name) and password are required for registration.");
      options.onFailure && options.onFailure({
        status: 400,
        responseText: "Missing user details or password."
      });
      return;
    }

    const processedUserDoc = transformUserDataForStorage(userDetails, userPassword);

    if (processedUserDoc === null) {
      options.onFailure && options.onFailure({
        status: 500,
        responseText: "Failed to prepare user document for storage."
      });
      return;
    }

    fetchUserDatabaseReference(function(userDatabase) {
      userDatabase.storeDocument(processedUserDoc, options);
    });
  };

  /**
   * Returns an object providing an interface for database-specific operations.
   * @param {string} dbName The name of the database.
   * @param {Object} [dbConfig={}] Optional database-specific configuration.
   * @returns {Object} An object with methods for interacting with the specified database.
   */
  apiHandler.getDatabaseInterface = function(dbName, dbConfig = {}) {
    if (!dbName) {
      console.error("Database name is required to get a database interface.");
      return null;
    }
    if (!this.baseEndpoint) {
      console.error("baseEndpoint is not set. Cannot create database interface.");
      return null;
    }

    const databaseEndpoint = `${this.baseEndpoint}/${encodeURIComponent(dbName)}/`;

    return {
      dbIdentifier: dbName,
      dbEndpoint: databaseEndpoint,

      /**
       * Initiates compaction for the specified database.
       * @param {requestOptions} options Request options.
       */
      initiateCompaction: function(options) {
        makeRequest({
          method: "POST",
          url: `${this.dbEndpoint}_compact`,
          successStatusCodes: [202]
        }, options);
      },

      /**
       * Cleans up old view indexes on disk for the current database.
       * @param {requestOptions} options Request options.
       */
      cleanViewIndexes: function(options) {
        makeRequest({
          method: "POST",
          url: `${this.dbEndpoint}_view_cleanup`,
          successStatusCodes: [202]
        }, options);
      },

      /**
       * Compacts view indexes associated with a specific design document.
       * @param {string} designDocName The name of the design document (e.g., 'mydesigndoc').
       * @param {requestOptions} options Request options.
       */
      compactDesignView: function(designDocName, options) {
        if (!designDocName) {
          console.error("Design document name is required for compactDesignView.");
          options.onFailure && options.onFailure({
            status: 400,
            responseText: "Missing design document name."
          });
          return;
        }
        makeRequest({
          method: "POST",
          url: `${this.dbEndpoint}_compact/${encodeURIComponent(designDocName)}`,
          successStatusCodes: [202]
        }, options);
      },

      /**
       * Creates a new database.
       * @param {requestOptions} options Request options.
       */
      createDatabase: function(options) {
        makeRequest({
          method: "PUT",
          url: this.dbEndpoint,
          successStatusCodes: [201]
        }, options);
      },

      /**
       * Deletes the specified database and all its contents.
       * @param {requestOptions} options Request options.
       */
      deleteDatabase: function(options) {
        makeRequest({
          method: "DELETE",
          url: this.dbEndpoint
        }, options);
      },

      /**
       * Retrieves metadata for the current database.
       * @param {requestOptions} options Request options.
       */
      getDatabaseMetadata: function(options) {
        makeRequest({
          url: this.dbEndpoint
        }, options);
      },

      /**
       * Fetches all documents from this database. Can filter by keys.
       * @param {requestOptions & {documentKeys?: string[]}} options Request options; `documentKeys` for specific IDs.
       */
      fetchAllDocuments: function(options) {
        let requestMethod = "GET";
        let requestPayload = null;
        const currentOptions = { ...options
        }; // Clone options to avoid modifying original

        if (currentOptions.documentKeys) {
          requestMethod = "POST";
          requestPayload = {
            "keys": currentOptions.documentKeys
          };
          delete currentOptions.documentKeys; // Remove from options passed to URL encoder
        }

        makeRequest({
          method: requestMethod,
          data: requestPayload,
          url: `${this.dbEndpoint}_all_docs`
        }, currentOptions);
      },

      /**
       * Fetches all design documents from this database.
       * @param {requestOptions} options Request options.
       */
      fetchDesignDocuments: function(options) {
        this.fetchAllDocuments({
          startkey: "_design",
          endkey: "_design0",
          ...options
        });
      },

      /**
       * Retrieves a specific document by its ID.
       * @param {string} documentId The ID of the document to retrieve.
       * @param {requestOptions} options Request options.
       */
      accessDocument: function(documentId, options) {
        if (!documentId) {
          console.error("Document ID is required for accessDocument.");
          options.onFailure && options.onFailure({
            status: 400,
            responseText: "Missing document ID."
          });
          return;
        }
        makeRequest({
          url: `${this.dbEndpoint}${sanitizeDocumentKey(documentId)}`
        }, options);
      },

      /**
       * Stores or updates a document in the database.
       * If `_id` is present, it's an update; otherwise, a new document is created.
       * @param {Object} document The document object to save.
       * @param {requestOptions} [options={}] Request options.
       */
      storeDocument: function(document, options = {}) {
        if (!document || typeof document !== 'object') {
          console.error("Invalid document provided for storage.");
          options.onFailure && options.onFailure({
            status: 400,
            responseText: "Invalid document."
          });
          return;
        }

        let requestMethod;
        let targetUri;

        if (document._id === undefined) {
          requestMethod = "POST";
          targetUri = this.dbEndpoint;
        } else {
          requestMethod = "PUT";
          targetUri = `${this.dbEndpoint}${sanitizeDocumentKey(document._id)}`;
        }

        makeRequest({
          method: requestMethod,
          url: targetUri,
          data: document,
          successStatusCodes: [200, 201, 202]
        }, options);
      },

      /**
       * Stores multiple documents in a single batch operation.
       * @param {Object[]} documents An array of document objects to save.
       * @param {requestOptions} options Request options.
       */
      storeMultipleDocuments: function(documents, options) {
        if (!Array.isArray(documents) || documents.length === 0) {
          console.error("An array of documents is required for bulk storage.");
          options.onFailure && options.onFailure({
            status: 400,
            responseText: "No documents provided for bulk save."
          });
          return;
        }
        makeRequest({
          method: "POST",
          url: `${this.dbEndpoint}_bulk_docs`,
          data: {
            docs: documents
          },
        }, options);
      },

      /**
       * Deletes a specific document from the database.
       * Requires the document's ID and its current revision (`_rev`).
       * @param {Object} docReference An object with `_id` and `_rev` properties.
       * @param {requestOptions} options Request options.
       */
      deleteDocument: function(docReference, options) {
        if (!docReference || !docReference._id || !docReference._rev) {
          console.error("Document ID and revision (_rev) are required for deletion.");
          options.onFailure && options.onFailure({
            status: 400,
            responseText: "Missing document ID or revision."
          });
          return;
        }
        makeRequest({
          method: "DELETE",
          data: {
            rev: docReference._rev
          },
          url: `${this.dbEndpoint}${sanitizeDocumentKey(docReference._id)}`
        }, options);
      },

      /**
       * Deletes multiple documents in a single batch operation.
       * @param {Object[]} docReferences An array of objects, each with `_id` and `_rev` properties.
       * @param {requestOptions} options Request options.
       */
      deleteMultipleDocuments: function(docReferences, options) {
        if (!Array.isArray(docReferences) || docReferences.length === 0) {
          console.error("An array of document references is required for bulk deletion.");
          options.onFailure && options.onFailure({
            status: 400,
            responseText: "No document references provided for bulk delete."
          });
          return;
        }

        const documentsToDelete = docReferences.map(doc => {
          if (!doc._id || !doc._rev) {
            console.warn("Skipping malformed document reference in bulk delete:", doc);
            return null; // Filter out invalid docs later
          }
          return { ...doc,
            _deleted: true
          };
        }).filter(Boolean); // Remove null entries

        if (documentsToDelete.length === 0) {
          console.warn("No valid document references to delete after filtering.");
          options.onSuccess && options.onSuccess({
            message: "No valid documents to delete."
          }); // Treat as success if nothing to do
          return;
        }

        makeRequest({
          method: "POST",
          successStatusCodes: [201],
          url: `${this.dbEndpoint}_bulk_docs`,
          data: {
            docs: documentsToDelete
          }
        }, options);
      },

      /**
       * Copies an existing document to a new or existing document ID.
       * @param {string} sourceDocumentId The ID of the document to copy.
       * @param {string} targetDocumentId The ID for the new (or existing) document.
       * @param {requestOptions} options Request options.
       */
      replicateDocument: function(sourceDocumentId, targetDocumentId, options) {
        if (!sourceDocumentId || !targetDocumentId) {
          console.error("Source and target document IDs are required for replication.");
          options.onFailure && options.onFailure({
            status: 400,
            responseText: "Missing source or target document ID."
          });
          return;
        }
        makeRequest({
          method: "COPY",
          url: `${this.dbEndpoint}${sanitizeDocumentKey(sourceDocumentId)}`,
          successStatusCodes: [201],
          headers: {
            "Destination": targetDocumentId
          }
        }, options);
      },

      /**
       * Executes a temporary view query using provided map and optional reduce functions.
       * @param {Function|string} mapFunction The map function (as a function or string).
       * @param {Function|string} [reduceFunction] The reduce function (as a function or string).
       * @param {string} [language="javascript"] The language of the view functions.
       * @param {requestOptions} options Request options.
       */
      executeTemporaryView: function(mapFunction, reduceFunction, language = "javascript", options) {
        if (!mapFunction) {
          console.error("Map function is required for temporary view query.");
          options.onFailure && options.onFailure({
            status: 400,
            responseText: "Missing map function."
          });
          return;
        }

        let mapFnSource = typeof mapFunction === "string" ? mapFunction :
          (mapFunction.toSource ? mapFunction.toSource() : `(${mapFunction.toString()})`);

        const requestBody = {
          language: language,
          map: mapFnSource
        };

        if (reduceFunction != null) {
          let reduceFnSource = typeof reduceFunction === "string" ? reduceFunction :
            (reduceFunction.toSource ? reduceFunction.toSource() : `(${reduceFunction.toString()})`);
          requestBody.reduce = reduceFnSource;
        }

        makeRequest({
          method: "POST",
          url: `${this.dbEndpoint}_temp_view`,
          data: requestBody,
          headers: {
            "Content-Type": "application/json"
          }
        }, options);
      },

      /**
       * Fetches output from a CouchDB list function applied to a view.
       * @param {string} listPath The path to the list function (e.g., 'designDocName/listFunctionName').
       * @param {string} viewPath The path to the view (e.g., 'viewName').
       * @param {requestOptions & {documentKeys?: string[]}} options Request options; `documentKeys` for specific IDs.
       */
      retrieveListView: function(listPath, viewPath, options) {
        if (!listPath || !viewPath) {
          console.error("List path and view path are required for retrieveListView.");
          options.onFailure && options.onFailure({
            status: 400,
            responseText: "Missing list or view path."
          });
          return;
        }

        const listParts = listPath.split('/');
        let requestMethod = 'GET';
        let requestPayload = null;
        const currentOptions = { ...options
        };

        if (currentOptions.documentKeys) {
          requestMethod = 'POST';
          requestPayload = {
            'keys': currentOptions.documentKeys
          };
          delete currentOptions.documentKeys;
        }

        makeRequest({
          method: requestMethod,
          data: requestPayload,
          url: `${this.dbEndpoint}_design/${listParts[0]}/_list/${listParts[1]}/${viewPath}`
        }, currentOptions);
      },

      /**
       * Executes a query against a predefined design document view.
       * @param {string} viewIdentifier The identifier of the view (e.g., 'designDocName/viewName').
       * @param {requestOptions & {documentKeys?: string[]}} options Request options; `documentKeys` for specific IDs.
       */
      queryDesignView: function(viewIdentifier, options) {
        if (!viewIdentifier) {
          console.error("View identifier is required for queryDesignView.");
          options.onFailure && options.onFailure({
            status: 400,
            responseText: "Missing view identifier."
          });
          return;
        }

        const viewParts = viewIdentifier.split('/');
        let requestMethod = "GET";
        let requestPayload = null;
        const currentOptions = { ...options
        };

        if (currentOptions.documentKeys) {
          requestMethod = "POST";
          requestPayload = {
            "keys": currentOptions.documentKeys
          };
          delete currentOptions.documentKeys;
        }

        // The original encodeViewOptions was applied to 'options' directly,
        // which implies URL parameters. If 'keys' are handled via POST body,
        // they should not be in the URL params.
        const queryString = serializeViewParams(currentOptions);
        const urlWithParams = `${this.dbEndpoint}_design/${viewParts[0]}/_view/${viewParts[1]}${queryString ? '?' + queryString : ''}`;

        makeRequest({
          method: requestMethod,
          data: requestPayload,
          url: urlWithParams
        }, currentOptions);
      }
    };
  };

})(dataStoreFacade);

// Mock external dependencies for demonstration purposes
// In a real environment, these would be provided by Titanium or other libraries.
if (typeof window.sha1Hasher === "undefined") {
  window.sha1Hasher = function(str) {
    console.warn("Using mock sha1Hasher. Implement a real SHA1 library for production.");
    return `mock_sha1_${str.substring(0, 10)}`;
  };
}
if (typeof console.error === "undefined") {
  console.error = function(...args) {
    // Fallback for environments without console.error
    console.log("ERROR:", ...args);
  };
}
if (typeof console.warn === "undefined") {
  console.warn = function(...args) {
    // Fallback for environments without console.warn
    console.log("WARN:", ...args);
  };
}