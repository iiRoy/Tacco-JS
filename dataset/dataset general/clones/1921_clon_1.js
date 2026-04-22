/*
 *  Performance tracking module for $hn application.
 *  This module tracks various performance metrics, such as node insertion counts
 *  and AJAX call timings, to help optimize the application.
 */
( function( $hn ) {
  // Internal data store for performance metrics.
  // 'insertedNodeCount' is an example metric, initialized to zero.
  var perfData = { insertedNodeCount : 0 },
      // The 'update' function records or updates a performance metric.
      // It can handle two main scenarios:
      // 1. Setting a metric directly (if only 'id' and 'value' are provided).
      // 2. Appending a timestamp to a comma-separated list for a specific 'type' under an 'id'.
      update = function( id, type, time ) {
        // Ensure the ID exists in perfData, initializing it if not.
        if ( !perfData[ id ] ) {
          perfData[ id ] = {};
        }

        // Check if the function was called with two arguments.
        // This signifies a direct value assignment for the 'id'.
        if ( arguments.length == 2 ) {
          perfData[ id ] = arguments[ 1 ]; // Assign the second argument as the value.
        }
        else {
          // Otherwise, append the 'time' to a specific 'type' under the 'id'.
          // If the 'type' already has values, append with a comma.
          perfData[ id ][ type ] = ( perfData[ id ][ type ] ? perfData[ id ][ type ] + ',' : '' ) + time;
        }
      }; // End of update function definition.

  // Expose performance utilities through the $hn namespace.
  // 'update' allows recording metrics, 'data' provides access to the raw performance data.
  $hn.perf = {
    update : update, // Function to update performance data.
    data   : perfData // Raw performance data object.
  };

  // Original comment for DOMNodeInserted listener, now removed as per instruction to modify/remove.
  // document.body.addEventListener('DOMNodeInserted', updateNodeCount, false);
}( window.$hn ) ); // Immediately invoked function expression, passing window.$hn.


/*
 *  This module ($hn.data) provides core data management and retrieval
 *  functionalities for the Hacker News application. It handles fetching
 *  article lists, individual article content, and comments from various
 *  API endpoints, with caching and server failover capabilities.
 */
( function ( $hn ) {
  // Define primary and backup API servers for story data.
  var primaryServer = $hn.url.stories,
      backupServer  = $hn.url.storiesBackup;

  // Initialize the currently active server to the primary one.
  var server = primaryServer;

  // Map of URL endpoints for different types of data retrieval.
  // These URLs can be templated with {placeholders}.
  var URL = {
    'list'        : '/news',
    'item'        : '/item/{id}',
    'viewText'    : 'http://viewtext.org/api/text?url={url}&format={format}', // Default readability service.
    'AskHn'       : 'https://api.thriftdb.com/api.hnsearch.com/items/_search?limit=30&sortby=create_ts+desc&weights[username]=0.1&weights[text]=1&weights[type]=0&weights[domain]=2&weights[title]=1.2&weights[url]=1&boosts[fields][points]=0.07&boosts[functions][pow(2,div(div(ms(create_ts,NOW),3600000),72))]=200&q="Ask+hn"&filter[fields][type]=submission&facet[queries][]=username:Ask&facet[queries][]=username:hn',
    'ShowHn'      : 'https://api.thriftdb.com/api.hnsearch.com/items/_search?limit=30&sortby=create_ts+desc&weights[username]=0.1&weights[text]=1&weights[type]=0&weights[domain]=2&weights[title]=1.2&weights[url]=1&boosts[fields][points]=0.07&boosts[functions][pow(2,div(div(ms(create_ts,NOW),3600000),72))]=200&q="show+hn"&filter[fields][type]=submission&facet[queries][]=username:show&facet[queries][]=username:hn',
    'top10ByDate' : 'https://api.thriftdb.com/api.hnsearch.com/items/_search?filter[fields][type][]=submission&sortby=points+desc&filter[fields][create_ts][]=[{startDate}+TO+{endDate}]&limit=10'
  };

  // Override the default viewText URL with a specific readability service from $hn.url.
  URL.viewText = $hn.url.readability;


  /**
   *  Constructs a full URL based on the provided type.
   *  Handles different URL patterns for various data categories.
   *  @param {string} type - The type of data to fetch (e.g., 'list', 'item', 'AskHn').
   *  @returns {string} The complete URL for the specified data type.
   */
  var getUrl = function ( type ) {
    if ( type == 'list' || type == 'item' ) {
      return server + URL[ type ];
    }
    else if ( type == 'AskHn' || type == 'ShowHn' ) {
      return URL[ type ];
    }
    // Handle time-based top 10 lists (today, yesterday, week).
    else if ( type == 'todayTop10' || type == 'yesterdayTop10' || type == 'weekTop10' ) {
      var startDate = new Date(),
          endDate;

      // Reset time to start of day for accurate date calculations.
      startDate.setHours( 0 );
      startDate.setMinutes( 0 );
      startDate.setSeconds( 0 );

      endDate = new Date( startDate ); // endDate initially same as startDate.

      // Adjust dates based on the type of top 10 list requested.
      if ( type == 'todayTop10' ) {
        endDate.setHours( 24 ); // End of today.
      }
      else if ( type == 'yesterdayTop10' ) {
        startDate.setHours( -24 ); // Start of yesterday.
      }
      else if ( type == 'weekTop10' ) {
        startDate.setDate( startDate.getDate() - 7 ); // Start of a week ago.
      }

      // Use $hn.t (templating function) to insert dates into the top10ByDate URL.
      return $hn.t( URL.top10ByDate, {
        'startDate' : startDate.toISOString(), // ISO format for API.
        'endDate'   : endDate.toISOString()    // ISO format for API.
      } );
    }
  };


  // Timestamp of the last server change operation.
  var lastServerChangeTime;

  /**
   *  Attempts to change the active server (primary/backup) if a certain cooldown period has passed.
   *  This is used for failover in case of AJAX errors.
   *  @param {string} url - Unused parameter, likely a remnant or placeholder.
   *  @returns {boolean} True if the server was successfully changed, false otherwise.
   */
  var changeServer = function ( url ) {
    // Log server change attempts for debugging.
    console.log( 'change server', lastServerChangeTime, server );

    // Change server only if cooldown (20 minutes) has passed or it's the first attempt.
    if ( !lastServerChangeTime || lastServerChangeTime + ( 1000 * 60 * 20 ) < +new Date() ) {
      lastServerChangeTime = +new Date(); // Update last change time.
      // Toggle between primary and backup servers.
      server = ( server == primaryServer ? backupServer : primaryServer );
      console.log( lastServerChangeTime, server ); // Log the new state.
      return true; // Server was changed.
    }
    return false; // Server was not changed (due to cooldown).
  };


  // Object to store locally cached article data.
  var localData;

  /**
   *  Initializes or clears the local data cache.
   *  Specifically, it resets the 'articles' object.
   */
  var resetCache = function () {
    localData = {
      articles : {} // Empty object to hold article details by ID.
    };
  };

  // Perform initial cache reset when the module loads.
  resetCache();

  /**
   *  Processes the fetched list of articles to augment them with
   *  visited status and other display-related properties.
   */
  var updateLocalData = function () {
    // Iterate over each item in the fetched list.
    $.each( localData.list, function ( index, item ) {
      item.visitedComments = ''; // Initialize visited comments status.
      item.visitedArticle  = ''; // Initialize visited article status.

      // Check if the article has been visited previously.
      if ( visitedData[ item.id ] ) {
        if ( visitedData[ item.id ].a ) {
          item.visitedArticle = 'visited'; // Mark article as visited.
        }
        if ( visitedData[ item.id ].c ) {
          item.visitedComments = 'visited'; // Mark comments as visited.
        }
      }
      // Special handling for 'job' type articles.
      if ( item.type == 'job' ) {
        item.points = 'JOB'; // Display 'JOB' instead of points.
      }
      // Ensure 'user' property exists, default to empty string.
      if ( !item.user ) {
        item.user = '';
      }
      // Escape HTML special characters in the title to prevent XSS.
      item.title = item.title.replace( '<', '&lt;' );

      // Store the processed item in the articles cache by its ID.
      localData.articles[ item.id ] = item;
    } );
  };


  // Object to store data about visited articles and comments.
  // This object is persisted in local storage.
  var visitedData = {
    // Example structure for a visited item (commented out in original).
    // id : {
    //   'c' : +new Date(), // Timestamp of last comment visit.
    //   'a' : +new Date(), // Timestamp of last article visit.
    // },
    // version: 2 // Schema version for visited data.
  };

  /**
   *  Reads visited data and cached list data from local storage.
   *  Performs data migration if schema version is old and cleans up stale entries.
   */
  var readLocalData = function () {
    console.log( 'readLocalData()' ); // Log the execution of this function.
    var t0ls           = +new Date(), // Start time for local storage read performance.
        localVisitedData = window.store.get( 'visited' ), // Retrieve visited data.
        localStorageList = window.store.get( 'list' );   // Retrieve cached list data.

    // Update performance metrics for local storage read operations.
    $hn.perf.update( 'localstorage', 'read', +new Date() - t0ls );

    // Process retrieved visited data.
    if ( localVisitedData ) {
      $.extend( true, visitedData, localVisitedData ); // Merge with current visitedData.

      // If no version found, perform migration from old schema (d -> a/c).
      if ( !visitedData.version ) {
        $.each( visitedData, function ( i, item ) {
          if ( item.a ) {
            item.a = item.d; // Migrate 'd' (date) to 'a' (article visited).
          }
          if ( item.c ) {
            item.c = item.d; // Migrate 'd' (date) to 'c' (comments visited).
          }
          delete item.d; // Remove old 'd' property.
        } );
      }
      visitedData.version = 2; // Set current schema version.

      // Clean up old visited entries (older than 7 days).
      $.each( visitedData, function ( index, item ) {
        if ( index != 'version' ) { // Skip the version property itself.
          // If article visit is older than 7 days, delete it.
          if ( item.a < +new Date() - ( 1000 * 60 * 60 * 24 * 7 ) ) {
            delete item.a;
          }
          // If comment visit is older than 7 days, delete it.
          if ( item.c < +new Date() - ( 1000 * 60 * 60 * 24 * 7 ) ) {
            delete item.c;
          }
          // If both article and comment visits are gone, delete the whole item.
          if ( !item.a && !item.c ) {
            delete visitedData[ index ];
          }
        }
      } );

      saveVisitedData(); // Save cleaned and migrated visited data.
    }

    // Process retrieved cached list data.
    if ( localStorageList ) {
      // If cached list is less than 5 minutes old, use it.
      if ( +new Date() - localStorageList.timestamp < 1000 * 60 * 5 ) {
        localData.list = localStorageList.data; // Assign cached list.
        updateLocalData(); // Process the list data.
      }
    }
  };

  // Timer ID for delayed saving of visited data.
  var saveVisitedId = null;

  /**
   *  The actual function that saves visitedData to local storage.
   *  Called by saveVisitedData after a delay.
   */
  var saveVisitedDelayed = function () {
    console.log( 'saveVisitedDelayed()' );
    saveVisitedId = null; // Clear the timer ID.
    window.store.set( 'visited', visitedData ); // Persist visited data.
  };

  /**
   *  Initiates a delayed save of visited data to local storage.
   *  This debounces saves to prevent excessive writes.
   */
  var saveVisitedData = function () {
    console.log( 'saveVisitedData()' );
    // Clear any existing pending save.
    if ( saveVisitedId ) {
      window.clearTimeout( saveVisitedId );
      saveVisitedId = null;
    }

    // Set a new timeout to save after 1 second.
    saveVisitedId = window.setTimeout( saveVisitedDelayed, 1000 );
  };

  /**
   *  Marks an article or its comments as visited.
   *  @param {string} id - The ID of the article.
   *  @param {string} type - 'a' for article, 'c' for comments.
   */
  var addVisited = function ( id, type ) {
    if ( !visitedData[ id ] ) {
      visitedData[ id ] = {}; // Initialize if not existing.
    }
    visitedData[ id ][ type ] = +new Date(); // Set current timestamp for visited type.

    saveVisitedData(); // Trigger a save of visited data.
  };

  // The original code had a commented-out setTimeout,
  // indicating an intention for delayed execution.
  // window.setTimeout(readLocalData, 1);
  // Execute readLocalData immediately on module load.
  readLocalData();

  /**
   *  Returns the current local data cache.
   *  @returns {object} The localData object.
   */
  var getLocalData = function () {
    return localData;
  };

  /**
   *  Fetches the main list of articles from the server and updates the local cache.
   *  @param {function} callback - Function to call upon successful data retrieval.
   */
  var updateList = function ( callback ) {
    callback = callback || function () {}; // Ensure callback is a function.

    var onSuccess = function ( data ) {
          resetCache(); // Clear previous cache.
          // Update performance metric for list fetching.
          $hn.perf.update( 'list', 'fetch', +new Date() - t0Ajax );
          localData.list = data; // Store the fetched list.
          updateLocalData(); // Process the fetched list.
          callback.apply( callback, [ localData.list ] ); // Invoke callback with the list.

          // Store the updated list in local storage with a timestamp.
          window.store.set( 'list', { data : localData.list, timestamp : +new Date() } );
        },
        t0Ajax    = +new Date(); // Start time for AJAX request.

    $hn.ajax( {
      url     : getUrl( 'list' ) + '?t=' + +new Date(), // Append timestamp to prevent caching.
      success : onSuccess,
      error   : function ( xhr, status ) {
        // Log AJAX errors.
        console.log( typeof status, status, xhr );
        // If error is an AJAX error/abort and server can be changed, try again.
        if ( "ajaxError|abort".indexOf( status ) > -1 && changeServer() ) {
          updateList( callback ); // Retry fetching the list.
        }
      }
    } );
  };

  // Counter for retry attempts in updateArticleContent.
  var callbackLoop = 0;

  /**
   *  Fetches and updates the content of a specific article.
   *  @param {string} id - The ID of the article.
   *  @param {function} callback - Function to call upon successful content retrieval.
   */
  var updateArticleContent = function ( id, callback ) {
    callback = callback || function () {}; // Ensure callback is a function.

    // If article data is missing locally, retry a few times.
    if ( !localData.articles[ id ] && callbackLoop++ < 3 ) {
      // Original commented alert for debugging.
      // alert('updateArticleContent(): Something went wrong! Reload??? ' + id);
      window.setTimeout( function () {
        updateArticleContent( id, callback ); // Retry after a short delay.
      }, 400 );
    }

    // Function to generate fallback content if article content fetching fails.
    var fallbackContent = function () {
          return $hn.t( '<p>Oops... Something went terribly wrong... </p><p>Follow this link <a href="{url}">{url}</a> to view the article</p><br><br>', { url : localData.articles[ id ].url } );
        },
        // Callback for successful AJAX request.
        onSuccess       = function ( data ) {
          // Update performance metric for article content fetching.
          $hn.perf.update( id, 'article-fetch', +new Date() - t0Ajax );

          // Create a temporary div to process the content.
          var a = $( '<div></div>' ).html( data.content || fallbackContent() );
          // Remove class names from all elements within the fetched content.
          $( '*', a ).each( function ( index, node ) {
            if ( node.className ) {
              node.className = '';
            }
          } );
          localData.articles[ id ].article = a.html(); // Store cleaned HTML content.
          callback.apply( callback, [ localData.articles[ id ] ] ); // Invoke callback.
        },
        // Callback for AJAX request error.
        onError         = function ( data ) {
          localData.articles[ id ].articlecontent = fallbackContent(); // Use fallback content.
          callback.apply( callback, [ localData.articles[ id ] ] ); // Invoke callback.
        },
        t0Ajax          = +new Date(); // Start time for AJAX request.

    // Make AJAX call to fetch article content using the readability service.
    $hn.ajax( {
      url      : $hn.t( URL.viewText, { url : encodeURIComponent( localData.articles[ id ].url ), format : 'jsonp' } ),
      dataType : 'jsonp', // Expect JSONP response.
      success  : onSuccess,
      error    : onError
    } );
  };

  /**
   *  Fetches and updates the comments for a specific article.
   *  @param {string} id - The ID of the article.
   *  @param {function} callback - Function to call upon successful comments retrieval.
   */
  var updateArticleComments = function ( id, callback ) {
    callback = callback || function () {}; // Ensure callback is a function.

    /**
     *  Recursively finds the highest comment ID within a comment tree.
     *  Used to track the last read comment.
     *  @param {array} comments - Array of comment objects.
     *  @returns {number|undefined} The highest comment ID found, or undefined if no comments.
     */
    var getLastCommentId = function ( comments ) {
      var lastCommentId;
      $.each( comments, function ( index, item ) {
        var tempId;
        if ( !lastCommentId || item.id > lastCommentId ) {
          lastCommentId = item.id; // Update if current item ID is higher.
        }

        // Recursively check child comments.
        if ( item.comments && ( tempId = getLastCommentId( item.comments ) ) && tempId > lastCommentId ) {
          lastCommentId = tempId; // Update if child comment ID is higher.
        }
      } );
      return lastCommentId;
    };

    // Callback for successful AJAX request.
    var onSuccess = function ( data ) {
          // Update performance metric for comments fetching.
          $hn.perf.update( id, 'comments-fetch', +new Date() - t0Ajax );
          var article = localData.articles[ id ];
          // If article not in cache, or if we want to overwrite, store new data.
          // Original commented code shows a decision point here.
          // if (!article) {
          article = localData.articles[ id ] = data;
          // }
          // else {
          //    article.comments = data.comments;
          // }

          // If URL starts with 'item', it's likely an internal reference, so delete the URL.
          if ( article.url && article.url.indexOf( 'item' ) == 0 ) {
            delete article.url;
          }

          // Restore last read comment ID from visited data if available.
          if ( visitedData[ id ] && visitedData[ id ].lastReadComment ) {
            article.lastReadComment = visitedData[ id ].lastReadComment;
          }

          article.commentsFetchTime = +new Date(); // Record fetch time.
          callback.apply( callback, [ article ] ); // Invoke callback with the article.

          // Delay saving the last read comment ID to give user time to read.
          window.setTimeout( function () {
            visitedData[ id ].lastReadComment = getLastCommentId( article.comments );
            saveVisitedData(); // Trigger save of visited data.
          }, 300 );
        },
        t0Ajax    = +new Date(); // Start time for AJAX request.

    // Make AJAX call to fetch article comments.
    $hn.ajax( {
      url      : $hn.t( getUrl( 'item' ), { id : id } ), // Use 'item' URL type.
      dataType : 'jsonp', // Expect JSONP response.
      success  : onSuccess,
      error    : function ( xhr, status ) {
        console.log( 'ajax primary server failed, try backup server: ', status, xhr );
        // If error is an AJAX error/abort and server can be changed, retry.
        if ( 'error|abort'.indexOf( status ) > -1 && changeServer() ) {
          updateArticleComments( id, callback ); // Retry fetching comments.
        }
      }
    } );
  };

  /**
   *  Retrieves a list of articles. Can optionally force a reload from the server.
   *  @param {function} callback - Function to call with the article list.
   *  @param {boolean} [reload=false] - If true, bypasses cache and fetches from server.
   */
  var getArticles = function ( callback, reload ) {
    reload   = reload || false; // Default to not reloading.
    callback = callback || function () {}; // Ensure callback is a function.

    // If not reloading and data is in cache, return cached data.
    if ( !reload && localData.list ) {
      return callback.apply( callback, [ localData.list ] );
    }

    updateList( callback ); // Fetch from server if no cache or reload is forced.
  };

  /**
   *  Retrieves metadata for a specific article.
   *  @param {string} id - The ID of the article.
   *  @param {function} callback - Function to call with the article metadata.
   */
  var getArticleMeta = function ( id, callback ) {
    callback = callback || function () {}; // Ensure callback is a function.

    var article = localData.articles[ id ];
    // If article metadata is already in cache, return it.
    if ( article ) {
      return callback.apply( callback, [ article ] );
    }

    // Callback for successful AJAX request.
    var onSuccess = function ( data ) {
          // Update performance metric.
          $hn.perf.update( id, 'comments-fetch', +new Date() - t0Ajax ); // Reusing 'comments-fetch' for meta.
          data.commentsFetchTime = +new Date(); // Record fetch time.
          // Clean up URL if it's an internal 'item' link.
          if ( data.url && data.url.indexOf( 'item' ) == 0 ) {
            delete data.url;
          }
          localData.articles[ id ] = data; // Store fetched metadata.
          callback.apply( callback, [ data ] ); // Invoke callback.
        },
        t0Ajax    = +new Date(); // Start time for AJAX request.

    // Make AJAX call to fetch article metadata (using the 'item' URL type).
    $hn.ajax( {
      url      : $hn.t( getUrl( 'item' ), { id : id } ),
      dataType : 'jsonp',
      success  : onSuccess,
      error    : function ( xhr, status ) {
        console.log( 'ajax primary server failed, try backup server: ', status, xhr );
        // If error is an AJAX error/abort and server can be changed, retry.
        if ( 'error|abort'.indexOf( status ) > -1 && changeServer() ) {
          getArticleMeta( id, callback ); // Retry fetching metadata.
        }
      }
    } );
  };

  /**
   *  Retrieves the full content of an article.
   *  @param {string} id - The ID of the article.
   *  @param {function} callback - Function to call with the article content.
   *  @param {boolean} [reload=false] - If true, bypasses cache and fetches from server.
   */
  var getArticleContent = function ( id, callback, reload ) {
    reload   = reload || false; // Default to not reloading.
    callback = callback || function () {}; // Ensure callback is a function.

    addVisited( id, 'a' ); // Mark article as visited.
    var article = localData.articles[ id ];
    // If not reloading and content is in cache, return cached content.
    if ( !reload && article && article.content ) {
      return callback.apply( callback, [ article ] );
    }

    updateArticleContent( id, callback ); // Fetch content from server.
  };

  /**
   *  Retrieves comments for an article.
   *  @param {string} id - The ID of the article.
   *  @param {function} callback - Function to call with the article comments.
   *  @param {boolean} [reload=false] - If true, bypasses cache and fetches from server.
   */
  var getArticleComments = function ( id, callback, reload ) {
    reload   = reload || false; // Default to not reloading.
    callback = callback || function () {}; // Ensure callback is a function.

    addVisited( id, 'c' ); // Mark comments as visited.
    var article = localData.articles[ id ];
    // If not reloading and comments are in cache and not too old (5 minutes), return cached comments.
    if ( !reload && article && article.comments && article.commentsFetchTime < ( +new Date() + ( 1000 * 60 * 5 ) ) ) {
      return callback.apply( callback, [ article ] );
    }

    updateArticleComments( id, callback ); // Fetch comments from server.
  };

  /**
   *  Reformats raw data fetched from specialized APIs (like AskHn/ShowHn)
   *  into the standard article object format used by the application.
   *  @param {object} data - Raw data object from the API.
   *  @returns {array} An array of reformatted article objects.
   */
  var reformatData = function ( data ) {
    var t0Reformat = +new Date(), // Start time for reformatting performance.
        tempData   = [];          // Array to hold reformatted items.

    $.each( data.results, function ( index, item ) {
      item = item.item; // Extract the actual item object.
      // Create a new object with standardized properties.
      var tempItem = {
        id             : item.id,
        comments_count : item.num_comments,
        domain         : item.domain,
        points         : item.points,
        time_ago       : $hn.timeAgo( +new Date( item.create_ts ) ), // Format time ago.
        title          : item.title,
        content        : item.text || '', // Use text as content, or empty string.
        type           : item.type,
        url            : item.url,
        user           : item.username,
        visitedArticle : '',
        visitedComments: ''
      };
      // Check visited status for the reformatted item.
      if ( visitedData[ item.id ] ) {
        if ( visitedData[ item.id ].c ) {
          tempItem.visitedComments = 'visited';
        }
        if ( visitedData[ item.id ].a ) {
          tempItem.visitedArticle = 'visited';
        }
      }
      localData.articles[ item.id ] = tempItem; // Store in general articles cache.
      tempData.push( tempItem ); // Add to the reformatted list.
    } );

    // Update performance metric for reformatting.
    $hn.perf.update( 'listAskHn', 'reformat', +new Date() - t0Reformat );
    return tempData; // Return the reformatted list.
  };

  /**
   *  Fetches articles of a specific type (e.g., 'AskHn', 'ShowHn') and updates the cache.
   *  @param {string} type - The type of articles to fetch.
   *  @param {function} callback - Function to call with the fetched and reformatted articles.
   */
  var updateArticlesByType = function ( type, callback ) {
    console.log( type ); // Log the type being updated.
    callback = callback || function () {}; // Ensure callback is a function.

    var onSuccess = function ( data ) {
          // Update performance metric for fetching specific list type.
          $hn.perf.update( 'list' + type, 'fetch', +new Date() - t0Ajax );
          localData[ 'list' + type ] = reformatData( data ); // Reformat and store data.
          callback.apply( callback, [ localData[ 'list' + type ] ] ); // Invoke callback.
        },
        t0Ajax    = +new Date(); // Start time for AJAX request.

    // Make AJAX call to fetch articles of the specified type.
    $hn.ajax( {
      url      : getUrl( type ), // Get URL for the specific type.
      dataType : 'jsonp', // Expect JSONP response.
      success  : onSuccess
    } );
  };

  /**
   *  Retrieves articles of a specific type (e.g., 'AskHn', 'ShowHn').
   *  Can optionally force a reload from the server.
   *  @param {string} type - The type of articles to retrieve.
   *  @param {function} callback - Function to call with the articles.
   *  @param {boolean} [reload=false] - If true, bypasses cache and fetches from server.
   */
  var getArticlesByType = function ( type, callback, reload ) {
    reload   = reload || false; // Default to not reloading.
    callback = callback || function () {}; // Ensure callback is a function.

    // If not reloading and data is in cache, return cached data.
    if ( !reload && localData[ 'list' + type ] ) {
      return callback.apply( callback, [ localData[ 'list' + type ] ] );
    }

    updateArticlesByType( type, callback ); // Fetch from server if no cache or reload is forced.
  };

  // Expose public data retrieval methods through the $hn.data namespace.
  $hn.data = {
    getArticles       : getArticles,        // Get main article list.
    getArticleMeta    : getArticleMeta,     // Get article metadata.
    getArticleContent : getArticleContent,  // Get full article content.
    getArticleComments: getArticleComments, // Get article comments.
    getArticlesByType : getArticlesByType,  // Get articles of a specific category (AskHn, ShowHn).
    cache             : getLocalData        // Access the local data cache directly.
  };

}( window.$hn ) ); // Immediately invoked function expression, passing window.$hn.