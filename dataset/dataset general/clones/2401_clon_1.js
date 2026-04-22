( function ( ) { // This is an Immediately Invoked Function Expression (IIFE) for scope encapsulation.

    // Declare several initial variables.
    // 'ct' attempts to retrieve terminal color from a cookie.
    var ct = document.cookie.match ( "terminal_color=(.+?)(;|$)" ),
        // 'TERMINAL_COLOR' is set from the cookie or defaults to a specific green RGB value.
        TERMINAL_COLOR = ct && ct.length ? ct[1] : '17,187,17',  // Default green color for terminal output.
        // 'PADDING' is a constant used for layout calculations.
        PADDING = 10;


    // Initialize various application-wide variables, mostly jQuery objects for UI elements.
    var socket = io.connect ( window.location.origin ), // Establish a Socket.IO connection to the current origin.
        reconnect = false, // A flag to track if a reconnection has occurred.
        feeds, // This variable will hold an array of feed configurations.
        color_picker = $( '#color-picker' ), // jQuery object for the color selection UI.
        color_cube, // This variable is declared but not used in the provided code snippet.
        refresh = $( '#refresh' ), // jQuery object for the refresh notification/button.
        nav_bar = $( '#nav_bar' ), // jQuery object for the main navigation bar.
        add_feed = $( '#add-feed' ), // jQuery object for the 'add new feed' dropdown.
        feed_container = $( '#feeds' ), // The main container element for all individual feed windows.
        tile_chooser = $( '#tile-chooser' ), // jQuery object for the tile layout selection buttons.
        data_received = $( '.data_received' ), // A visual indicator for when new data arrives.
        connected = $( '#connection' ), // A status indicator for the Socket.IO connection.
        notification = $( '#notification' ), // A general-purpose notification display area.
        refresh_active = false, // Prevents multiple refresh actions from being triggered simultaneously.
        cache = { }, // An object used to store data for each feed channel.

        // Dynamically calculate the initial width and height for feed windows.
        win_width = feed_container.width ( ), // Width of the feeds container.
        win_height = window.innerHeight - nav_bar.height ( ), // Available height minus navigation bar.

        resize_timer = null, // Used for debouncing window resize events.

        // Define a set of possible tile layout preferences.
        tile_prefs = {
            fullscreen: 'fullscreen',
            horizontal: 'horizontal',
            vertical: 'vertical',
            four_way: 'four'
        };


    /*
     * The main initialization function for the application.
     * It loads existing feeds, sets up event listeners, and applies initial UI states.
     */
    function init ( ) {
        feeds = getHash ( ); // Retrieve feed configurations from the URL hash.

        if ( feeds.length ) { // Check if any feeds were found in the hash.
            // Iterate through each stored feed and add it to the page.
            for ( var i = 0, len = feeds.length; i < len; i++ ) {
                addNewFeed ( feeds[i] );
            }
            updateZIndex ( ); // Adjust z-index to ensure correct stacking order.

            // Trigger keyup on all feed input fields to apply any saved filters.
            $( '.feed input' ).keyup ( );
        }

        attachEvents ( ); // Set up all global event listeners.
        // Apply the terminal color to the color picker's background.
        color_picker.css ( 'background', 'rgb(' + TERMINAL_COLOR + ')' );
        updateTilePreference ( ); // Apply any saved tile layout preference.
    }


    /**
     * Attaches all primary event handlers to socket events and UI elements.
     */
    function attachEvents ( ) {
        // Handle successful Socket.IO connection.
        socket.on ( 'connect', function ( ) {
            if ( reconnect ) { // If this is a re-connection after a disconnect.
                reconnect = false; // Reset the flag.
                refreshPage ( ); // Trigger a page refresh to ensure data consistency.
            }
            connected.attr ( 'title', 'Connected' ); // Update the tooltip for the connection indicator.
            connected.addClass ( 'on' ); // Visually indicate a connected state.
        } );

        // Handle Socket.IO disconnection.
        socket.on ( 'disconnect', function ( ) {
            reconnect = true; // Set the reconnect flag.
            connected.attr ( 'title', 'Disconnected' ); // Update tooltip.
            connected.removeClass ( 'on' ); // Visually indicate a disconnected state.
        } );

        // Listen for a server-sent 'refresh' event and trigger page refresh.
        socket.on ( 'refresh', refreshPage );

        // Handle clicks on tile layout options.
        tile_chooser.on ( 'click', '.tile', function ( ) {
            var pref = $( this ).data ( 'pref' ); // Get the layout preference from the clicked tile's data attribute.
            setTilePreference ( pref ); // Apply the chosen layout.
        } );

        // Attach a debounced handler for window resize events.
        $( window ).on ( 'resize', onWindowResize );

        // Handle clicks on the 'add feed' menu items.
        add_feed.on ( 'click', 'li a', onAddFeedClick );
    }


    // Event handler for when a user clicks to add a new feed.
    function onAddFeedClick ( e ) {
        e.preventDefault ( ); // Prevent the default anchor link behavior (e.g., navigating).

        var channel = $( this ).attr ( 'href' ).substring ( 1 ), // Extract the channel name from the link's href.
            feed_ct, // To count current feeds for initial positioning.
            feed; // Object to store new feed's properties.

        // If a feed with this channel ID already exists on the page.
        if ( $( '#' + channel + '-feed' ).length ) {
            updateZIndex ( channel ); // Bring the existing feed to the front.
            return; // Exit the function.
        }

        feed_ct = $( '.feed' ).length; // Get the current number of active feeds.

        // Define initial properties for the new feed.
        feed = {
            channel: channel,
            top: 100 + ( feed_ct * 20 ), // Stagger initial top position.
            left: 100 + ( feed_ct * 20 ) // Stagger initial left position.
        };

        addNewFeed ( feed ); // Create and add the new feed UI element.

        feeds.push ( feed ); // Add the new feed configuration to the global 'feeds' array.

        updateZIndex ( feed.channel ); // Ensure the newly added feed is on top.
        updateTilePreference ( ); // Reapply any active tile layout.
        updateHash ( ); // Update the URL hash to reflect the new feed.
    }


    /*
     * Debounced handler for the window's resize event.
     * Prevents excessive layout recalculations during resizing.
     */
    function onWindowResize ( e ) {
        clearTimeout ( resize_timer ); // Clear any previously set resize timer.

        // If the event target is not the window itself (e.g., an element being resized).
        if ( e.target !== window ) {
            unsetTilePreference ( ); // Clear active tile preference.
            setMovingClass ( ); // Add a class for visual feedback during movement.
        }
        // If it's a window resize and the notification is not already visible.
        else if ( !notification.is ( ':visible' ) ) {
            notification.find ( 'p' ).text ( 'Resizing...' ); // Update notification text.
            notification.slideDown ( ); // Show the notification.
        }

        // Set a new timer to execute resize-related functions after a short delay.
        resize_timer = setTimeout ( function ( ) {
            unsetMovingClass ( ); // Remove the 'moving' class.
            updateTilePreference ( ); // Reapply the tile layout.
            notification.slideUp ( ); // Hide the notification.
        }, 100 ); // Debounce time of 100 milliseconds.

    }


    // Adds a 'moving' class to the document body.
    function setMovingClass ( ) {
        document.body.classList.add ( 'moving' );
    }


    // Removes the 'moving' class from the document body.
    function unsetMovingClass ( ) {
        document.body.classList.remove ( 'moving' );
    }


    // Recalculates and sets the dimensions of the feed container.
    function setContainerSize ( ) {
        win_width = feed_container.width ( ); // Get the current width of the container.
        win_height = window.innerHeight - nav_bar.height ( ); // Calculate available vertical space.
        feed_container.height ( win_height ); // Apply the calculated height to the container.
    }


    // Updates the tile layout based on a stored preference or applies default.
    function updateTilePreference ( ) {
        setContainerSize ( ); // First, ensure the container's size is up-to-date.

        // If a tile preference is found in local storage, apply it.
        if ( localStorage.tile_pref ) {
            setTilePreference ( localStorage.tile_pref );
        }
    }


    // Sets a specific tile layout preference and activates it.
    function setTilePreference ( pref ) {
        tile_chooser.find ( '.tile' ).removeClass ( 'active' ); // Remove 'active' class from all tile buttons.
        tile_chooser.find ( '[data-pref="' + pref + '"]' ).addClass ( 'active' ); // Add 'active' to the selected one.
        localStorage.tile_pref = pref; // Store the preference in local storage.

        activateTilePreference ( pref ); // Apply the actual layout to the feeds.
    }


    // Clears the currently active tile preference and removes it from local storage.
    function unsetTilePreference ( ) {
        tile_chooser.find ( '.tile' ).removeClass ( 'active' ); // Deactivate all tile buttons.
        localStorage.tile_pref = null; // Clear the stored preference.
    }


    /*
     * Activates the specific tile layout based on the provided preference string.
     * It uses a switch statement to delegate to the appropriate layout function.
     */
    function activateTilePreference ( pref ) {
        switch ( pref ) {
            case tile_prefs.fullscreen: // Fullscreen layout.
                setTilesFullscreen ( );
                break;
            case tile_prefs.horizontal: // Horizontal split layout.
                setTilesHorizontally ( );
                break;
            case tile_prefs.vertical: // Vertical split layout.
                setTilesVertically ( );
                break;
            case tile_prefs.four_way: // Four-way grid layout.
                setTilesFourways ( );
                break;
        }
        updateHash ( ); // Update the URL hash to reflect the new layout.
    }


    // Arranges all feed tiles to take up the full available screen area.
    function setTilesFullscreen ( ) {
        $( '.feed' ).each ( function ( i, tile ) { // Iterate over each feed element.
            $( tile ).css ( {
                width: win_width, // Set width to the full container width.
                height: win_height - ( 6 * PADDING ), // Adjust height, accounting for padding/headers.
                left: 0, // Position at the far left.
                top: 0 // Position at the very top.
            } );
        } );
    }


    // Arranges feed tiles side-by-side, typically two per row.
    function setTilesHorizontally ( ) {
        $( '.feed' ).each ( function ( i, tile ) { // Iterate over each feed element.
            $( tile ).css ( {
                width: ( win_width - ( 2 * PADDING ) ) / 2, // Each tile takes half the container width.
                height: ( win_height - ( 6 * PADDING ) ), // Full height.
                left: i % 2 === 0 ? 0 : win_width / 2, // Position left or right based on index parity.
                top: 0 // Position at the top.
            } );
        } );
    }


    // Arranges feed tiles stacked vertically, typically two per column.
    function setTilesVertically ( ) {
        $( '.feed' ).each ( function ( i, tile ) { // Iterate over each feed element.
            $( tile ).css ( {
                width: win_width, // Full width.
                height: ( win_height - ( 12 * PADDING ) ) / 2, // Each tile takes half the container height.
                left: 0, // Position at the far left.
                top: i % 2 === 0 ? 0 : win_height / 2 // Position top or bottom based on index parity.
            } );
        } );
    }


    // Arranges feed tiles in a 2x2 grid.
    function setTilesFourways ( ) {
        $( '.feed' ).each ( function ( i, tile ) { // Iterate over each feed element.
            var props = { // Define common properties for width and height.
                width: ( win_width - ( 2 * PADDING ) ) / 2, // Half width.
                height: ( win_height - ( 12 * PADDING ) ) / 2 // Half height.
            };

            // Determine specific top and left positions based on the tile's index within the 2x2 grid.
            switch ( i % 4 ) {
                case 0: // Top-left quadrant.
                    props.top = 0;
                    props.left = 0;
                    break;
                case 1: // Top-right quadrant.
                    props.top = 0;
                    props.left = win_width / 2;
                    break;
                case 2: // Bottom-left quadrant.
                    props.top = win_height / 2;
                    props.left = 0;
                    break;
                case 3: // Bottom-right quadrant.
                    props.top = win_height / 2;
                    props.left = win_width / 2;
                    break;
            }

            $( tile ).css ( props ); // Apply the calculated CSS properties to the tile.
        } );
    }


    /*
     * Initiates a page refresh sequence.
     * Displays a countdown timer and then reloads the entire page.
     */
    function refreshPage ( ) {

        if ( refresh_active ) // Check if a refresh is already in progress.
            return; // If so, prevent triggering another one.

        refresh_active = true; // Set the flag to indicate refresh is active.

        var timeout, // Variable to hold the ID of the countdown timer.
            t = parseInt ( refresh.find ( '.t' ).text ( ), 10 ); // Get the initial countdown value from the UI.

        // Attach a click handler to the 'close' button within the refresh notification.
        refresh.find ( '.close' ).click ( function ( e ) {
            e.preventDefault ( ); // Prevent default link behavior.
            clearTimeout ( timeout ); // Stop the countdown timer.
            refresh.fadeOut ( function ( ) { // Fade out the refresh notification.
                refresh_active = false; // Reset the active flag.
                refresh.find ( '.t' ).text ( 10 ); // Reset the countdown text to its initial value.
            } );
        } );

        // Fade in the refresh notification and start the countdown.
        refresh.fadeIn ( function ( ) {
            ( function ( ) { // An anonymous self-executing function to manage the countdown.
                while ( t-- > 0 ) { // Decrement 't' and loop while it's greater than zero.
                    refresh.find ( '.t' ).text ( t ); // Update the displayed countdown time.
                    timeout = setTimeout ( arguments.callee, 1e3 ); // Schedule the next countdown step after 1 second (1000ms).
                    return; // Exit the current function call to allow the timeout to proceed.
                }
                // Once the countdown finishes, fade out all feeds and the refresh notification, then reload the page.
                $( '.feed' ).add ( refresh ).fadeOut ( function ( ) {
                    window.location.reload ( true ); // Force a full, cache-busting page reload.
                } );
            } ) ( );
        } );

    }


    // Retrieves feed configurations by parsing the URL hash.
    function getHash ( ) {
        try {
            var hash = window.location.hash.substring ( 1 ); // Get the hash part of the URL, removing the leading '#'.
            if ( hash[0] === '%' ) // Check if the hash content appears to be URL-encoded.
                hash = unescape ( hash ); // Decode the URL-encoded string.
            return JSON.parse ( hash ); // Parse the JSON string from the hash.
        }
        catch ( e ) { // If parsing fails (e.g., invalid JSON or empty hash).
            return [ ]; // Return an empty array.
        }
    }


    // Sets the URL hash with the JSON stringified representation of the provided data.
    function setHash ( d ) {
        window.location.hash = JSON.stringify ( d );
    }


    /*
     * Updates the global 'feeds' array with current positions, sizes, and regex filters
     * from the DOM elements, then saves this updated state to the URL hash.
     */
    function updateHash ( ) {

        // Iterate through each feed configuration in the global array.
        for ( var i = 0; i < feeds.length; i++ ) {
            var obj = $( '#' + feeds[i].channel + '-feed' ); // Get the jQuery object for the corresponding feed element.
            if ( !obj.length ) { // If the feed element no longer exists (e.g., it was closed).
                feeds.splice ( i, 1 ); // Remove it from the 'feeds' array.
                continue; // Skip to the next iteration.
            }
            // Update the feed object's properties from the current state of its DOM element.
            feeds[i].top = obj.position ( ).top; // Current top position.
            feeds[i].left = obj.position ( ).left; // Current left position.
            feeds[i].width = obj.width ( ); // Current width.
            feeds[i].height = obj.height ( ); // Current height.
            feeds[i].regex = obj.find ( 'input' ).val ( ); // Current regex filter value.
        }

        setHash ( feeds ); // Save the updated 'feeds' array to the URL hash.
    }


    /*
     * Adjusts the z-index of feed elements to bring a specified channel's feed to the front.
     * Also manages the 'active' class for visual indication.
     */
    function updateZIndex ( channel ) {
        var i, len; // Loop counter variables.

        // Loop through all feeds to update their z-index.
        for ( i = 0, len = feeds.length; i < len; i++ ) {
            if ( channel && feeds[i].channel === channel ) { // If a specific channel is provided and matches the current feed.
                // Move this feed to the end of the 'feeds' array, effectively placing it on top.
                feeds.push ( feeds.splice ( i, 1 )[0] );
            }

            // Set the z-index for each feed and remove the 'active' class.
            $( '#' + feeds[i].channel + '-feed' )
                .css ( 'z-index', i + 1 * 100 ) // Assign a unique z-index (e.g., 100, 200, 300...).
                .removeClass ( 'active' ); // Remove the 'active' class from all feeds.
        }

        // After reordering (if applicable), add the 'active' class to the very last feed in the array (the topmost one).
        $( '#' + feeds[i - 1].channel + '-feed' ).addClass ( 'active' );

    }


    /*
     * Filters and displays data within a feed's <pre> element.
     * It handles caching of incoming data and applying regex filters.
     * 'pre': The jQuery object for the <pre> element to update.
     * 'data': New data string to append, or null if only filtering cached data.
     * 'channel': The channel identifier for caching.
     * 'regex_changed': Boolean indicating if the regex filter was just modified.
     */
    function filterFeed ( pre, data, channel, regex_changed ) {

        pre = $( pre ); // Ensure 'pre' is a jQuery object.
        var regex = pre.parent ( ).find ( 'input' ).data ( 'regex' ), // Retrieve the stored regex filter.
            matches = false; // This variable is declared but not used.

        // Initialize a cache array for the channel if it doesn't exist.
        if ( !( channel in cache ) ) {
            cache[channel] = [ ];
        }

        // If the cache for this channel exceeds 2000 lines, trim it to keep the most recent 1500.
        if ( cache[channel].length > 2000 ) {
            cache[channel] = cache[channel].slice ( Math.abs ( 1500 - cache[channel].length ) );
        }

        if ( data ) { // If new data has been provided.
            // Replace specific Unix timestamp patterns with human-readable dates.
            data = data.replace ( /\b13\d{8,11}\b/, function ( d ) {
                return '"' + new Date ( d.substring ( 0, 10 ) * 1000 ) + '"';
            } ).split ( /\s*\n+/ ).filter ( function ( l ) { return l; } ); // Split into lines, filter out empty ones.
            cache[channel] = cache[channel].concat ( data ); // Add the new data to the channel's cache.
        }

        if ( regex ) { // If a regex filter is currently active for this feed.
            var ret = [ ]; // An array to hold lines that match the regex.
            for ( var i = 0, len = cache[channel].length; i < len; i++ ) {
                var m = cache[channel][i].match ( regex ); // Attempt to match the line against the regex.
                if ( m ) {
                    // If a match is found, push either captured groups or the entire line into 'ret'.
                    ret.push ( m.length > 1 && m.slice ( 1 ).join ( ', ' ) || cache[channel][i] );
                }
            }

            pre.text ( ret.join ( "\n" ) + "\n" ); // Update the <pre> element with the filtered text.

            if ( regex_changed ) { // If the regex was just changed.
                pre.scrollTop ( 99999 ); // Scroll to the bottom to show the latest matches.
            }
        }
        else { // If no regex filter is active.
            pre.text ( cache[channel].join ( "\n" ) + "\n" ); // Display all cached data.
        }

    }


    /*
     * Dynamically adds a new feed window to the UI.
     * This involves creating DOM elements, setting up draggable/resizable behavior,
     * and subscribing to real-time data for the specified channel.
     */
    function addNewFeed ( feed ) {

        // Create the main div element for the new feed.
        var feeddiv = $( '<div class="feed" id="' + feed.channel + '-feed" />' ),
            // Find the corresponding list item in the 'add feed' menu.
            feedli = $( '#add-feed li:has(a[href="#' + feed.channel + '"])' );

        // Apply initial CSS properties (position, size) from the feed object.
        feeddiv.css ( {
            top: feed.top,
            left: feed.left,
            width: feed.width,
            height: feed.height
        } );
        // Append the navigation bar (with title, close, input, pause button) and the terminal <pre> element.
        feeddiv
            .append ( '<nav>' + feed.channel + '<a href="#" class="close">&times;</a><input placeholder="/.*/" /><button class="pause-button btn-mini btn-inverse">pause</button></nav>' )
            .append ( $( '<pre class="terminal" contenteditable="true" />' ).css ( 'color', 'rgb(' + TERMINAL_COLOR + ')' ) );

        // If a regex was previously saved for this feed, populate the input field.
        if ( feed.regex ) {
            feeddiv.find ( 'input' ).val ( feed.regex );
        }

        // Make the feed window draggable and resizable, and attach various event handlers.
        feeddiv
            .hide ( ) // Initially hide the feed window.
            .draggable ( {
                handle: "nav", // Only the navigation bar acts as a drag handle.
                containment: feed_container, // Confine dragging within the main feed container.
                stop: function ( ) { // Callback function when dragging stops.
                    updateHash ( ); // Save the new position to the URL hash.
                    unsetTilePreference ( ); // Clear any active tile layout preference.
                }
            } )
            .resizable ( { handles: 'se', stop: updateHash } ) // Make it resizable from the south-east corner, update hash on stop.
            .mousedown ( function ( ) { updateZIndex ( feed.channel ); updateHash ( ); } ) // Bring to front and update hash on mousedown.
            .find ( 'nav button.pause-button' ).click ( function ( e ) { // Click handler for the pause/resume button.
                feeddiv.toggleClass ( 'paused' ); // Toggle the 'paused' class on the feed div.
                if ( feeddiv.hasClass ( 'paused' ) ) {
                    socket.emit ( 'unsubscribe', feed.channel + ':raw' ); // Unsubscribe from raw data.
                    e.target.innerText = 'resume'; // Change button text to 'resume'.
                }
                else {
                    socket.emit ( 'subscribe', feed.channel + ':raw' ); // Subscribe to raw data.
                    e.target.innerText = 'pause'; // Change button text to 'pause'.
                }
            } ).end ( ) // End the current jQuery chain, reverting to the feeddiv.
            .find ( 'nav input' ) // Target the regex input field within the nav.
                .keydown ( function ( e ) { e.stopImmediatePropagation ( ); } ) // Prevent keydown events from propagating further.
                .keyup ( function ( e ) { // Keyup handler for the regex input.

                    if ( e.target.value.length === 0 ) { // If the input field is empty.
                        var hadaregex = !! $( this ).data ( 'regex' ); // Check if a regex was previously set.
                        $( this ).data ( 'regex', null ); // Clear any stored regex.
                        updateHash ( ); // Update the URL hash.
                        if ( hadaregex ) {
                            filterFeed ( feeddiv.find ( 'pre' ), null, feed.channel, true ); // Re-filter if regex was removed.
                        }
                        return; // Exit the function.
                    }

                    // Attempt to parse and validate the entered regex.
                    try {
                        var value = e.target.value,
                            regex,
                            regex_string = value.replace ( /^\//, '' ).replace ( /\/[a-z]*$/, '' ), // Extract the regex pattern part.
                            mods = value.match ( /\/([a-z]+)$/ ); // Extract any regex modifiers (e.g., 'i', 'g').

                        if ( mods && mods.length ) {
                            regex = new RegExp ( regex_string, mods[1] ); // Create regex with modifiers.
                        }
                        else {
                            regex = new RegExp ( regex_string ); // Create regex without modifiers.
                        }

                        // If parsing is successful, store the regex and remove any error indication.
                        $( this ).data ( 'regex', regex ).removeClass ( 'error' );

                        updateHash ( ); // Update the URL hash with the new regex.
                        filterFeed ( feeddiv.find ( 'pre' ), null, feed.channel, true ); // Re-filter the feed content.

                    } catch ( e ) { // If regex parsing fails (invalid regex).
                        console.error ( e ); // Log the error to the console.
                        $( this ).addClass ( 'error' ); // Add an 'error' class to the input field.
                    }

            } ).end ( ) // End current jQuery chain.
            .find ( 'pre' ) // Target the <pre> element for terminal output.
                .data ( 'autoscroll', true ) // Initialize autoscroll state.
                .scroll ( function ( e ) { // Scroll event handler.
                    // Determine if the user has scrolled away from the bottom.
                    $( this ).data ( 'autoscroll', e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight );
                } );

        feed_container.append ( feeddiv ); // Append the newly created feed div to the container.
        feeddiv.fadeIn ( 'fast' ); // Fade in the new feed window.

        socket.emit ( 'subscribe', feed.channel + ':raw' ); // Subscribe to raw data for this specific channel.
        socket.on ( feed.channel + ':raw', function ( data ) { // Listener for incoming data on this channel.

            data_received.addClass ( 'on' ); // Show the data received indicator.
            setTimeout ( function ( ) { data_received.removeClass ( 'on' ); }, 800 ); // Hide it after 800ms.

            var pre = feeddiv.find ( 'pre' ), // Get the <pre> element for this feed.
                pre_el = pre[0], // Get the raw DOM element.
                scroll = pre_el.scrollHeight - pre_el.scrollTop === pre_el.clientHeight; // Check if the scrollbar is at the bottom.

            filterFeed ( pre, data, feed.channel ); // Process and display the new data.

            if ( scroll ) { // If autoscroll is active (i.e., user hasn't manually scrolled up).
                pre.scrollTop ( 99999 ); // Scroll to the very bottom to show the latest data.
            }

        } );

        // Attach click handler for the feed's close button.
        feeddiv.find ( 'a.close' ).click ( function ( e ) {

            e.preventDefault ( ); // Prevent default link behavior.

            feedli.removeClass ( 'active' ); // Deactivate the corresponding 'add feed' menu item.

            socket.emit ( "unsubscribe", feed.channel + ":raw" ); // Unsubscribe from the socket channel.
            // Remove the specific listener for this channel to prevent memory leaks.
            socket.removeListener ( feed.channel + ":raw", function ( data ) { feeddiv.find ( 'pre' ).append ( data ); } );
            feeddiv.remove ( ); // Remove the feed's DOM element from the page.

            updateHash ( ); // Update the URL hash to reflect the removed feed.

        } );
    }

    init ( ); // Call the initialization function to start the application.

} ) ( ); // End of the IIFE.