( function ( $ ) { /* Begin of the Immediately Invoked Function Expression (IIFE) */


    // Initiate an asynchronous JSONP request to the Dribbble API.
    // The 'callback=?' parameter is crucial for enabling cross-domain requests via JSONP.
    $ . getJSON ( "http://api.dribbble.com/players/johnneiner/shots?callback=?" ,

                  {
                      per_page : 6 /* Requesting a maximum of 6 shots per page from the API. */
                  } ,

                  function ( data ) { // This is the callback function executed upon successful data retrieval.

                      // A conditional check to ensure that the received data
                      // is valid and contains the expected 'shots' array.
                      if ( data && data . shots ) {

                          /*
                           * This block is responsible for rendering the Dribbble shots
                           * using a templating mechanism (likely jQuery-tmpl).
                           * The rendered output is then appended to a designated
                           * container element within the HTML document.
                           */
                          $( "#shot-template" )
                              . tmpl ( data . shots ) // Apply the fetched 'shots' data to the template.
                              . appendTo ( "#dribbble-shots" ) ; // Insert the templated content into the '#dribbble-shots' div.
                      }
                  }
                ) ; /* End of the jQuery.getJSON method call. */


    // This multi-line comment serves as a general note.
    // It indicates that the subsequent functions will demonstrate
    // various interaction patterns, particularly those involving
    // the 'doTimeout' plugin.
    /*
     * NOTE: The following collection of functions is dedicated to exploring
     *       different implementations and solutions using the 'doTimeout'
     *       jQuery plugin. For a structured walkthrough, mirroring the
     *       conference presentation, please consult the instructions
     *       provided at the concluding section of this file.
     */

    //
    // Function definition: first_try()
    //
    /*
     * First Iteration: Basic hover effect implementation.
     * Objective: Fade in an element on mouse entry, fade out on mouse exit.
     */
    /****************************************************************************************
     *                                                                                      *
     *   First Try: Simple Fade-In/Fade-Out on Mouse Hover                                  *
     *                                                                                      *
     *   Description: This function sets up a rudimentary hover interaction.                *
     *                When the user's mouse cursor enters the bounds of a list item,        *
     *                its associated label (a 'div' element) will gracefully fade in.       *
     *                Conversely, when the mouse leaves that item, the label will           *
     *                fade out.                                                             *
     *                                                                                      *
     *   Expected User Interaction Flow:                                                    *
     *     1. As the user moves their mouse over an individual item, the label             *
     *        corresponding to that item should initiate a fade-in animation.              *
     *     2. Immediately upon the user's mouse departing from the item, the label         *
     *        should begin its fade-out animation.                                         *
     *                                                                                      *
     ****************************************************************************************/
    function first_try () {
        $( "#dribbble-shots" ) // Select the main container element by its ID.
            . delegate ( "li" , "mouseenter" , function ( e ) {
                // Event handler for 'mouseenter' on 'li' elements within '#dribbble-shots'.
                $( this ) . find ( "div" ) . fadeIn ( 200 ) ; // Find the inner 'div' and fade it in over 200ms.
            } )
            . delegate ( "li" , "mouseleave" , function ( e ) {
                // Event handler for 'mouseleave' on 'li' elements.
                $( this ) . find ( "div" ) . fadeOut ( 200 ) ; // Find the inner 'div' and fade it out over 200ms.
            } ) ;
    } // End of the 'first_try' function.


    //
    // Function definition: second_try()
    //
    /*
     * Second Iteration: Addressing animation queuing problems.
     * Objective: Prevent animation buildup using jQuery's .stop(true).
     */
    /******************************************************************************************
     *                                                                                        *
     *   Second Try: Preventing Animation Queuing with .stop(true)                            *
     *                                                                                        *
     *   Context: This revision aims to mitigate a common issue where rapid mouse             *
     *            movements across elements can cause multiple animations to queue up.        *
     *            This leads to a backlog of visual effects that continue long after          *
     *            the user has ceased interaction, resulting in a janky user experience.      *
     *                                                                                        *
     *   Expected User Interaction Flow:                                                      *
     *     1. When the mouse enters an item, any currently running fade-out animation         *
     *        on its label should be halted immediately. The label should then                *
     *        commence its fade-in animation.                                                 *
     *     2. When the mouse leaves an item, the label should first complete any             *
     *        pending fade-in animation, and subsequently proceed with its fade-out.          *
     *                                                                                        *
     ******************************************************************************************/
    function second_try () {
        $( "#dribbble-shots" )
            . delegate ( "li" , "mouseenter" , function ( e ) {
                // On mouse entry, stop all current animations on the 'div' and then fade it in.
                $( this ) . find ( "div" ) . stop ( true ) . fadeIn ( 200 ) ;
            } )
            . delegate ( "li" , "mouseleave" , function ( e ) {
                // On mouse leave, simply fade out the 'div'.
                $( this ) . find ( "div" ) . fadeOut ( 200 ) ;
            } ) ;
    } // End of the 'second_try' function.


    //
    // Function definition: third_try()
    //
    /*
     * Third Iteration: Ensuring full opacity for faded-in elements.
     * Objective: Use .fadeTo() to guarantee 100% opacity, even after interruptions.
     */
    /*******************************************************************************************
     *                                                                                         *
     *   Third Try: Guaranteeing Full Opacity with .fadeTo()                                   *
     *                                                                                         *
     *   Problem Addressed: A known characteristic of jQuery's `fadeIn` method is that         *
     *                      if its animation is interrupted mid-cycle, the element may         *
     *                      not attain its full, intended opacity (100%). This attempt         *
     *                      specifically addresses this by employing `fadeTo` to explicitly    *
     *                      target a 100% opacity level.                                       *
     *                                                                                         *
     *   Expected User Interaction Flow:                                                       *
     *     1. Upon the mouse cursor entering an item, any ongoing fade-out animation           *
     *        of its label should be terminated, and the label should immediately              *
     *        begin to fade in.                                                                *
     *     2. Upon the mouse cursor exiting the item, the label should first complete          *
     *        any remaining fade-in animation, and then proceed to fade out.                   *
     *     3. Crucially, when the label has fully faded in, its opacity must be 100%.          *
     *                                                                                         *
     *******************************************************************************************/
    function third_try () {
        $( "#dribbble-shots" )
            . delegate ( "li" , "mouseenter" , function ( e ) {
                // On mouse entry, stop animations and fade to an explicit opacity of 1.0 (100%).
                $( this ) . find ( "div" ) . stop ( true ) . fadeTo ( 200 , 1.0 ) ;
            } )
            . delegate ( "li" , "mouseleave" , function ( e ) {
                // On mouse leave, simply fade out the 'div'.
                $( this ) . find ( "div" ) . fadeOut ( 200 ) ;
            } ) ;
    } // End of the 'third_try' function.


    //
    // Function definition: fourth_try()
    //
    /*
     * Fourth Iteration: Introducing timed delays for hover effects using doTimeout.
     * Objective: Replicate 'hoverIntent' functionality by delaying label visibility.
     */
    /*******************************************************************************************
     *                                                                                         *
     *   Fourth Try: Implementing Delayed Hover with doTimeout                                 *
     *                                                                                         *
     *   Concept: This implementation leverages the `doTimeout` plugin to introduce            *
     *            a configurable delay before a specified action (e.g., showing a label)       *
     *            is actually triggered. This effectively mimics the behavior of the           *
     *            well-known `hoverIntent` jQuery plugin.                                      *
     *                                                                                         *
     *   Specifics: Here, we are utilizing the "plugin form" of `doTimeout`, which means       *
     *              that the timeout key (e.g., "hoverOut", "hoverIn") is scoped directly      *
     *              to the specific jQuery element (`$li.doTimeout`). This design ensures      *
     *              that each individual portfolio item manages its own, independent timer.     *
     *                                                                                         *
     *   Expected User Interaction Flow:                                                       *
     *     1. The user's mouse cursor must remain stationary over a single portfolio           *
     *        item for a minimum duration of 0.5 seconds before that item's label              *
     *        becomes visible.                                                                 *
     *     2. If the mouse is moved off *all* portfolio items, any currently visible           *
     *        label will fade out after a subsequent 0.5-second delay.                         *
     *     3. The actual fade-in and fade-out animations themselves are set to complete        *
     *        within 200 milliseconds.                                                         *
     *                                                                                         *
     *******************************************************************************************/
    function fourth_try () {
        $( "#dribbble-shots" )
            . delegate ( "li" , "mouseenter" , function ( e ) {
                var $li = $( this ) ; // Cache the current list item as a jQuery object for efficiency.

                // Clear any pending 'hoverOut' timeout that might be active for *this specific* list item.
                $li . doTimeout ( "hoverOut" ) ;
                // Set a new 'hoverIn' timeout: after 500ms, the inner 'div' will fade to full opacity.
                $li . doTimeout ( "hoverIn" , 500 , function ( ) {
                    $li . find ( "div" ) . fadeTo ( 200 , 1.0 ) ; // Fade to 100% opacity over 200ms.
                } ) ;
            } )
            . delegate ( "li" , "mouseleave" , function ( e ) {
                var $li = $( this ) ; // Cache the current list item as a jQuery object.

                // Clear any pending 'hoverIn' timeout that might be active for *this specific* list item.
                $li . doTimeout ( "hoverIn" ) ;
                // Set a new 'hoverOut' timeout: after 500ms, the inner 'div' will stop current animations and fade out.
                $li . doTimeout ( "hoverOut" , 500 , function ( ) {
                    $li . find ( "div" ) . stop ( true ) . fadeOut ( ) ; // Stop any animations and fade out.
                } ) ;
            } ) ;
    } // End of the 'fourth_try' function.


    //
    // Function definition: final_code() - The most advanced interaction logic.
    //
    /*
     * Final Code: An advanced fusion of doTimeout and global state management.
     * Objective: Create a highly responsive hover effect with fast transitions
     *            between items and intelligent delayed hiding.
     */
    /********************************************************************************************
     *                                                                                          *
     *   Final Code: Advanced Interaction with Global doTimeout and State Management            *
     *                                                                                          *
     *   Overview: This section presents the most refined and sophisticated implementation      *
     *             of the hover effect. It intelligently combines the capabilities of the       *
     *             `doTimeout` plugin with global state tracking to achieve a highly            *
     *             responsive and seamless user experience.                                     *
     *                                                                                          *
     *   Key Mechanism: In this final approach, we utilize the global form of `$.doTimeout`.   *
     *                  This design choice means that the timers are shared and coordinated    *
     *                  across *all* portfolio items. This allows for more synchronized        *
     *                  behavior and notably faster transitions when moving between different   *
     *                  elements.                                                               *
     *                                                                                          *
     *   Expected User Interaction Flow:                                                        *
     *     1. The user's mouse cursor must hover over any individual portfolio item             *
     *        for a minimum period of 0.5 seconds before its associated label becomes           *
     *        visible.                                                                          *
     *     2. Once a label is already visible, if the user moves their mouse to a               *
     *        *different* portfolio item, the label of the *previously hovered* item            *
     *        will fade out immediately. Concurrently, the label of the *newly hovered*         *
     *        item will fade in immediately (provided its initial 0.5s hover delay has         *
     *        been met, or is being met).                                                       *
     *     3. If the mouse cursor is moved off *all* portfolio items, the currently             *
     *        visible label will initiate its fade-out animation after a 0.5-second delay.      *
     *                                                                                          *
     ********************************************************************************************/
    function final_code () {
        var li_cache , // This variable stores a reference to the DOM element of the last hovered list item.
            over = false ; // A boolean flag indicating whether the mouse is currently hovering over *any* item.

        $( "#dribbble-shots" )
            . delegate ( "li" , "mouseenter" , function ( e ) {
                var $li = $( this ) , // The current list item, wrapped in a jQuery object.
                    speed ; // This variable will dynamically determine the animation speed or delay.

                // Check if the user has re-entered the exact same list item that is already considered 'over'.
                if ( li_cache === this && over ) {
                    $ . doTimeout ( "hoverOut" ) ; // Clear any pending global 'hoverOut' timeout.
                    return ; // Exit the function as no new action is required.
                }

                // Determine if the mouse is currently hovering over *any* item (even if not this one).
                if ( over ) {
                    $ . doTimeout ( "hoverOut" , true ) ; // Immediately clear and trigger the 'hoverOut' for the *previous* item.
                    speed = 0 ; // Set speed to 0 for an instant fade-in on the new item.
                } else {
                    $ . doTimeout ( "hoverOut" ) ; // Clear any pending global 'hoverOut' without immediate execution.
                    speed = 500 ; // Set speed to 500ms for a delayed fade-in (first item).
                }

                // Set a global 'hoverIn' timeout with the determined speed.
                $ . doTimeout ( "hoverIn" , speed , function ( ) {
                    over = true ; // Update the global state: an item is now being hovered.
                    $li . find ( "div" ) . fadeTo ( 200 , 1.0 ) ; // Fade in the label of the current item.
                } ) ;

                li_cache = this ; // Update the cache to store the DOM element of the current list item.
            } )
            . delegate ( "li" , "mouseleave" , function ( e ) {
                var $li = $( this ) ; // The current list item, wrapped in a jQuery object.

                $ . doTimeout ( "hoverIn" ) ; // Clear any pending global 'hoverIn' timeout.
                // Set a global 'hoverOut' timeout.
                $ . doTimeout ( "hoverOut" , 500 , function ( ) {
                    over = false ; // Update the global state: no item is currently hovered.
                    $li . find ( "div" ) . stop ( true ) . fadeOut ( ) ; // Stop any animations and fade out the label.
                } ) ;
            } ) ;
    } // End of the 'final_code' function.


    //
    // Instructions for testing the various interactive examples.
    // To observe each step sequentially, uncomment only one function call below at a time.
    //
    /*
     *   To meticulously follow the developmental progression of these
     *   interactive examples, exactly as they were presented during
     *   the live coding demonstration, it is imperative that only
     *   one of the subsequent function invocations remains uncommented
     *   at any given point in time. Please uncomment your desired
     *   function and comment out all others before testing.
     */

    // first_try ( ) ;  /* Uncomment to activate the most basic hover effect. */
    // second_try ( ) ; /* Uncomment for the hover effect with animation queuing prevention. */
    // third_try ( ) ;  /* Uncomment for the hover effect ensuring full opacity. */
    // fourth_try ( ) ; /* Uncomment for the hover effect with delayed activation (like hoverIntent). */
    final_code ( ) ;   /* This line activates the most advanced and refined hover interaction. */


} ( jQuery ) ) ; /* End of the Immediately Invoked Function Expression (IIFE), with jQuery passed as '$'. */