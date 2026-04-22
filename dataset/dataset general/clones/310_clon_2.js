//-------------------------------------------------------------------------
// Project: Dynamic Visualizer
// Creator: Code Weaver - code-weaver.net
// License: Open-source (e.g., Apache 2.0)
// Repository: https://github.com/CodeWeaver/dynamic-visualizer
// Usage: Refer to the documentation on GitHub
// Version: 1.0.0
//-------------------------------------------------------------------------

function startVisualElements(containerId, configOptions) {

    var drawingSurface = document.querySelector('#' + containerId + ' > canvas');

    // Visualizer engine properties with default configurations
    visualEngine = {
        displayArea: {
            elementRef: drawingSurface,
            widthVal: drawingSurface.offsetWidth,
            heightVal: drawingSurface.offsetHeight
        },
        elementSettings: {
            mainColor: '#fff',
            randomColor: false,
            elementShape: 'circle', // Options: "circle", "edge", "triangle"
            transparency: {
                currentTransparency: 1,
                animation: {
                    activated: false,
                    animSpeed: 2,
                    minTransparency: 0,
                    synchronized: false
                }
            },
            elementSize: 2.5,
            randomSize: true,
            elementCount: 200,
            connectionLines: {
                autoConnect: true,
                connectDistance: 100,
                lineColor: '#fff',
                lineTransparency: 1,
                lineWidth: 1,
                compressedMode: {
                    activated: false,
                    rotX: 3000,
                    rotY: 3000
                }
            },
            animation: {
                activated: true,
                animSpeed: 2
            },
            elementList: []
        },
        interaction: {
            activated: true,
            pointer: {
                connectDistance: 100
            },
            detectionTarget: 'canvas',
            interactMode: 'grab',
            connectionLines: {
                lineTransparency: 1
            },
            eventHandlers: {
                onClickAction: {
                    activated: true,
                    interactMode: 'push',
                    elementCount: 4
                },
                onResizeEvent: {
                    activated: true,
                    interactMode: 'out', // "out" or "bounce"
                    autoDensity: false,
                    densityRegion: 800 // num_elements = elementSettings.elementCount * (displayArea width * displayArea height / 1000) / densityRegion
                }
            }
        },
        highResDetect: false,
        utilityFunctions: {
            helperMethods: {
                interactionHelpers: {}
            }
        }
    };

    // Apply custom configuration options
    if (configOptions) {
        if (configOptions.elements) {
            var particleSettingsFromConfig = configOptions.elements;
            if (particleSettingsFromConfig.mainColor) visualEngine.elementSettings.mainColor = particleSettingsFromConfig.mainColor;
            if (particleSettingsFromConfig.randomColor) visualEngine.elementSettings.randomColor = particleSettingsFromConfig.randomColor;
            if (particleSettingsFromConfig.elementShape) visualEngine.elementSettings.elementShape = particleSettingsFromConfig.elementShape;
            if (particleSettingsFromConfig.transparency) {
                var opacitySettingsFromConfig = particleSettingsFromConfig.transparency;
                if (typeof opacitySettingsFromConfig == 'object') visualEngine.elementSettings.transparency.currentTransparency = opacitySettingsFromConfig.currentTransparency;
                else visualEngine.elementSettings.transparency.currentTransparency = opacitySettingsFromConfig;
                if (opacitySettingsFromConfig.animation) {
                    var opacityAnimSettingsFromConfig = opacitySettingsFromConfig.animation;
                    if (opacityAnimSettingsFromConfig.activated === false || opacityAnimSettingsFromConfig.activated) visualEngine.elementSettings.transparency.animation.activated = opacityAnimSettingsFromConfig.activated;
                    if (opacityAnimSettingsFromConfig.animSpeed) visualEngine.elementSettings.transparency.animation.animSpeed = opacityAnimSettingsFromConfig.animSpeed;
                    if (opacityAnimSettingsFromConfig.minTransparency) visualEngine.elementSettings.transparency.animation.minTransparency = opacityAnimSettingsFromConfig.minTransparency;
                    if (opacityAnimSettingsFromConfig.synchronized === false || opacityAnimSettingsFromConfig.synchronized) visualEngine.elementSettings.transparency.animation.synchronized = opacityAnimSettingsFromConfig.synchronized;
                }
            }
            if (particleSettingsFromConfig.elementSize) visualEngine.elementSettings.elementSize = particleSettingsFromConfig.elementSize;
            if (particleSettingsFromConfig.randomSize === false) visualEngine.elementSettings.randomSize = particleSettingsFromConfig.randomSize;
            if (particleSettingsFromConfig.elementCount) visualEngine.elementSettings.elementCount = particleSettingsFromConfig.elementCount;
            if (particleSettingsFromConfig.connectionLines) {
                var lineLinkedSettingsFromConfig = particleSettingsFromConfig.connectionLines;
                if (lineLinkedSettingsFromConfig.autoConnect === false) visualEngine.elementSettings.connectionLines.autoConnect = lineLinkedSettingsFromConfig.autoConnect;
                if (lineLinkedSettingsFromConfig.connectDistance) visualEngine.elementSettings.connectionLines.connectDistance = lineLinkedSettingsFromConfig.connectDistance;
                if (lineLinkedSettingsFromConfig.lineColor) visualEngine.elementSettings.connectionLines.lineColor = lineLinkedSettingsFromConfig.lineColor;
                if (lineLinkedSettingsFromConfig.lineTransparency) visualEngine.elementSettings.connectionLines.lineTransparency = lineLinkedSettingsFromConfig.lineTransparency;
                if (lineLinkedSettingsFromConfig.lineWidth) visualEngine.elementSettings.connectionLines.lineWidth = lineLinkedSettingsFromConfig.lineWidth;
                if (lineLinkedSettingsFromConfig.compressedMode) {
                    var condensedModeSettingsFromConfig = lineLinkedSettingsFromConfig.compressedMode;
                    if (condensedModeSettingsFromConfig.activated === false) visualEngine.elementSettings.connectionLines.compressedMode.activated = condensedModeSettingsFromConfig.activated;
                    if (condensedModeSettingsFromConfig.rotX) visualEngine.elementSettings.connectionLines.compressedMode.rotX = condensedModeSettingsFromConfig.rotX;
                    if (condensedModeSettingsFromConfig.rotY) visualEngine.elementSettings.connectionLines.compressedMode.rotY = condensedModeSettingsFromConfig.rotY;
                }
            }
            if (particleSettingsFromConfig.animation) {
                var animSettingsFromConfig = particleSettingsFromConfig.animation;
                if (animSettingsFromConfig.activated === false) visualEngine.elementSettings.animation.activated = animSettingsFromConfig.activated;
                if (animSettingsFromConfig.animSpeed) visualEngine.elementSettings.animation.animSpeed = animSettingsFromConfig.animSpeed;
            }
        }
        if (configOptions.interaction) {
            var interactivitySettingsFromConfig = configOptions.interaction;
            if (interactivitySettingsFromConfig.activated === false) visualEngine.interaction.activated = interactivitySettingsFromConfig.activated;
            if (interactivitySettingsFromConfig.pointer) {
                if (interactivitySettingsFromConfig.pointer.connectDistance) visualEngine.interaction.pointer.connectDistance = interactivitySettingsFromConfig.pointer.connectDistance;
            }
            if (interactivitySettingsFromConfig.detectionTarget) visualEngine.interaction.detectionTarget = interactivitySettingsFromConfig.detectionTarget;
            if (interactivitySettingsFromConfig.interactMode === false || interactivitySettingsFromConfig.interactMode) visualEngine.interaction.interactMode = interactivitySettingsFromConfig.interactMode;
            if (interactivitySettingsFromConfig.connectionLines) {
                if (interactivitySettingsFromConfig.connectionLines.lineTransparency) visualEngine.interaction.connectionLines.lineTransparency = interactivitySettingsFromConfig.connectionLines.lineTransparency;
            }
            if (interactivitySettingsFromConfig.eventHandlers) {
                var eventSettingsFromConfig = interactivitySettingsFromConfig.eventHandlers;
                if (eventSettingsFromConfig.onClickAction) {
                    var onClickSettingsFromConfig = eventSettingsFromConfig.onClickAction;
                    if (onClickSettingsFromConfig.activated === false) visualEngine.interaction.eventHandlers.onClickAction.activated = false;
                    if (onClickSettingsFromConfig.interactMode != 'push') visualEngine.interaction.eventHandlers.onClickAction.interactMode = onClickSettingsFromConfig.interactMode;
                    if (onClickSettingsFromConfig.elementCount) visualEngine.interaction.eventHandlers.onClickAction.elementCount = onClickSettingsFromConfig.elementCount;
                }
                if (eventSettingsFromConfig.onResizeEvent) {
                    var onResizeSettingsFromConfig = eventSettingsFromConfig.onResizeEvent;
                    if (onResizeSettingsFromConfig.activated === false) visualEngine.interaction.eventHandlers.onResizeEvent.activated = false;
                    if (onResizeSettingsFromConfig.interactMode) visualEngine.interaction.eventHandlers.onResizeEvent.interactMode = onResizeSettingsFromConfig.interactMode;
                    if (onResizeSettingsFromConfig.autoDensity === false || onResizeSettingsFromConfig.autoDensity) visualEngine.interaction.eventHandlers.onResizeEvent.autoDensity = onResizeSettingsFromConfig.autoDensity;
                    if (onResizeSettingsFromConfig.densityRegion) visualEngine.interaction.eventHandlers.onResizeEvent.densityRegion = onResizeSettingsFromConfig.densityRegion;
                }
            }
        }
        visualEngine.highResDetect = configOptions.retina_detect;
    }

    // Convert hexadecimal color codes to RGB format
    visualEngine.elementSettings.rgbColor = convertHexToRgb(visualEngine.elementSettings.mainColor);
    visualEngine.elementSettings.connectionLines.rgbLineColor = convertHexToRgb(visualEngine.elementSettings.connectionLines.lineColor);

    // Detect high-resolution (retina) displays
    if (visualEngine.highResDetect && window.devicePixelRatio > 1) {
        visualEngine.isRetina = true;

        visualEngine.displayArea.pixelRatio = window.devicePixelRatio;
        visualEngine.displayArea.widthVal = visualEngine.displayArea.elementRef.offsetWidth * visualEngine.displayArea.pixelRatio;
        visualEngine.displayArea.heightVal = visualEngine.displayArea.elementRef.offsetHeight * visualEngine.displayArea.pixelRatio;
        visualEngine.elementSettings.animation.animSpeed = visualEngine.elementSettings.animation.animSpeed * visualEngine.displayArea.pixelRatio;
        visualEngine.elementSettings.connectionLines.connectDistance = visualEngine.elementSettings.connectionLines.connectDistance * visualEngine.displayArea.pixelRatio;
        visualEngine.elementSettings.connectionLines.lineWidth = visualEngine.elementSettings.connectionLines.lineWidth * visualEngine.displayArea.pixelRatio;
        visualEngine.interaction.pointer.connectDistance = visualEngine.interaction.pointer.connectDistance * visualEngine.displayArea.pixelRatio;
    }


    // ---------- DISPLAY AREA UTILITY FUNCTIONS ------------

    visualEngine.utilityFunctions.initDisplay = function () {
        visualEngine.displayArea.context = visualEngine.displayArea.elementRef.getContext('2d');
    };

    visualEngine.utilityFunctions.adjustDisplaySize = function () {

        visualEngine.displayArea.elementRef.width = visualEngine.displayArea.widthVal;
        visualEngine.displayArea.elementRef.height = visualEngine.displayArea.heightVal;

        window.addEventListener('resize', function () {

            if (visualEngine && visualEngine.interaction.eventHandlers.onResizeEvent.activated) {

                visualEngine.displayArea.widthVal = visualEngine.displayArea.elementRef.offsetWidth;
                visualEngine.displayArea.heightVal = visualEngine.displayArea.elementRef.offsetHeight;

                // Scale canvas for high-resolution displays
                if (visualEngine.isRetina) {
                    visualEngine.displayArea.widthVal *= visualEngine.displayArea.pixelRatio;
                    visualEngine.displayArea.heightVal *= visualEngine.displayArea.pixelRatio;
                }

                visualEngine.displayArea.elementRef.width = visualEngine.displayArea.widthVal;
                visualEngine.displayArea.elementRef.height = visualEngine.displayArea.heightVal;

                // Redraw visual elements
                visualEngine.utilityFunctions.paintDisplay();
                if (!visualEngine.elementSettings.animation.activated) {
                    visualEngine.utilityFunctions.removeElements();
                    visualEngine.utilityFunctions.clearDisplay();
                    startVisualElements(); // Re-initialize the visualizer
                }

                // Adjust element density if enabled
                visualEngine.utilityFunctions.autoAdjustDensity();

            }

        });

    };

    visualEngine.utilityFunctions.autoAdjustDensity = function () {
        if (visualEngine.interaction.eventHandlers.onResizeEvent.autoDensity) {

            // Calculate current display area
            var surfaceArea = visualEngine.displayArea.elementRef.width * visualEngine.displayArea.elementRef.height / 1000;
            if (visualEngine.isRetina) {
                surfaceArea = surfaceArea / (visualEngine.displayArea.pixelRatio * 2);
            }

            // Determine target number of elements based on density settings
            var calculatedElementCount = surfaceArea * visualEngine.elementSettings.elementCount / visualEngine.interaction.eventHandlers.onResizeEvent.densityRegion;

            // Add or remove elements to match the target count
            var elementsToAdjust = visualEngine.elementSettings.elementList.length - calculatedElementCount;
            if (elementsToAdjust < 0) {
                visualEngine.utilityFunctions.helperMethods.interactionHelpers.addMoreElements(Math.abs(elementsToAdjust));
            } else {
                visualEngine.utilityFunctions.helperMethods.interactionHelpers.subtractElements(elementsToAdjust);
            }

        }
    };

    visualEngine.utilityFunctions.paintDisplay = function () {
        visualEngine.displayArea.context.fillRect(0, 0, visualEngine.displayArea.widthVal, visualEngine.displayArea.heightVal);
    };

    visualEngine.utilityFunctions.clearDisplay = function () {
        visualEngine.displayArea.context.clearRect(0, 0, visualEngine.displayArea.widthVal, visualEngine.displayArea.heightVal);
    };


    // --------- VISUAL ELEMENT FUNCTIONS -----------

    visualEngine.utilityFunctions.GraphicElement = function (itemColor, itemTransparency, initialPosition) {

        // Set element position
        this.posX = initialPosition ? initialPosition.x : Math.random() * visualEngine.displayArea.widthVal;
        this.posY = initialPosition ? initialPosition.y : Math.random() * visualEngine.displayArea.heightVal;

        // Determine element size
        this.sizeRadius = (visualEngine.elementSettings.randomSize ? Math.random() : 1) * visualEngine.elementSettings.elementSize;
        if (visualEngine.isRetina) this.sizeRadius *= visualEngine.displayArea.pixelRatio;

        // Assign element color
        if (visualEngine.elementSettings.randomColor) {
            this.itemColor = {
                r: (Math.floor(Math.random() * (255 - 0 + 1)) + 0),
                g: (Math.floor(Math.random() * (255 - 0 + 1)) + 0),
                b: (Math.floor(Math.random() * (255 - 0 + 1)) + 0)
            };
        } else {
            this.itemColor = itemColor;
        }

        // Set element transparency
        this.itemTransparency = itemTransparency;
        if (visualEngine.elementSettings.transparency.animation.activated) {
            this.transparencyState = false;
            this.transparencyVelocity = visualEngine.elementSettings.transparency.animation.animSpeed / 100;
            if (!visualEngine.elementSettings.transparency.animation.synchronized) {
                this.transparencyVelocity = this.transparencyVelocity * Math.random();
            }
        }

        // Initialize animation velocity
        this.velX = -.5 + Math.random();
        this.velY = -.5 + Math.random();

    };

    visualEngine.utilityFunctions.GraphicElement.prototype.renderElement = function () {

        visualEngine.displayArea.context.fillStyle = 'rgba(' + this.itemColor.r + ',' + this.itemColor.g + ',' + this.itemColor.b + ',' + this.itemTransparency + ')';
        visualEngine.displayArea.context.beginPath();

        switch (visualEngine.elementSettings.elementShape) {
            case 'circle':
                visualEngine.displayArea.context.arc(this.posX, this.posY, this.sizeRadius, 0, Math.PI * 2, false);
                break;

            case 'edge':
                visualEngine.displayArea.context.rect(this.posX, this.posY, this.sizeRadius * 2, this.sizeRadius * 2);
                break;

            case 'triangle':
                visualEngine.displayArea.context.moveTo(this.posX, this.posY - this.sizeRadius);
                visualEngine.displayArea.context.lineTo(this.posX + this.sizeRadius, this.posY + this.sizeRadius);
                visualEngine.displayArea.context.lineTo(this.posX - this.sizeRadius, this.posY + this.sizeRadius);
                visualEngine.displayArea.context.closePath();
                break;
        }

        visualEngine.displayArea.context.fill();

    };

    visualEngine.utilityFunctions.generateElements = function () {
        for (var itemIndex = 0; itemIndex < visualEngine.elementSettings.elementCount; itemIndex++) {
            visualEngine.elementSettings.elementList.push(new visualEngine.utilityFunctions.GraphicElement(visualEngine.elementSettings.rgbColor, visualEngine.elementSettings.transparency.currentTransparency));
        }
    };

    visualEngine.utilityFunctions.animateElements = function () {
        for (var itemIndex = 0; itemIndex < visualEngine.elementSettings.elementList.length; itemIndex++) {
            // Get the current element
            var currentElement = visualEngine.elementSettings.elementList[itemIndex];

            // Update element position
            currentElement.posX += currentElement.velX * (visualEngine.elementSettings.animation.animSpeed / 2);
            currentElement.posY += currentElement.velY * (visualEngine.elementSettings.animation.animSpeed / 2);

            // Manage transparency animation
            if (visualEngine.elementSettings.transparency.animation.activated) {
                if (currentElement.transparencyState === true) {
                    if (currentElement.itemTransparency >= visualEngine.elementSettings.transparency.currentTransparency) currentElement.transparencyState = false;
                    currentElement.itemTransparency += currentElement.transparencyVelocity;
                } else {
                    if (currentElement.itemTransparency <= visualEngine.elementSettings.transparency.animation.minTransparency) currentElement.transparencyState = true;
                    currentElement.itemTransparency -= currentElement.transparencyVelocity;
                }
            }

            // Adjust element position if it moves off-canvas
            switch (visualEngine.interaction.eventHandlers.onResizeEvent.interactMode) {
                case 'bounce':
                    if (currentElement.posX - currentElement.sizeRadius > visualEngine.displayArea.widthVal) currentElement.velX = -currentElement.velX;
                    else if (currentElement.posX + currentElement.sizeRadius < 0) currentElement.velX = -currentElement.velX;
                    if (currentElement.posY - currentElement.sizeRadius > visualEngine.displayArea.heightVal) currentElement.velY = -currentElement.velY;
                    else if (currentElement.posY + currentElement.sizeRadius < 0) currentElement.velY = -currentElement.velY;
                    break;

                case 'out':
                    if (currentElement.posX - currentElement.sizeRadius > visualEngine.displayArea.widthVal) currentElement.posX = currentElement.sizeRadius;
                    else if (currentElement.posX + currentElement.sizeRadius < 0) currentElement.posX = visualEngine.displayArea.widthVal + currentElement.sizeRadius;
                    if (currentElement.posY - currentElement.sizeRadius > visualEngine.displayArea.heightVal) currentElement.posY = currentElement.sizeRadius;
                    else if (currentElement.posY + currentElement.sizeRadius < 0) currentElement.posY = visualEngine.displayArea.heightVal + currentElement.sizeRadius;
                    break;
            }


            // Check interactions between current element and other elements
            for (var otherItemIndex = itemIndex + 1; otherItemIndex < visualEngine.elementSettings.elementList.length; otherItemIndex++) {
                var neighborElement = visualEngine.elementSettings.elementList[otherItemIndex];

                // Connect elements with lines if auto-connect is enabled
                if (visualEngine.elementSettings.connectionLines.autoConnect) {
                    visualEngine.utilityFunctions.helperMethods.measureElementDistance(currentElement, neighborElement);
                }

                // Apply interactivity if enabled
                if (visualEngine.interaction.activated) {

                    // Interaction mode
                    switch (visualEngine.interaction.interactMode) {
                        case 'grab':
                            visualEngine.utilityFunctions.helperMethods.interactionHelpers.grabElements(currentElement, neighborElement);
                            break;
                    }

                }


            }
        }
    };

    visualEngine.utilityFunctions.drawElements = function () {
        // Clear the display area
        visualEngine.displayArea.context.clearRect(0, 0, visualEngine.displayArea.widthVal, visualEngine.displayArea.heightVal);

        // Advance element animations
        visualEngine.utilityFunctions.animateElements();

        // Render each element
        for (var itemIndex = 0; itemIndex < visualEngine.elementSettings.elementList.length; itemIndex++) {
            var currentElement = visualEngine.elementSettings.elementList[itemIndex];
            currentElement.renderElement('rgba(' + currentElement.itemColor.r + ',' + currentElement.itemColor.g + ',' + currentElement.itemColor.b + ',' + currentElement.itemTransparency + ')');
        }

    };

    visualEngine.utilityFunctions.removeElements = function () {
        visualEngine.elementSettings.elementList = [];
    };


    // ---------- HELPER METHOD FUNCTIONS ------------

    visualEngine.utilityFunctions.helperMethods.measureElementDistance = function (elementA, elementB) {

        var deltaX = elementA.posX - elementB.posX,
            deltaY = elementA.posY - elementB.posY,
            separation = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // If elements are within connection distance
        if (separation <= visualEngine.elementSettings.connectionLines.connectDistance) {

            // Draw the connecting line
            var lineDrawingColor = visualEngine.elementSettings.connectionLines.rgbLineColor;
            visualEngine.displayArea.context.beginPath();
            visualEngine.displayArea.context.strokeStyle = 'rgba(' + lineDrawingColor.r + ',' + lineDrawingColor.g + ',' + lineDrawingColor.b + ',' + (visualEngine.elementSettings.connectionLines.lineTransparency - separation / visualEngine.elementSettings.connectionLines.connectDistance) + ')';
            visualEngine.displayArea.context.moveTo(elementA.posX, elementA.posY);
            visualEngine.displayArea.context.lineTo(elementB.posX, elementB.posY);
            visualEngine.displayArea.context.lineWidth = visualEngine.elementSettings.connectionLines.lineWidth;
            visualEngine.displayArea.context.stroke();
            visualEngine.displayArea.context.closePath();

            // Apply condensed mode physics
            if (visualEngine.elementSettings.connectionLines.compressedMode.activated) {
                var deltaX = elementA.posX - elementB.posX,
                    deltaY = elementA.posY - elementB.posY,
                    accelX = deltaX / (visualEngine.elementSettings.connectionLines.compressedMode.rotX * 1000),
                    accelY = deltaY / (visualEngine.elementSettings.connectionLines.compressedMode.rotY * 1000);
                elementB.velX += accelX;
                elementB.velY += accelY;
            }

        }

    };

    visualEngine.utilityFunctions.helperMethods.interactionHelpers.setupInteractionListeners = function () {

        // Determine the event detection target
        if (visualEngine.interaction.detectionTarget == 'window') {
            var listenerTarget = window;
        } else {
            var listenerTarget = visualEngine.displayArea.elementRef;
        }

        // Handle mouse movement events
        listenerTarget.onmousemove = function (eventData) {

            if (listenerTarget == window) {
                var cursorX = eventData.clientX,
                    cursorY = eventData.clientY;
            } else {
                var cursorX = eventData.offsetX || eventData.clientX,
                    cursorY = eventData.offsetY || eventData.clientY;
            }

            if (visualEngine) {

                visualEngine.interaction.pointer.posX = cursorX;
                visualEngine.interaction.pointer.posY = cursorY;

                if (visualEngine.isRetina) {
                    visualEngine.interaction.pointer.posX *= visualEngine.displayArea.pixelRatio;
                    visualEngine.interaction.pointer.posY *= visualEngine.displayArea.pixelRatio;
                }

                visualEngine.interaction.status = 'mousemove';
            }

        };

        // Handle mouse leave events
        listenerTarget.onmouseleave = function (eventData) {

            if (visualEngine) {
                visualEngine.interaction.pointer.posX = 0;
                visualEngine.interaction.pointer.posY = 0;
                visualEngine.interaction.status = 'mouseleave';
            }

        };

        // Handle click events if enabled
        if (visualEngine.interaction.eventHandlers.onClickAction.activated) {
            switch (visualEngine.interaction.eventHandlers.onClickAction.interactMode) {
                case 'push':
                    listenerTarget.onclick = function (eventData) {
                        visualEngine.utilityFunctions.helperMethods.interactionHelpers.addMoreElements(visualEngine.interaction.eventHandlers.onClickAction.elementCount, visualEngine.interaction.pointer);
                    };
                    break;

                case 'remove':
                    listenerTarget.onclick = function (eventData) {