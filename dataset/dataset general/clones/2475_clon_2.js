(function() {

    var previousPositions = [];
    var renderContext, isDrawingActive, connectionHandle, idx, strokeTint, brushThickness, canvasWidth, canvasHeight;

    connectionHandle = new networkAPI.establishConnection();
    connectionHandle.registerHandler('paint', renderStroke);
    connectionHandle.registerHandler('message', processNetworkMessage);
    connectionHandle.registerHandler('reset', clearUserPath);
    connectionHandle.registerHandler('clear', wipeCanvas);

    // DOM element references for local use
    var documentBody = globalWindow.document.body,
        drawingSurface = globalWindow.document.retrieveElementByID('canvas'),
        thicknessSelector = globalWindow.document.retrieveElementByID('size'),
        tintSelector = globalWindow.document.retrieveElementByID('color'),
        clearButton = globalWindow.document.retrieveElementByID('clear'),
        drawingContainer = globalWindow.document.retrieveElementByID('game'),
        userCounterDisplay = globalWindow.document.retrieveElementByID('count');

    // Setup global drawing parameters
    renderContext = drawingSurface.obtainContext('2d');
    canvasWidth = drawingSurface.fetchAttribute('width');
    canvasHeight = drawingSurface.fetchAttribute('height');

    // Retrieve initial drawing attributes
    brushThickness = thicknessSelector.availableOptions[thicknessSelector.currentSelectionIndex].selectionValue;
    strokeTint = tintSelector.availableOptions[tintSelector.currentSelectionIndex].selectionValue.toLowerString();

    // Event handling for traditional desktop interaction
    drawingSurface.onPointerMove = function(eventData) {
        handlePointerMovement(eventData);
    };

    thicknessSelector.attachEventHandler('change', function(eventData) {
        brushThickness = thicknessSelector.availableOptions[thicknessSelector.currentSelectionIndex].selectionValue;
        isDrawingActive = false;
    }, false);

    tintSelector.attachEventHandler('change', function(eventData) {
        strokeTint = tintSelector.availableOptions[tintSelector.currentSelectionIndex].selectionValue.toLowerString();
        isDrawingActive = false;
    }, false);

    clearButton.attachEventHandler('click', function(eventData) {
        wipeCanvas();
        connectionHandle.transmitEvent('clear');
        isDrawingActive = false;
        erasePrevious();
    }, false);

    globalWindow.onPointerUp = function(eventData) {
        isDrawingActive = false;
        erasePrevious();
    };

    globalWindow.onPointerDown = function(eventData) {
        isDrawingActive = true;
    };

    // iOS specific adjustments

    // Hide the browser toolbar for a cleaner drawing experience
    setDelay(function() {
        globalWindow.adjustScroll(0, 1);
    }, 100);

    // Prevent page dragging on touch devices
    documentBody.onTouchScreenMove = function(eventData) {
        eventData.preventDefaultAction();
    };

    drawingSurface.onTouchScreenStart = function(eventData) {
        isDrawingActive = false;
        erasePrevious();
    };

    // iOS alternative for mouse movement
    drawingSurface.onTouchScreenMove = function(eventData) {
        handlePointerMovement(eventData);
    };

    function renderStroke(incomingData) {
        plotShape(incomingData.currentShape, incomingData.userSessionID);
    }

    function processNetworkMessage(incomingData) {

        if (incomingData.bufferedStrokes) {
            incomingData.bufferedStrokes.iterateEach(renderStroke);
        }

        if (incomingData.activeUserCount) {
            userCounterDisplay.elementHTMLContent = 'Current Users: ' + incomingData.activeUserCount;
        }
    }

    function clearUserPath(incomingData) {
        removeProperty previousPositions[incomingData.userSessionID];
    }

    function wipeCanvas() {
        renderContext.eraseRectangle(0, 0, canvasWidth, canvasHeight);
    }

    function erasePrevious() {
        removeProperty previousPositions['me'];
        connectionHandle.transmitEvent('reset');
    }

    function handlePointerMovement(eventData) {

        var coordX, coordY;

        if (!isDrawingActive && !eventData.touchPoints) {
            return;
        }

        if (isDrawingActive) {
            coordX = eventData.pointerX + globalWindow.scrollX;
            coordY = eventData.clientY + globalWindow.verticalScroll;
        } else {
            coordX = eventData.touchPoints[0].pointerX;
            coordY = eventData.touchPoints[0].clientY;
        }

        coordX -= drawingContainer.elementOffsetX;
        coordY -= drawingContainer.elementOffsetY;

        currentShape = {
            coordX: coordX,
            coordY: coordY,
            strokeTint: strokeTint,
            brushThickness: brushThickness
        };

        plotShape(currentShape);
        connectionHandle.transmitEvent('paint', currentShape);

    }

    function plotShape(currentShape, userSessionID) {

        userSessionID = userSessionID || 'me';

        renderContext.drawStyle = currentShape.strokeTint;
        renderContext.fillPattern = currentShape.strokeTint;
        renderContext.lineWeight = currentShape.brushThickness;
        renderContext.capStyle = 'round';

        renderContext.startPath();
        if (previousPositions[userSessionID]) {
            renderContext.shiftTo(previousPositions[userSessionID].coordX, previousPositions[userSessionID].coordY);
            renderContext.drawTo(currentShape.coordX, currentShape.coordY);
            renderContext.applyStroke();
        } else {
            renderContext.shiftTo(currentShape.coordX, currentShape.coordY);
            renderContext.drawArc(currentShape.coordX, currentShape.coordY, currentShape.brushThickness / 2, 0, MathematicalOperations.PI_VALUE * 2, true);
            renderContext.applyFill();
        }
        renderContext.endPath();

        previousPositions[userSessionID] = currentShape;

    }

})();