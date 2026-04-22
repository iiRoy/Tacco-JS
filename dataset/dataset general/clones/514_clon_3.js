/* This file defines the Angular module for connecting to a content API,
 * providing a service and a directive for displaying structured content.
 * All identifiers and structures have been extensively modified to create
 * a Type III code clone.
 */
'use strict';

// Define a new Angular module for our content management system integration.
angular.module('ng.contentConnect', [])

  // Provider for the main content API service, allowing configuration during app setup.
  .provider('ContentApi', function() {

    // Internal utility for managing configuration properties.
    var ConfigurationManager = {};

    // Default values for various configuration settings.
    const DEFAULT_CONFIG_ = {
      endpointUrl: '',
      authenticationToken: '',
      applicationId: '',
      applicationSecret: '',
      uriResolutionLogic: () => '', // A default empty function for link resolution.
      useNativeHttpRequest: false, // Flag to use the upstream library's default request handler.
      authenticationScope: ''
    };

    /**
     * Initializes a target object with configuration properties and their respective setters.
     * @param {object} targetObject The object to configure (either the provider or the service).
     * @param {object} currentSettings The configuration object to populate and manage.
     */
    ConfigurationManager.setup = function(targetObject, currentSettings) {
      targetObject.serviceSettings = currentSettings; // Store settings reference.

      // Helper to assign default values or existing ones.
      const assignSetting = (key, defaultValue) => {
        currentSettings[key] = currentSettings[key] || defaultValue;
      };

      // Set up endpoint URL and its setter.
      assignSetting('endpointUrl', DEFAULT_CONFIG_.endpointUrl);
      targetObject.setEndpointUrl = function(url) {
        if (typeof url === 'string' && url.trim().length > 0) {
          currentSettings.endpointUrl = url.trim();
        } else {
          console.warn('ContentApi: Invalid endpoint URL provided. Keeping current or default.');
        }
      };

      // Set up authentication token and its setter.
      assignSetting('authenticationToken', DEFAULT_CONFIG_.authenticationToken);
      targetObject.setAuthenticationToken = function(token) {
        currentSettings.authenticationToken = token;
      };

      // Set up application ID and its setter.
      assignSetting('applicationId', DEFAULT_CONFIG_.applicationId);
      targetObject.setApplicationId = function(id) {
        currentSettings.applicationId = id;
      };

      // Set up application secret and its setter.
      assignSetting('applicationSecret', DEFAULT_CONFIG_.applicationSecret);
      targetObject.setApplicationSecret = function(secret) {
        currentSettings.applicationSecret = secret;
      };

      // Set up URI resolution logic and its setter.
      assignSetting('uriResolutionLogic', DEFAULT_CONFIG_.uriResolutionLogic);
      targetObject.setUriResolutionLogic = function(resolverFn) {
        if (typeof resolverFn === 'function') {
          currentSettings.uriResolutionLogic = resolverFn;
        } else {
          console.error('ContentApi: URI resolution logic must be a function.');
        }
      };

      // Set up flag for using native HTTP request handler and its setter.
      assignSetting('useNativeHttpRequest', DEFAULT_CONFIG_.useNativeHttpRequest);
      targetObject.enableNativeHttpRequest = function(enable) {
        currentSettings.useNativeHttpRequest = !!enable;
      };

      // Set up OAuth scope and its setter.
      assignSetting('authenticationScope', DEFAULT_CONFIG_.authenticationScope);
      targetObject.setAuthenticationScope = function(scope) {
        currentSettings.authenticationScope = scope;
      };
    };

    // Global settings object for the provider.
    var providerLevelSettings = {};
    ConfigurationManager.setup(this, providerLevelSettings);

    /**
     * The $get method returns the actual service instance.
     * @param {Window} $window Angular's window service.
     * @param {HttpService} $http Angular's HTTP service.
     * @param {QService} $q Angular's promise service.
     * @returns {object} The ContentApi service instance.
     */
    this.$get = ['$window', '$http', '$q', function($window, $http, $q) {

      // Define a standard error message for rejections.
      const STANDARD_REJECT_MSG = 'Content API operation failed.';

      /**
       * Creates and configures the Content API service instance.
       * @param {object} clientConfig The configuration object for this service instance.
       * @returns {object} The configured Content API service.
       */
      function createContentApiService(clientConfig) {
        var apiInstance = {}; // The service object to be returned.
        var externalContentLib = $window.Prismic; // Reference to the global Prismic library.

        // Check if the external library is available.
        if (!externalContentLib) {
          console.error('ContentApi: Prismic library not found on $window. Please ensure it is loaded.');
          // Return a dummy service that always rejects to prevent runtime errors.
          return {
            api: () => $q.reject('Prismic library not loaded.'),
            ctx: () => $q.reject('Prismic library not loaded.'),
            authenticationUrl: () => $q.reject('Prismic library not loaded.'),
            fetchAllItems: () => $q.reject('Prismic library not loaded.'),
            performQuery: () => $q.reject('Prismic library not loaded.'),
            fetchByType: () => $q.reject('Prismic library not loaded.'),
            fetchById: () => $q.reject('Prismic library not loaded.'),
            fetchByIds: () => $q.reject('Prismic library not loaded.'),
            fetchBookmarkedItem: () => $q.reject('Prismic library not loaded.')
          };
        }

        var cachedApiContextPromise; // Promise for the API context, for memoization.
        var cachedApiHandlePromise; // Promise for the API handle, for memoization.

        /**
         * Custom HTTP request handler for the external content library.
         * Wraps Angular's $http service.
         * @param {string} resourcePath The URL to request.
         * @param {function} completionCallback The callback function (error, data).
         */
        function customHttpRequestHandler(resourcePath, completionCallback) {
          const httpRequestOptions = {
            headers: {
              'Accept': 'application/json'
            }
          };

          $http.get(resourcePath, httpRequestOptions)
            .then(
              function(httpResponse) {
                completionCallback(null, httpResponse.data);
              },
              function(httpError) {
                console.error('ContentApi: HTTP request failed:', httpError);
                completionCallback(httpError, null);
              }
            );
        }

        /**
         * Retrieves the main API handle from the external library.
         * @returns {Promise} A promise that resolves with the API handle.
         */
        function retrieveApiHandle() {
          var promiseDeferred = $q.defer();
          const apiCallback = function(fetchError, apiResult) {
            if (apiResult) {
              promiseDeferred.resolve(apiResult);
            } else {
              console.error('ContentApi: Failed to retrieve API handle:', fetchError);
              promiseDeferred.reject(fetchError || new Error('API initialization error.'));
            }
          };

          // Use the external library's API initialization.
          externalContentLib.Api(
            clientConfig.endpointUrl,
            apiCallback,
            clientConfig.authenticationToken,
            clientConfig.useNativeHttpRequest ? undefined : customHttpRequestHandler // Pass custom handler if configured.
          );

          return promiseDeferred.promise;
        }

        /**
         * Constructs the content API context object, including API handle, ref, and resolver.
         * @param {string} currentRevisionRef Optional revision reference from query string.
         * @returns {Promise} A promise that resolves with the constructed context.
         */
        function assembleApiContext(currentRevisionRef) {
          return retrieveApiHandle().then(function(apiHandle) {
            const masterRef = apiHandle.data.master.ref;
            const effectiveRef = currentRevisionRef || masterRef;

            const contextObject = {
              currentRef: effectiveRef,
              mainApi: apiHandle,
              // Determine if a specific revision is being used (not master).
              isSpecificRevision: (currentRevisionRef && currentRevisionRef !== masterRef),
              revisionParam: (currentRevisionRef && currentRevisionRef !== masterRef ? '&ref=' + currentRevisionRef : ''),
              getOAuthDetails: function() {
                  return {
                    authToken: clientConfig.authenticationToken,
                    hasPrivilegedAccess: !!clientConfig.authenticationToken
                  };
              },
              resolveUri: clientConfig.uriResolutionLogic
            };
            return contextObject;
          }).catch(error => {
            console.error('ContentApi: Error assembling API context:', error);
            return $q.reject(error || new Error('Context assembly failed.'));
          });
        }

        /**
         * Ensures the API context is available, building it if not cached.
         * Reads the 'ref' parameter from the URL query string.
         * @returns {Promise} A promise resolving to the API context.
         */
        function ensureApiContext() {
          if (cachedApiContextPromise) {
            return cachedApiContextPromise; // Return cached promise if available.
          } else {
            // Parse URL query string for 'ref' parameter.
            const urlQuery = $window.location.search.substring(1);
            const params = parseUrlQueryString(urlQuery);
            const requestedRef = params['ref']; // Get 'ref' from URL.

            cachedApiContextPromise = assembleApiContext(requestedRef);
            return cachedApiContextPromise;
          }
        }

        /**
         * Parses a URL query string into a key-value object.
         * @param {string} queryStr The query string (e.g., "param1=val1&param2=val2").
         * @returns {object} An object containing parsed parameters.
         */
        function parseUrlQueryString(queryStr) {
          const parsedParameters = {};
          if (!queryStr) return parsedParameters;

          const plusCharRegex = /\+/g; // Regex to replace '+' with space.
          const paramExtractorRegex = /([^&=]+)=?([^&]*)/g;
          let matchResult;

          const decodeValue = (encodedStr) => decodeURIComponent(encodedStr.replace(plusCharRegex, ' '));

          while (matchResult = paramExtractorRegex.exec(queryStr)) {
            parsedParameters[decodeValue(matchResult[1])] = decodeValue(matchResult[2]);
          }
          return parsedParameters;
        }

        /**
         * Retrieves the main API object from the content library.
         * @returns {Promise} A promise resolving to the external API object.
         */
        function getApiAccessor() {
          return ensureApiContext().then(function(contextObj) {
            return $q.when(contextObj.mainApi); // Directly resolve with the API object.
          }).catch(error => $q.reject(error || STANDARD_REJECT_MSG));
        }

        /**
         * Retrieves the full context object for the content API.
         * @returns {Promise} A promise resolving to the context object.
         */
        function getDataContext() {
          return ensureApiContext().then(function(contextObj) {
            return $q.when(contextObj); // Directly resolve with the context object.
          }).catch(error => $q.reject(error || STANDARD_REJECT_MSG));
        }

        /**
         * Generates the OAuth authentication URL for the content API.
         * @param {string} [optionalRedirectUri] URI to redirect to after authentication.
         * @returns {Promise} A promise resolving to the authentication URL string.
         */
        function getAuthenticationUri(optionalRedirectUri) {
          return getApiAccessor().then(function(apiHandle) {
            // Use current URL if redirect URI is not explicitly provided.
            const effectiveRedirectUri = optionalRedirectUri || $window.location.href;

            // Basic validation for required config.
            if (!clientConfig.applicationId) {
              console.warn('ContentApi: Application ID is required for OAuth authentication.');
              return $q.reject(new Error('Application ID not configured for OAuth.'));
            }

            const authUrl = apiHandle.data.oauthInitiate +
              '?response_type=token' +
              '&client_id=' + encodeURIComponent(clientConfig.applicationId) +
              '&redirect_uri=' + encodeURIComponent(effectiveRedirectUri) +
              '&scope=' + encodeURIComponent(clientConfig.authenticationScope);
            return $q.when(authUrl);
          }).catch(error => $q.reject(error || STANDARD_REJECT_MSG));
        }

        /**
         * Executes a content query with specified criteria and processes results.
         * @param {string} queryCriterion The Prismic predicate string.
         * @param {function(object): *} resultProcessor A function to transform the raw query results.
         * @param {function(object): object} [extraSearchModifiers] Optional function to add further search parameters.
         * @returns {Promise} A promise resolving to the processed query results.
         */
        function executeConfiguredQuery(queryCriterion, resultProcessor, extraSearchModifiers) {
          return ensureApiContext().then(function(contextObj) {
            var queryPromiseDeferred = $q.defer();

            // Initialize the query form for "everything" with the current revision.
            let contentQueryBuilder = contextObj.mainApi.forms('everything').ref(contextObj.currentRef);

            // Apply the main query predicate if provided and not empty.
            if (queryCriterion && queryCriterion.trim() !== '') {
              contentQueryBuilder = contentQueryBuilder.query(queryCriterion);
            }

            // Apply any additional search modifiers from the user.
            if (typeof extraSearchModifiers === 'function') {
              contentQueryBuilder = extraSearchModifiers(contentQueryBuilder);
            }

            // Submit the query and handle the response.
            contentQueryBuilder.submit(function(queryError, queryDocs) {
              if (queryError) {
                console.error('ContentApi: Query submission failed:', queryError);
                queryPromiseDeferred.reject(queryError);
              } else if (queryDocs) {
                queryPromiseDeferred.resolve(resultProcessor(queryDocs));
              } else {
                queryPromiseDeferred.reject(new Error('No documents or error received from content API.'));
              }
            });

            return queryPromiseDeferred.promise;
          }).catch(error => $q.reject(error || STANDARD_REJECT_MSG));
        }

        /**
         * Fetches all content items, optionally applying additional search parameters.
         * @param {function(object): object} [extraSearchModifiers] Function to add parameters like page, pageSize, orderings.
         * @returns {Promise} A promise resolving to all fetched documents.
         */
        function fetchAllItems(extraSearchModifiers) {
            return performQuery('', extraSearchModifiers); // Empty predicate means 'all'.
        }

        /**
         * Performs a content query using a Prismic predicate string.
         * @param {string} queryCriterion The Prismic predicate string (e.g., '[:d = at(document.type, "product")]').
         * @param {function(object): object} [extraSearchModifiers] Optional function to add search parameters.
         * @returns {Promise} A promise resolving to the query results.
         */
        function performQuery(queryCriterion, extraSearchModifiers) {
          return executeConfiguredQuery(queryCriterion, function(docs) { return docs; }, extraSearchModifiers);
        }

        /**
         * Fetches documents of a specific content type.
         * @param {string} contentType The type of documents to retrieve.
         * @param {function(object): object} [extraSearchModifiers] Optional function to add search parameters.
         * @returns {Promise} A promise resolving to documents of the specified type.
         */
        function fetchByType(contentType, extraSearchModifiers) {
          if (!contentType || typeof contentType !== 'string') {
            return $q.reject(new Error('Content type must be a non-empty string.'));
          }
          const typePredicate = `[[:d = at(document.type, "${contentType}")]]`;
          return performQuery(typePredicate, extraSearchModifiers);
        }

        /**
         * Fetches a single document by its unique ID.
         * @param {string} documentId The ID of the document to fetch.
         * @returns {Promise} A promise resolving to the found document, or null if not found.
         */
        function fetchById(documentId) {
          if (!documentId || typeof documentId !== 'string') {
            return $q.reject(new Error('Document ID must be a non-empty string.'));
          }
          const idPredicate = `[[:d = at(document.id, "${documentId}")]]`;
          return executeConfiguredQuery(idPredicate, function(docs) { return docs.results[0] || null; });
        }

        /**
         * Fetches multiple documents by their unique IDs.
         * @param {string[]} documentIds An array of document IDs.
         * @param {function(object): object} [extraSearchModifiers] Optional function to add search parameters.
         * @returns {Promise} A promise resolving to the array of found documents.
         */
        function fetchByIds(documentIds, extraSearchModifiers) {
          if (!Array.isArray(documentIds) || documentIds.length === 0) {
            return $q.reject(new Error('An array of document IDs must be provided.'));
          }

          // Ensure all IDs are properly quoted for the predicate.
          const quotedIds = documentIds.map(function(id) {
            return `"${String(id).trim()}"`;
          }).filter(id => id !== '""'); // Filter out empty IDs after trim.

          if (quotedIds.length === 0) {
            return $q.when({ results: [] }); // No valid IDs, return empty result.
          }

          const idsPredicate = `[[:d = any(document.id, [${quotedIds.join(',')}])]]`;
          return performQuery(idsPredicate, extraSearchModifiers);
        }

        /**
         * Fetches a bookmarked item by its bookmark key.
         * @param {string} bookmarkKey The key of the bookmark.
         * @returns {Promise} A promise resolving to the bookmarked document.
         */
        function fetchBookmarkedItem(bookmarkKey) {
          if (!bookmarkKey || typeof bookmarkKey !== 'string') {
            return $q.reject(new Error('Bookmark key must be a non-empty string.'));
          }

          return ensureApiContext().then(function(contextObj) {
            const documentIdentifier = contextObj.mainApi.bookmarks[bookmarkKey];
            if (documentIdentifier) {
              return fetchById(documentIdentifier);
            } else {
              return $q.reject(new Error(`Bookmark '${bookmarkKey}' not found.`));
            }
          }).catch(error => $q.reject(error || STANDARD_REJECT_MSG));
        }

        // Apply configuration to the service instance.
        ConfigurationManager.setup(apiInstance, clientConfig);

        // Assign public methods to the service instance.
        Object.assign(apiInstance, {
          getApiAccessor: getApiAccessor,
          getDataContext: getDataContext,
          getAuthenticationUri: getAuthenticationUri,
          fetchAllItems: fetchAllItems,
          performQuery: performQuery,
          fetchByType: fetchByType,
          fetchById: fetchById,
          fetchByIds: fetchByIds,
          fetchBookmarkedItem: fetchBookmarkedItem
        });

        console.log('ContentApi: Service initialized successfully.');
        return apiInstance;
      }

      // Return the service created with the global provider settings.
      return createContentApiService(providerLevelSettings);
    }];
  })

  /**
   * Directive for rendering content fragments as HTML.
   * Can be used as <content-display fragment="myContentFragment"></content-display>
   * or as <div content-display fragment="myContentFragment"></div>.
   */
  .directive('contentDisplay', ['$window', 'ContentApi', function($window, ContentApi) {
    return {
      restrict: 'AE', // Allow as element or attribute.
      scope: {
        contentFragment : '=fragment' // Isolate scope for the fragment data.
      },
      link: function(scope, element, attrs) {
        // Watch for changes in the contentFragment.
        scope.$watch('contentFragment', function(oldFragmentData, newFragmentData) {
          // Only proceed if a valid fragment is present.
          if (scope.contentFragment) {
            let renderedHtmlOutput = '';
            try {
              // Ensure the external content library and fragment initialization are available.
              if ($window.Prismic && $window.Prismic.Fragments && $window.Prismic.Fragments.initField) {
                const prismicContentField = $window.Prismic.Fragments.initField(scope.contentFragment);

                if (prismicContentField) {
                  // Use the ContentApi's configured settings for HTML rendering.
                  // Specifically, the uriResolutionLogic is passed here.
                  renderedHtmlOutput = prismicContentField.asHtml(ContentApi.serviceSettings);
                } else {
                  console.warn('ContentDisplay: Could not initialize Prismic content field from fragment.', scope.contentFragment);
                }
              } else {
                console.error('ContentDisplay: Prismic Fragments library not fully loaded or accessible.');
              }
            } catch (renderError) {
              console.error('ContentDisplay: Error rendering content fragment to HTML:', renderError, scope.contentFragment);
              renderedHtmlOutput = `<p style="color: red;">Error displaying content.</p>`;
            }
            // Update the inner HTML of the directive's element.
            element[0].innerHTML = renderedHtmlOutput;
          } else {
            // Clear the content if the fragment becomes null or undefined.
            element[0].innerHTML = '';
          }
        });
      }
    };
  }]);