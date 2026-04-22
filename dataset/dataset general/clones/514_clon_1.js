//////////////////////////////////////////////////////////////////////////////
// This file provides the Prismic.io AngularJS integration.                 //
// It defines a provider for configuring the Prismic service and a          //
// directive for rendering Prismic HTML fragments.                          //
//////////////////////////////////////////////////////////////////////////////

'use strict'; // Enforce strict parsing and error handling in code.

// Define the 'prismic.io' module and its components.
angular .module(
    'prismic.io',
    []
)
.provider(
    'Prismic',
    function() {

        // --- Configuration Helper Object ---
        // This object provides a utility method to initialize configuration properties.
        var Configurer = {};

        /**
         * Initializes configuration properties on a given object.
         * Default values are applied if properties are undefined.
         * Setter methods are also attached to the object for each configuration property.
         * @param {object} object The target object to configure.
         * @param {object} config The configuration object containing the settings.
         */
        Configurer.init = function( object, config ) {

            // Store the configuration object on the target object for later access.
            object.configuration = config;

            // --- API Endpoint Configuration ---
            // Initialize apiEndpoint; default to empty string if not provided.
            config.apiEndpoint = angular.isUndefined( config.apiEndpoint )
                                 ? ''
                                 : config.apiEndpoint;
            // Setter for the API endpoint.
            object.setApiEndpoint = function( apiEndpoint ) {
                config.apiEndpoint = apiEndpoint;
            };

            // --- Access Token Configuration ---
            // Initialize accessToken; default to empty string.
            config.accessToken = angular.isUndefined( config.accessToken )
                                 ? ''
                                 : config.accessToken;
            // Setter for the access token.
            object.setAccessToken = function( accessToken ) {
                config.accessToken = accessToken;
            };

            // --- Client ID Configuration ---
            // Initialize clientId; default to empty string.
            config.clientId = angular.isUndefined( config.clientId )
                                 ? ''
                                 : config.clientId;
            // Setter for the client ID.
            object.setClientId = function( clientId ) {
                config.clientId = clientId;
            };

            // --- Client Secret Configuration ---
            // Initialize clientSecret; default to empty string.
            config.clientSecret = angular.isUndefined( config.clientSecret )
                                 ? ''
                                 : config.clientSecret;
            // Setter for the client secret.
            object.setClientSecret = function( clientSecret ) {
                config.clientSecret = clientSecret;
            };

            // --- Link Resolver Configuration ---
            // Initialize linkResolver; default to an empty function.
            config.linkResolver = angular.isUndefined( config.linkResolver )
                                  ? function() {}
                                  : config.linkResolver;
            // Setter for the link resolver function.
            object.setLinkResolver = function( linkResolver ) {
                config.linkResolver = linkResolver;
            };

            // --- Prismic Default Request Handler Flag ---
            // Determine whether to utilize Prismic's built-in request handler.
            // If true, the custom requestHandler defined in this module will be bypassed.
            config.usePrismicDefaultRequestHandler = angular.isUndefined( config.usePrismicDefaultRequestHandler )
                                                     ? false
                                                     : config.usePrismicDefaultRequestHandler;
            // Setter for the default request handler flag.
            object.setUsePrismicDefaultRequestHandler = function( usePrismicDefaultRequestHandler ) {
                config.usePrismicDefaultRequestHandler = usePrismicDefaultRequestHandler;
            };

            // --- OAuth Scope Configuration ---
            // This parameter is configured within the Prismic "API & Security" settings.
            // Examples include: "master", "master+releases", etc.
            config.oauthScope = angular.isUndefined( config.oauthScope )
                                ? ''
                                : config.oauthScope;
            // Setter for the OAuth scope.
            object.setOAuthScope = function( oauthScope ) {
                config.oauthScope = oauthScope;
            };

        }; // End of Configurer.init

        // Internal global configuration object for the Prismic service.
        var globalConfiguration = {};

        // Initialize the provider's configuration using the Configurer utility.
        Configurer.init( this, globalConfiguration );

        // --- Service Factory Method ---
        // This method is called when the Prismic service is injected into other components.
        // It returns the actual Prismic service instance.
        this.$get = [
            '$window',
            '$http',
            '$q',
            function( $window, $http, $q ) {

                /**
                 * Creates and returns the Prismic service instance with the given configuration.
                 * @param {object} config The configuration object for the service.
                 * @returns {object} The Prismic service instance.
                 */
                function createService( config ) {
                    var service    = {}; // The service object to be returned.
                    var prismic    = $window.Prismic; // Reference to the global Prismic object.
                    var maybeContext; // Caches the Prismic context promise.
                    var maybeApi;     // Caches the Prismic API promise.

                    /**
                     * Custom request handler for Prismic API calls.
                     * Uses AngularJS $http service for making requests.
                     * @param {string} url The URL to request.
                     * @param {Function} callback The callback function (error, data).
                     */
                    function requestHandler( url, callback ) {

                        // Configuration for the $http request, including headers.
                        var configHttp = {
                            headers: {
                                'Accept': 'application/json' // Request JSON response.
                            }
                        };

                        // Perform GET request using $http.
                        $http.get( url, configHttp )
                             .then(
                                 // Success callback.
                                 function( response ) {
                                     callback( null, response.data );
                                 },
                                 // Error callback.
                                 function( error ) {
                                     callback( error, null );
                                 }
                             );
                    }

                    /**
                     * Fetches the Prismic API home document.
                     * @returns {Promise} A promise that resolves with the Prismic API object.
                     */
                    function getApiHome() {
                        var deferred = $q.defer(); // Create a new deferred object.

                        // Callback function for the Prismic.Api constructor.
                        var callback = function( error, api ) {
                            if ( api ) {
                                deferred.resolve( api ); // Resolve with the API object on success.
                            } else {
                                deferred.reject( error ); // Reject with the error on failure.
                            }
                        };

                        // Initialize the Prismic API.
                        // Use custom requestHandler if usePrismicDefaultRequestHandler is false.
                        prismic.Api(
                            config.apiEndpoint,
                            callback,
                            config.accessToken,
                            config.usePrismicDefaultRequestHandler ? undefined : requestHandler
                        );

                        return deferred.promise; // Return the promise.
                    }

                    /**
                     * Builds the Prismic context object, including API, ref, and link resolver.
                     * @param {string} ref The Prismic ref to use (e.g., master ref or a release ref).
                     * @returns {Promise} A promise that resolves with the Prismic context.
                     */
                    function buildContext( ref ) {
                        maybeApi = getApiHome().then( function( api ) {
                            var context = {
                                // The current reference for API queries.
                                ref:           ( ref || api.data.master.ref ),
                                // The Prismic API object.
                                api:           api,
                                // The current reference if it's not the master ref.
                                maybeRef:      ( ref && ref !== api.data.master.ref ? ref : '' ),
                                // Parameter string for the current reference if it's not the master ref.
                                maybeRefParam: ( ref && ref !== api.data.master.ref ? '&ref=' + ref : '' ),
                                // OAuth related information.
                                oauth:         function() {
                                    return {
                                        accessToken:         config.accessToken,
                                        hasPrivilegedAccess: !!config.accessToken
                                    };
                                },
                                // The configured link resolver function.
                                linkResolver:  config.linkResolver
                            };
                            return context;
                        } );
                        return maybeApi; // Return the promise for the context.
                    }

                    /**
                     * Retrieves the Prismic context, either from cache or by building it.
                     * @returns {Promise} A promise that resolves with the Prismic context.
                     */
                    function withPrismic() {
                        if ( maybeContext ) {
                            // If the context promise is already resolved (cached), return it.
                            return maybeContext;
                        } else {
                            // Otherwise, build the context using the 'ref' from the query string.
                            maybeContext = buildContext( queryString['ref'] );
                            return maybeContext;
                        }
                    }

                    /**
                     * Parses a URL query string into an object.
                     * @param {string} query The query string to parse (e.g., "param1=value1&param2=value2").
                     * @returns {object} An object containing key-value pairs from the query string.
                     */
                    function parseQS( query ) {
                        var params = {}, // Object to store parsed parameters.
                            match,       // Holds the result of regex execution.
                            pl     = /\+/g, // Regex to replace '+' with space.
                            search = /([^&=]+)=?([^&]*)/g, // Regex to find key-value pairs.
                            decode = function( s ) {
                                return decodeURIComponent( s.replace( pl, " " ) );
                            };

                        // Iterate through the query string to find all matches.
                        while ( match = search.exec( query ) ) {
                            params[decode( match[1] )] = decode( match[2] );
                        }
                        return params;
                    }

                    // Parse the query string of the current window location once.
                    var queryString = parseQS( $window.location.search.substring( 1 ) );

                    /**
                     * Provides access to the Prismic API object.
                     * This allows direct interaction with the Prismic JavaScript kit,
                     * for example: `Prismic.api().then(function(api){ api.form('everything')...... });`
                     * @returns {ng.IPromise<PrismicApi>} A promise resolving to the Prismic API object.
                     */
                    function api() {
                        return withPrismic().then( function( ctx ) {
                            var deferred = $q.defer();
                            deferred.resolve( ctx.api ); // Resolve with the API object from the context.
                            return deferred.promise;
                        } );
                    }

                    /**
                     * Provides access to the Prismic context object.
                     * This object contains useful information like the current ref and the link resolver.
                     * Example usage: `Prismic.ctx().then(function(ctx){ console.log(ctx.ref); });`
                     * @returns {ng.IPromise<PrismicContext>} A promise resolving to the Prismic context object.
                     */
                    function ctx() {
                        return withPrismic().then( function( ctx ) {
                            var deferred = $q.defer();
                            deferred.resolve( ctx ); // Resolve with the full context object.
                            return deferred.promise;
                        } );
                    }

                    /**
                     * Generates the OAuth authentication URL for Prismic.
                     * Requires `clientId` and `oauthScope` to be configured in the provider.
                     * Example: `Prismic.authenticationUrl(redirectUri).then(function(url){ window.location = url; });`
                     * @param {string} [maybeRedirectUri] Optional URI to redirect to after Prismic authentication.
                     *                                    Must be registered in Prismic "API & Security" settings.
                     *                                    Defaults to the current window location if not provided.
                     * @returns {ng.IPromise<string>} A promise resolving to the authentication URL.
                     */
                    function authenticationUrl( maybeRedirectUri ) {
                        return api().then( function( api ) {
                            // Determine the redirect URI; use current location if not specified.
                            var redirectUri = maybeRedirectUri || $window.location;

                            // Construct the OAuth URL with necessary parameters.
                            var url = api.data.oauthInitiate +
                                      "?response_type=token" +
                                      "&client_id="     + encodeURIComponent( config.clientId ) +
                                      "&redirect_uri="  + encodeURIComponent( redirectUri ) +
                                      "&scope="         + encodeURIComponent( config.oauthScope );
                            return $q.when( url ); // Wrap the URL in a resolved promise.
                        } );
                    }

                    /**
                     * Fetches items from Prismic based on a predicate and configuration.
                     * This is the core query function used internally.
                     * @param {string} predicate Prismic query predicate (e.g., '[:d = at(document.type, "product")]').
                     *                           An empty string implies no predicate.
                     * @param {Function} resultExtractor A function `(results -> *)` to transform the raw Prismic results.
                     * @param {Function} [additionalSearchParams] An optional function `(SearchForm -> SearchForm)` to apply
                     *                                            additional search parameters like `page()`, `pageSize()`, or `orderings()`.
                     * @returns {ng.IPromise<T>} A promise resolving to the extracted results.
                     */
                    function queryWithConfiguration( predicate, resultExtractor, additionalSearchParams ) {
                        return withPrismic().then( function( ctx ) {
                            var deferred = $q.defer(); // Create a new deferred object.

                            // Start building the search form, applying the current reference.
                            var searchForm = ctx.api.forms( 'everything' ).ref( ctx.ref );

                            // Apply the predicate if it's not empty.
                            if ( "" !== predicate ) {
                                searchForm = searchForm.query( predicate );
                            }

                            // Apply any additional search parameters provided.
                            if ( additionalSearchParams ) {
                                searchForm = additionalSearchParams( searchForm );
                            }

                            // Submit the search form.
                            searchForm.submit( function( error, docs ) {
                                if ( docs ) {
                                    deferred.resolve( resultExtractor( docs ) ); // Resolve with extracted documents.
                                } else {
                                    deferred.reject( error ); // Reject on error.
                                }
                            } );

                            return deferred.promise; // Return the promise.
                        } );
                    }

                    /**
                     * Fetches all Prismic documents.
                     * Example: `Prismic.all().then(function(docs){ ... });`
                     * Example with additional parameters:
                     * `Prismic.all(function(searchForm) { return searchForm.page(3).pageSize(50); }).then(...);`
                     * @param {Function} [additionalSearchParams] Optional function `(SearchForm -> SearchForm)` to customize the search.
                     * @returns {ng.IPromise<PrismicDocuments>} A promise resolving to the list of Prismic documents.
                     */
                    function all( additionalSearchParams ) {
                        // Delegates to the general query function with an empty predicate.
                        return query( "", additionalSearchParams );
                    }

                    /**
                     * Fetches Prismic documents based on a given query predicate.
                     * Example: `Prismic.query('[[:d = at(document.type, "product")]]').then(...);`
                     * Example with additional parameters:
                     * `Prismic.query('[[:d = at(document.type, "product")]]', function(searchForm) { return searchForm.page(5).pageSize(60); }).then(...);`
                     * @param {string} predicate The Prismic predicate string (mandatory). An empty predicate is equivalent to `all()`.
                     * @param {Function} [additionalSearchParams] Optional function `(SearchForm -> SearchForm)` for custom search parameters.
                     * @returns {ng.IPromise<PrismicDocuments>} A promise resolving to the queried Prismic documents.
                     */
                    function query( predicate, additionalSearchParams ) {
                        // Delegates to the queryWithConfiguration, returning raw documents.
                        return queryWithConfiguration(
                            predicate,
                            function( docs ) { return docs; },
                            additionalSearchParams
                        );
                    }

                    /**
                     * Fetches all Prismic documents of a specific type.
                     * Example: `Prismic.documentTypes('product').then(...);`
                     * @param {string} documentType The type of documents to query (e.g., 'product', 'blog-post').
                     * @param {Function} [additionalSearchParams] Optional function `(SearchForm -> SearchForm)` for custom search parameters.
                     * @returns {ng.IPromise<PrismicDocuments>} A promise resolving to the documents of the specified type.
                     */
                    function documentTypes( documentType, additionalSearchParams ) {
                        // Constructs a predicate for the given document type.
                        var predicate = '[[:d = at(document.type, "' + documentType + '")]]';
                        return query( predicate, additionalSearchParams );
                    }

                    /**
                     * Fetches a single Prismic document by its ID.
                     * @param {string} id The unique ID of the Prismic document.
                     * @returns {ng.IPromise<PrismicDocument>} A promise resolving to the single Prismic document.
                     */
                    function document( id ) {
                        // Constructs a predicate for the given document ID.
                        var predicate = '[[:d = at(document.id, "' + id + '")]]';
                        // Uses queryWithConfiguration and extracts the first result.
                        return queryWithConfiguration(
                            predicate,
                            function( docs ) { return docs.results[0]; }
                        );
                    }

                    /**
                     * Fetches multiple Prismic documents by a list of their IDs.
                     * Example: `Prismic.documents(['id1', 'id2'], function(searchForm) { return searchForm.pageSize(10); }).then(...);`
                     * @param {string[]} ids An array of Prismic document IDs.
                     * @param {Function} [additionalSearchParams] Optional function `(SearchForm -> SearchForm)` for custom search parameters.
                     * @returns {ng.IPromise<PrismicDocuments>} A promise resolving to the list of specified Prismic documents.
                     */
                    function documents( ids, additionalSearchParams ) {
                        if ( ids && ids.length ) {

                            // Constructs a predicate to query for any of the provided IDs.
                            var predicate = '[[:d = any(document.id, [' +
                                            ( ids ).map( function( id ) {
                                                return '"' + id + '"';
                                            } )
                                                .join( ',' ) + '])]]';

                            return query( predicate, additionalSearchParams );
                        } else {
                            // If no IDs are provided, reject the promise.
                            return $q.reject( "Ids must be provided" );
                        }
                    }

                    /**
                     * Fetches a document by its bookmark name.
                     * @param {string} bookmark The name of the bookmark.
                     * @returns {ng.IPromise<PrismicDocument>} A promise resolving to the bookmarked document.
                     */
                    function bookmarked( bookmark ) {
                        return withPrismic().then( function( ctx ) {
                            var id = ctx.api.bookmarks[bookmark]; // Get the ID from the API bookmarks.
                            if ( id ) {
                                return document( id ); // Fetch the document by its ID.
                            } else {
                                return $q.reject( "Bookmark not found" ); // Reject if bookmark not found.
                            }
                        } );
                    }

                    // Initialize the service object with configuration and public methods.
                    Configurer.init( service, config ); // Apply configuration to the service.

                    // Assign public API methods to the service object.
                    service.api             = api;
                    service.ctx             = ctx;
                    service.authenticationUrl = authenticationUrl;
                    service.all             = all;
                    service.query           = query;
                    service.documentTypes   = documentTypes;
                    service.document        = document;
                    service.documents       = documents;
                    service.bookmark        = bookmarked;

                    return service; // Return the fully configured service instance.
                }

                // Return the service created with the global configuration.
                return createService( globalConfiguration );
            }
        ];
    }
)

/**
 * Prismic HTML Directive
 *
 * This directive facilitates rendering Prismic HTML fragments directly within
 * your Angular application. It can be used as an element (`<prismic-html fragment="data.fragment">`)
 * or as an attribute on an existing element (`<div prismic-html fragment="data.fragment">`).
 * It watches the provided fragment and updates the innerHTML of the element
 * whenever the fragment changes, using Prismic's `asHtml` method and the
 * configured link resolver.
 */
.directive(
    'prismicHtml',
    [
        '$window',
        'Prismic',
        function( $window, Prismic ) {
            return {
                restrict: 'AE', // Can be used as an attribute (A) or element (E).
                scope:    {
                    // Isolated scope, 'fragment' attribute is two-way bound.
                    fragment: '=fragment'
                },
                link: function( scope, element, attrs ) {
                    // Set up a watch on the 'fragment' property in the isolated scope.
                    // This listener will execute whenever the fragment's value changes.
                    scope.$watch(
                        'fragment',
                        function( oldVal, newVal ) {
                            // Only proceed if a fragment is actually present.
                            if ( scope.fragment ) {
                                // Initialize a Prismic Field object from the fragment data.
                                var field = $window.Prismic.Fragments.initField( scope.fragment );
                                if ( field ) {
                                    // Convert the Prismic field to HTML using the PrismicProvider's configuration.
                                    // This configuration includes the link resolver.
                                    var html = field.asHtml( Prismic.configuration );
                                    // Update the innerHTML of the directive's element.
                                    element[0].innerHTML = html;
                                }
                            }
                        }
                    );
                }
            };
        }
    ]
);
//////////////////////////////////////////////////////////////////////////////
// End of Prismic.io AngularJS Integration File                             //
//////////////////////////////////////////////////////////////////////////////