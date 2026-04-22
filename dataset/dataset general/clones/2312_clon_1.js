$( function ( ) {


    /*
     * Variable Declarations:
     * These variables manage the state and configuration of the infinite scrolling feature.
     */
    var postURLs,                     // Stores an array of URLs for all available posts.
        isFetchingPosts     = false,  // A boolean flag; true when an AJAX request for posts is active.
        shouldFetchPosts    = true,   // A global switch to enable/disable the infinite scroll mechanism.
        postsToLoad         = $( ".posts" ).children( ).length, // The number of posts displayed initially on page load.
        loadNewPostsThreshold = 3000; // The scroll distance from the bottom of the document that triggers new post loading.


    // Step 1: Load the JSON configuration file containing all post URLs.
    // This is typically a manifest of blog posts or articles.
    $.getJSON( '/all-posts.json', function ( data ) {

        // Assign the array of post URLs from the fetched JSON data.
        postURLs = data[ "posts" ];

        // Conditional check: If the total number of available post URLs
        // is less than or equal to the posts already visible on the page,
        // there are no more new posts to fetch. In this scenario, disable
        // the infinite scrolling functionality immediately.
        if ( postURLs.length <= postsToLoad )
        {
            disableFetching( ); // Invoke the helper function to deactivate fetching.
        }

    } ); // End of $.getJSON callback.


    // Initial setup check:
    // If there is no visual spinner element (e.g., ".infinite-spinner") present
    // on the page, it implies that this page is not configured for infinite scrolling.
    // Therefore, disable the post fetching mechanism.
    if ( $( ".infinite-spinner" ).length < 1 ) {

        shouldFetchPosts = false; // Set the flag to prevent any post fetching.

    }


    // Event Listener: Attach a scroll handler to the window object.
    // This function continuously monitors the user's scroll position.
    $( window ).scroll( function ( e ) {

        // Guard clause: If post fetching is globally disabled OR
        // if an AJAX request is already in progress,
        // then do nothing and exit this scroll event handler.
        if ( !shouldFetchPosts || isFetchingPosts ) {
            return;
        }

        // Calculate various scroll-related metrics to determine proximity to the page bottom.
        var windowHeight         = $( window ).height( ),         // The current height of the browser's viewport.
            windowScrollPosition = $( window ).scrollTop( ),     // The number of pixels the document has been scrolled from the top.
            bottomScrollPosition = windowHeight + windowScrollPosition, // The absolute pixel position of the bottom of the viewport.
            documentHeight       = $( document ).height( );      // The total, full height of the entire HTML document.


        // Main condition for triggering new post loads:
        // If the user has scrolled close enough to the bottom of the document
        // (i.e., the distance remaining to the bottom is less than 'loadNewPostsThreshold'),
        // then initiate the fetching of new posts.
        if ( ( documentHeight - loadNewPostsThreshold ) < bottomScrollPosition ) {

            fetchPosts( ); // Call the function responsible for fetching new content.

        }

    } ); // End of window scroll event handler.


    /**
     * `fetchPosts` Function:
     * This is the primary function responsible for fetching a "chunk" or batch of new posts.
     * It orchestrates the sequential loading of multiple posts using a callback mechanism.
     */
    function fetchPosts ( ) {

        // Pre-condition check: If `postURLs` has not been initialized (e.g., JSON not loaded yet),
        // then we cannot fetch any posts. Exit immediately.
        if ( !postURLs ) {
            return;
        }

        // Set the fetching flag to true to prevent concurrent calls.
        isFetchingPosts = true;

        // Initialize variables for managing the current batch of post loads.
        var loadedPosts = 0, // Counter for the number of posts successfully loaded in this current batch.
            postCount   = $( ".posts" ).children( ).length, // The total number of posts already present on the page.

            // Define a callback function that will be executed after each individual post is loaded.
            callback    = function ( ) {

                loadedPosts++; // Increment the counter for loaded posts.

                // Calculate the index of the *next* post to be fetched from the `postURLs` array.
                var postIndex = postCount + loadedPosts;

                // Check if the calculated index exceeds the total number of available post URLs.
                // If it does, it means there are no more posts left to load.
                if ( postIndex > postURLs.length - 1 ) {

                    disableFetching( ); // Deactivate the infinite scroll feature.
                    return;             // Stop the callback chain, as there's nothing more to do.

                }

                // If not all posts in the current batch (`postsToLoad`) have been loaded yet,
                // then proceed to fetch the next post in the sequence.
                if ( loadedPosts < postsToLoad ) {

                    fetchPostWithIndex( postIndex, callback ); // Recursively call to fetch the next post.

                } else {

                    isFetchingPosts = false; // All posts in this batch have been loaded; reset the fetching flag.

                }

            }; // End of the `callback` function definition.

        // Begin the process by fetching the very first post in the current batch.
        // The `callback` will then handle subsequent posts in the batch.
        fetchPostWithIndex( postCount + loadedPosts, callback );

    } // End of `fetchPosts` function.


    /**
     * `fetchPostWithIndex` Function:
     * This utility function fetches a single post using its URL, determined by an index
     * into the `postURLs` array. The fetched content is then appended to the DOM.
     *
     * @param {number} index    The numerical index of the post to fetch from the `postURLs` array.
     * @param {function} callback A function to be executed once the post has been successfully loaded and appended.
     */
    function fetchPostWithIndex ( index, callback ) {

        var postURL = postURLs[ index ]; // Retrieve the specific URL for the post at the given index.

        // Execute an AJAX GET request to retrieve the HTML content of the post.
        $.get( postURL, function ( data ) {

            // From the fetched HTML data, find the element with the class ".post"
            // and append it to the main ".posts" container in the current document.
            $( data ).find( ".post" ).appendTo( ".posts" );

            callback( ); // Invoke the provided callback function (e.g., to continue loading the next post).

        } );

    } // End of `fetchPostWithIndex` function.


    /**
     * `disableFetching` Function:
     * This function is responsible for completely deactivating the infinite scrolling
     * mechanism. It is typically called when there are no more posts available to load.
     */
    function disableFetching ( ) {

        shouldFetchPosts = false; // Globally disable any further attempts to fetch posts.
        isFetchingPosts  = false; // Ensure no fetching operation is considered "in progress."

        // Visually hide the loading spinner element with a smooth fade-out animation.
        $( ".infinite-spinner" ).fadeOut( );

    } // End of `disableFetching` function.


} ); // End of jQuery document ready block.