var dataStoreFacade = {};

(function(coreApi) {

  /*
   * Private helper: Obtains the database for user accounts.
   * @param {Function} completionHandler - Callback to invoke with the user database instance.
   */
  function retrieveUserDatabase(completionHandler) {
    coreApi.getCurrentSession({
      success: function(responsePayload) {
        var loggedInUserDb = coreApi.database(responsePayload.info.authentication_db);
        completionHandler(loggedInUserDb);
      }
    });
  }

  /*
   * Private helper: Prepares a user document for storage, including password hashing.
   * @param {Object} account_record - The user document object.
   * @param {string} secret_phrase - The user's new password.
   * @returns {Object} The formatted user document.
   */
  function formatAccountDocument(account_record, secret_phrase) {
    if (typeof hex_sha1 === "undefined") {
      App.log.err("Account document creation demands 'sha1.js' be included.");
      return;
    }
    var account_id_prefix = "org.couchdb.user:";
    account_record._id = account_record._id || account_id_prefix + account_record.name;
    if (secret_phrase) {
      /* Handle cryptographic hashing for the password */
      account_record.random_seed = _newUUID();
      account_record.hashed_secret = hex_sha1(secret_phrase + account_record.random_seed);
    }
    account_record.type = "user";
    if (!account_record.roles) {
      account_record.roles = [];
    }
    return account_record;
  }

  /*
   * Private helper: Encodes a document ID for URL safety, handling design documents.
   * @param {string} doc_id_string - The document identifier.
   * @returns {string} The URL-encoded document ID.
   */
  function sanitizeDocumentIdentifier(doc_id_string) {
    var segments = doc_id_string.split("/");
    if (segments[0] === "_design") {
      segments.shift();
      return "_design/" + encodeURIComponent(segments.join('/'));
    }
    return encodeURIComponent(doc_id_string);
  }

  /*
   * Private constant: List of valid view query parameters.
   */
  var queryParametersList = [
    "key", "startkey", "startkey_docid", "endkey", "endkey_docid", "limit",
    "stale", "descending", "skip", "group", "group_level", "reduce",
    "include_docs", "inclusive_end"
  ];

  /*
   * Private helper: Encodes an object's properties into a URL query string,
   * specifically for view options.
   * @param {Object} input_object - The object containing query parameters.
   * @returns {string} The URL-encoded query string.
   */
  function serializeQueryParams(input_object) {
    /* Refer to http://wiki.apache.org/couchdb/HTTP_view_API; "keys" handled separately */
    var param_buffer = [];
    for (var prop_name in input_object) {
      if (inArray(prop_name, queryParametersList) > -1) {
        param_buffer.push(encodeURIComponent(prop_name) + "=" + encodeURIComponent(JSON.stringify(input_object[prop_name])));
      }
    }
    return param_buffer.join('&');
  }


  /*
   * The base URL for the NoSQL server, e.g., 'http://127.0.0.1:5984'
   */
  coreApi.baseEndpoint = '';

  /* Public API Methods */

  /*
   * Retrieves a comprehensive list of all available databases.
   * @param {Object} requestOptions - Configuration options for the request.
   */
  coreApi.listAllDatabases = function(requestOptions) {
    ajax({
      url: this.baseEndpoint + "/_all_dbs"
    }, requestOptions);
  };

  /*
   * Fetches metadata about the server or a specific database.
   * Requires a "databaseName" field in the options for database info.
   * @param {Object} requestOptions - Configuration options.
   */
  coreApi.getSystemInfo = function(requestOptions) {
    ajax({
      url: this.baseEndpoint + "/" + (requestOptions.databaseName || "")
    }, requestOptions);
  };

  coreApi.modifyConfiguration = function(requestOptions, configSection, configKey, configValue) {
    var api_request = { url: this.baseEndpoint + "/_config/" };
    if (configSection) {
      api_request.url += encodeURIComponent(configSection) + "/";
      if (configKey) {
        api_request.url += encodeURIComponent(configKey);
      }
    }
    if (configValue === null) {
      api_request.method = "DELETE";
    }
    else if (configValue !== undefined) {
      api_request.method = "PUT";
      api_request.data = JSON.stringify(configValue);
    }
    ajax(api_request, requestOptions);
  };

  coreApi.authenticate = function(requestOptions, userIdentifier, userSecret) {
    this.getCurrentSession(extend({ username:userIdentifier, password:userSecret}, requestOptions));
  };

  coreApi.deauthenticate = function(requestOptions) {
    ajax({
      method: "DELETE",
      url: this.baseEndpoint + "/_session",
      username: "_",
      password: "_"
    }, requestOptions);
  };

  coreApi.getCurrentSession = function(requestOptions) {
    ajax({
      url: this.baseEndpoint + "/_session",
      headers: { "Accept": "application/json" }
    }, requestOptions);
  };

  coreApi.registerAccount = function(account_record, secret_phrase, requestOptions) {
    requestOptions = requestOptions || {};
    account_record = formatAccountDocument(account_record, secret_phrase);
    retrieveUserDatabase(function(loggedInUserDb) {
      loggedInUserDb.persistDocument(account_record, requestOptions);
    });
  };

  coreApi.database = function(db_name, database_settings) {
    database_settings = database_settings || {};

    return {
      name: db_name,
      resource_uri: this.baseEndpoint + "/" + encodeURIComponent(db_name) + "/",

      /*
       * Initiates compaction for the specified database.
       * @param {Object} requestOptions - Options for the compaction request.
       */
      defragment: function(requestOptions) {
        ajax({
          method: "POST",
          url: this.resource_uri + "_compact",
          successStatus: 202
        }, requestOptions);
      },

      /*
       * Clears out obsolete view output from disk for a particular view.
       */
      cleanViewIndexes: function(requestOptions) {
        ajax({
          method: "POST",
          url: this.resource_uri + "_view_cleanup",
          successStatus: 202
        }, requestOptions);
      },

      /*
       * Compresses view indexes linked to a specific design document.
       * Can be used as an alternative to full database compaction when
       * only certain view indexes have been modified.
       */
      defragmentView: function(viewGroupName, requestOptions) {
        ajax({
          method: "POST",
          url: this.resource_uri + "_compact/" + viewGroupName,
          successStatus: 202
          }, requestOptions);
      },

      /*
       * Establishes a brand new database.
       */
      establish: function(requestOptions) {
        ajax({
          method: "PUT",
          url: this.resource_uri,
          successStatus: 201
        }, requestOptions);
      },

      /*
       * Permanently removes the designated database, along with all
       * its contents (documents and attachments).
       */
      annihilate: function(requestOptions) {
        ajax({
          method: "DELETE",
          url: this.resource_uri
        }, requestOptions);
      },

      /*
       * Retrieves detailed information about the specified database.
       */
      details: function(requestOptions) {
        ajax({
          url: this.resource_uri
        }, requestOptions);
      },

      /* TODO TODO TODO
      changes: function(since, requestOptions) {

        requestOptions = requestOptions || {};
        // set up the promise object within a closure for this handler
        var timeout = 100, db = this, active = true,
          listeners = [],
          promise = {
          onChange : function(fun) {
            listeners.push(fun);
          },
          stop : function() {
            active = false;
          }
        };
        // call each listener when there is a change
        function triggerListeners(resp) {
          $.each(listeners, function() {
            this(resp);
          });
        };
        // when there is a change, call any listeners, then check for
        // another change
        requestOptions.success = function(resp) {
          timeout = 100;
          if (active) {
            since = resp.last_seq;
            triggerListeners(resp);
            getChangesSince();
          };
        };
        requestOptions.error = function() {
          if (active) {
            setTimeout(getChangesSince, timeout);
            timeout = timeout * 2;
          }
        };
        // actually make the changes request
        function getChangesSince() {
          var opts = $.extend({heartbeat : 10 * 1000}, requestOptions, {
            feed : "longpoll",
            since : since
          });
          ajax(
            {url: db.resource_uri + "_changes"+encodeOptions(opts)},
            requestOptions,
            "Error connecting to "+db.resource_uri+"/_changes."
          );
        }
        // start the first request
        if (since) {
          getChangesSince();
        } else {
          db.details({
            success : function(info) {
              since = info.update_seq;
              getChangesSince();
            }
          });
        }
        return promise;
      },
      */

      /*
       * Retrieves all documents within this database. An array of specific
       * document keys can be provided via the `document_keys` field in `requestOptions`.
       * @param {Object} requestOptions - Configuration options.
       */
      retrieveAllDocuments: function(requestOptions) {
        var http_method = "GET";
        var request_data = null;
        if (requestOptions["document_keys"]) {
          http_method = "POST";
          var document_keys = requestOptions["document_keys"];
          delete requestOptions["document_keys"];
          request_data = { "keys": document_keys };
        }
        ajax({
            method: http_method,
            data: request_data,
            url: this.resource_uri + "_all_docs"
        }, requestOptions);
      },

      /*
       * Obtains all design documents in the current database.
       * @param {Object} requestOptions - Configuration options.
       */
      retrieveAllDesignDocuments: function(requestOptions) {
        this.retrieveAllDocuments(extend({ startkey:"_design", endkey:"_design0" }, requestOptions));
      },

      /*
       * Fetches the specified document from the database.
       * @param {string} documentId - The ID of the document to retrieve.
       * @param {Object} requestOptions - Configuration options.
       */
      accessDocument: function(documentId, requestOptions) {
        ajax({
          url: this.resource_uri + sanitizeDocumentIdentifier(documentId)
        }, requestOptions);
      },

      /*
       * Creates a new document in the designated database using the provided
       * JSON structure. If `_id` is present, the document will use that ID;
       * otherwise, a new unique ID will be generated.
       * @param {Object} document_object - The JSON document to save.
       * @param {Object} requestOptions - Configuration options.
       */
      persistDocument: function(document_object, requestOptions) {
        requestOptions = requestOptions || {};
        var current_db_instance = this;
        if (document_object._id === undefined) {
          var http_method = "POST";
          var target_uri = this.resource_uri;
        }
        else {
          var http_method = "PUT";
          var target_uri = this.resource_uri + sanitizeDocumentIdentifier(document_object._id);
        }
        ajax({
          method: http_method,
          url: target_uri,
          data: document_object,
          successStatus: [200, 201, 202]
        }, requestOptions);
      },

      /*
       * Saves multiple documents in a single batch operation.
       * @param {Object} document_collection - An object containing a `docs` array of documents.
       * @param {Object} requestOptions - Configuration options.
       */
      batchPersist: function(document_collection, requestOptions) {
        ajax({
          method: "POST",
          url: this.resource_uri + "_bulk_docs",
          data: document_collection,
        }, requestOptions);
      },

      /*
       * Removes the specified document from the database. The current (latest)
       * revision and `_id` of the document must be supplied, e.g.,
       * `deleteDocument({_id:"my_record", _rev: "1-2345"})`.
       * @param {Object} document_object - The document to delete (must include `_id` and `_rev`).
       * @param {Object} requestOptions - Configuration options.
       */
      deleteDocument: function(document_object, requestOptions) {
        ajax({
          method: "DELETE",
          data: { rev: document_object._rev },
          url: this.resource_uri + sanitizeDocumentIdentifier(document_object._id)
        }, requestOptions);
      },

      /*
       * Deletes a collection of documents in a batch.
       * @param {Object} document_collection - An object containing a `docs` array of documents.
       * @param {Object} requestOptions - Configuration options.
       */
      batchDelete: function(document_collection, requestOptions){
        document_collection.docs = each(document_collection.docs, function(idx, doc_item) {
          doc_item._deleted = true;
        });
        ajax({
          method: "POST",
          successStatus: 201,
          url: this.resource_uri + "_bulk_docs",
          data: document_collection
        }, requestOptions);
      },

      /*
       * Duplicates an existing document to a new or pre-existing document.
       * @param {string} sourceId - The ID of the source document.
       * @param {string} targetId - The ID for the new or target document.
       * @param {Object} requestOptions - Configuration options.
       */
      duplicateDocument: function(sourceId, targetId, requestOptions) {
        if (!targetId) {
          /* TODO Generate a UUID */
        }
        ajax({
          method: "COPY",
          url: this.resource_uri + sanitizeDocumentIdentifier(sourceId),
          successStatus: 201,
          headers: { "Destination": targetId }
        }, requestOptions);
      },

      /*
       * Creates and executes a transient view.
       * @param {Function|string} mapFunction - The map function.
       * @param {Function|string} reduceFunction - The reduce function (optional).
       * @param {string} queryLanguage - The language of the view functions (default: "javascript").
       * @param {Object} requestOptions - Configuration options.
       */
      executeTemporaryQuery: function(mapFunction, reduceFunction, queryLanguage, requestOptions) {
        queryLanguage = queryLanguage || "javascript";
        if (typeof(mapFunction) !== "string") {
          mapFunction = mapFunction.toSource ? mapFunction.toSource() : "(" + mapFunction.toString() + ")";
        }
        var request_body = {language: queryLanguage, map: mapFunction};
        if (reduceFunction != null) {
          if (typeof(reduceFunction) !== "string")
            reduceFunction = reduceFunction.toSource ? reduceFunction.toSource()
              : "(" + reduceFunction.toString() + ")";
          request_body.reduce = reduceFunction;
        }
        ajax({
            method: "POST",
            url: this.resource_uri + "_temp_view",
            data: request_body,
            headers: { "Content-Type": "application/json" }
          },
          requestOptions);
      },


      /*
       * Fetches output from a `_list` view. A list of `document_keys` can be
       * specified in the `requestOptions` to retrieve only those keys.
       * @param {string} listPath - The path to the list function (e.g., "design_doc/list_func").
       * @param {string} viewName - The name of the view.
       * @param {Object} requestOptions - Configuration options.
       */
      fetchListViewOutput: function(listPath, viewName, requestOptions) {
        var list_parts = listPath.split('/');
        var http_method = 'GET';
        var request_data = null;
        if (requestOptions['document_keys']) {
          http_method = 'POST';
          var document_keys = requestOptions['document_keys'];
          delete requestOptions['document_keys'];
          request_data = {'keys': document_keys };
        }
        ajax({
          method: http_method,
          data: request_data,
          url: this.resource_uri + '_design/' + list_parts[0] + '/_list/' + list_parts[1] + '/' + viewName
        }, requestOptions);
      },

      /*
       * Executes a named view from a specified design document.
       * A list of `document_keys` can be provided in `requestOptions`
       * to filter the results.
       * @param {string} viewPath - The path to the view (e.g., "design_doc/view_name").
       * @param {Object} requestOptions - Configuration options.
       */
      processView: function(viewPath, requestOptions) {
        var view_parts = viewPath.split('/');
        var http_method = "GET";
        var request_data = null;
        if (requestOptions["document_keys"]) {
          http_method = "POST";
          var document_keys = requestOptions["document_keys"];
          delete requestOptions["document_keys"];
          request_data = { "keys": document_keys };
        }
        ajax({
            method: http_method,
            data: request_data,
            url: this.resource_uri + "_design/" + view_parts[0] + "/_view/" + view_parts[1] + '?' + serializeQueryParams(requestOptions)
          }, requestOptions);
      },

      /*
       * Fetches an arbitrary property of a NoSQL database. As of version 1.1, only
       */
    };
  };

})(dataStoreFacade);