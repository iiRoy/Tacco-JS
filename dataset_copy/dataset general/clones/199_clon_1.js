// This file contains the JavaScript code for the moTimeline plugin.
// It is designed to create responsive two-column timeline layouts.
// Version: 0.9.46
// Author: MattOpen
// Website: http://www.mattopen.com
// License: MIT License

( function ( $ ) {

    // A small helper utility to determine the current Bootstrap breakpoint.
    // Credits: http://stackoverflow.com/questions/18575582/how-to-detect-responsive-breakpoints-of-twitter-bootstrap-3-using-javascript
    var breakpointHelper = '<div class="device-xs visible-xs hidden"></div>';
    breakpointHelper     += '<div class="device-sm visible-sm hidden"></div>';
    breakpointHelper     += '<div class="device-md visible-md hidden"></div>';
    breakpointHelper     += '<div class="device-lg visible-lg hidden"></div>';

    // Append the helper elements to the body for breakpoint detection.
    $( 'body' ).prepend( breakpointHelper );

    // Check if waitForFinalEvent utility function is already defined.
    if ( typeof waitForFinalEvent !== 'undefined' && $.isFunction( waitForFinalEvent ) ) {
        // Function is already present, no action needed.
    } else {
        // Define waitForFinalEvent to debounce resize events.
        var waitForFinalEvent = function () {
            var b = {};
            return function ( c, d, a ) {
                a = a || "some string!"; // Default key for the timeout.
                if ( b[a] ) {
                    clearTimeout( b[a] );
                }
                b[a] = setTimeout( c, d );
            };
        }();
        // A timestamp for event identification.
        var fullDateString = new Date();
    }

    /**
     * Determines if a specific Bootstrap breakpoint is currently active.
     * @param {string} alias - The breakpoint alias (e.g., 'xs', 'sm', 'md', 'lg').
     * @returns {boolean} True if the breakpoint is active, false otherwise.
     */
    function getBreakpoint( alias ) {
        return $( '.device-' + alias ).is( ':visible' );
    }
    // End of breakpoint helper functions.

    // Global variables for moTimeline plugin state.
    var moTcolumns = [],
        moToption  = [];

    // Check user agent for specific browser classes (Firefox and Safari).
    // This might be used for specific CSS adjustments later.
    if ( navigator.userAgent.toLowerCase().indexOf( 'firefox' ) > -1 ) {
        $( 'html, Body' ).addClass( 'gecko ext-gecko' );
    }
    if ( navigator.userAgent.toLowerCase().indexOf( 'safari' ) > -1 ) {
        $( 'html, Body' ).addClass( 'safari ext-webkit' );
    }


    // Private functions for the moTimeline plugin.
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Calculates the number of columns to use based on current breakpoint and user options.
     * This is an immediately invoked function expression (IIFE).
     * @returns {object} An object containing column count, grid values, and current breakpoint.
     */
    var moT_GetColumnCount = ( function () {
        var col                = 0,
            gridValues,
            Breakpoint,
            getBreakpointInt   = 0,
            startBreakpointInt = 0;

        // Determine the current breakpoint as an integer for comparison.
        if ( getBreakpoint( 'xs' ) ) {
            getBreakpointInt = 1;
            Breakpoint       = 'xs';
        } else if ( getBreakpoint( 'sm' ) ) {
            getBreakpointInt = 2;
            Breakpoint       = 'sm';
        } else if ( getBreakpoint( 'md' ) ) {
            getBreakpointInt = 3;
            Breakpoint       = 'md';
        } else if ( getBreakpoint( 'lg' ) ) {
            getBreakpointInt = 4;
            Breakpoint       = 'lg';
        }
        // console.log(getBreakpointInt + Breakpoint); // Debugging line.

        // Check if moToption is defined, which holds plugin configuration.
        if ( typeof moToption !== 'undefined' ) {
            // Set column grid classes based on the 'startBreakpoint' option.
            if ( moToption.startBreakpoint == 'xs' ) {
                startBreakpointInt = 1;
                gridValues         = 'col-xs-6 col-sm-6 col-md-6  col-lg-6 xs';
            } else if ( moToption.startBreakpoint == 'sm' ) {
                startBreakpointInt = 2;
                gridValues         = 'col-xs-12 col-sm-6 col-md-6  col-lg-6 sm';
            } else if ( moToption.startBreakpoint == 'md' ) {
                startBreakpointInt = 3;
                gridValues         = 'col-xs-12 col-sm-12 col-md-6  col-lg-6 md';
            } else if ( moToption.startBreakpoint == 'lg' ) {
                startBreakpointInt = 4;
                gridValues         = 'col-xs-12 col-sm-12 col-md-12 col-lg-6 lg';
            }
            // console.log(gridValues); // Debugging line.
        } else {
            console.log( 'moToption not defined' ); // Fallback if options are missing.
        }

        // Determine if two columns should be displayed.
        if ( getBreakpointInt >= startBreakpointInt ) {
            col = 2; // Use two columns.
        } else {
            col = 1; // Use single column.
        }

        // Return the calculated column information.
        return {
            col        : col,
            gridValues : gridValues,
            Breakpoint : Breakpoint
        };
    } )();

    /**
     * Retrieves position and height information for a given element.
     * @param {jQuery|HTMLElement} elem - The element to analyze.
     * @returns {object} An object containing offset, height, and computed bottom position.
     */
    var moT_GetPostPosition = ( function ( elem ) {
        var o = 0, h = 0, gppu = 0, the_post, the_post_OK, the_post_H, the_post_UK, the_postID;

        // If no element or invalid element, return default zero values.
        if ( elem == 0 || !elem || elem.length == 0 ) {
            return { o : 0, h : 0, gppu : 0 };
        }

        the_post    = $( elem );
        the_postID  = the_post.attr( 'id' );
        the_post_OK = Math.ceil( the_post.offset().top );      // Top offset.
        the_post_H  = Math.ceil( the_post.outerHeight( true ) ); // Outer height including margin.
        the_post_UK = ( the_post_H + the_post_OK );           // Bottom position.

        // console.log('the_postID: ' + the_postID + ': the_post_OK: ' + the_post_OK + ' the_post_H: ' + the_post_H + ' = the_post_UK: ' + the_post_UK + ' berechnet: ' + (the_post_OK + the_post_H)); // Debugging line.

        return {
            o    : the_post_OK,
            h    : the_post_H,
            gppu : the_post_UK,
            eID  : the_postID
        };
    } );

    /**
     * Determines if a timeline post should be placed on the left or right column.
     * Also checks for badge offset conditions.
     * @param {jQuery|HTMLElement} elem - The current timeline post element.
     * @returns {object} An object indicating left/right position and badge offset.
     */
    var moT_GetLeftOrRight = ( function ( elem ) {

        if ( elem == 0 || !elem || elem.length == 0 ) {
            return console.log( 'no element' ); // Log error if no element provided.
        } else {
            var e, l, r, OG, UG, AA, BB, eid, pRid, pLid, pos, bo,
                the_post = $( elem );
            var moT_c = 0; // Compensation for Gecko/WebKit, likely related to height calculation.
            if ( $( 'body' ).hasClass( 'ext-gecko' ) ) {
                moT_c = 1;
            }
            if ( $( 'body' ).hasClass( 'ext-webkit' ) ) {
                moT_c = 1;
            }    // Safari - Apple

            eid  = the_post.attr( 'id' );
            pRid = the_post.prevAll( '.mo-inverted' ).attr( 'id' ); // ID of the previous right-aligned element.
            pLid = the_post.prevAll( 'li' ).not( '.mo-inverted' ).attr( 'id' );    // ID of the previous left-aligned element.


            l = moT_GetPostPosition( $( '#' + pLid ) ); // Position of the previous left element.
            r = moT_GetPostPosition( $( '#' + pRid ) ); // Position of the previous right element.
            e = moT_GetPostPosition( $( '#' + eid ) );  // Position of the current element.

            // Calculate various offsets and overlaps.
            OG = e.o - l.o;
            UG = l.gppu - e.o;
            AA = l.gppu - r.gppu;
            BB = r.gppu - l.gppu;

            // Logic for two-column layout.
            if ( moTcolumns.col > 1 ) {

                if ( l.gppu >= e.o + moT_c ) {
                    pos = 1; // Position on the left.
                }
                if ( r.gppu > l.gppu ) {
                    pos = 0; // Position on the right.
                }
                if ( l.gppu == r.gppu ) {
                    // pos = 1; // If heights are equal, default to left. (Commented out in original).
                }

                // Adjust badge position based on proximity to previous elements.
                if ( pos > 0 ) { // If current element is on the left.
                    if ( OG < 40 && OG >= 0 ) {
                        bo = 1; // Badge offset.
                    }
                    if ( AA < 40 && BB < 40 ) {
                        bo = 1; // Badge offset.
                    }
                }
            }

            // Return positioning details.
            return {
                lr           : pos,
                badge_offset : bo,
                e            : e,
                l            : l,
                r            : r
            };
        }
    } );

    /**
     * Sets the CSS classes for a timeline post based on its calculated position.
     * @param {jQuery|HTMLElement} elem - The timeline post element.
     */
    var moT_setPostPosition = ( function ( elem ) {

        // if(elem == 'undefined') return; // Original commented check.
        var pPos = moT_GetLeftOrRight( elem ); // Get position details.

        // Apply 'mo-inverted' class for right-aligned posts.
        if ( pPos.lr > 0 ) {
            elem.addClass( 'mo-inverted' );
        } else {
            elem.removeClass( 'mo-inverted' );
        }
        // Apply 'offset' class for badge adjustments.
        if ( pPos.badge_offset > 0 ) {
            elem.addClass( 'offset' );
        } else {
            elem.removeClass( 'offset' );
        }

    } );

    /**
     * Recursively initializes the position of timeline posts.
     * @param {Array<HTMLElement>} initarr - Array of timeline post elements.
     * @param {number} idx - Current index in the array.
     */
    moT_init = ( function ( initarr, idx ) {

        var elem;

        elem = $( initarr[idx] );
        moT_setPostPosition( elem ); // Set position for the current element.

        // Recurse to the next element if not at the end of the array.
        if ( idx < ( moTdefaults.total - 1 ) ) {
            moT_init( initarr, idx + 1 );
        } else {
            moT_RefreshPostsAll(); // Once all are initialized, refresh all posts.
            // $(window).data('ajaxready', true); // This line might be specific to mattopen.com and can be removed.
        }

    } );

    /**
     * Refreshes the position of all timeline posts.
     * This is typically called after initialization or on window resize.
     */
    moT_RefreshPostsAll = ( function () {

        // moTcolumns = moT_GetColumnCount(); // Original commented line, likely for re-calculating columns on refresh.
        var arr = $( 'ul.mo-timeline' );

        // Iterate through all list items within the timeline and set their position.
        // $('li:not(:first)',arr).each(function(idx){ // Original commented line to skip first li.
        $( 'li', arr ).each( function ( idx ) {
            moT_setPostPosition( $( this ) );
        } );

        // $('li',arr).css({"opacity":"1"}); // Original commented line to make posts visible.

    } );


    /**
     * jQuery plugin definition for moTimeline.
     * Initializes and manages a responsive two-column timeline layout.
     * @param {object} option - User-defined options for the timeline.
     */
    jQuery.fn.moTimeline = function ( option ) {

        var mo_posts      = this;
        var checkSelector = mo_posts.length;

        // If no elements are selected, return early.
        if ( !mo_posts || checkSelector == 0 ) {
            // console.log('sorry, no data...'); // Debugging message.
            return;
        } else {
            var motrcount = 1; // A counter, possibly for internal use.

            // Extend default options with user-provided options.
            moToption = $.extend( {
                // animationSpeed: 100, // Original commented option.
                // shuffleSpeed: 200,   // Original commented option.
                // gutter: 0,           // Original commented option (should be same as margin-bottom LI).
                badge         : 'ver_b',          // Default badge style.
                startBreakpoint : 'md',         // Breakpoint from which two columns start.
                startID       : 0             // Starting ID for post processing.
            }, option );

            // Default settings for the timeline.
            var moTdefaults = {
                calcSpeed  : 100,
                total      : mo_posts.length,
                gridValues : 'col-xs-12 col-sm-12 col-md-6  col-lg-6' // Default grid classes.
            };


            // Initialize column settings based on current breakpoint and options.
            moTcolumns = moT_GetColumnCount();
            $( mo_posts ).addClass( moTcolumns.gridValues ); // Apply grid classes to posts.
            $( '.badge', mo_posts ).addClass( 'visible-lg visible-md ' + moToption.badge ); // Apply badge visibility and style.

            // Add/remove 'twocol' class to the timeline container.
            if ( moTcolumns.col == 1 ) {
                $( '.mo-timeline' ).removeClass( 'twocol' );
            } else {
                if ( $( '.timeline-wrapper' ).find( '.twocol' ).length > 0 ) {
                    // Nothing to do if 'twocol' class is already present.
                } else {
                    $( '.mo-timeline' ).addClass( 'twocol' );
                }
            }

            var idx = 0; // Starting index for initialization.
            if ( moToption.startID > 0 ) {
                $( mo_posts ).addClass( moTcolumns.gridValues ); // Redundant line, already applied above.
            }

            // Ensure every list item has an ID, assigning one if missing.
            mo_posts.attr( 'id', function ( index ) {
                var theid = this.id;
                if ( theid.length > 0 ) {
                    return theid; // Use existing ID.
                } else {
                    return 'moT' + index; // Generate a new ID.
                }
            } );

            // Start the recursive initialization of post positions.
            moT_init( mo_posts, idx );

            // Use imagesLoaded plugin if available to re-calculate positions after images load.
            if ( typeof imagesLoaded !== 'undefined' && $.isFunction( imagesLoaded ) ) {
                $( '.mo-timeline' ).imagesLoaded( function () {
                    moT_RefreshPostsAll(); // Refresh all posts after images are loaded.
                } );
            }

            // Attach a debounced resize event handler.
            $( window ).on( 'resize', function () {
                waitForFinalEvent( function () {
                    moT_RefreshPostsAll(); // Re-evaluate and refresh post positions.
                    moTcolumns = moT_GetColumnCount(); // Re-calculate column count.
                    // Adjust 'twocol' class based on new column count.
                    if ( moTcolumns.col == 1 ) {
                        $( '.mo-timeline' ).removeClass( 'twocol' );
                    } else {
                        if ( $( '.timeline-wrapper' ).find( '.twocol' ).length > 0 ) {
                            // Already has 'twocol' class.
                        } else {
                            $( '.mo-timeline' ).addClass( 'twocol' );
                            console.log( 'darf nicht sein' ); // Debugging message, indicates unexpected state.
                        }
                    }
                }, 500, fullDateString.getTime() ); // Debounce for 500ms using a unique timestamp.
            } );
        }
    };
}( jQuery ) ); // End of Immediately Invoked Function Expression (IIFE).