class CropController {
    constructor(sourceElement, initialSettings) {
        // --- 1. Internal State and Configuration Setup ---
        const componentInstance = this;

        // Ensure the target element is a valid DOM node
        let targetDomItem = (typeof sourceElement === 'object' && sourceElement.nodeType === 1) ? sourceElement : document.querySelector(sourceElement);
        if (!targetDomItem) {
            console.error("No valid target element detected for the image manipulation utility.");
            return;
        }

        // Standardize the user-provided settings
        let receivedSettings = (typeof initialSettings === 'object' && initialSettings !== null) ? initialSettings : {};

        // Define a comprehensive set of default configurations
        const defaultConfiguration = {
            eventTrackingOnDocument: false,
            baseCssClass: 'image-adjust-component',
            additionalCssClass: null,

            // Visual properties
            canvasBackgroundColor: 'black',
            canvasBackgroundOpacity: 0.6,
            boundaryLineOpacity: 0.4,
            resizerHandleOpacity: 0.5,

            resizerHandleSize: 9,
            resizerHandleOffset: 5,

            // Behavioral constraints
            fixedProportion: 0,
            keyboardInteractionEnabled: true,
            cornerResizersPresent: true,
            sideResizersPresent: true,
            displayBoundaryLines: true,
            draggableEdges: true,

            // Size constraints
            containerMaximumWidth: 0,
            containerMaximumHeight: 0,
            boundaryPixelPadding: 3,
            uiAnimationDelay: 20,
            animationEaseSpeed: 3,

            allowRegionCreation: true,
            allowRegionMovement: true,
            allowRegionResizing: true,
            uiFadeDuration: 400,

            minimumRegionDimensions: [0, 0],
            maximumRegionDimensions: [0, 0],
            sourceImageMinimumDimensions: [0, 0],

            // Event callbacks
            onRegionUpdate: function () { },
            onRegionFinalize: function () { }
        };

        // Merge user settings with the default configuration
        let activeComponentConfiguration = { ...defaultConfiguration, ...receivedSettings };

        // No browser-specific patches (e.g., MSIE checks) are included for Type IV divergence,
        // assuming modern browser behavior for `eventTrackingOnDocument` and `keyboardInteractionEnabled`.

        // --- 2. Constructing the DOM Interface ---
        const baseImageStyles = {
            border: 'none',
            margin: '0',
            padding: '0',
            position: 'absolute'
        };

        const initialImageReference = targetDomItem;
        const mainImageDisplay = initialImageReference.cloneNode(false);
        mainImageDisplay.removeAttribute('id');
        Object.assign(mainImageDisplay.style, baseImageStyles);

        mainImageDisplay.style.width = initialImageReference.offsetWidth + 'px';
        mainImageDisplay.style.height = initialImageReference.offsetHeight + 'px';

        initialImageReference.parentNode.insertBefore(mainImageDisplay, initialImageReference.nextSibling);
        initialImageReference.style.display = 'none';

        // Helper to adjust image dimensions based on container limits
        const scaleImageWithinBox = (imgElem, boxW, boxH) => {
            if (boxW > 0 && imgElem.offsetWidth > boxW) {
                imgElem.style.width = boxW + 'px';
                imgElem.style.height = 'auto';
            }
            if (boxH > 0 && imgElem.offsetHeight > boxH) {
                imgElem.style.height = boxH + 'px';
                imgElem.style.width = 'auto';
            }
        };
        scaleImageWithinBox(mainImageDisplay, activeComponentConfiguration.containerMaximumWidth, activeComponentConfiguration.containerMaximumHeight);

        let currentContainerWidth = mainImageDisplay.offsetWidth;
        let currentContainerHeight = mainImageDisplay.offsetHeight;

        const primaryContainerElement = document.createElement('div');
        primaryContainerElement.style.width = currentContainerWidth + 'px';
        primaryContainerElement.style.height = currentContainerHeight + 'px';
        primaryContainerElement.classList.add(activeComponentConfiguration.baseCssClass + '-viewport');
        Object.assign(primaryContainerElement.style, {
            position: 'relative',
            backgroundColor: activeComponentConfiguration.canvasBackgroundColor
        });
        initialImageReference.parentNode.insertBefore(primaryContainerElement, initialImageReference.nextSibling);
        primaryContainerElement.appendChild(mainImageDisplay);

        delete activeComponentConfiguration.canvasBackgroundColor; // Remove used option
        if (activeComponentConfiguration.additionalCssClass) {
            primaryContainerElement.classList.add(activeComponentConfiguration.additionalCssClass);
        }

        const selectionImageFragment = document.createElement('img');
        selectionImageFragment.setAttribute('src', mainImageDisplay.getAttribute('src'));
        Object.assign(selectionImageFragment.style, baseImageStyles);
        selectionImageFragment.style.width = currentContainerWidth + 'px';
        selectionImageFragment.style.height = currentContainerHeight + 'px';

        const imageClippingWrapper = document.createElement('div');
        imageClippingWrapper.style.width = '100%';
        imageClippingWrapper.style.height = '100%';
        Object.assign(imageClippingWrapper.style, {
            zIndex: '310',
            position: 'absolute',
            overflow: 'hidden'
        });
        imageClippingWrapper.appendChild(selectionImageFragment);

        const resizerHandleWrapper = document.createElement('div');
        resizerHandleWrapper.style.width = '100%';
        resizerHandleWrapper.style.height = '100%';
        resizerHandleWrapper.style.zIndex = '320';

        const activeSelectionLayer = document.createElement('div');
        Object.assign(activeSelectionLayer.style, {
            position: 'absolute',
            zIndex: '300'
        });
        primaryContainerElement.insertBefore(activeSelectionLayer, mainImageDisplay);
        activeSelectionLayer.appendChild(imageClippingWrapper);
        activeSelectionLayer.appendChild(resizerHandleWrapper);

        const boundary = activeComponentConfiguration.boundaryPixelPadding;
        const eventCaptureArea = document.createElement('div');
        eventCaptureArea.style.width = (currentContainerWidth + (boundary * 2)) + 'px';
        eventCaptureArea.style.height = (currentContainerHeight + (boundary * 2)) + 'px';
        Object.assign(eventCaptureArea.style, {
            position: 'absolute',
            top: (-boundary) + 'px',
            left: (-boundary) + 'px',
            zIndex: '290'
        });
        eventCaptureArea.addEventListener('mousedown', (e) => componentInstance.initiateAreaSelection(e));
        primaryContainerElement.appendChild(eventCaptureArea);

        // --- 3. Internal Dynamic State Variables ---
        let currentBackgroundShade = activeComponentConfiguration.canvasBackgroundOpacity;
        let maxSelectionWidthLimit, maxSelectionHeightLimit, minSelectionWidthLimit, minSelectionHeightLimit;
        let horizScaleFactor = 1, vertScaleFactor = 1; // Assuming 1:1 scale if not explicitly set elsewhere
        let interactionEnabled = true;
        let documentGlobalOffset = { x: primaryContainerElement.offsetLeft, y: primaryContainerElement.offsetTop };

        let isSelectionActive = false;
        let lastCursorShape = '';
        let isInterfaceDimmed = false;
        let isTransitioning = false;
        let isShiftKeyDown = false;

        // --- 4. RegionGeometry: Manages selection coordinates and constraints ---
        class RegionGeometry {
            constructor(containerW, containerH, config) {
                this.containerWidth = containerW;
                this.containerHeight = containerH;
                this.operationConfig = config;

                this.beginX = 0;
                this.beginY = 0;
                this.endX = 0;
                this.endY = 0;
                this.lastDeltaX = 0;
                this.lastDeltaY = 0;
            }

            // Sets the initial point for a new selection
            establishStartPoint(point) {
                const boundedPoint = this.restrictPointToContainer(point);
                this.endX = this.beginX = boundedPoint.x;
                this.endY = this.beginY = boundedPoint.y;
            }

            // Updates the current end point of the selection
            updateEndPoint(point) {
                const boundedPoint = this.restrictPointToContainer(point);
                this.lastDeltaX = boundedPoint.x - this.endX;
                this.lastDeltaY = boundedPoint.y - this.endY;
                this.endX = boundedPoint.x;
                this.endY = boundedPoint.y;
            }

            // Retrieves the last movement delta
            getMovementDelta() {
                return { dx: this.lastDeltaX, dy: this.lastDeltaY };
            }

            // Moves the entire selection region by a given offset
            shiftRegion(offset) {
                let shiftAmountX = offset.dx;
                let shiftAmountY = offset.dy;

                if (0 > this.beginX + shiftAmountX) shiftAmountX -= (shiftAmountX + this.beginX);
                if (0 > this.beginY + shiftAmountY) shiftAmountY -= (shiftAmountY + this.beginY);

                if (this.containerHeight < this.endY + shiftAmountY) shiftAmountY += (this.containerHeight - (this.endY + shiftAmountY));
                if (this.containerWidth < this.endX + shiftAmountX) shiftAmountX += (this.containerWidth - (this.endX + shiftAmountX));

                this.beginX += shiftAmountX;
                this.endX += shiftAmountX;
                this.beginY += shiftAmountY;
                this.endY += shiftAmountY;
            }

            // Returns coordinates of a specific corner
            retrieveCorner(cornerId) {
                const currentRegion = this.calculateFinalRegion();
                switch (cornerId) {
                    case 'northEast': return { x: currentRegion.x2, y: currentRegion.y };
                    case 'northWest': return { x: currentRegion.x, y: currentRegion.y };
                    case 'southEast': return { x: currentRegion.x2, y: currentRegion.y2 };
                    case 'southWest': return { x: currentRegion.x, y: currentRegion.y2 };
                    default: return { x: 0, y: 0 };
                }
            }

            // Calculates the region applying aspect ratio and size constraints
            calculateConstrainedRegion() {
                if (!this.operationConfig.fixedProportion) {
                    return this.fetchBasicBoundedRegion();
                }

                const propRatio = this.operationConfig.fixedProportion;
                const minSelW = this.operationConfig.sourceImageMinimumDimensions[0] / horizScaleFactor;
                const minSelH = this.operationConfig.sourceImageMinimumDimensions[1] / vertScaleFactor;
                const maxSelW = this.operationConfig.maximumRegionDimensions[0] === 0 ? this.containerWidth * 10 : this.operationConfig.maximumRegionDimensions[0] / horizScaleFactor;
                const maxSelH = this.operationConfig.maximumRegionDimensions[1] === 0 ? this.containerHeight * 10 : this.operationConfig.maximumRegionDimensions[1] / vertScaleFactor;

                let currentW = this.endX - this.beginX;
                let currentH = this.endY - this.beginY;
                let absCurrentW = Math.abs(currentW);
                let absCurrentH = Math.abs(currentH);
                let actualRatio = absCurrentW / absCurrentH;

                let modifiedX2 = this.endX;
                let modifiedY2 = this.endY;

                if (actualRatio < propRatio) {
                    let requiredW = absCurrentH * propRatio;
                    modifiedX2 = currentW < 0 ? this.beginX - requiredW : this.beginX + requiredW;

                    if (modifiedX2 < 0) {
                        modifiedX2 = 0;
                        requiredW = Math.abs(this.beginX - modifiedX2);
                        let calcH = requiredW / propRatio;
                        modifiedY2 = currentH < 0 ? this.beginY - calcH : this.beginY + calcH;
                    } else if (modifiedX2 > this.containerWidth) {
                        modifiedX2 = this.containerWidth;
                        requiredW = Math.abs(this.beginX - modifiedX2);
                        let calcH = requiredW / propRatio;
                        modifiedY2 = currentH < 0 ? this.beginY - calcH : this.beginY + calcH;
                    }
                } else {
                    let requiredH = absCurrentW / propRatio;
                    modifiedY2 = currentH < 0 ? this.beginY - requiredH : this.beginY + requiredH;

                    if (modifiedY2 < 0) {
                        modifiedY2 = 0;
                        requiredH = Math.abs(this.beginY - modifiedY2);
                        let calcW = requiredH * propRatio;
                        modifiedX2 = currentW < 0 ? this.beginX - calcW : this.beginX + calcW;
                    } else if (modifiedY2 > this.containerHeight) {
                        modifiedY2 = this.containerHeight;
                        requiredH = Math.abs(this.beginY - modifiedY2);
                        let calcW = requiredH * propRatio;
                        modifiedX2 = currentW < 0 ? this.beginX - calcW : this.beginX + calcW;
                    }
                }

                let finalCoordX1 = this.beginX;
                let finalCoordY1 = this.beginY;
                let finalCoordX2 = modifiedX2;
                let finalCoordY2 = modifiedY2;

                let currentCalcW = finalCoordX2 - finalCoordX1;
                let currentCalcH = finalCoordY2 - finalCoordY1;

                if (currentCalcW > 0) {
                    if (currentCalcW < minSelW) {
                        finalCoordX2 = finalCoordX1 + minSelW;
                    } else if (currentCalcW > maxSelW) {
                        finalCoordX2 = finalCoordX1 + maxSelW;
                    }
                    finalCoordY2 = finalCoordY1 + (finalCoordX2 - finalCoordX1) / propRatio;
                } else {
                    if (Math.abs(currentCalcW) < minSelW) {
                        finalCoordX2 = finalCoordX1 - minSelW;
                    } else if (Math.abs(currentCalcW) > maxSelW) {
                        finalCoordX2 = finalCoordX1 - maxSelW;
                    }
                    finalCoordY2 = finalCoordY1 - (finalCoordX1 - finalCoordX2) / propRatio;
                }

                let [orderedX1, orderedY1, orderedX2, orderedY2] = this.orderNormalizedCoordinates(finalCoordX1, finalCoordY1, finalCoordX2, finalCoordY2);

                if (orderedX1 < 0) {
                    orderedX2 -= orderedX1;
                    orderedX1 = 0;
                } else if (orderedX2 > this.containerWidth) {
                    let deltaVal = orderedX2 - this.containerWidth;
                    orderedX1 -= deltaVal;
                    orderedX2 -= deltaVal;
                }

                if (orderedY1 < 0) {
                    orderedY2 -= orderedY1;
                    orderedY1 = 0;
                } else if (orderedY2 > this.containerHeight) {
                    let deltaVal = orderedY2 - this.containerHeight;
                    orderedY1 -= deltaVal;
                    orderedY2 -= deltaVal;
                }

                orderedX1 = Math.max(0, orderedX1);
                orderedY1 = Math.max(0, orderedY1);
                orderedX2 = Math.min(this.containerWidth, orderedX2);
                orderedY2 = Math.min(this.containerHeight, orderedY2);

                return this.createRegionObject(this.orderNormalizedCoordinates(orderedX1, orderedY1, orderedX2, orderedY2));
            }

            // Restricts a point to be within the container boundaries
            restrictPointToContainer(point) {
                let xPos = point.x;
                let yPos = point.y;

                if (xPos < 0) xPos = 0;
                if (yPos < 0) yPos = 0;
                if (xPos > this.containerWidth) xPos = this.containerWidth;
                if (yPos > this.containerHeight) yPos = this.containerHeight;

                return { x: xPos, y: yPos };
            }

            // Ensures coordinates are ordered correctly (x1 <= x2, y1 <= y2)
            orderNormalizedCoordinates(p1x, p1y, p2x, p2y) {
                let startX = p1x, endX = p2x, startY = p1y, endY = p2y;
                if (p2x < p1x) {
                    startX = p2x;
                    endX = p1x;
                }
                if (p2y < p1y) {
                    startY = p2y;
                    endY = p1y;
                }
                return [Math.round(startX), Math.round(startY), Math.round(endX), Math.round(endY)];
            }

            // Fetches a basic region, applying min/max size and boundary checks without aspect ratio
            fetchBasicBoundedRegion() {
                let currentW = this.endX - this.beginX;
                let currentH = this.endY - this.beginY;

                const minW = this.operationConfig.sourceImageMinimumDimensions[0] / horizScaleFactor;
                const maxW = this.operationConfig.maximumRegionDimensions[0] === 0 ? Infinity : this.operationConfig.maximumRegionDimensions[0] / horizScaleFactor;
                const minH = this.operationConfig.sourceImageMinimumDimensions[1] / vertScaleFactor;
                const maxH = this.operationConfig.maximumRegionDimensions[1] === 0 ? Infinity : this.operationConfig.maximumRegionDimensions[1] / vertScaleFactor;

                if (maxW !== Infinity && (Math.abs(currentW) > maxW)) {
                    this.endX = (currentW > 0) ? (this.beginX + maxW) : (this.beginX - maxW);
                }
                if (maxH !== Infinity && (Math.abs(currentH) > maxH)) {
                    this.endY = (currentH > 0) ? (this.beginY + maxH) : (this.beginY - maxH);
                }

                if (minW > 0 && (Math.abs(currentW) < minW)) {
                    this.endX = (currentW > 0) ? (this.beginX + minW) : (this.beginX - minW);
                }
                if (minH > 0 && (Math.abs(currentH) < minH)) {
                    this.endY = (currentH > 0) ? (this.beginY + minH) : (this.beginY - minH);
                }

                let finalX1 = this.beginX;
                let finalY1 = this.beginY;
                let finalX2 = this.endX;
                let finalY2 = this.endY;

                if (finalX1 < 0) { finalX2 -= finalX1; finalX1 = 0; }
                if (finalY1 < 0) { finalY2 -= finalY1; finalY1 = 0; }
                if (finalX2 < 0) { finalX1 -= finalX2; finalX2 = 0; }
                if (finalY2 < 0) { finalY1 -= finalY2; finalY2 = 0; }

                if (finalX2 > this.containerWidth) { let delta = finalX2 - this.containerWidth; finalX1 -= delta; finalX2 -= delta; }
                if (finalY2 > this.containerHeight) { let delta = finalY2 - this.containerHeight; finalY1 -= delta; finalY2 -= delta; }

                // Corrected logical intent for x1/y1 exceeding bounds (original had a bug here)
                if (finalX1 > this.containerWidth) { let delta = finalX1 - this.containerWidth; finalX1 -= delta; finalX2 -= delta; }
                if (finalY1 > this.containerHeight) { let delta = finalY1 - this.containerHeight; finalY1 -= delta; finalY2 -= delta; }

                return this.createRegionObject(this.orderNormalizedCoordinates(finalX1, finalY1, finalX2, finalY2));
            }

            // Creates a standardized region object from ordered coordinates
            createRegionObject(coordsArray) {
                const [x, y, x2, y2] = coordsArray;
                return { x, y, x2, y2, width: x2 - x, height: y2 - y };
            }

            // Public method to retrieve the current calculated region
            getCurrentRegion() {
                return this.calculateConstrainedRegion();
            }
        }

        // --- 5. VisualInterface: Manages the display of selection elements ---
        class VisualInterface {
            constructor(imageClipDiv, handleWrapperDiv, config) {
                this.imageClipDiv = imageClipDiv;
                this.handleWrapperDiv = handleWrapperDiv;
                this.displayConfig = config;

                this.beginSelectionPoint = null;
                this.endSelectionPoint = null;
                this.interactionMode = null;
                this.isDisplayActive = false;
                this.nextLayerZIndex = 370;

                this.boundaryElements = {};
                this.interactionHandles = {};
                this.areResizersVisible = false;
                this.resizerHalfSize = this.displayConfig.resizerHandleOffset;

                this.initializeVisualComponents();
            }

            // Helper to generate specific CSS class names
            deriveComponentClass(suffix) {
                return this.displayConfig.baseCssClass + '-' + suffix;
            }

            // Creates and appends a boundary line element
            createBoundaryLine(type) {
                const lineDiv = document.createElement('div');
                lineDiv.style.position = 'absolute';
                lineDiv.style.opacity = this.displayConfig.boundaryLineOpacity;
                lineDiv.classList.add(this.deriveComponentClass(type));
                this.imageClipDiv.appendChild(lineDiv);
                return lineDiv;
            }

            // Creates a generic interactive div for handles/resizers
            createInteractiveComponent(direction, zIndex) {
                const interactiveDiv = document.createElement('div');
                interactiveDiv.style.cursor = direction + '-resize';
                interactiveDiv.style.position = 'absolute';
                interactiveDiv.style.zIndex = zIndex;
                this.handleWrapperDiv.appendChild(interactiveDiv);
                return interactiveDiv;
            }

            // Creates a corner grabber element
            createCornerGrabber(direction) {
                const grabber = this.createInteractiveComponent(direction, this.nextLayerZIndex++);
                grabber.style.top = (-this.resizerHalfSize + 1) + 'px';
                grabber.style.left = (-this.resizerHalfSize + 1) + 'px';
                grabber.style.opacity = this.displayConfig.resizerHandleOpacity;
                grabber.classList.add(this.deriveComponentClass('resizer-handle'));
                return grabber;
            }

            // Creates an edge resizer bar element
            createEdgeResizer(direction) {
                const size = this.displayConfig.resizerHandleSize;
                let currentW = size, currentH = size;
                const offset = this.resizerHalfSize;

                if (direction === 'n' || direction === 's') currentW = '100%';
                if (direction === 'e' || direction === 'w') currentH = '100%';

                const resizerBar = this.createInteractiveComponent(direction, this.nextLayerZIndex++);
                resizerBar.style.width = currentW + (typeof currentW === 'number' ? 'px' : '');
                resizerBar.style.height = currentH + (typeof currentH === 'number' ? 'px' : '');
                resizerBar.style.top = (-offset + 1) + 'px';
                resizerBar.style.left = (-offset + 1) + 'px';
                return resizerBar;
            }

            // Generates a set of grabber elements for specified directions
            generateGrabbers(directionList) {
                for (let i = 0; i < directionList.length; i++) {
                    const dir = directionList[i];
                    this.interactionHandles[dir] = this.createCornerGrabber(dir);
                }
            }

            // Sets up all visual components (borders, handles)
            initializeVisualComponents() {
                if (this.displayConfig.displayBoundaryLines) {
                    this.boundaryElements.top = this.createBoundaryLine('horizontal-line');
                    this.boundaryElements.bottom = this.createBoundaryLine('horizontal-line');
                    this.boundaryElements.left = this.createBoundaryLine('vertical-line');
                    this.boundaryElements.right = this.createBoundaryLine('vertical-line');
                }

                if (this.displayConfig.draggableEdges) {
                    this.interactionHandles.t = this.createEdgeResizer('n');
                    this.interactionHandles.b = this.createEdgeResizer('s');
                    this.interactionHandles.r = this.createEdgeResizer('e');
                    this.interactionHandles.l = this.createEdgeResizer('w');
                }

                if (this.displayConfig.sideResizersPresent) {
                    this.generateGrabbers(['n', 's', 'e', 'w']);
                }

                if (this.displayConfig.cornerResizersPresent) {
                    this.generateGrabbers(['sw', 'nw', 'ne', 'se']);
                }
            }

            // Repositions all grabber elements based on the current selection region
            repositionGrabbers(selectionRegion) {
                const centerVert = Math.round((selectionRegion.height / 2) - this.resizerHalfSize);
                const centerHoriz = Math.round((selectionRegion.width / 2) - this.resizerHalfSize);
                const topEdge = -this.resizerHalfSize + 1;
                const leftEdge = -this.resizerHalfSize + 1;
                const rightEdge = selectionRegion.width - this.resizerHalfSize;
                const bottomEdge = selectionRegion.height - this.resizerHalfSize;

                // The original snippet ends here in the `moveHandles` function.
                // If it were to continue, it would involve setting styles for each handle:
                /*
                if (this.interactionHandles.nw) {
                    Object.assign(this.interactionHandles.nw.style, { top: topEdge + 'px', left: leftEdge + 'px' });
                }
                // ... and so on for all defined handles and borders
                */
            }
        }

        // Initialize core modules
        this.regionGeometryProcessor = new RegionGeometry(currentContainerWidth, currentContainerHeight, activeComponentConfiguration);
        this.visualComponentsManager = new VisualInterface(imageClippingWrapper, resizerHandleWrapper, activeComponentConfiguration);

        // --- 6. Event Handlers (Publicly Exposed for Interaction) ---
        this.initiateAreaSelection = (event) => {
            if (!interactionEnabled) return;
            isSelectionActive = true;
            const bounds = eventCaptureArea.getBoundingClientRect();
            const mouseX = event.clientX - bounds.left - boundary;
            const mouseY = event.clientY - bounds.top - boundary;
            this.regionGeometryProcessor.establishStartPoint({ x: mouseX, y: mouseY });

            document.addEventListener('mousemove', this.updateAreaSelection);
            document.addEventListener('mouseup', this.finalizeAreaSelection);

            activeComponentConfiguration.onRegionUpdate(this.regionGeometryProcessor.getCurrentRegion());
        };

        this.updateAreaSelection = (event) => {
            if (!isSelectionActive) return;
            const bounds = eventCaptureArea.getBoundingClientRect();
            const mouseX = event.clientX - bounds.left - boundary;
            const mouseY = event.clientY - bounds.top - boundary;
            this.regionGeometryProcessor.updateEndPoint({ x: mouseX, y: mouseY });

            const currentRegion = this.regionGeometryProcessor.getCurrentRegion();
            this.visualComponentsManager.repositionGrabbers(currentRegion);

            activeSelectionLayer.style.left = currentRegion.x + 'px';
            activeSelectionLayer.style.top = currentRegion.y + 'px';
            activeSelectionLayer.style.width = currentRegion.width + 'px';
            activeSelectionLayer.style.height = currentRegion.height + 'px';

            selectionImageFragment.style.left = (-currentRegion.x) + 'px';
            selectionImageFragment.style.top = (-currentRegion.y) + 'px';

            activeComponentConfiguration.onRegionUpdate(currentRegion);
        };

        this.finalizeAreaSelection = () => {
            isSelectionActive = false;
            document.removeEventListener('mousemove', this.updateAreaSelection);
            document.removeEventListener('mouseup', this.finalizeAreaSelection);
            activeComponentConfiguration.onRegionFinalize(this.regionGeometryProcessor.getCurrentRegion());
        };
    }
}