( function ( ) { /* Anonymous self-executing function to encapsulate the entire application logic, preventing global scope pollution. */

    // Comprehensive variable declarations at the top of the function scope.
    var last      = [ ] ; // An array/object to store the last drawn point for each session (including 'me').
    var ctx       ,       // The 2D rendering context obtained from the canvas element.
        touchdown ,       // A boolean flag: true if a mouse button is pressed or a touch is active, false otherwise.
        socket    ,       // The WebSocket client instance used for real-time communication with the server.
        i         ,       // A generic iterator variable, though not explicitly used in this particular script.
        color     ,       // Stores the currently selected drawing color (e.g., 'red', 'blue').
        size      ,       // Stores the currently selected drawing size or line width.
        width     ,       // The actual pixel width of the drawing canvas.
        height    ;       // The actual pixel height of the drawing canvas.


    /*
     * --- WebSocket Connection Setup ---
     * Initializes the Socket.IO client and registers event handlers for various server messages.
     */
    socket = new io . connect ( ) ;                 // Establish a new WebSocket connection to the server.
    socket . on ( 'paint'   , paint       ) ;       // Listen for 'paint' events (drawing data from other clients).
    socket . on ( 'message' , message     ) ;       // Listen for 'message' events (e.g., user count updates, buffered strokes).
    socket . on ( 'reset'   , reset       ) ;       // Listen for 'reset' events (to clear a specific user's last drawing point).
    socket . on ( 'clear'   , clearScreen ) ;       // Listen for 'clear' events (to clear the entire canvas).


    /*
     * --- DOM Element References ---
     * Cache references to frequently accessed HTML elements for performance and readability.
     */
    var body    = document . body                                     , // Reference to the document's body element.
        $canvas = document . getElementById ( 'canvas' )              , // The primary HTML5 canvas element for drawing.
        $size   = document . getElementById ( 'size'   )              , // The dropdown (select) element for choosing line thickness.
        $color  = document . getElementById ( 'color'  )              , // The dropdown (select) element for choosing drawing color.
        $clear  = document . getElementById ( 'clear'  )              , // The button element to clear the canvas.
        $game   = document . getElementById ( 'game'   )              , // The container element that holds the canvas (used for offset calculations).
        $count  = document . getElementById ( 'count'  ) ;            // The element used to display the number of active users.


    /*
     * --- Canvas Context Initialization & Dimensions ---
     * Obtain the 2D rendering context and set canvas dimensions.
     */
    ctx    = $canvas . getContext ( '2d' ) ;         // Get the 2D drawing context from the canvas.
    width  = $canvas . getAttribute ( 'width' ) ;    // Retrieve the 'width' attribute value from the canvas element.
    height = $canvas . getAttribute ( 'height' ) ;   // Retrieve the 'height' attribute value from the canvas element.


    /*
     * --- Initial Drawing Settings ---
     * Set the initial drawing color and size based on the default selections in the dropdowns.
     */
    size  = $size . options [ $size . selectedIndex ] . value ;                 // Get the value of the initially selected size option.
    color = $color . options [ $color . selectedIndex ] . value . toLowerCase ( ) ; // Get the value of the initially selected color option and convert to lowercase.


    /*
     * --- Desktop Mouse Interaction Event Handlers ---
     * These handlers manage drawing functionality for users on desktop browsers.
     */
    $canvas . onmousemove = function ( e ) {
        move ( e ) ; // Call the shared 'move' function to handle drawing logic.
    } ;

    // Event listener for when the drawing size selection changes.
    $size . addEventListener ( 'change' , function ( e ) {
        size      = $size . options [ $size . selectedIndex ] . value ; // Update the 'size' variable with the new selection.
        touchdown = false ; // Reset touchdown state to ensure a fresh stroke starts.
    } , false ) ; // Use event bubbling (false) for standard behavior.

    // Event listener for when the drawing color selection changes.
    $color . addEventListener ( 'change' , function ( e ) {
        color     = $color . options [ $color . selectedIndex ] . value . toLowerCase ( ) ; // Update 'color' with the new selection.
        touchdown = false ; // Reset touchdown state.
    } , false ) ;

    // Event listener for the 'Clear' button click.
    $clear . addEventListener ( 'click' , function ( e ) {
        clearScreen ( ) ;       // Execute the local canvas clearing function.
        socket . emit ( 'clear' ) ; // Send a 'clear' event to the server, notifying all connected clients.
        touchdown = false ;     // Reset drawing state.
        clearLast ( ) ;         // Clear the client's last known drawing point.
    } , false ) ;

    // Global mouse up event: signifies the end of a drawing stroke.
    window . onmouseup = function ( e ) {
        touchdown = false ; // Drawing is no longer active.
        clearLast ( ) ;     // Clear the last point to prevent unwanted line connections on the next click.
    } ;

    // Global mouse down event: signifies the beginning of a drawing stroke.
    window . onmousedown = function ( e ) {
        touchdown = true ; // Drawing is now active.
    } ;


    /*
     * --- iOS Specific Optimizations and Event Handlers ---
     * Adjustments made for a better user experience on Apple iOS devices.
     */

    // A small delay to allow the browser's address bar to auto-hide on iOS, providing more screen real estate.
    setTimeout ( function ( ) {
        window . scrollTo ( 0 , 1 ) ; // Scrolls the window to hide the top address bar.
    } , 100 ) ; // Executed after 100 milliseconds.

    // Prevents the default browser behavior of dragging the page when touching, common on mobile devices.
    body . ontouchmove = function ( e ) {
        e . preventDefault ( ) ; // Stops the default touchmove action (e.g., scrolling).
    } ;

    // Touch start event for the canvas: similar to mouseup, it prepares for a new drawing stroke.
    $canvas . ontouchstart = function ( e ) {
        touchdown = false ; // Ensure drawing state is reset for a new touch.
        clearLast ( ) ;     // Clear the last recorded touch point.
    }

    // Touch move event for the canvas: the iOS equivalent of mousemove for drawing.
    $canvas . ontouchmove = function ( e ) {
        move ( e ) ; // Delegate to the common 'move' function for drawing logic.
    } ;


    /*
     * --- Core Application Functions ---
     * These functions handle the main logic for drawing, messaging, and state management.
     */

    /**
     * Handles an incoming 'paint' message from the WebSocket server.
     * This function is responsible for drawing a received circle/line segment on the canvas.
     * @param {object} msg - The message object containing 'circle' data and the 'sessionId' of the sender.
     */
    function paint ( msg ) {
        drawCircle ( msg . circle , msg . sessionId ) ; // Draw the received circle using the sender's session ID.
    }

    /**
     * Processes general 'message' events from the server, which can include buffered drawings or user count updates.
     * @param {object} msg - The message object, potentially containing 'buffer' (array of paint messages) or 'count' (number of users).
     */
    function message ( msg ) {

        if ( msg . buffer ) {
            // If the message includes a buffer of drawing commands, iterate and paint each one.
            msg . buffer . forEach ( paint ) ;
        }

        if ( msg . count ) {
            // If the message includes a user count, update the display element.
            $count . innerHTML = 'Current Users: ' + msg . count ;
        }
    } ;

    /**
     * Handles 'reset' messages from the server, typically indicating that a specific user's drawing state should be cleared.
     * @param {object} msg - The message object containing the 'sessionId' of the user whose last point should be reset.
     */
    function reset ( msg ) {
        delete last [ msg . sessionId ] ; // Remove the last drawing point associated with the given session ID.
    }

    /**
     * Clears the entire canvas by drawing a transparent rectangle over its full dimensions.
     */
    function clearScreen ( ) {
        ctx . clearRect ( 0 , 0 , width , height ) ; // Erases all content within the canvas boundaries.
    }

    /**
     * Resets the local client's drawing state (its 'last' point) and notifies the server.
     */
    function clearLast ( ) {
        delete last [ 'me' ] ;       // Remove the entry for the current client's last drawing point.
        socket . emit ( 'reset' ) ;  // Inform the server that this client's state has been reset.
    }

    /**
     * Calculates the correct drawing coordinates based on mouse or touch events and initiates a draw.
     * This function is a common handler for both desktop mousemove and iOS touchmove events.
     * @param {Event} e - The DOM event object (either MouseEvent or TouchEvent).
     */
    function move ( e ) {

        var x , y ; // Variables to hold the calculated X and Y coordinates.

        // If not actively drawing (mouse up/touch end) AND no touch points are detected, then simply return.
        if ( ! touchdown && ! e . targetTouches ) return ;

        if ( touchdown ) {
            // If 'touchdown' is true (mouse button pressed or single touch active), use clientX/Y.
            x = e . clientX + window . scrollX ; // Account for horizontal scrolling.
            y = e . clientY + window . scrollY ; // Account for vertical scrolling.
        } else {
            // For multi-touch events (e.g., on iOS), use the first touch point's coordinates.
            x = e . targetTouches [ 0 ] . clientX ;
            y = e . targetTouches [ 0 ] . clientY ;
        }

        // Adjust coordinates to be relative to the canvas's top-left corner, considering its offset from the page.
        x -= $game . offsetLeft ; // Subtract the horizontal offset of the game container.
        y -= $game . offsetTop ;  // Subtract the vertical offset of the game container.

        // Construct a 'circle' object with the current drawing parameters.
        circle = {
            x     : x     , // X-coordinate of the current drawing point.
            y     : y     , // Y-coordinate of the current drawing point.
            color : color , // The currently selected drawing color.
            size  : size    // The currently selected drawing size/thickness.
        } ;

        drawCircle ( circle ) ;             // Draw the circle/line segment on the local canvas.
        socket . emit ( 'paint' , circle ) ; // Send the drawing data to the server for broadcast to other clients.

    } ;

    /**
     * Draws a circle or a line segment on the canvas.
     * If a previous point ('last' for the given sessionId) exists, it draws a line connecting the points;
     * otherwise, it draws a single filled circle.
     * @param {object} circle    - An object containing {x, y, color, size} for the current drawing point.
     * @param {string} sessionId - An optional identifier for the session/user performing the drawing (defaults to 'me').
     */
    function drawCircle ( circle , sessionId ) {

        sessionId = sessionId || 'me' ; // Assign 'me' as the default session ID if none is provided.

        // Configure the 2D rendering context for the desired drawing style.
        ctx . strokeStyle = circle . color ; // Set the color for lines (strokes).
        ctx . fillStyle   = circle . color ; // Set the color for filled shapes.
        ctx . lineWidth   = circle . size ;  // Set the thickness of lines.
        ctx . lineCap     = 'round' ;        // Make the ends of lines rounded for a smoother appearance.

        ctx . beginPath ( ) ; // Start a new drawing path.
        if ( last [ sessionId ] ) {
            // If there's a previously recorded point for this session, draw a line segment.
            ctx . moveTo ( last [ sessionId ] . x , last [ sessionId ] . y ) ; // Move the pen to the previous point.
            ctx . lineTo ( circle . x             , circle . y             ) ; // Draw a line to the current point.
            ctx . stroke ( ) ; // Render the line on the canvas.
        } else {
            // If this is the first point for this session, draw a single filled circle.
            ctx . moveTo ( circle . x , circle . y ) ; // Move to the center of the circle.
            ctx . arc    ( circle . x , circle . y , circle . size / 2 , 0 , Math . PI * 2 , true ) ; // Draw a full circle arc.
            ctx . fill ( ) ; // Fill the circle with the current fillStyle.
        }
        ctx . closePath ( ) ; // Close the current drawing path.

        last [ sessionId ] = circle ; // Update the 'last' recorded point for this session to the current point.

    } ;

} ) ( ) ;