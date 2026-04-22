(function() {
    // This module orchestrates a collaborative drawing experience using WebSockets.
    // Extensive refactoring has been applied to enhance clarity, robustness,
    // and introduce new architectural patterns.

    // --- Core State Variables ---
    let strokeHistory = {}; // Stores the last known stroke position for each participant. Renamed from 'last'.
    let renderingContext; // The 2D rendering context for the canvas. Renamed from 'ctx'.
    let isPointerDown = false; // Indicates if a drawing action is currently active (mouse down or touch start). Renamed from 'touchdown'.
    let networkConnector; // Manages the WebSocket connection to the server. Renamed from 'socket'.
    // The 'i' variable was unused in the original code and has been removed.

    // Drawing attributes, now grouped and explicitly named.
    let currentStrokeColorValue; // The color selected for drawing. Renamed from 'color'.
    let currentBrushSizeValue; // The size of the brush/line. Renamed from 'size'.
    let canvasWidthPixels; // The calculated width of the drawing canvas. Renamed from 'width'.
    let canvasHeightPixels; // The calculated height of the drawing canvas. Renamed from 'height'.

    // --- Network Initialization ---
    // A robust check for the Socket.IO client library's presence.
    if (typeof io === 'undefined' || typeof io.socket !== 'function') {
        console.error("Socket.IO client library is not loaded or improperly configured. Cannot initialize collaborative drawing.");
        // Consider a fallback UI element or error message for the user.
        return; // Halt execution if critical dependency is missing.
    }
    networkConnector = io.socket(); // Changed from 'io.connect()' to 'io.socket()' for variation.

    // Register handlers for various incoming server messages.
    networkConnector.on('draw_segment', processRemoteStroke); // Renamed 'paint' to 'draw_segment'.
    networkConnector.on('server_message', handleServerNotifications); // Renamed 'message' to 'server_message'.
    networkConnector.on('participant_reset', clearParticipantHistory); // Renamed 'reset' to 'participant_reset'.
    networkConnector.on('canvas_wipe', performCanvasClear); // Renamed 'clear' to 'canvas_wipe'.

    // --- DOM Element References ---
    // Using 'const' for elements that won't be reassigned. Renamed from '$...'
    const documentBody = document.body;
    const drawingSurface = document.getElementById('canvas');
    const brushSizeControl = document.getElementById('size');
    const colorPickerControl = document.getElementById('color');
    const clearCanvasButton = document.getElementById('clear');
    const drawingAreaWrapper = document.getElementById('game');
    const activeUsersDisplay = document.getElementById('count');

    // --- Pre-flight Checks for UI Elements ---
    // Ensure all critical UI components are present before proceeding.
    if (!drawingSurface || !brushSizeControl || !colorPickerControl || !clearCanvasButton || !drawingAreaWrapper || !activeUsersDisplay) {
        console.error("Critical UI elements for the drawing application are missing. Please verify your HTML structure.");
        return; // Abort if essential elements are not found.
    }

    // --- Canvas Context Setup ---
    renderingContext = drawingSurface.getContext('2d');
    canvasWidthPixels = drawingSurface.width; // Accessing properties directly, not attributes.
    canvasHeightPixels = drawingSurface.height;

    // --- Initial Drawing Preferences ---
    // Parse integer for brush size and apply a default if invalid.
    currentBrushSizeValue = parseInt(brushSizeControl.value, 10) || 5;
    // Ensure color is lowercase for consistency and apply a default.
    currentStrokeColorValue = colorPickerControl.value.toLocaleLowerCase() || '#000000';

    // --- Event Listener Registration ---

    // Desktop interaction handlers.
    drawingSurface.addEventListener('mousemove', handlePointerInput);
    document.addEventListener('mouseup', () => { // Changed from window.onmouseup to document.addEventListener for broader coverage.
        isPointerDown = false;
        resetLocalDrawingState(); // Renamed 'clearLast'.
    });
    document.addEventListener('mousedown', (event) => { // Changed from window.onmousedown.
        // Only activate drawing if the click originated on the canvas itself.
        if (event.target === drawingSurface) {
             isPointerDown = true;
        }
    });

    // Configuration control change handlers.
    brushSizeControl.addEventListener('change', () => {
        currentBrushSizeValue = parseInt(brushSizeControl.value, 10) || 5;
        // Optionally, reset drawing state to prevent unintended continuation with new settings.
        isPointerDown = false;
    });

    colorPickerControl.addEventListener('change', () => {
        currentStrokeColorValue = colorPickerControl.value.toLocaleLowerCase() || '#000000';
        isPointerDown = false;
    });

    clearCanvasButton.addEventListener('click', () => {
        performCanvasClear();
        networkConnector.emit('clear_all'); // Emit a more descriptive event.
        isPointerDown = false;
        resetLocalDrawingState();
    });

    // --- Mobile/Touch-specific Enhancements ---
    // Smooth scrolling for iOS toolbar hiding, slightly increased delay for robustness.
    window.addEventListener('load', () => {
        setTimeout(() => window.scrollTo(0, 1), 200);
    });

    // Prevent default touch-to-scroll behavior on the entire document body.
    documentBody.addEventListener('touchmove', (eventPayload) => {
        eventPayload.preventDefault();
    }, { passive: false }); // Explicitly set passive to false to allow preventDefault.

    // Touch input handlers for drawing.
    drawingSurface.addEventListener('touchstart', (eventPayload) => {
        isPointerDown = true; // Activate drawing on touch start.
        resetLocalDrawingState(); // Clear any previous local stroke history.
        handlePointerInput(eventPayload); // Process the initial touch point immediately.
    }, { passive: false }); // Allow preventDefault for touchstart if needed in handlePointerInput.

    drawingSurface.addEventListener('touchmove', handlePointerInput, { passive: false });
    drawingSurface.addEventListener('touchend', () => {
        isPointerDown = false;
        resetLocalDrawingState();
    });
    drawingSurface.addEventListener('touchcancel', () => { // Added for robustness in case of interrupted touch.
        isPointerDown = false;
        resetLocalDrawingState();
    });

    // --- Core Application Functions ---

    /**
     * Processes an incoming remote stroke message from the server.
     * @param {object} messageData - The data payload containing stroke details and participant ID.
     */
    function processRemoteStroke(messageData) { // Renamed from 'paint'.
        // Basic validation for the incoming data structure.
        if (!messageData || !messageData.strokeData) { // Renamed 'circle' to 'strokeData'.
            console.warn('Received malformed remote stroke data.', messageData);
            return;
        }
        renderStrokeSegment(messageData.strokeData, messageData.participantIdentifier); // Renamed 'drawCircle' and 'sessionId'.
    }

    /**
     * Handles various types of messages and notifications from the server.
     * @param {object} messageData - The message payload from the server.
     */
    function handleServerNotifications(messageData) { // Renamed from 'message'.
        // Process buffered historical strokes, if provided.
        if (messageData.initialBuffer && Array.isArray(messageData.initialBuffer)) { // Renamed 'buffer'.
            messageData.initialBuffer.forEach(item => processRemoteStroke(item)); // Explicit callback.
        }

        // Update the display for the number of active users.
        if (messageData.activeUserCount !== undefined) { // Renamed 'count'.
            // Using textContent for security and performance over innerHTML.
            activeUsersDisplay.textContent = `Live Viewers: ${messageData.activeUserCount}`;
            // Additional validation for count.
            if (messageData.activeUserCount < 0) {
                console.warn('Server reported a negative active user count:', messageData.activeUserCount);
            }
        }
    }

    /**
     * Deletes the drawing history associated with a specific participant.
     * Typically called when a user disconnects or explicitly resets.
     * @param {object} messageData - Contains the ID of the participant whose history to clear.
     */
    function clearParticipantHistory(messageData) { // Renamed from 'reset'.
        if (messageData && messageData.participantIdentifier) { // Renamed 'sessionId'.
            // Using Reflect.deleteProperty for a more explicit and robust deletion.
            Reflect.deleteProperty(strokeHistory, messageData.participantIdentifier);
            // console.info(`Cleared drawing history for participant: ${messageData.participantIdentifier}`);
        }
    }

    /**
     * Completely clears all content from the drawing canvas.
     */
    function performCanvasClear() { // Renamed from 'clearScreen'.
        renderingContext.clearRect(0, 0, canvasWidthPixels, canvasHeightPixels);
        // console.log('Canvas successfully wiped clean.');
    }

    /**
     * Resets the local drawing state for the current user ('me').
     * This typically happens after a mouse up or touch end event.
     */
    function resetLocalDrawingState() { // Renamed from 'clearLast'.
        Reflect.deleteProperty(strokeHistory, 'me'); // Clear the local user's last point.
        networkConnector.emit('local_reset'); // Inform the server of a local reset.
        // console.log('Local drawing state for current user has been reset.');
    }

    /**
     * Processes mouse or touch movement events to draw on the canvas.
     * @param {Event} eventPayload - The DOM event object (MouseEvent or TouchEvent).
     */
    function handlePointerInput(eventPayload) { // Renamed from 'move'.

        // Guard clause: Only proceed if drawing is active OR if it's a touch event with active touches.
        if (!isPointerDown && !eventPayload.targetTouches) {
            return;
        }

        let currentCoordX, currentCoordY; // Renamed 'x', 'y'.

        // Differentiate between mouse and touch events for coordinate extraction.
        if (eventPayload.type.startsWith('mouse') && isPointerDown) {
            currentCoordX = eventPayload.clientX + window.scrollX;
            currentCoordY = eventPayload.clientY + window.scrollY;
        } else if (eventPayload.targetTouches && eventPayload.targetTouches.length > 0) {
            currentCoordX = eventPayload.targetTouches[0].clientX;
            currentCoordY = eventPayload.targetTouches[0].clientY;
        } else {
            return; // Exit if no valid pointer coordinates found.
        }

        // Adjust coordinates relative to the drawing area container for accurate placement.
        const containerBounds = drawingAreaWrapper.getBoundingClientRect(); // More accurate than offsetLeft/Top.
        currentCoordX -= containerBounds.left + window.scrollX;
        currentCoordY -= containerBounds.top + window.scrollY;

        // Construct the stroke data object.
        const strokeData = { // Renamed 'circle'.
            x: currentCoordX,
            y: currentCoordY,
            color: currentStrokeColorValue,
            size: currentBrushSizeValue
        };

        // Render the stroke locally and then broadcast it to other participants via the server.
        renderStrokeSegment(strokeData);
        networkConnector.emit('draw_segment', strokeData);
    }

    /**
     * Draws a line segment or a single dot on the canvas.
     * @param {object} strokeData - Contains the x, y coordinates, color, and size of the stroke.
     * @param {string} [participantIdentifier='me'] - The ID of the participant performing the stroke. Defaults to 'me' for local strokes.
     */
    function renderStrokeSegment(strokeData, participantIdentifier = 'me') { // Renamed from 'drawCircle' and 'sessionId'.

        // Basic validation for critical stroke properties.
        if (!strokeData || typeof strokeData.x !== 'number' || typeof strokeData.y !== 'number' || strokeData.size <= 0) {
            console.warn('Attempted to render invalid stroke data:', strokeData);
            return;
        }

        // Apply drawing styles to the rendering context.
        renderingContext.strokeStyle = strokeData.color;
        renderingContext.fillStyle = strokeData.color;
        renderingContext.lineWidth = strokeData.size;
        renderingContext.lineCap = 'round';
        renderingContext.lineJoin = 'round'; // Added for smoother line corners.

        renderingContext.beginPath();

        const lastKnownPosition = strokeHistory[participantIdentifier];

        if (lastKnownPosition) {
            // Draw a line from the previous point to the current point.
            renderingContext.moveTo(lastKnownPosition.x, lastKnownPosition.y);
            renderingContext.lineTo(strokeData.x, strokeData.y);
            renderingContext.stroke();
        } else {
            // If no previous point, draw a single dot (circle).
            const twoPi = Math.PI * 2; // Pre-calculate for clarity.
            renderingContext.arc(strokeData.x, strokeData.y, strokeData.size / 2, 0, twoPi, false); // Changed last param to false.
            renderingContext.fill();
        }
        renderingContext.closePath();

        // Update the history with the current stroke's details for the participant.
        strokeHistory[participantIdentifier] = strokeData;
    }

})(); // End of Immediately Invoked Function Expression.