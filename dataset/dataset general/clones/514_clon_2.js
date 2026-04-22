/* globals */

'use strict';

angular.module('contentFetcher.js', [])
  .provider('ContentFetcher',
    /* This function initializes the ContentFetcher provider */
    function() {
      var Initializer = {};

      Initializer.setup = function(targetObj, settings) {
        // Assign the provided settings to the target object's internal settings data.
        targetObj.settingsData = settings;

        // Initialize remote source URL configuration.
        settings.remoteSourceUrl = angular.isUndefined(settings.remoteSourceUrl) ? '' : settings.remoteSourceUrl;
        targetObj.setRemoteSourceUrl = function(sourceUrl) {
          settings.remoteSourceUrl = sourceUrl;
        };

        // Initialize security token configuration.
        settings.securityToken = angular.isUndefined(settings.securityToken) ? '' : settings.securityToken;
        targetObj.setSecurityToken = function(securityToken) {
          settings.securityToken = securityToken;
        };

        // Initialize client key configuration.
        settings.clientKey = angular.isUndefined(settings.clientKey) ? '' : settings.clientKey;
        targetObj.setClientKey = function(clientKey) {
          settings.clientKey = clientKey;
        };

        // Initialize client code configuration.
        settings.clientCode = angular.isUndefined(settings.clientCode) ? '' : settings.clientCode;
        targetObj.setClientCode = function(clientCode) {
          settings.clientCode = clientCode;
        };

        // Initialize URI resolver configuration.
        settings.uriResolver = angular.isUndefined(settings.uriResolver) ? function() {} : settings.uriResolver;
        targetObj.setUriResolver = function(uriResolver) {
          settings.uriResolver = uriResolver;
        };

        // Set this to true if the service should use its built-in request handling.
        settings.useDefaultRequestHandler = angular.isUndefined(settings.useDefaultRequestHandler) ? false : settings.useDefaultRequestHandler;
        targetObj.setUseDefaultRequestHandler = function(useDefaultRequestHandler) {
          settings.useDefaultRequestHandler = useDefaultRequestHandler;
        };

        /*
         * This value is configured on the content service's "API & Security" page,
         * associated with the "client_id". Examples: "main", "main+releases", etc.
         */
        settings.authScope = angular.isUndefined(settings.authScope) ? '' : settings.authScope;
        targetObj.setAuthScope = function(authScope) {
          settings.authScope = authScope;
        };
      };

      // Define a global configuration object for the provider.
      var masterSettings = {};

      // Apply initial settings to the provider instance.
      Initializer.setup(this, masterSettings);

      // The $get method returns the actual service instance.
      this.$get = ['$window', '$http', '$q',
        function($windowService, $httpService, $qService) {

          /*
           * Factory function to construct a data service instance.
           * @param {object} serviceConfiguration - The configuration for this service instance.
           * @returns {object} - The constructed data service.
           */
          function buildDataService(serviceConfiguration) {
            var dataService = {};
            var contentKit = $windowService.Prismic; // Assuming Prismic is globally available via window.
            var cachedContext; // Caches the promise for the content context.
            var cachedApi; // Caches the promise for the API object.

            /*
             * Custom HTTP request handler for the content kit.
             * @param {string} resourceUri - The URL to fetch.
             * @param {function} responseCallback - Callback function (error, data).
             */
            function httpAgent(resourceUri, responseCallback) {

              var httpOptions = {
                headers: {
                  'Accept': 'application/json'
                }
              };

              $httpService.get(resourceUri, httpOptions).then(
                function(httpResponse) {
                  responseCallback(null, httpResponse.data);
                },
                function(fetchError) {
                  responseCallback(fetchError, null);
                });
            }

            /*
             * Fetches the root API object from the content service.
             * @returns {Promise} A promise that resolves with the API object.
             */
            function fetchApiRoot() {
              var promiseDeferrer = $qService.defer();
              var resolveApi = function(fetchError, sourceApi) {
                if (sourceApi) {
                  promiseDeferrer.resolve(sourceApi);
                } else {
                  promiseDeferrer.reject(fetchError);
                }
              };

              contentKit.Api(
                serviceConfiguration.remoteSourceUrl,
                resolveApi,
                serviceConfiguration.securityToken,
                serviceConfiguration.useDefaultRequestHandler ? undefined : httpAgent
              );

              return promiseDeferrer.promise;
            }

            /*
             * Assembles the content context object.
             * @param {string} revisionRef - The content revision reference.
             * @returns {Promise} A promise that resolves with the context object.
             */
            function assembleContext(revisionRef) {
              cachedApi = fetchApiRoot().then(function(sourceApi) {
                var currentContext = {
                  ref: (revisionRef || sourceApi.payload.main.ref),
                  api: sourceApi,
                  optionalRef: (revisionRef && revisionRef !== sourceApi.payload.main.ref ? revisionRef : ''),
                  optionalRefParam: (revisionRef && revisionRef !== sourceApi.payload.main.ref ? '&ref=' + revisionRef : ''),
                  authDetails: function() {
                    return {
                      securityToken: serviceConfiguration.securityToken,
                      hasElevatedPrivileges: !!serviceConfiguration.securityToken
                    };
                  },
                  uriResolver: serviceConfiguration.uriResolver
                };
                return currentContext;
              });
              return cachedApi;
            }

            /*
             * Obtains the content context, either from cache or by building it.
             * @returns {Promise} A promise for the content context.
             */
            function obtainContentContext() {
              if (cachedContext) {
                // If context is already resolved, return the cached promise.
                return cachedContext;
              } else {
                // Otherwise, build the context using query string parameters.
                cachedContext = assembleContext(uriParameters['ref']);
                return cachedContext;
              }
            }

            /*
             * Parses the query string from a URL.
             * @param {string} rawQuery - The raw query string.
             * @returns {object} An object containing parsed parameters.
             */
            function decodeUriParams(rawQuery) {
              var parsedParams = {},
                regexMatch,
                plusSign = /\+/g, // Regex for replacing '+' with space.
                paramRegex = /([^&=]+)=?([^&]*)/g, // Regex for parsing key-value pairs.
                decodeComponent = function(s) {
                  return decodeURIComponent(s.replace(plusSign, " "));
                };

              while (regexMatch = paramRegex.exec(rawQuery)) {
                parsedParams[decodeComponent(regexMatch[1])] = decodeComponent(regexMatch[2]);
              }
              return parsedParams;
            }

            // Parse URL parameters from the current window location.
            var uriParameters = decodeUriParams($windowService.location.search.substring(1));

            /**
             * Builds a usable API object, as described in the official content kit.
             *
             * For example: ContentFetcher.getApiAccessor().then(function(api){ api.form('everything')... });
             *
             * @returns {Promise} A promise that resolves with the API accessor object.
             */
            function getApiAccessor() {
              return obtainContentContext().then(function(ctxObj) {
                var promiseDeferrer = $qService.defer();
                promiseDeferrer.resolve(ctxObj.api);
                return promiseDeferrer.promise;
              });
            }

            /**
             * Builds a usable context object, as described in the official content kit.
             *
             * For example: ContentFetcher.getContextObject().then(function(ctx){ ... ctx.ref ... });
             *
             * @returns {Promise} A promise that resolves with the context object.
             */
            function getContextObject() {
              return obtainContentContext().then(function(ctxObj) {
                var promiseDeferrer = $qService.defer();
                promiseDeferrer.resolve(ctxObj);
                return promiseDeferrer.promise;
              });
            }

            /**
             * Retrieves the OAuth authentication URL for the content service.
             *
             * For example: ContentFetcher.getAuthLink(redirectUrl).then(function(url){ ... });
             *
             * Client key and authentication scope must be configured.
             *
             * @param {string} [optionalRedirectUri] - Optional URI for redirection after authentication.
             *                                         Must be registered as authorized in "API & Security" settings.
             *                                         If not provided, the current window location is used.
             * @returns {Promise} A promise that resolves with the authentication URL.
             */
            function getAuthLink(optionalRedirectUri) {
              return getApiAccessor().then(function(sourceApi) {
                // Use current URL if a redirect URI isn't explicitly provided.
                var targetUri = optionalRedirectUri || $windowService.location;

                var authUrl = sourceApi.payload.authInitiate +
                  "?response_type=token" +
                  "&client_id=" + encodeURIComponent(serviceConfiguration.clientKey) +
                  "&redirect_uri=" + encodeURIComponent(targetUri) +
                  "&scope=" + encodeURIComponent(serviceConfiguration.authScope);
                return $qService.when(authUrl);
              });
            }

            /**
             * Fetches content items by applying a query predicate and configuration.
             *
             * @param {string} queryPredicate - The content service predicate (mandatory). An empty predicate fetches all.
             * @param {function} dataTransformer - Mandatory function (results -> *) to extract the desired result.
             * @param {function} [extraSearchOptions] - Optional function (SearchForm -> SearchForm) to add
             *                                          additional search parameters like 'page()', 'pageSize()', etc.
             * @returns {Promise} A promise that resolves with the transformed results.
             */
            function fetchDataWithSettings(queryPredicate, dataTransformer, extraSearchOptions) {
              return obtainContentContext().then(function(ctxObj) {
                var promiseDeferrer = $qService.defer();

                var dataForm = ctxObj.api.forms('everything').ref(ctxObj.ref);

                if ("" !== queryPredicate) {
                  dataForm = dataForm.query(queryPredicate);
                }

                if (extraSearchOptions) {
                  dataForm = extraSearchOptions(dataForm);
                }

                dataForm.submit(function(fetchError, documents) {
                  if (documents) {
                    promiseDeferrer.resolve(dataTransformer(documents));
                  } else {
                    promiseDeferrer.reject(fetchError);
                  }
                });

                return promiseDeferrer.promise;
              });
            }

            /**
             * Fetches all content items.
             *
             * For example:
             *     ContentFetcher.fetchAll().then(...)
             *
             *     ContentFetcher.fetchAll(function(searchForm) {
             *       return searchForm.page(3).pageSize(50);
             *     }).then(...)
             *
             * @param {function} [extraSearchOptions] - Optional function (SearchForm -> SearchForm) to add
             *                                          additional search parameters.
             * @returns {Promise} A promise that resolves with all content items.
             */
            function fetchAll(extraSearchOptions) {
              return queryContent("", extraSearchOptions);
            }

            /**
             * Fetches content items based on a query predicate.
             *
             * For example:
             *   ContentFetcher.queryContent('[[:d = at(document.type, "product")]]').then(...)
             *
             *   ContentFetcher.queryContent('[[:d = at(document.type, "product")]]', function(searchForm) {
             *     return searchForm.page(5).pageSize(60);
             *   }).then(...)
             *
             * @param {string} queryPredicate - The content service predicate (mandatory).
             *                                  An empty predicate fetches all (see #fetchAll()).
             * @param {function} [extraSearchOptions] - Optional function (SearchForm -> SearchForm) to add
             *                                          additional search parameters.
             * @returns {Promise} A promise that resolves with the query results.
             */
            function queryContent(queryPredicate, extraSearchOptions) {
              return fetchDataWithSettings(queryPredicate, function(documents) {
                return documents;
              }, extraSearchOptions);
            }

            /**
             * Fetches all items of a specific document type.
             *
             * For example:
             *
             *   ContentFetcher.fetchByType('product').then(...)
             *
             * @param {string} itemType - The type of documents to query.
             * @param {function} [extraSearchOptions] - Optional function (SearchForm -> SearchForm) to add
             *                                          additional search parameters.
             * @returns {Promise} A promise that resolves with documents of the specified type.
             */
            function fetchByType(itemType, extraSearchOptions) {
              var typePredicate = '[[:d = at(document.type, "' + itemType + '")]]';
              return queryContent(typePredicate, extraSearchOptions);
            }

            /**
             * Fetches a single content item by its ID.
             *
             * @param {string} documentId - The ID of the document.
             * @returns {Promise} A promise that resolves with the single document.
             */
            function fetchSingleDocument(documentId) {
              var idPredicate = '[[:d = at(document.id, "' + documentId + '")]]';
              return fetchDataWithSettings(idPredicate, function(documents) {
                return documents.results[0];
              });
            }

            /**
             * Fetches multiple content items by a list of IDs.
             * For example:
             *
             *   ContentFetcher.fetchMultipleDocuments([...], function(searchForm) {
             *     return searchForm.page(3).pageSize(10);
             *   }).then(...)
             *
             * @param {string[]} documentIds - An array of document IDs.
             * @param {function} [extraSearchOptions] - Optional function (SearchForm -> SearchForm) to add
             *                                          additional search parameters.
             * @returns {Promise} A promise that resolves with the list of documents.
             */
            function fetchMultipleDocuments(documentIds, extraSearchOptions) {
              if (documentIds && documentIds.length) {

                var idsPredicate = '[[:d = any(document.id, [' +
                  (documentIds).map(function(singleId) {
                    return '"' + singleId + '"';
                  })
                  .join(',') + '])]]';

                return queryContent(idsPredicate, extraSearchOptions);
              } else {
                return $qService.reject("Document IDs must be provided");
              }
            }

            /**
             * Fetches a bookmarked content item.
             * @param {string} bookmarkIdentifier - The identifier for the bookmark.
             * @returns {Promise} A promise that resolves with the bookmarked document.
             */
            function fetchBookmarked(bookmarkIdentifier) {
              return obtainContentContext().then(function(ctxObj) {
                var bookmarkedId = ctxObj.api.bookmarks[bookmarkIdentifier];
                if (bookmarkedId) {
                  return fetchSingleDocument(bookmarkedId);
                } else {
                  return $qService.reject("Bookmark not found");
                }
              });
            }

            // Initialize the data service with the given configuration.
            Initializer.setup(dataService, serviceConfiguration);
            // Expose public methods on the data service object.
            dataService.getApiAccessor = getApiAccessor;
            dataService.getContextObject = getContextObject;
            dataService.getAuthLink = getAuthLink;
            dataService.fetchAll = fetchAll;
            dataService.queryContent = queryContent;
            dataService.fetchByType = fetchByType;
            dataService.fetchSingleDocument = fetchSingleDocument;
            dataService.fetchMultipleDocuments = fetchMultipleDocuments;
            dataService.fetchBookmarked = fetchBookmarked;
            return dataService;
          }

          // Return a new data service instance using the global configuration.
          return buildDataService(masterSettings);
        }
      ])

  /**
   * The 'contentRenderer' directive processes content service HTML fragments.
   * It can be used as <content-renderer content-snippet="data.fragment">
   * or as <div content-renderer content-snippet="data.fragment">.
   */
  .directive('contentRenderer', ['$window', 'ContentFetcher',
    function($windowService, ContentFetcherService) {
      return {
        restrict: 'AE',
        scope: {
          contentSnippet: '=contentSnippet' // Binds the 'contentSnippet' attribute to the directive's scope.
        },
        linkingFunction: function(directiveScope, domElement, elementAttributes) {
          // Watch for changes in the 'contentSnippet' value.
          directiveScope.$watch('contentSnippet', function(oldValue, newValue) {
            if (directiveScope.contentSnippet) {
              // Initialize a content field from the snippet.
              var contentField = $windowService.Prismic.Fragments.initializeField(directiveScope.contentSnippet);
              if (contentField) {
                // Render the field to HTML using the ContentFetcher's configuration.
                var renderedHtml = contentField.toHtmlString(ContentFetcherService.settingsData);
                domElement[0].innerHTML = renderedHtml; // Update the DOM element's inner HTML.
              }
            }
          });
        }
      };
    }
  ]);