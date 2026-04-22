/*
 * This is a Type I clone of the original ABSBiblesearch API JS client.
 *
 * Original project information:
 *  - Version: 1.0.6
 *  - Copyright Holder: American Bible Society, 2013
 *  - License: MIT License
 *  - Project Homepage: http://americanbible.github.io/biblesearch-api-js/
 *  - Source Repository: https://github.com/americanbible/biblesearch-api-js
 *  - API Documentation: http://bibles.org/pages/api
 *
 * This cloned version maintains exact functional equivalence.
 * Only whitespace and comments have been altered.
 */

( function ( ) {

    // Base URL for the API endpoints.
    var _baseUrl = 'https://bibles.org/v2/' ;

    // API Key for authentication. Get yours at http://bibles.org/pages/api/signup.
    var _APIKey = '' ;

    // Stores the last encountered error message.
    var _lastError = '' ;

    // FUMS (Fair Use Management System) related variables.
    var _fumsJs = '' ;
    var _fumsJsIncluded = false ;
    var _fumsInterval = null ;
    var _fumsInjectionSuppression = false ;

    // Asynchronous operation flag.
    var _async = true ;

    // Debugging flag.
    var _debug = false ;

    /**
     * @constructor
     * Creates a new instance of the ABSBiblesearch API client.
     * This constructor does not take any arguments.
     */
    function ABSBiblesearch ( )
    {
        // Constructor body is intentionally empty.
    }

    /**
     * Enables debug logging for the API client.
     * Log messages will be printed to the console.
     */
    ABSBiblesearch.prototype.turnOnLogging = function ( )
    {
        _debug = true ; // Set the debug flag to true.
    } ;

    /**
     * Disables debug logging for the API client.
     * No log messages will be printed.
     */
    ABSBiblesearch.prototype.turnOffLogging = function ( )
    {
        _debug = false ; // Set the debug flag to false.
    } ;

    // ############################## API KEY MANAGEMENT ##############################

    /*
     * Method: setKey
     * Description: Sets the API key used for authenticating requests to bibles.org.
     *              You can obtain a FREE API Key by visiting http://bibles.org/pages/api/signup.
     * @param {string} key - The API key string.
     */
    ABSBiblesearch.prototype.setKey = function ( key )
    {
        _APIKey = key ;
    } ;

    /*
     * Method: getKey
     * Description: Retrieves the currently set API key.
     * @returns {string} The current API key.
     */
    ABSBiblesearch.prototype.getKey = function ( )
    {
        return _APIKey ;
    } ;

    // ############################## ASYNCHRONOUS REQUEST SETTINGS ##############################

    /*
     * Method: setAsync
     * Description: Configures whether API requests should be made asynchronously.
     *              Note: In some environments, like Android simulators, setting this to `false` (synchronous)
     *              might resolve certain issues.
     * @param {boolean} async - If `true`, requests are asynchronous; otherwise, they are synchronous.
     */
    ABSBiblesearch.prototype.setAsync = function ( async )
    {
        _async = async ;
    } ;

    /*
     * Method: getAsync
     * Description: Returns the current asynchronous setting for API requests.
     * @returns {boolean} `true` if requests are asynchronous, `false` if synchronous.
     */
    ABSBiblesearch.prototype.getAsync = function ( )
    {
        return _async ;
    } ;

    // ############################## ERROR HANDLING ##############################

    /*
     * Method: lastError
     * Description: Retrieves the last error message that occurred during an API call.
     *              Calling this method clears the stored error message.
     * @returns {string} The last error message, or an empty string if no error occurred.
     */
    ABSBiblesearch.prototype.lastError = function ( )
    {
        var e = _lastError ; // Store the current error.
        _lastError = '' ;    // Clear the error for subsequent calls.
        return e ;           // Return the stored error.
    } ;

    // ################################## SEARCH FUNCTIONALITY ##################################

    /*
     * Method: search
     * Description: Performs a general search against the bibles.org API.
     *              Refer to the official documentation for more details:
     *              http://bibles.org/pages/api/documentation/search
     *              The API intelligently determines if the query is a passage or a keyword.
     *              Keyword searches leverage stemming, user tags, and helpfulness votes.
     * @param {object} options - An object containing search parameters.
     *   @param {string} options.query - The search query (passage or keyword). (Required)
     *   @param {string} [options.version] - Optional: The version ID to search within.
     * @param {function} callback - The callback function to execute upon successful API response.
     * @returns {boolean} `true` if the request was initiated, `false` otherwise (e.g., missing API key or query).
     */
    ABSBiblesearch.prototype.search = function ( options , callback )
    {
        // First, check if the API key has been set.
        if ( _APIKey === '' )
        {
            _lastError = 'API Key must be specified.' ;
            return false ;
        }

        // Validate the options object and the presence of a query.
        if ( ! options || ! options.query )
        {
            _lastError = 'Please supply a query.' ;
            return false ;
        }

        // Construct the base URL for the search request.
        var url = _baseUrl + 'search.js?query=' + options.query ;

        // Append the version parameter if provided in options.
        if ( options.version )
        {
            url = url + '&version=' + options.version ;
        }

        // Execute the JSON API call.
        return this.json ( url , callback ) ;
    } ;

    // ##################################### VERSION-RELATED ENDPOINTS #############################

    /*
     * Method: versions
     * Description: Retrieves a list of all available Bible versions.
     *              Versions represent specific editions (e.g., NIV, KJV) and contain multiple books.
     *              Documentation: http://bibles.org/pages/api/documentation/versions
     * @param {function} callback - The callback function to handle the API response.
     * @returns {boolean} `true` if the request was sent, `false` otherwise.
     */
    ABSBiblesearch.prototype.versions = function ( callback )
    {
        if ( _APIKey === '' )
        {
            _lastError = 'API Key must be specified.' ;
            return false ;
        }

        return this.json ( _baseUrl + 'versions.js' , callback ) ;
    } ;

    /*
     * Method: booksInVersion
     * Description: Fetches a list of all books belonging to a specified Bible version.
     *              The version ID can be obtained from the `versions` endpoint.
     * @param {object} options - Parameters for the request.
     *   @param {string} options.version - The ID of the version (e.g., 'eng-NIV'). (Required)
     *   @param {string} [options.testament] - Optional: Filter books by testament (e.g., 'OT', 'NT').
     * @param {function} callback - The callback function.
     * @returns {boolean} `true` if successful, `false` on error.
     */
    ABSBiblesearch.prototype.booksInVersion = function ( options , callback )
    {
        if ( _APIKey === '' )
        {
            _lastError = 'API Key must be specified.' ;
            return false ;
        }

        if ( ! options || ! options.version || options.version === '' )
        {
            _lastError = 'Must supply a version id.' ;
            return false ;
        }

        var url = _baseUrl + 'versions/' + options.version + '/books.js' ;
        if ( options.testament )
        {
            url = url + '?testament=' + options.testament ;
        }
        return this.json ( url , callback ) ;
    } ;

    /*
     * Method: versionsByLanguage
     * Description: Retrieves Bible versions available in a specific language.
     *              The language parameter should be an ISO 639-2 abbreviation (e.g., 'eng' for English).
     * @param {string} language - The ISO 639-2 language abbreviation. (Required)
     * @param {function} callback - The callback function.
     * @returns {boolean} `true` if successful, `false` on error.
     */
    ABSBiblesearch.prototype.versionsByLanguage = function ( language , callback )
    {
        if ( _APIKey === '' )
        {
            _lastError = 'API Key must be specified.' ;
            return false ;
        }

        if ( language === null || language === '' )
        {
            _lastError = 'Must supply a language.' ;
            return false ;
        }

        return this.json ( _baseUrl + 'versions.js?language=' + language , callback ) ;
    } ;

    /*
     * Method: versionInformation
     * Description: Gets detailed information about a particular Bible version.
     *              The version ID can be found using the `versions` endpoint.
     * @param {string} version - The ID of the specific version. (Required)
     * @param {function} callback - The callback function.
     * @returns {boolean} `true` if successful, `false` on error.
     */
    ABSBiblesearch.prototype.versionInformation = function ( version , callback )
    {
        if ( _APIKey === '' )
        {
            _lastError = 'API Key must be specified.' ;
            return false ;
        }

        if ( version === null || version === '' )
        {
            _lastError = 'Must supply a version id.' ;
            return false ;
        }

        return this.json ( _baseUrl + 'versions/' + version + '.js' , callback ) ;
    } ;

    // ############################ BOOK-SPECIFIC ENDPOINTS #############################

    /*
     * Method: book
     * Description: Retrieves a specific book resource within a given Bible version.
     *              Books are fundamental units, belonging to versions and bookgroups, and containing chapters.
     *              For more details: http://bibles.org/pages/api/documentation/books
     *              The book should be identified by its OSIS normative abbreviation (e.g., 'Gen' for Genesis).
     * @param {object} options - Request parameters.
     *   @param {string} options.version - The ID of the version. (Required)
     *   @param {string} options.book - The OSIS abbreviation for the book. (Required)
     * @param {function} callback - The callback function.
     * @returns {boolean} Status of the API call initiation.
     */
    ABSBiblesearch.prototype.book = function ( options , callback )
    {
        if ( _APIKey === '' )
        {
            _lastError = 'API Key must be specified.' ;
            return false ;
        }

        if ( ! options || ! options.version || options.version === '' )
        {
            _lastError = 'Must supply a version id.' ;
            return false ;
        }

        if ( ! options || ! options.book || options.book === '' )
        {
            _lastError = 'Must supply a book id.' ;
            return false ;
        }

        var url = _baseUrl + 'books/' + options.version + ':' + options.book + '.js' ;
        return this.json ( url , callback ) ;
    } ;

    /*
     * Method: chaptersInBook
     * Description: Lists all chapters for a specified book within a particular Bible version.
     *              The version IDs are available via the `versions` endpoint.
     *              Book IDs use OSIS normative abbreviations.
     * @param {object} options - Request parameters.
     *   @param {string} options.version - The ID of the version. (Required)
     *   @param {string} options.book - The OSIS abbreviation for the book. (Required)
     * @param {function} callback - The callback function.
     * @returns {boolean} Status of the API call initiation.
     */
    ABSBiblesearch.prototype.chaptersInBook = function ( options , callback )
    {
        if ( _APIKey === '' )
        {
            _lastError = 'API Key must be specified.' ;
            return false ;
        }

        if ( ! options || ! options.version || options.version === '' )
        {
            _lastError = 'Must supply a version id.' ;
            return false ;
        }

        if ( ! options || ! options.book || options.book === '' )
        {
            _lastError = 'Must supply a book id.' ;
            return false ;
        }

        var url = _baseUrl + 'books/' + options.version + ':' + options.book + '/chapters.js' ;
        return this.json ( url , callback ) ;
    } ;

    // ################################# CHAPTER-LEVEL ENDPOINTS #####################################

    /*
     * Method: chapter
     * Description: Retrieves a specific chapter, identified by version, book, and chapter number.
     *              Chapters are sub-sections of books and contain verses.
     *              Documentation: http://bibles.org/pages/api/documentation/chapters
     *              To include cross-references and footnotes, set `options.marginalia` to `true`.
     * @param {object} options - Request parameters.
     *   @param {string} options.version - The version ID. (Required)
     *   @param {string} options.book - The OSIS abbreviation for the book. (Required)
     *   @param {string|number} options.chapter - The chapter number. (Required)
     *   @param {boolean} [options.marginalia] - Optional: Set to `true` to include marginalia (cross-references, footnotes).
     * @param {function} callback - The callback function.
     * @returns {boolean} Status of the API call initiation.
     */
    ABSBiblesearch.prototype.chapter = function ( options , callback )
    {
        if ( _APIKey === '' )
        {
            _lastError = 'API Key must be specified.' ;
            return false ;
        }

        if ( ! options || ! options.version || options.version === '' )
        {
            _lastError = 'Must supply a version id.' ;
            return false ;
        }

        if ( ! options || ! options.book || options.book === '' )
        {
            _lastError = 'Must supply a book id.' ;
            return false ;
        }

        if ( ! options || ! options.chapter || options.chapter === '' )
        {
            _lastError = 'Must supply a chapter number.' ;
            return false ;
        }

        var url = _baseUrl + 'chapters/' + options.version + ':' + options.book + '.' + options.chapter + '.js' ;

        // Conditionally append marginalia parameter.
        if ( options && options.marginalia )
        {
            url += '?include_marginalia=' + options.marginalia ;
        }

        return this.json ( url , callback ) ;
    } ;

    /*
     * Method: chapterVerseList
     * Description: Retrieves a list of all verses within a specific chapter, version, and book.
     *              Version IDs from `versions` endpoint, book IDs from OSIS abbreviations.
     * @param {object} options - Request parameters.
     *   @param {string} options.version - The version ID. (Required)
     *   @param {string} options.book - The OSIS abbreviation for the book. (Required)
     *   @param {string|number} options.chapter - The chapter number. (Required)
     *   @param {string|number} [options.start] - Optional: Starting verse number for a range.
     *   @param {string|number} [options.end] - Optional: Ending verse number for a range.
     * @param {function} callback - The callback function.
     * @returns {boolean} Status of the API call initiation.
     */
    ABSBiblesearch.prototype.chapterVerseList = function ( options , callback )
    {
        if ( _APIKey === '' )
        {
            _lastError = 'API Key must be specified.' ;
            return false ;
        }

        if ( ! options || ! options.version || options.version === '' )
        {
            _lastError = 'Must supply a version id.' ;
            return false ;
        }

        if ( ! options || ! options.book || options.book === '' )
        {
            _lastError = 'Must supply a book id.' ;
            return false ;
        }

        if ( ! options || ! options.chapter || options.chapter === '' )
        {
            _lastError = 'Must supply a chapter number.' ;
            return false ;
        }

        var url = _baseUrl + 'chapters/' + options.version + ':' + options.book + '.' + options.chapter + '/verses.js' ;

        // Handle start and end verse parameters.
        if ( options.start || options.end )
        {
            url = url + '?' ;
        }
        if ( options.start && options.start !== '' )
        {
            url = url + 'start=' + options.start + '&' ;
        }
        if ( options.end && options.end !== '' )
        {
            url = url + 'end=' + options.end ;
        }
        return this.json ( url , callback ) ;
    } ;

    // ################################# VERSES-SPECIFIC ENDPOINTS #####################################

    /*
     * Method: versesByKeyword
     * Description: Searches for verses based on a keyword and optional filtering parameters.
     *              Verses are the smallest organizational unit within the Bible text.
     *              Documentation: http://bibles.org/pages/api/documentation/verses
     *              The `keyword` parameter is mandatory.
     *
     * @param {object} options - Search criteria and filters.
     *   @param {string} options.keyword - The word(s) to search for. (Required)
     *   @param {string} [options.precision] - 'all' (all keywords) or 'any' (any keywords).
     *   @param {string} [options.exclude] - Keywords to exclude from results.
     *   @param {string} [options.spelling] - 'yes' to search for similar terms if no direct match.
     *   @param {string} [options.version] - One or more version IDs (comma-separated).
     *   @param {string} [options.language] - One or more ISO 639-2 language codes.
     *   @param {string} [options.testament] - One or more testament values ('OT', 'NT').
     *   @param {string} [options.book] - One or more OSIS book abbreviations.
     *   @param {string} [options.sort_order] - 'canonical' or 'relevance'.
     *   @param {number} [options.offset] - Number of records to skip.
     *   @param {number} [options.limit] - Maximum number of records to return (max 500).
     * @param {function} callback - The callback function.
     * @returns {boolean} Status of the API call initiation.
     */
    ABSBiblesearch.prototype.versesByKeyword = function ( options , callback )
    {
        if ( _APIKey === '' )
        {
            _lastError = 'API Key must be specified.' ;
            return false ;
        }

        if ( ! options || ! options.keyword || options.keyword === '' )
        {
            _lastError = 'Must supply a keyword.' ;
            return false ;
        }

        var url = _baseUrl + 'verses.js?' ;
        // Iterate over options to build the query string.
        for ( var key in options )
        {
            url = url + key + '=' + options[ key ] + '&' ;
        }
        // Remove the trailing '&'.
        url = url.substring ( 0 , url.length - 1 ) ;
        return this.json ( url , callback ) ;
    } ;

    /*
     * Method: versesByRef
     * Description: Retrieves a single, specific verse using its full reference (version, book, chapter, verse number).
     *              Version IDs are available from `versions` endpoint.
     *              Book IDs are OSIS normative abbreviations.
     * @param {object} options - Reference parameters.
     *   @param {string} options.version - The version ID. (Required)
     *   @param {string} options.book - The OSIS abbreviation for the book. (Required)
     *   @param {string|number} options.chapter - The chapter number. (Required)
     *   @param {string|number} options.verse - The verse number. (Required)
     * @param {function} callback - The callback function.
     * @returns {boolean} Status of the API call initiation.
     */
    ABSBiblesearch.prototype.versesByRef = function ( options , callback )
    {
        if ( _APIKey === '' )
        {
            _lastError = 'API Key must be specified.' ;
            return false ;
        }

        if ( ! options || ! options.version || options.version === '' )
        {
            _lastError = 'Must supply a version.' ;
            return false ;
        }

        if ( ! options || ! options.book || options.book === '' )
        {
            _lastError = 'Must supply a book.' ;
            return false ;
        }

        if ( ! options || ! options.chapter || options.chapter === '' )
        {
            _lastError = 'Must supply a chapter.' ;
            return false ;
        }

        if ( ! options || ! options.verse || options.verse === '' )
        {
            _lastError = 'Must supply a verse.' ;
            return false ;
        }

        var url = _baseUrl + 'verses/' + options.version + ':' + options.book + '.' + options.chapter + '.' + options.verse + '.js' ;
        return this.json ( url , callback ) ;
    } ;

    // ################################# PASSAGE-BASED ENDPOINTS #####################################

    /*
     * Method: passages
     * Description: Retrieves references to one or more Bible passages.
     *              Documentation: http://bibles.org/pages/api/documentation/passages
     *              This endpoint provides structured references and a preview (first three verses).
     *              For full text, use the `verses` API.
     *
     * @param {object} options - Parameters for the passage request.
     *   @param {string} options.passages - One or more passage specifiers (comma-separated).
     *                                      Examples: 'John+3', 'John+3:12-15', 'John+3,Luke+2'. (Required)
     *   @param {string} [options.version] - Optional: One or more version IDs (comma-separated).
     *                                      Examples: 'KJV', 'GNT,CEV'.
     * @param {function} callback - The callback function.
     * @returns {boolean} Status of the API call initiation.
     */
    ABSBiblesearch.prototype.passages = function ( options , callback )
    {
        if ( _APIKey === '' )
        {
            _lastError = 'API Key must be specified.' ;
            return false ;
        }

        if ( ! options || ! options.passages || options.passages === '' )
        {
            _lastError = 'Must supply a passage.' ;
            return false ;
        }

        var url = _baseUrl ;
        if ( options.version && options.version !== '' )
        {
            url = url + options.version + '/' ;
        }
        url = url + 'passages.js?q[]=' + options.passages ;
        return this.json ( url , callback ) ;
    } ;

    // ################################# BOOKGROUPS ENDPOINTS #####################################

    /*
     * Method: bookgroups
     * Description: Accesses information about bookgroups, which are conventional groupings of Bible books
     *              (e.g., Pentateuch, Gospels). The composition and order of bookgroups can vary by version.
     *              Documentation: http://bibles.org/pages/api/documentation/bookgroups
     * @param {object} [options] - Optional parameters.
     *   @param {string} [options.id] - Optional: The ID of a specific bookgroup to retrieve.
     * @param {function} callback - The callback function.
     * @returns {boolean} Status of the API call initiation.
     */
    ABSBiblesearch.prototype.bookgroups = function ( options , callback )
    {
        if ( _APIKey === '' )
        {
            _lastError = 'API Key must be specified.' ;
            return false ;
        }

        var url = _baseUrl + 'bookgroups' ;
        if ( options && options.id && options.id !== '' )
        {
            url = url + '/' + options.id ; // Append specific bookgroup ID if provided.
        }
        url = url + '.js' ;
        return this.json ( url , callback ) ;
    } ;

    // ################################# FOLLOW-UP REQUESTS #####################################

    /*
     * Method: follow
     * Description: Executes a follow-up JSON API call using a path provided in a previous API response.
     *              This is useful for navigating hypermedia-style APIs.
     * @param {string} path - The relative URL path for the follow-up request. (Required)
     * @param {function} callback - The callback function.
     * @returns {boolean} Status of the API call initiation.
     */
    ABSBiblesearch.prototype.follow = function ( path , callback )
    {
        if ( _APIKey === '' )
        {
            _lastError = 'API Key must be specified.' ;
            return false ;
        }

        if ( ! path || path === '' )
        {
            _lastError = 'No path specified' ;
            return false ;
        }

        // Remove leading slash if present, to ensure correct URL construction.
        if ( path.substr ( 0 , 1 ) === '/' )
        {
            path = path.substr ( 1 ) ;
        }
        var url = _baseUrl + path ;
        return this.json ( url , callback ) ;
    } ;

    /*
     * Developer Note: The following section contains internal utility methods
     *                 and should generally not be called directly by consumers
     *                 of the ABSBiblesearch API client.
     */

    // ################################# UTILITY METHODS ######################################

    /*
     * Method: networkIsUp
     * Description: Checks the current network connectivity status.
     *              Specifically checks for Cordova environments if `navigator.connection` is available.
     * @returns {boolean} `true` if the network appears to be up, `false` otherwise.
     */
    ABSBiblesearch.prototype.networkIsUp = function ( )
    {
        // For Cordova-based applications, check the connection type.
        if ( navigator.connection && ( navigator.connection.type === 'unknown' || navigator.connection.type === 'none' ) )
        {
            if ( _debug )
            {
                console.log ( 'ABS - Network down' ) ;
            }
            return false ;
        }
        else
        {
            if ( _debug )
            {
                console.log ( 'ABS - Network up' ) ;
            }
            return true ;
        }
    } ;

    // ##################### DEFAULT TIMEOUT HANDLER ###########################

    /*
     * Method: timeout
     * Description: Default handler for API request timeouts.
     *              Logs a message to the console.
     */
    ABSBiblesearch.prototype.timeout = function ( )
    {
        console.log ( 'ABS Biblesearch timeout' ) ;
    } ;

    // ###################### JSON REQUEST HANDLER ###########################

    /*
     * Method: json
     * Description: Generic method for making JSON API requests.
     *              Handles network checks, authentication, and FUMS integration.
     * @param {string} url - The full URL for the API endpoint.
     * @param {function} callback - The function to call with the parsed JSON response.
     * @param {function} [timeout] - Optional: A custom timeout handler function.
     * @returns {boolean} `true` if the request was sent, `false` if network is down or other issues.
     */
    ABSBiblesearch.prototype.json = function ( url , callback , timeout )
    {
        if ( _debug )
        {
            console.log ( 'ABS json - url: ' + url ) ;
        }

        // Ensure callback is a function, default to an empty one if not provided.
        callback = callback || function ( ) { } ;

        // Perform a network check before attempting the request.
        if ( ! this.networkIsUp ( ) )
        {
            if ( _debug )
            {
                console.log ( 'ABS json failed.  No network.' ) ;
            }
            _lastError = 'Network is not up.' ;
            return false ;
        }

        var _xhr = new XMLHttpRequest ( ) ;

        // Define the state change handler for the XHR object.
        _xhr.onreadystatechange = function ( )
        {
            if ( _debug )
            {
                console.log ( 'ABS state: ' + _xhr.readyState ) ;
            }
            if ( _debug && _xhr.readyState === 4 )
            {
                console.log ( 'ABS status: ' + _xhr.status ) ;
            }
            if ( _xhr.readyState === 4 && _xhr.status === 200 )
            {
                if ( _debug )
                {
                    console.log ( 'ABS responseText: ' + _xhr.responseText ) ;
                }
                var obj = window.plugins.absBiblesearch.parseJSON ( _xhr.responseText + '' ) ;

                // FUMS (Fair Use Management System) integration.
                // Refer to http://bibles.org/pages/api/documentation/fums for details.
                window.plugins.absBiblesearch.setFumsJs ( obj.response.meta.fums_js_include ) ;
                window.plugins.absBiblesearch.addFums ( obj.response.meta.fums_js ) ;

                callback ( obj ) ;
            }
        } ;

        // Modify URL for basic authentication. This handles 302 redirects in browsers/iOS.
        url = url.replace ( '//' , '//' + _APIKey + ':x@' ) ;
        _xhr.open ( 'GET' , url , _async ) ;

        // Special handling for Android user agents to set Authorization header directly.
        // This is a workaround for specific Android XHR behavior.
        if ( navigator.userAgent.match ( /Android/ ) )
        {
            _xhr.setRequestHeader ( 'Authorization' , 'Basic ' + btoa ( _APIKey + ':x' ) ) ;
        }

        _xhr.timeout = 10000 ; // Set a 10-second timeout.
        _xhr.ontimeout = timeout ? timeout : this.timeout ; // Use custom timeout or default.
        _xhr.send ( null ) ; // Send the request.

        return true ;
    } ;

    /*
     * Method: parseJSON
     * Description: Safely handles initial processing of a JSON string by trimming whitespace.
     *              Adapted from jQuery 1.8.2's internal string trimming logic.
     * @param {string} data - The JSON string to process.
     * @returns {object|null|undefined} Returns `null` if input is not a string, otherwise performs
     *                                  trimming and implicitly returns `undefined` (as no explicit
     *                                  return value is specified after trimming in the original code).
     */
    ABSBiblesearch.prototype.parseJSON = function ( data )
    {
        if ( ! data || typeof data !== 'string' )
        {
            return null ;
        }

        // Regular expression to trim leading and trailing whitespace from the string.
        var rtrim = new RegExp ( '^[\\x20\\t\\r\\n\\f]+|((?:^|[^\\\\])(?:\\\\.)*)[\\x20\\t\\r\\n\\f]+$' , 'g' ) ;
        data = ( data + '' ).replace ( rtrim , '' ) ; // Converts to string and then trims.

        // IMPORTANT NOTE FOR CLONING:
        // The original `parseJSON` function, as provided in the source code,
        // concludes here without an explicit `return` statement after the
        // trimming operation, nor does it call `JSON.parse()`.
        // According to JavaScript rules, a function without an explicit return
        // statement implicitly returns `undefined`.
        // To strictly adhere to the Type I cloning definition ("Every identifier,
        // variable name, function name, operator, and expression must remain
        // completely unchanged"), this behavior, including the implicit `undefined`
        // return, must be preserved. Adding `JSON.parse()` or an explicit `return data;`
        // would constitute a change in expressions and thus violate Type I.
        // This might imply an incomplete snippet in the original source or an
        // expectation that `window.plugins.absBiblesearch.parseJSON` is overridden
        // or handled externally to actually parse the JSON.
    } ;

} ) ( ) ; // End of the immediately invoked function expression (IIFE).