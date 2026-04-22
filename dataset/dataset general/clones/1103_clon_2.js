/**
* image-clipper.js v1.0.0
* jQuery Image Cropping Utility
* @author A. N. Other <anon@example.com>
* Copyright (c) 2023 Anon - released under Custom License
*
* This software is provided "as-is", without any express or implied warranty.
* In no event will the authors be held liable for any damages arising from
* the use of this software.
*
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
*
* 1. The origin of this software must not be misrepresented; you must not
*    claim that you wrote the original software. If you use this software
*    in a product, an acknowledgment in the product documentation would be
*    appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
*    misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

(function (jq) {

    jq.ImageCutter = function (targetElement, configSettings) {
        // Module initialization starts

        // Basic sanity checks for input parameters
        var targetElement = targetElement;
        var configSettings = configSettings;
        var selfInstance = this;

        if (typeof (targetElement) !== 'object')
            targetElement = jq(targetElement)[0];
        if (typeof (configSettings) !== 'object')
            configSettings = {};

        // Browser-specific adjustments (e.g., for older IE versions)
        if (!('monitorDocument' in configSettings)) {
            configSettings.monitorDocument = jq.browser.msie ? false : true;
            if (jq.browser.msie && jq.browser.version.split('.')[0] == '8')
                configSettings.monitorDocument = true;
        }

        if (!('keyboardControl' in configSettings))
            configSettings.keyboardControl = jq.browser.msie ? false : true;

        // Default configuration values
        var baseOptions = {

            // Core operational settings
            monitorDocument: false,
            rootClass: 'imgclip-base',
            extraClass: null,

            // Visual presentation settings
            fillColor: 'black',
            fillAlpha: .6,
            outlineAlpha: .4,
            gripAlpha: .5,

            gripSize: 9,
            gripOffset: 5,

            shapeRatio: 0,
            keyboardControl: true,
            cornerGrips: true,
            sideGrips: true,
            renderOutlines: true,
            pullEdges: true,

            containerWidth: 0,
            containerHeight: 0,
            borderPadding: 3,
            frameDelay: 20,
            easeFactor: 3,

            enableSelection: true,
            enableMovement: true,
            enableResizing: true,
            disappearTime: 400,

            minSelectionSize: [0, 0],
            maxCropSize: [0, 0],
            minCropSize: [0, 0],

            // Event callbacks
            onCoordinatesChange: function () { },
            onAreaSelected: function () { }

        };
        var currentSettings = baseOptions;
        applySettings(configSettings);

        // Prepare jQuery elements for the interface
        var imageStyleProps = {
            border: 'none',
            margin: 0,
            padding: 0,
            position: 'absolute'
        };

        var $sourceImage = jq(targetElement);
        var $displayImage = $sourceImage.clone().removeAttr('id').css(imageStyleProps);

        $displayImage.width($sourceImage.width());
        $displayImage.height($sourceImage.height());
        $sourceImage.after($displayImage).hide();

        adjustSize($displayImage, currentSettings.containerWidth, currentSettings.containerHeight);

        var containerWidth = $displayImage.width(),
            containerHeight = $displayImage.height(),

            $mainWrapper = jq('<div />')
                .width(containerWidth).height(containerHeight)
                .addClass(getClass('root-element'))
                .css({
                    position: 'relative',
                    backgroundColor: currentSettings.fillColor
                }).insertAfter($sourceImage).append($displayImage);
        ;

        delete (currentSettings.fillColor);
        if (currentSettings.extraClass) $mainWrapper.addClass(currentSettings.extraClass);

        var $overlayImage = jq('<img />')
            .attr('src', $displayImage.attr('src'))
            .css(imageStyleProps)
            .width(containerWidth).height(containerHeight)
        ;
        var $imageLayer = jq('<div />')
            .width(percentage(100)).height(percentage(100))
            .css({
                zIndex: 310,
                position: 'absolute',
                overflow: 'hidden'
            })
            .append($overlayImage)
        ;
        var $handleLayer = jq('<div />')
            .width(percentage(100)).height(percentage(100))
            .css('zIndex', 320);
        var $selectionArea = jq('<div />')
            .css({
                position: 'absolute',
                zIndex: 300
            })
            .insertBefore($displayImage)
            .append($imageLayer, $handleLayer)
        ;

        var borderPadding = currentSettings.borderPadding;
        var $trackerDiv = createTracker().width(containerWidth + (borderPadding * 2)).height(containerHeight + (borderPadding * 2))
            .css({ position: 'absolute', top: pixelValue(-borderPadding), left: pixelValue(-borderPadding), zIndex: 290 })
            .mousedown(initiateSelection);

        // Additional internal variables
        var backgroundAlpha = currentSettings.fillAlpha;
        var maxXExtent, maxYExtent, minXExtent, minYExtent;
        var horizontalScale, verticalScale, controlEnabled = true;
        var documentOffset = getPosition($displayImage),
            // Current interaction states
            isMouseDown, lastCursorState, isDimmed, isAnimating,
            shiftKeyHeld;

        // Coordinate management module
        var CoordinateManager = (function () {
            var startX = 0, startY = 0, endX = 0, endY = 0, offsetX, offsetY;

            function initSelectionPoint(position) {
                var position = constrainPoint(position);
                endX = startX = position[0];
                endY = startY = position[1];
            };
            function updateCurrentPoint(position) {
                var position = constrainPoint(position);
                offsetX = position[0] - endX;
                offsetY = position[1] - endY;
                endX = position[0];
                endY = position[1];
            };
            function retrieveOffset() {
                return [offsetX, offsetY];
            };
            function shiftSelection(offsetVector) {
                var offsetX = offsetVector[0];
                var offsetY = offsetVector[1];

                if (0 > startX + offsetX) offsetX -= offsetX + startX;
                if (0 > startY + offsetY) offsetY -= offsetY + startY;

                if (containerHeight < endY + offsetY) offsetY += containerHeight - (endY + offsetY);
                if (containerWidth < endX + offsetX) offsetX += containerWidth - (endX + offsetX);

                startX += offsetX;
                endX += offsetX;
                startY += offsetY;
                endY += offsetY;
            };
            function fetchCornerCoordinates(orientation) {
                var currentRect = getAdjustedRectangle();
                switch (orientation) {
                    case 'ne': return [currentRect.x2, currentRect.y];
                    case 'nw': return [currentRect.x, currentRect.y];
                    case 'se': return [currentRect.x2, currentRect.y2];
                    case 'sw': return [currentRect.x, currentRect.y2];
                }
            };
            function getAdjustedRectangle() {
                if (!currentSettings.shapeRatio) return getCurrentRectangle();
                // This function could use some optimization I think...
                var ratioValue = currentSettings.shapeRatio;
                var min_w = currentSettings.minCropSize[0] / horizontalScale;
                var min_h = currentSettings.minCropSize[1] / verticalScale;
                var max_w = currentSettings.maxCropSize[0] / horizontalScale;
                var max_h = currentSettings.maxCropSize[1] / verticalScale;
                var currentWidth = endX - startX;
                var currentHeight = endY - startY;
                var absWidth = Math.abs(currentWidth);
                var absHeight = Math.abs(currentHeight);
                var actualRatio = absWidth / absHeight;
                var newXCoord, newYCoord;

                if (max_w == 0) { max_w = containerWidth * 10 }
                if (max_h == 0) { max_h = containerHeight * 10 }
                if (actualRatio < ratioValue) {
                    newYCoord = endY;
                    var calcWidth = absHeight * ratioValue;
                    newXCoord = currentWidth < 0 ? startX - calcWidth : calcWidth + startX;

                    if (newXCoord < 0) {
                        newXCoord = 0;
                        var calcHeight = Math.abs((newXCoord - startX) / ratioValue);
                        newYCoord = currentHeight < 0 ? startY - calcHeight : calcHeight + startY;
                    }
                    else if (newXCoord > containerWidth) {
                        newXCoord = containerWidth;
                        var calcHeight = Math.abs((newXCoord - startX) / ratioValue);
                        newYCoord = currentHeight < 0 ? startY - calcHeight : calcHeight + startY;
                    }
                }
                else {
                    newXCoord = endX;
                    var calcHeight = absWidth / ratioValue;
                    newYCoord = currentHeight < 0 ? startY - calcHeight : startY + calcHeight;
                    if (newYCoord < 0) {
                        newYCoord = 0;
                        var calcWidth = Math.abs((newYCoord - startY) * ratioValue);
                        newXCoord = currentWidth < 0 ? startX - calcWidth : calcWidth + startX;
                    }
                    else if (newYCoord > containerHeight) {
                        newYCoord = containerHeight;
                        var calcWidth = Math.abs(newYCoord - startY) * ratioValue;
                        newXCoord = currentWidth < 0 ? startX - calcWidth : calcWidth + startX;
                    }
                }

                // Apply constraints based on min/max dimensions
                if (newXCoord > startX) { // right side
                    if (newXCoord - startX < min_w) {
                        newXCoord = startX + min_w;
                    } else if (newXCoord - startX > max_w) {
                        newXCoord = startX + max_w;
                    }
                    if (newYCoord > startY) {
                        newYCoord = startY + (newXCoord - startX) / ratioValue;
                    } else {
                        newYCoord = startY - (newXCoord - startX) / ratioValue;
                    }
                } else if (newXCoord < startX) { // left side
                    if (startX - newXCoord < min_w) {
                        newXCoord = startX - min_w
                    } else if (startX - newXCoord > max_w) {
                        newXCoord = startX - max_w;
                    }
                    if (newYCoord > startY) {
                        newYCoord = startY + (startX - newXCoord) / ratioValue;
                    } else {
                        newYCoord = startY - (startX - newXCoord) / ratioValue;
                    }
                }

                if (newXCoord < 0) {
                    startX -= newXCoord;
                    newXCoord = 0;
                } else if (newXCoord > containerWidth) {
                    startX -= newXCoord - containerWidth;
                    newXCoord = containerWidth;
                }

                if (newYCoord < 0) {
                    startY -= newYCoord;
                    newYCoord = 0;
                } else if (newYCoord > containerHeight) {
                    startY -= newYCoord - containerHeight;
                    newYCoord = containerHeight;
                }

                return createCoordinateObject(normalizeCoordinates(startX, startY, newXCoord, newYCoord));
            };
            function constrainPoint(point) {
                if (point[0] < 0) point[0] = 0;
                if (point[1] < 0) point[1] = 0;

                if (point[0] > containerWidth) point[0] = containerWidth;
                if (point[1] > containerHeight) point[1] = containerHeight;

                return [point[0], point[1]];
            };
            function normalizeCoordinates(coord1x, coord1y, coord2x, coord2y) {
                var finalX1 = coord1x, finalX2 = coord2x, finalY1 = coord1y, finalY2 = coord2y;
                if (coord2x < coord1x) {
                    finalX1 = coord2x;
                    finalX2 = coord1x;
                }
                if (coord2y < coord1y) {
                    finalY1 = coord2y;
                    finalY2 = coord1y;
                }
                return [Math.round(finalX1), Math.round(finalY1), Math.round(finalX2), Math.round(finalY2)];
            };
            function getCurrentRectangle() {
                var currentWidth = endX - startX;
                var currentHeight = endY - startY;

                if (maxXExtent && (Math.abs(currentWidth) > maxXExtent))
                    endX = (currentWidth > 0) ? (startX + maxXExtent) : (startX - maxXExtent);
                if (maxYExtent && (Math.abs(currentHeight) > maxYExtent))
                    endY = (currentHeight > 0) ? (startY + maxYExtent) : (startY - maxYExtent);

                if (minYExtent && (Math.abs(currentHeight) < minYExtent))
                    endY = (currentHeight > 0) ? (startY + minYExtent) : (startY - minYExtent);
                if (minXExtent && (Math.abs(currentWidth) < minXExtent))
                    endX = (currentWidth > 0) ? (startX + minXExtent) : (startX - minXExtent);

                if (startX < 0) { endX -= startX; startX -= startX; }
                if (startY < 0) { endY -= startY; startY -= startY; }
                if (endX < 0) { startX -= endX; endX -= endX; }
                if (endY < 0) { startY -= endY; endY -= endY; }
                if (endX > containerWidth) { var coordDelta = endX - containerWidth; startX -= coordDelta; endX -= coordDelta; }
                if (endY > containerHeight) { var coordDelta = endY - containerHeight; startY -= coordDelta; endY -= coordDelta; }
                if (startX > containerWidth) { var coordDelta = startX - containerWidth; endY -= coordDelta; startY -= coordDelta; } // Potential bug in original logic
                if (startY > containerHeight) { var coordDelta = startY - containerHeight; endY -= coordDelta; startY -= coordDelta; } // Potential bug in original logic

                return createCoordinateObject(normalizeCoordinates(startX, startY, endX, endY));
            };
            function createCoordinateObject(coordArray) {
                return {
                    x: coordArray[0], y: coordArray[1], x2: coordArray[2], y2: coordArray[3],
                    w: coordArray[2] - coordArray[0], h: coordArray[3] - coordArray[1]
                };
            };

            return {
                normalizeCoordinates: normalizeCoordinates,
                initSelectionPoint: initSelectionPoint,
                updateCurrentPoint: updateCurrentPoint,
                retrieveOffset: retrieveOffset,
                shiftSelection: shiftSelection,
                fetchCornerCoordinates: fetchCornerCoordinates,
                getAdjustedRectangle: getAdjustedRectangle
            };
        })();

        // Selection drawing and interaction module
        var SelectionControl = (function () {
            var initialPoint, finalPoint, interactionMode, isActive, handleZIndexCounter = 370;
            var outlineElements = {};
            var gripElements = {};
            var handlesVisible = false;
            var gripSizeHalf = currentSettings.gripOffset;

            // Generate draggable components
            if (currentSettings.renderOutlines) {
                outlineElements = {
                    top: createBorder('horizontal-line'),
                    bottom: createBorder('horizontal-line'),
                    left: createBorder('vertical-line'),
                    right: createBorder('vertical-line')
                };
            }

            // Create draggable bars on selection edges
            if (currentSettings.pullEdges) {
                gripElements.top = createDragbarElement('n');
                gripElements.bottom = createDragbarElement('s');
                gripElements.right = createDragbarElement('e');
                gripElements.left = createDragbarElement('w');
            }

            // Create side grips if enabled
            currentSettings.sideGrips &&
                generateGrips(['n', 's', 'e', 'w']);

            // Create corner grips if enabled
            currentSettings.cornerGrips &&
                generateGrips(['sw', 'nw', 'ne', 'se']);

            // Helper for creating border elements
            function createBorder(kind) {
                var elementRef = jq('<div />')
                    .css({ position: 'absolute', opacity: currentSettings.outlineAlpha })
                    .addClass(getClass(kind));
                $imageLayer.append(elementRef);
                return elementRef;
            };
            // Helper for creating draggable div elements
            function createDraggableDiv(orientation, zIndexVal) {
                var elementRef = jq('<div />')
                    .mousedown(createDragEventHandler(orientation))
                    .css({
                        cursor: orientation + '-resize',
                        position: 'absolute',
                        zIndex: zIndexVal
                    })
                ;
                $handleLayer.append(elementRef);
                return elementRef;
            };
            // Helper for creating individual handle elements
            function createHandleElement(orientation) {
                return createDraggableDiv(orientation, handleZIndexCounter++)
                    .css({ top: pixelValue(-gripSizeHalf + 1), left: pixelValue(-gripSizeHalf + 1), opacity: currentSettings.gripAlpha })
                    .addClass(getClass('grip'));
            };
            // Helper for creating dragbar elements
            function createDragbarElement(orientation) {
                var sizeParam = currentSettings.gripSize;
                var elementHeight = sizeParam, elementWidth = sizeParam;
                var topOffset = gripSizeHalf, leftOffset = gripSizeHalf;

                switch (orientation) {
                    case 'n': case 's': elementWidth = percentage(100); break;
                    case 'e': case 'w': elementHeight = percentage(100); break;
                }

                return createDraggableDiv(orientation, handleZIndexCounter++).width(elementWidth).height(elementHeight)
                    .css({ top: pixelValue(-topOffset + 1), left: pixelValue(-leftOffset + 1) });
            };
            // Generate a list of grips
            function generateGrips(list) {
                for (var k = 0; k < list.length; k++)
                    gripElements[list[k]] = createHandleElement(list[k]);
            };
            // Position all grip elements based on current selection
            function positionGrips(currentBounds) {
                var vertMidpoint = Math.round((currentBounds.h / 2) - gripSizeHalf);
                var horizMidpoint = Math.round((currentBounds.w / 2) - gripSizeHalf);
                var northPos = westPos = -gripSizeHalf + 1;
                var eastPos = currentBounds.w - gripSizeHalf;
                var southPos = currentBounds.h - gripSizeHalf;

                // Update horizontal lines
                outlineElements.top.css({ left: pixelValue(currentBounds.x), top: pixelValue(currentBounds.y), width: pixelValue(currentBounds.w) });
                outlineElements.bottom.css({ left: pixelValue(currentBounds.x), top: pixelValue(currentBounds.y2), width: pixelValue(currentBounds.w) });
                // Update vertical lines
                outlineElements.left.css({ left: pixelValue(currentBounds.x), top: pixelValue(currentBounds.y), height: pixelValue(currentBounds.h) });
                outlineElements.right.css({ left: pixelValue(currentBounds.x2), top: pixelValue(currentBounds.y), height: pixelValue(currentBounds.h) });

                // Update corner handles
                gripElements.nw.css({ top: pixelValue(northPos), left: pixelValue(westPos) });
                gripElements.ne.css({ top: pixelValue(northPos), left: pixelValue(eastPos) });
                gripElements.sw.css({ top: pixelValue(southPos), left: pixelValue(westPos) });
                gripElements.se.css({ top: pixelValue(southPos), left: pixelValue(eastPos) });

                // Update side handles
                gripElements.n.css({ top: pixelValue(northPos), left: pixelValue(horizMidpoint) });
                gripElements.s.css({ top: pixelValue(southPos), left: pixelValue(horizMidpoint) });
                gripElements.e.css({ top: pixelValue(vertMidpoint), left: pixelValue(eastPos) });
                gripElements.w.css({ top: pixelValue(vertMidpoint), left: pixelValue(westPos) });
            };
            // Set opacity of elements
            function adjustOpacity(opacityValue) {
                $selectionArea.children().filter(':not(.imgclip-outlines)').css('opacity', opacityValue);
            };
            // Display selection elements
            function display() {
                $selectionArea.show();
                if (currentSettings.renderOutlines) {
                    $selectionArea.children('.imgclip-outlines').show();
                }
                if (currentSettings.pullEdges) {
                    $handleLayer.children('.imgclip-dragbar').show();
                }
                if (currentSettings.cornerGrips) {
                    $handleLayer.children('.imgclip-grip').show();
                }
                if (currentSettings.sideGrips) {
                    $handleLayer.children('.imgclip-grip').show();
                }
                handlesVisible = true;
            };
            // Conceal selection elements
            function conceal() {
                $selectionArea.hide();
                handlesVisible = false;
            };
            // Animate selection appearance
            function transition() {
                if (currentSettings.disappearTime > 0) {
                    $selectionArea.fadeOut(currentSettings.disappearTime);
                } else {
                    conceal();
                }
            };
            // Refresh selection based on new coordinates
            function refresh(c) {
                $selectionArea.css({
                    top: pixelValue(c.y),
                    left: pixelValue(c.x),
                    width: pixelValue(c.w),
                    height: pixelValue(c.h)
                });
                $overlayImage.css({
                    top: pixelValue(-c.y),
                    left: pixelValue(-c.x)
                });
                positionGrips(c);
                notifySelection(c);
            };
            // Activate selection for interaction
            function enable() {
                isActive = true;
                if (currentSettings.keyboardControl) {
                    jq(document).bind('keydown.imgclipper', keyboardManager.onKeyDown)
                        .bind('keyup.imgclipper', keyboardManager.onKeyUp);
                }
            };
            // Deactivate selection
            function disable() {
                isActive = false;
                jq(document).unbind('keydown.imgclipper').unbind('keyup.imgclipper');
            };

            return {
                adjustOpacity: adjustOpacity,
                display: display,
                conceal: conceal,
                transition: transition,
                refresh: refresh,
                enable: enable,
                disable: disable
            };
        })();

        // Core dragging functionality
        var dragHandler = (function () {
            var eventX, eventY, moveType, currentPosition,
                _doc = document.body;

            function startDrag(event) {
                // Determine interaction mode and coordinates
                eventX = event.pageX;
                eventY = event.pageY;
                moveType = currentPosition = event.data;
                isMouseDown = true;

                // Set up event listeners for dragging
                jq(_doc).bind('mousemove.imgclipper', performDrag);
                jq(_doc).bind('mouseup.imgclipper', endDrag);

                // Update cursor
                SelectionControl.adjustOpacity(0.9);
                return false;
            };
            function performDrag(event) {
                // Update coordinates based on drag event
                var newX = event.pageX - eventX;
                var newY = event.pageY - eventY;
                eventX = event.pageX;
                eventY = event.pageY;

                if (moveType == 'move') {
                    CoordinateManager.shiftSelection([newX, newY]);
                    SelectionControl.refresh(CoordinateManager.getAdjustedRectangle());
                }
                else {
                    if (CoordinateManager.getFixed) {
                        CoordinateManager.updateCurrentPoint([eventX, eventY]);
                        SelectionControl.refresh(CoordinateManager.getAdjustedRectangle());
                    }
                    else {
                        CoordinateManager.updateCurrentPoint([eventX, eventY]);
                        SelectionControl.refresh(CoordinateManager.getCurrentRectangle());
                    }
                }
                return false;
            };
            function endDrag(event) {
                isMouseDown = false;
                SelectionControl.adjustOpacity(backgroundAlpha);
                jq(_doc).unbind('mousemove.imgclipper');
                jq(_doc).unbind('mouseup.imgclipper');
                return false;
            };

            return {
                startDrag: startDrag
            };
        })();

        // Keyboard control module
        var keyboardManager = (function () {
            var nudgeSpeed = {
                x: 1,
                y: 1
            };
            var nudgeAmount = 1;

            function performNudge(dir) {
                if (isActive) {
                    switch (dir) {
                        case 37:
                            CoordinateManager.shiftSelection([-nudgeAmount, 0]);
                            break; // left
                        case 38:
                            CoordinateManager.shiftSelection([0, -nudgeAmount]);
                            break; // up
                        case 39:
                            CoordinateManager.shiftSelection([nudgeAmount, 0]);
                            break; // right
                        case 40:
                            CoordinateManager.shiftSelection([0, nudgeAmount]);
                            break; // down
                    }
                    SelectionControl.refresh(CoordinateManager.getAdjustedRectangle());
                }
            };
            function configureNudge(x, y) {
                nudgeSpeed.x = x;
                nudgeSpeed.y = y;
            };
            function onKeyDown(event) {
                if (!controlEnabled) return true;
                if (event.ctrlKey || event.metaKey) {
                    return true;
                }
                if (event.shiftKey) {
                    shiftKeyHeld = true;
                }
                var code = event.keyCode;
                if (code >= 37 && code <= 40) {
                    performNudge(code);
                    return false;
                }
                return true;
            };
            function onKeyUp(event) {
                if (!controlEnabled) return true;
                if (event.shiftKey) {
                    shiftKeyHeld = false;
                }
                var code = event.keyCode;
                if (code >= 37 && code <= 40) {
                    return false;
                }
                return true;
            };

            return {
                performNudge: performNudge,
                configureNudge: configureNudge,
                onKeyDown: onKeyDown,
                onKeyUp: onKeyUp
            };
        })();

        // Private utility functions
        function initiateSelection(event) {
            // Start a new selection area
            if (controlEnabled) {
                SelectionControl.conceal();
                SelectionControl.enable();
                isMouseDown = true;
                CoordinateManager.initSelectionPoint([event.pageX, event.pageY]);
                $selectionArea.show();
                jq(document).bind('mousemove.imgclipper', updateSelection);
                jq(document).bind('mouseup.imgclipper', finishSelection);
            }
            return false;
        };
        function updateSelection(event) {
            // Update selection area during drag
            CoordinateManager.updateCurrentPoint([event.pageX, event.pageY]);
            SelectionControl.refresh(CoordinateManager.getAdjustedRectangle());
            return false;
        };
        function finishSelection(event) {
            // Finalize selection after drag
            jq(document).unbind('mousemove.imgclipper');
            jq(document).unbind('mouseup.imgclipper');
            isMouseDown = false;
            currentSettings.onAreaSelected(getSelection());
            SelectionControl.transition();
            SelectionControl.disable();
            return false;
        };
        function createDragEventHandler(orientation) {
            // Create event handler for draggable elements
            return function (event) {
                if (currentSettings.enableResizing) {
                    jq(document).bind('mousemove.imgclipper', dragHandler.performDrag);
                    jq(document).bind('mouseup.imgclipper', dragHandler.endDrag);
                    dragHandler.startDrag(event);
                }
                return false;
            };
        };
        function adjustSize($elem, width, height) {
            // Helper to resize image if necessary
            var image = new Image();
            image.src = $elem.attr('src');
            var imgWidth = image.width;
            var imgHeight = image.height;

            if (width > 0 && imgWidth > width) {
                imgHeight = (width / imgWidth) * imgHeight;
                imgWidth = width;
            }
            if (height > 0 && imgHeight > height) {
                imgWidth = (height / imgHeight) * imgWidth;
                imgHeight = height;
            }

            $elem.width(imgWidth).height(imgHeight);
        };
        function getClass(suffix) {
            // Generate CSS class names
            return currentSettings.rootClass + '-' + suffix;
        };
        function pixelValue(value) {
            // Format value as pixel string
            return value + 'px';
        };
        function percentage(value) {
            // Format value as percentage string
            return value + '%';
        };
        function createTracker() {
            // Create a tracking div for events
            return jq('<div />').addClass(getClass('tracker'));
        };
        function getPosition($elem) {
            // Get position relative to document
            return [$elem.offset().left, $elem.offset().top];
        };

        // API methods
        selfInstance.setSelection = function (x, y, x2, y2) {
            // Set selection coordinates
            CoordinateManager.startX = x;
            CoordinateManager.startY = y;
            CoordinateManager.endX = x2;
            CoordinateManager.endY = y2;
            SelectionControl.refresh(CoordinateManager.getAdjustedRectangle());
            return selfInstance;
        };
        selfInstance.getSelection = function () {
            // Get current selection coordinates
            return CoordinateManager.getAdjustedRectangle();
        };
        function notifySelection(c) {
            // Notify event listeners of coordinate change
            currentSettings.onCoordinatesChange(c);
            notifyScaled(c);
        };
        function notifyScaled(c) {
            // Notify event listeners of scaled coordinates
            var scaledC = {
                x: Math.round(c.x * horizontalScale),
                y: Math.round(c.y * verticalScale),
                x2: Math.round(c.x2 * horizontalScale),
                y2: Math.round(c.y2 * verticalScale),
                w: Math.round(c.w * horizontalScale),
                h: Math.round(c.h * verticalScale)
            };
            currentSettings.onAreaSelected(scaledC);
        };
        function applySettings(newOptions) {
            // Apply new settings
            var prevMinSize = currentSettings.minCropSize;
            var prevMaxSize = currentSettings.maxCropSize;
            currentSettings = jq.extend(currentSettings, newOptions);
            maxXExtent = currentSettings.maxCropSize[0];
            maxYExtent = currentSettings.maxCropSize[1];
            minXExtent = currentSettings.minCropSize[0];
            minYExtent = currentSettings.minCropSize[1];
            if (minXExtent > containerWidth) minXExtent = containerWidth;
            if (minYExtent > containerHeight) minYExtent = containerHeight;
            if (maxXExtent > containerWidth) maxXExtent = containerWidth;
            if (maxYExtent > containerHeight) maxYExtent = containerHeight;
        };
        selfInstance.activateControl = function () {
            // Enable interaction
            controlEnabled = true;
            SelectionControl.enable();
            return selfInstance;
        };
        selfInstance.deactivateControl = function () {
            // Disable interaction
            controlEnabled = false;
            SelectionControl.disable();
            return selfInstance;
        };
        selfInstance.removeInstance = function () {
            // Remove the cropping instance
            $mainWrapper.remove();
            $sourceImage.show();
            selfInstance.deactivateControl();
            return selfInstance;
        };
        selfInstance.gainFocus = function () {
            // Give focus to the instance
            keyboardManager.onKeyDown = function (e) {
                return false;
            };
            keyboardManager.onKeyUp = function (e) {
                return false;
            };
            return selfInstance;
        };
        selfInstance.loseFocus = function () {
            // Remove focus from the instance
            keyboardManager.onKeyDown = function (e) {
                return true;
            };
            keyboardManager.onKeyUp = function (e) {
                return true;
            };
            return selfInstance;
        };
        selfInstance.abortOperation = function () {
            // Cancel current selection
            SelectionControl.transition();
            return selfInstance;
        };
        selfInstance.clearSelection = function () {
            // Clear selection area
            SelectionControl.conceal();
            return selfInstance;
        };
        selfInstance.setBackgroundOpacity = function (opacityVal) {
            // Set background opacity
            backgroundAlpha = opacityVal;
            $mainWrapper.css('opacity', opacityVal);
            return selfInstance;
        };
        selfInstance.getContainerBounds = function () {
            // Get bounds of the container
            return [containerWidth, containerHeight];
        };
        selfInstance.getWidgetDimensions = function () {
            // Get widget dimensions
            return [containerWidth, containerHeight];
        };
        selfInstance.getScaleFactors = function () {
            // Get scale factors
            return [horizontalScale, verticalScale];
        };
        selfInstance.refresh = function () {
            // Refresh the entire crop interface
            var currentCoords = CoordinateManager.getAdjustedRectangle();
            SelectionControl.refresh(currentCoords);
        };
        selfInstance.updateOptions = function (newOptions) {
            // Update options and refresh
            applySettings(newOptions);
            selfInstance.refresh();
            return selfInstance;
        };

        // Initialize the component
        initializeCrop();

        function initializeCrop() {
            // Perform initial setup
            $mainWrapper.append(
                createShadeLayer(0).css({ top: 0, left: 0 })
                    .append(createSelectionFill())
            );
            $mainWrapper.append(
                createShadeLayer(1).css({ top: 0, right: 0 })
                    .append(createSelectionFill())
            );
            $mainWrapper.append(
                createShadeLayer(2).css({ bottom: 0, left: 0 })
                    .append(createSelectionFill())
            );
            $mainWrapper.append(
                createShadeLayer(3).css({ bottom: 0, right: 0 })
                    .append(createSelectionFill())
            );

            $selectionArea.append(createSelectionOutline());
            SelectionControl.refresh(CoordinateManager.getAdjustedRectangle());
        };

        function createShadeLayer(index) {
            // Create a shade layer element
            return jq('<div />')
                .css({
                    position: 'absolute',
                    width: percentage(100),
                    height: percentage(100),
                    zIndex: 299
                })
                .addClass(getClass('shade-' + index));
        };

        function createSelectionFill() {
            // Create the selection fill element
            return jq('<div />')
                .css({
                    position: 'absolute',
                    width: percentage(100),
                    height: percentage(100),
                    zIndex: 300,
                    backgroundColor: currentSettings.fillColor,
                    opacity: currentSettings.fillAlpha
                })
                .addClass(getClass('selection-fill'));
        };

        function createSelectionOutline() {
            // Create the selection outline element
            return jq('<div />')
                .css({
                    position: 'absolute',
                    width: percentage(100),
                    height: percentage(100),
                    zIndex: 300,
                    border: '1px solid white'
                })
                .addClass(getClass('selection-outline'));
        };
    };

    // jQuery plugin registration
    jq.fn.imgClipper = function (config) {
        var api = jq(this).data('imgClipper');
        if (!api) {
            api = new jq.ImageCutter(this, config);
            jq(this).data('imgClipper', api);
        }
        return api;
    };

})(jQuery);