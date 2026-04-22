$( document ).ready( function ( ) {


    // ----------------------------------------------------
    //                 GLOBAL VARIABLES SECTION
    // ----------------------------------------------------


    var    $hamburger    =    $( '.hamburger-icon' ), // Selector for the hamburger menu icon
           $item         =    $( '.has-parallax' ),   // Elements with parallax effect
           $btn          =    $( '.follow button' ),  // Buttons that trigger ripple effect
           $carousel     =    $( '.carousel' ),       // The main carousel container
           $nav          =    $( '.nav' ),            // Navigation elements for the carousel
           $play         =    $( '.audio .play' ),    // Play button for audio
           $audio        =    $( 'audio' ).get( 0 ),  // The audio element itself
           $bars         =    $( '.bars' ),           // Elements representing bars in a chart
           $count        =    $( '.count' )           // Elements for count-up animation
           ; // End of global variable declarations


    // ----------------------------------------------------
    //             HAMBURGER MENU ANIMATION LOGIC
    // ----------------------------------------------------


    $hamburger.on( 'click', function ( ) { // Attach a click event listener to the hamburger icon
        $( this ).toggleClass( 'active' ); // Toggle the 'active' class on the clicked element
        // This action typically controls the visual state of the hamburger menu,
        // often transforming it into a close icon or similar.
        // Additional functionality, such as opening a side navigation menu,
        // can be implemented here based on the 'active' class state.
    } );


    // ----------------------------------------------------
    //                 PROFILE PARALLAX EFFECT
    // ----------------------------------------------------


    $item.on( { // Attach multiple event handlers to elements with the 'has-parallax' class
        mousemove: function ( e ) { // When the mouse moves over the element
            var $this = $( this ); // Cache the current element for performance
            $this.find( '.is-parallax' ).velocity( { // Find parallax children and apply animation
                translateZ: 0, // Ensure hardware acceleration
                translateX: Math.floor( ( e.pageX - $this.offset( ).left ) - ( $this.width( ) / 2 ) ), // X-axis movement relative to mouse position
                translateY: Math.floor( ( e.pageY - $this.offset( ).top ) - ( $this.height( ) / 2 ) ), // Y-axis movement relative to mouse position
                scale: '2' // Scale up the element
            }, { // Animation options
                duration: 400, // Duration of the animation in milliseconds
                easing: 'linear', // Easing function for a smooth transition
                queue: false // Prevent animation from queuing
            } );
        },
        mouseleave: function ( ) { // When the mouse leaves the element
            $( this ).find( '.is-parallax' ).velocity( { // Animate parallax children back to original state
                translateZ: 0, // Reset Z-axis
                translateX: 0, // Reset X-axis position
                translateY: 0, // Reset Y-axis position
                scale: '1' // Reset scale to original size
            }, { // Animation options for resetting
                duration: 1000, // Longer duration for a smoother return
                easing: 'easeOutSine', // Easing function for a gentle stop
                queue: false // Prevent animation from queuing
            } );
        }
    } );


    // ----------------------------------------------------
    //                  RIPPLE EFFECT FOR BUTTONS
    // ----------------------------------------------------


    $btn.on( 'click', function ( event ) { // Attach a click event to buttons for ripple effect
        event.preventDefault( ); // Prevent the default button action (e.g., form submission)

        var $div = $( '<div/>' ); // Create a new div element for the ripple animation
        var btnOffset = $( this ).offset( ); // Get the position of the button relative to the document
        var xPos = event.pageX - btnOffset.left; // Calculate X-coordinate of the click relative to the button
        var yPos = event.pageY - btnOffset.top; // Calculate Y-coordinate of the click relative to the button


        $div.addClass( 'ripple-effect' ); // Add the 'ripple-effect' class to the new div
        var $ripple = $( ".ripple-effect" ); // Select the newly created ripple div

        $ripple.css( "height", $( this ).height( ) ); // Set ripple height to button height
        $ripple.css( "width", $( this ).height( ) ); // Set ripple width (making it a circle)
        $div
            .css( { // Position the ripple effect at the click location
                top: yPos - ( $ripple.height( ) / 2 ), // Adjust top position to center ripple
                left: xPos - ( $ripple.width( ) / 2 ), // Adjust left position to center ripple
            } )
            .appendTo( $( this ) ); // Append the ripple div to the clicked button

        window.setTimeout( function ( ) { // Set a timeout to remove the ripple effect
            $div.remove( ); // Remove the ripple div after a delay
        }, 2000 ); // Delay in milliseconds (2 seconds)
    } );


    // ----------------------------------------------------
    //             WEATHER CAROUSEL INITIALIZATION
    // ----------------------------------------------------


    $carousel.owlCarousel( { // Initialize the Owl Carousel plugin
        navigation: false, // Hide navigation buttons (prev/next)
        slideSpeed: 300, // Speed of the slide transition
        paginationSpeed: 400, // Speed of the pagination transition
        singleItem: true // Display only one item at a time in the carousel
    } );


    // ----------------------------------------------------
    //                  CAROUSEL NAVIGATION
    // ----------------------------------------------------


    $nav.on( 'click', function ( ) { // Attach click event to carousel navigation elements
        if ( $( this ).hasClass( 'next' ) ) { // Check if the clicked nav element is 'next'
            $carousel.trigger( 'owl.next' ); // Trigger the Owl Carousel 'next' event
        } else { // Otherwise, it must be 'prev'
            $carousel.trigger( 'owl.prev' ); // Trigger the Owl Carousel 'prev' event
        }
    } );


    // ----------------------------------------------------
    //                 AUDIO PLAYER CONTROL
    // ----------------------------------------------------


    var play = 0; // Initialize a counter for play/pause state
    $play.on( 'click', function ( ) { // Attach click event to the audio play button
        play++; // Increment the play counter on each click


        // --- TOGGLE PLAY/PAUSE ICON AND AUDIO STATE ---
        if ( play % 2 == 0 ) { // If counter is even, it's currently playing, so pause
            $( this ).removeClass( 'icon-pause' ).addClass( 'icon-play-arrow' ); // Change icon to play
            $audio.pause( ); // Pause the audio
        } else { // If counter is odd, it's currently paused, so play
            $( this ).removeClass( 'icon-play-arrow' ).addClass( 'icon-pause' ); // Change icon to pause
            $audio.play( ); // Play the audio
        }
    } );


    // ----------------------------------------------------
    //                      CHART ANIMATION
    // ----------------------------------------------------


    $bars.addClass( 'animate' ); // Add 'animate' class to trigger CSS animations for chart bars


    // ----------------------------------------------------
    //                 COUNT UP JQUERY PLUGIN
    // ----------------------------------------------------


    $.fn.countTo = function ( options ) { // Define a new jQuery plugin 'countTo'
        options = $.extend( { }, $.fn.countTo.defaults, options || { } ); // Merge default options with provided options

        var loops = Math.ceil( options.speed / options.refreshInterval ), // Calculate total animation steps
            increment = ( options.to - options.from ) / loops; // Calculate increment per step

        return $( this ).each( function ( ) { // Iterate over each selected element
            var _this = this, // Store reference to the current DOM element
                loopCount = 0, // Initialize loop counter
                value = options.from, // Start value for counting
                interval = setInterval( updateTimer, options.refreshInterval ); // Set interval for updating

            function updateTimer ( ) { // Function to update the counter
                value += increment; // Increment the value
                loopCount++; // Increment the loop counter
                $( _this ).html( formatNumber( value ) ); // Update element's HTML with formatted value

                if ( typeof ( options.onUpdate ) == 'function' ) { // Check if an onUpdate callback is provided
                    options.onUpdate.call( _this, value ); // Execute onUpdate callback
                }

                if ( loopCount >= loops ) { // Check if animation is complete
                    clearInterval( interval ); // Clear the interval to stop counting
                    value = options.to; // Ensure final value is exactly 'to'

                    if ( typeof ( options.onComplete ) == 'function' ) { // Check if an onComplete callback is provided
                        options.onComplete.call( _this, value ); // Execute onComplete callback
                    }
                }
            }
        } );
    };

    $.fn.countTo.defaults = { // Default options for the countTo plugin
        from: 0, // Starting number
        to: 100, // Ending number
        speed: 1000, // Animation speed in milliseconds
        refreshInterval: 100, // How often the number is updated (milliseconds)
        decimals: 0, // Number of decimal places
        onUpdate: null, // Callback function for each update
        onComplete: null, // Callback function when counting is complete
    };


    // ----------------------------------------------------
    //                  NUMBER FORMATTING UTILITY
    // ----------------------------------------------------


    function formatNumber ( num ) { // Function to format a number with comma separators
        var p = num.toFixed( 2 ).split( "." ); // Convert to string with 2 decimals, then split by decimal point
        return p[ 0 ].split( "" ).reverse( ).reduce( function ( acc, num, i, orig ) { // Format integer part with commas
            return num + ( i && ! ( i % 3 ) ? "," : "" ) + acc; // Add comma every three digits
        }, "" );
    }


    // ----------------------------------------------------
    //                  INITIALIZE COUNT UP ANIMATION
    // ----------------------------------------------------


    $count.each( function ( ) { // Iterate over each element with the 'count' class

        var start = $( this ).data( 'before' ), // Get the starting value from 'data-before' attribute
            end = $( this ).data( 'count' ); // Get the ending value from 'data-count' attribute

        $( this ).countTo( { // Apply the countTo plugin to the current element
            from: start, // Set the starting number for the count
            to: end, // Set the target number for the count
            speed: 2000, // Set the animation duration to 2 seconds
            refreshInterval: 50 // Update the number every 50 milliseconds
        } );

    } );


} ); // End of document.ready function