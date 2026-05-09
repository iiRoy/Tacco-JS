( function ( window, $ ) {

    /*
     * This is the main class for the EchoNest API wrapper.
     * It allows connection to the API using different keys or options.
     */
    function EchoNest ( apiKey, options ) {

        var that = this; // Store a reference to the current instance.

        function hasJQueryTemplates ( ) {
            // Check if jQuery and its templating plugin are available.
            return ( typeof $ === "function" && typeof $.tmpl === "function" );
        }


        function hasUnderscoreTemplates ( ) {
            // Verify if Underscore.js is loaded and provides templating.
            return ( typeof _ === "function" );
        }

        /*
         * Helper function to determine if a value is an integer.
         * Note: This implementation has some edge cases for non-numeric input.
         */
        function isInteger ( s ) {
            return ( s % ( parseInt( s ) / Number( s ) ) ) === 0;
        }

        // This method identifies the available templating engine (jQuery or Underscore).
        // It stores the detected engine for subsequent use.
        that.getTemplatingEngine = function ( ) {
            var name, engine; // Declare variables for engine name and function.

            if ( hasJQueryTemplates( ) ) {
                name = "jQuery";
                engine = $.tmpl; // Assign jQuery's template function.
            } else if ( hasUnderscoreTemplates( ) ) {
                name = "Underscore";
                engine = _.template; // Assign Underscore's template function.
            } else {
                // If no supported templating engine is found, throw an error.
                throw new Error ( 'Either the jQuery template or Underscore template engines must be installed to convert a collection to html' );
            }

            // Return an object containing the engine's name and its function.
            return {
                name: name,
                engine: engine
            };
        };

        /*
         * Renders data into an HTML template using the detected templating engine.
         * TODO: Future enhancement: consider using proxy objects for better abstraction.
         */
        function toTemplate ( template, data, options ) {
            console.log ( data ); // Log the data being passed to the template.

            var engineDetails = that.getTemplatingEngine ( ),
                html; // Variable to store the generated HTML.

            // Extend default options with provided ones, ensuring 'start' defaults to 0.
            options = $.extend ( { }, { start: 0 }, options );

            // Slice the data based on 'start' and 'end' options.
            if ( options.end ) {
                data = data.slice ( options.start, options.end );
            } else {
                data = data.slice ( options.start );
            }


            if ( engineDetails.name === "jQuery" ) {
                // Use jQuery's templating engine.
                html = engineDetails.engine ( template, data );

            } else if ( engineDetails.name === "Underscore" ) {
                // Underscore templates do not natively handle arrays for iteration.
                // We must manually compile the template and iterate over the data.
                var compiled = engineDetails.engine ( template );
                $.each ( data, function ( count, item ) {
                    html += compiled ( item ); // Append rendered item to html string.
                } );
                // Investigate why 'undefined' might be appearing and remove it.
                html = html.replace ( /undefined/, '' );

            } else {
                // This case should ideally not be reached if getTemplatingEngine is robust.
                throw new Error ( 'Could not determine engine type.' );
            }

            return html; // Return the final HTML string.
        }

        /*
         * Flattens a nested JSON object into a single-level object.
         * Original structure is preserved in new key names (e.g., "parent_child_key").
         * This is particularly useful for easier access in templating engines.
         */
        function flatten_json ( obj, includePrototype, into, prefix ) {
            into = into || { }; // Initialize 'into' object if not provided.
            prefix = prefix || ""; // Initialize 'prefix' string if not provided.

            for ( var k in obj ) { // Iterate over properties of the object.
                if ( includePrototype || obj.hasOwnProperty ( k ) ) {
                    var prop = obj [ k ]; // Get the current property value.
                    if ( prop && typeof prop === "object" &&
                        ! ( prop instanceof Date || prop instanceof RegExp ) ) {
                        // If the property is a non-null, non-Date, non-RegExp object, recurse.
                        flatten_json ( prop, includePrototype, into, prefix + k + "_" );
                    }
                    else {
                        // Otherwise, assign the property to the 'into' object with a prefixed key.
                        into [ prefix + k ] = prop;
                    }
                }
            }
            return into; // Return the flattened object.
        }

        // Ensure an API key is provided upon instantiation.
        if ( ! apiKey ) {
            throw new Error ( 'You must supply an API key to use the API!' );
        }

        var _en = this; // Keep a local reference to the EchoNest instance.
        this.apiKey = apiKey; // Store the provided API key.

        /*
         * Define constant values for API interaction.
         * These include the base endpoint, API version, and data format.
         */
        this.constants = {
            endPoint: "http://developer.echonest.com/api/",
            endPointVersion: 'v4',
            format: 'jsonp'
        };

        // Initialize user-settable options.
        this.options = {
            // No custom options are defined by default yet.
        };
        // Merge any provided options into the default options.
        $.extend ( this.options, options );

        /*
         * Provides an entry point to interact with artist-related API functionalities.
         * Creates and returns a new Artist object.
         */
        this.artist = function ( name ) {
            return new Artist ( name );
        };

        /*
         * Handles responses received from the EchoNest API.
         * It validates the response status and throws an error if an issue is found.
         */
        var Response = function ( data ) {
            this.data = data; // Store the raw response data.
            // Check the API status code; 0 typically indicates success.
            if ( this.data.response.status.code != 0 ) {
                throw new Error ( this.data.response.status.message ); // Throw error with API message.
            }
        };

        // Prototype method to retrieve the main data payload from the response.
        Response.prototype.getData = function ( ) {
            return this.data.response;
        };

        /*
         * Constructs and manages API requests.
         * It consolidates API details and generates settings for jQuery AJAX calls.
         */
        var Request = function ( ) {

            // Merge any additional API details passed as arguments.
            this.extendedDetails = $.extend.apply ( true, arguments );

            // Private helper function to construct the base API URL.
            function url ( ) {
                return _en.constants.endPoint + _en.constants.endPointVersion + "/";
            }

            // Private helper function to get the desired response format.
            function format ( ) {
                return _en.constants.format;
            }

            // Private helper function to retrieve the API key.
            function apiKey ( ) {
                return _en.apiKey;
            }

            /*
             * Generates a settings object compatible with jQuery's AJAX function.
             * This includes endpoint, data, and success callback handling.
             */
            this.settings = function ( options ) {
                var data = {
                    format: format ( ), // Set data format.
                    api_key: apiKey ( ) // Include the API key.
                };

                // Merge in any request-specific extended details.
                $.extend ( data, this.extendedDetails );

                return {
                    url: url ( ) + options.endPoint, // Full request URL.
                    dataType: 'jsonp', // Expect JSONP response.
                    type: options.type, // HTTP method (e.g., 'GET').
                    data: data, // Data payload for the request.
                    cache: true, // Enable caching for requests.
                    success: function ( data, textStatus, XMLHttpRequest ) {
                        // If a success callback is provided, invoke it with a new Response object.
                        if ( options.success ) {
                            options.success ( new Response ( data ) );
                        }
                    }
                };
            };

        };

        // Prototype method to perform a GET request to a specified API endpoint.
        Request.prototype.get = function ( endPoint, callbackSuccess ) {
            $.ajax ( this.settings ( { endPoint: endPoint, success: callbackSuccess, type: 'GET' } ) );
        };

        /*
         * Represents an artist within the EchoNest API context.
         * Instantiated with the artist's name.
         */
        var Artist = function ( name ) {
            this.name = name; // Store the artist's name.
            this.endPoint = 'artist/'; // Define the base endpoint for artist-related calls.
        };


        // Retrieve audio associated with the artist.
        // @returns An AudioCollection object.
        Artist.prototype.audio = function ( callback, options ) {
            var request = new Request ( options, { name: this.name } );
            request.get ( this.endPoint + 'audio', function ( response ) {
                callback ( new AudioCollection ( response.getData ( ) ) );
            } );
        };

        // Fetch biographies for the artist.
        // @returns A BiographyCollection object.
        Artist.prototype.biographies = function ( callback, options ) {
            var request = new Request ( options, { name: this.name } );
            request.get ( this.endPoint + 'biographies', function ( response ) {
                callback ( new BiographyCollection ( response.getData ( ) ) );
            } );
        };

        // Obtain blog posts related to the artist.
        // @returns A BlogCollection object.
        Artist.prototype.blogs = function ( callback, options ) {
            var request = new Request ( options, { name: this.name } );
            request.get ( this.endPoint + 'blogs', function ( response ) {
                callback ( new BlogCollection ( response.getData ( ) ) );
            } );
        };

        // Get the familiarity score of the artist.
        // @returns A Familiarity object.
        Artist.prototype.familiarity = function ( callback, options ) {
            var request = new Request ( options, { name: this.name } );
            request.get ( this.endPoint + 'familiarity', function ( response ) {
                callback ( new Familiarity ( response.getData ( ) ) );
            } );
        };

        // Retrieve the hotttnesss score of the artist.
        // @returns A Hotttnesss object.
        Artist.prototype.hotttnesss = function ( callback, options ) {
            var request = new Request ( options, { name: this.name } );
            request.get ( this.endPoint + 'hotttnesss', function ( response ) {
                callback ( new Hotttnesss ( response.getData ( ) ) );
            } );
        };

        // Get images associated with the artist.
        // @returns An ImageCollection object.
        Artist.prototype.images = function ( callback, options ) {
            var request = new Request ( options, { name: this.name } );
            request.get ( this.endPoint + 'images', function ( response ) {
                callback ( new ImageCollection ( response.getData ( ) ) );
            } );
        };

        // Fetch news articles about the artist.
        // @returns A NewsCollection object.
        Artist.prototype.news = function ( callback, options ) {
            var request = new Request ( options, { name: this.name } );
            request.get ( this.endPoint + 'news', function ( response ) {
                callback ( new NewsCollection ( response.getData ( ) ) );
            } );
        };

        // Get the profile information for the artist.
        // @returns A Profile object.
        Artist.prototype.profile = function ( callback, options ) {
            var request = new Request ( options, { name: this.name } );
            request.get ( this.endPoint + 'profile', function ( response ) {
                callback ( new Profile ( response.getData ( ) ) );
            } );
        };

        // Retrieve reviews about the artist.
        // @returns A ReviewsCollection object.
        Artist.prototype.reviews = function ( callback, options ) {
            var request = new Request ( options, { name: this.name } );
            request.get ( this.endPoint + 'reviews', function ( response ) {
                callback ( new ReviewsCollection ( response.getData ( ) ) );
            } );
        };

        // Perform a search for the artist.
        // @returns A SearchResultsCollection object.
        Artist.prototype.search = function ( callback, options ) {
            var request = new Request ( options, { name: this.name } );
            request.get ( this.endPoint + 'search', function ( response ) {
                callback ( new SearchResultsCollection ( response.getData ( ) ) );
            } );
        };

        // Get songs by the artist.
        // @returns A SongsCollection object.
        Artist.prototype.songs = function ( callback, options ) {
            var request = new Request ( options, { name: this.name } );
            request.get ( this.endPoint + 'songs', function ( response ) {
                callback ( new SongsCollection ( response.getData ( ) ) );
            } );
        };

        // Find similar artists.
        // @returns A SimilarCollection object.
        Artist.prototype.similar = function ( callback, options ) {
            var request = new Request ( options, { name: this.name } );
            request.get ( this.endPoint + 'similar', function ( response ) {
                callback ( new SimilarCollection ( response.getData ( ) ) );
            } );
        };

        // Get terms used to describe the artist.
        // @returns A TermsCollection object.
        Artist.prototype.terms = function ( callback, options ) {
            var request = new Request ( options, { name: this.name } );
            request.get ( this.endPoint + 'terms', function ( response ) {
                callback ( new TermsCollection ( response.getData ( ) ) );
            } );
        };

        // Get top "hottt" artists (though this seems miscategorized under Artist.prototype).
        // @returns A TopHotttCollection object.
        Artist.prototype.top_hottt = function ( callback, options ) {
            var request = new Request ( options, { name: this.name } );
            request.get ( this.endPoint + 'top_hottt', function ( response ) {
                callback ( new TopHotttCollection ( response.getData ( ) ) );
            } );
        };

        // Get top terms related to the artist.
        // @returns A TopTermsCollection object.
        Artist.prototype.top_terms = function ( callback, options ) {
            var request = new Request ( options, { name: this.name } );
            request.get ( this.endPoint + 'top_terms', function ( response ) {
                callback ( new TopTermsCollection ( response.getData ( ) ) );
            } );
        };

        // Get URLs associated with the artist.
        // @returns A UrlsCollection object.
        Artist.prototype.urls = function ( callback, options ) {
            var request = new Request ( options, { name: this.name } );
            request.get ( this.endPoint + 'urls', function ( response ) {
                callback ( new UrlsCollection ( response.getData ( ) ) );
            } );
        };

        // Get videos for the artist.
        // @returns A VideoCollection object.
        Artist.prototype.video = function ( callback, options ) {
            var request = new Request ( options, { name: this.name } );
            request.get ( this.endPoint + 'video', function ( response ) {
                callback ( new VideoCollection ( response.getData ( ) ) );
            } );
        };

        /*
         * Base class for API responses that represent a single item
         * rather than a collection of items.
         */
        var Singular = function ( ) {
            // Constructor for Singular items.
            // Data is expected to be assigned by inheriting classes.
        };

        // Prototype method to retrieve the core data of the singular item.
        // @returns The data associated with this singular instance.
        Singular.prototype.getData = function ( ) {
            return this.data [ this.name ];
        };

        // Converts the singular item's data to HTML using a template.
        Singular.prototype.to_html = function ( template, options ) {
            return toTemplate ( template, this.getData ( ), options );
        };

        /*
         * Base class for handling collections of items returned from the API.
         * Provides methods for accessing data, pagination info, and templating.
         */
        var Collection = function ( ) {
            // 'workingWith' tracks if a specific item in the collection is being focused on.
            this.workingWith = null;
        };

        /*
         * Retrieves the data from the collection.
         * If 'workingWith' is set, it returns only that specific item.
         * @returns The collection data or a single item from it.
         */
        Collection.prototype.getData = function ( ) {
            return ( this.getWorkingWith ( ) )
                ? this.data [ this.name ] [ this.getWorkingWith ( ) ]
                : this.data [ this.name ];
        };

        // Sets the index of the item to work with within the collection.
        // @param {number} count - The index of the item.
        // @returns The set 'workingWith' index.
        Collection.prototype.setWorkingWith = function ( count ) {
            this.workingWith = count;
            return this.workingWith;
        };

        // Gets the currently selected 'workingWith' index.
        // @returns The index of the item being worked with.
        Collection.prototype.getWorkingWith = function ( count ) {
            return this.workingWith;
        };

        /*
         * Reports the starting index of the results received from the server.
         * @returns The integer start point of the current data slice.
         */
        Collection.prototype.start = function ( count ) {
            return parseInt ( this.data.start, 10 );
        };

        /*
         * Provides the total count of available items for this collection on the server.
         * @returns The total number of results available.
         */
        Collection.prototype.total = function ( count ) {
            return parseInt ( this.data.total, 10 );
        };

        /*
         * Returns the number of items currently in the collection.
         * @returns The integer size of the local collection.
         */
        Collection.prototype.size = function ( count ) {
            return this.getData ( ).length;
        };

        /*
         * Converts the collection's data into an HTML string using a provided template.
         * Throws an error if the collection is empty.
         * @returns The HTML string generated from the template and data.
         */
        Collection.prototype.to_html = function ( template, options ) {
            if ( this.size ( ) < 1 ) {
                throw new RangeError ( 'Empty collection' );
            }
            return toTemplate ( template, this.getData ( ), options );
        };

        /*
         * Allows focusing on a specific item within the collection by its index.
         * If a non-integer is passed, the focus is reset to the entire collection.
         * @param {number} count - The zero-based index of the item.
         * @returns The current Collection instance for chaining.
         */
        Collection.prototype.at = function ( count ) {
            ( isInteger ( count ) ) ? this.setWorkingWith ( count ) : this.setWorkingWith ( null );
            return this;
        };

        /*
         * Represents a collection of audio objects.
         * Inherits all functionalities from the base Collection class.
         */
        var AudioCollection = function ( data ) {
            this.data = data; // Raw data for the audio collection.
            this.name = "audio"; // Identifier for this specific collection type.
        };
        // Establish inheritance from Collection.
        AudioCollection.prototype = new Collection ( );
        AudioCollection.prototype.constructor = AudioCollection;


        /*
         * Represents a collection of blog entries.
         * Inherits from the base Collection class.
         */
        var BlogCollection = function ( data ) {
            this.data = data; // Raw data for the blog collection.
            this.name = "blogs"; // Identifier for this collection type.
        };
        // Establish inheritance from Collection.
        BlogCollection.prototype = new Collection ( );
        BlogCollection.prototype.constructor = BlogCollection;


        /*
         * Represents a collection of artist biographies.
         * Inherits from Collection and performs JSON flattening.
         */
        var BiographyCollection = function ( data ) {
            var that = this; // Capture 'this' for use in the callback.
            this.data = data; // Raw data for the biography collection.
            this.name = "biographies"; // Identifier for this collection type.

            // Iterate through each biography and flatten its JSON structure.
            // This makes nested properties directly accessible in templates.
            $.each ( this.data [ this.name ], function ( count, item ) {
                that.data [ that.name ] [ count ] = flatten_json ( item );
            } );

        };
        // Establish inheritance from Collection.
        BiographyCollection.prototype = new Collection ( );
        BiographyCollection.prototype.constructor = BiographyCollection;


        /*
         * Represents the familiarity information for an artist.
         * Inherits from the Singular base class.
         */
        var Familiarity = function ( data ) {
            this.data = data; // Raw data for familiarity.
            this.name = "artist"; // The relevant key within the data.
        };