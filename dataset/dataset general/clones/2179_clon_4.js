const detectStyleTransformProp = () => {
    const testElement = document.createElement("div");
    const styleProperties = testElement.style;
    let detectedProperty = 'transform' in styleProperties ? 'transform' : undefined;

    const vendorPrefixes = ['webkit', 'moz', 'ms'];
    for (let index = 0; index < vendorPrefixes.length; index++) {
        const prefixedProperty = vendorPrefixes[index] + 'Transform';
        if (prefixedProperty in styleProperties) {
            detectedProperty = prefixedProperty;
            break;
        }
    }
    return detectedProperty;
};
const styleTransformerProperty = detectStyleTransformProp();

const obtainCurrentTimestamp = () => performance.now();

const requestNextRender = window.requestAnimationFrame || ((callback) => setTimeout(callback, 1000 / 60));
const cancelActiveRender = window.cancelAnimationFrame || clearTimeout;

class DisplayRotator {
    constructor(targetContainerElement, settings) {
        this.containerNode = targetContainerElement;
        this.components = [];
        this.horizontalAxisCenter = settings.centralX === null ? this.containerNode.offsetWidth * 0.5 : settings.centralX;
        this.verticalAxisCenter = settings.centralY === null ? this.containerNode.offsetHeight * 0.1 : settings.centralY;
        this.horizontalOrbitRadius = settings.orbitXRadius === null ? this.containerNode.offsetWidth / 2.3 : settings.orbitXRadius;
        this.verticalOrbitRadius = settings.orbitYRadius === null ? this.containerNode.offsetHeight / 6 : settings.orbitYRadius;
        this.distantScaleFactor = settings.distantObjectScale;
        this.currentAngularPosition = Math.PI / 2;
        this.targetAngularPosition = Math.PI / 2;
        this.animationSpeedFactor = settings.moveSpeed;
        this.useSmoothAnimation = settings.smoothMotion;
        this.fixedFrameRate = settings.frameRate;
        this.animationFrameHandle = 0;
        this.autoAdvanceAmount = settings.autoAdvanceSteps;
        this.autoAdvanceIntervalDuration = settings.autoAdvanceDelay;
        this.autoAdvanceTimerHandle = 0;
        this.onReadyCallback = settings.onLoadComplete;
        this.onUpdateCallback = settings.onFrameRendered;
        this.enableTransforms = settings.useTransforms;
        this.settings = settings; // Store all settings for later use

        this.containerNode.style.position = 'relative';
        this.containerNode.style.overflow = 'hidden';

        // Omission: Reflection feature from reflection.js is not implemented as it's an optional third-party plugin dependency
        // and its replication would significantly diverge from the core carousel functionality,
        // making the clone unnecessarily complex for a Type IV requirement focused on core logic.

        this.initializeComponents(settings.elementClass);
    }

    initializeComponents(elementClassName) {
        const childElements = Array.from(this.containerNode.getElementsByClassName(elementClassName));
        const imageLoadPromises = [];

        childElements.forEach(node => {
            node.style.position = 'absolute';
            if (styleTransformerProperty && this.enableTransforms) {
                node.style[styleTransformerProperty + "Origin"] = "0 0";
            }

            let initialWidth, initialHeight;
            if (node.tagName === 'IMG') {
                if (node.complete && node.naturalWidth !== 0) {
                    initialWidth = node.naturalWidth;
                    initialHeight = node.naturalHeight;
                } else {
                    imageLoadPromises.push(new Promise(resolve => {
                        node.onload = () => resolve({ node, width: node.naturalWidth, height: node.naturalHeight });
                        node.onerror = () => {
                            console.warn(`Image loading failed for: ${node.src}`);
                            resolve({ node, width: node.offsetWidth || 100, height: node.offsetHeight || 100 });
                        };
                        if (node.complete) node.onload(); // Trigger if already loaded
                    }));
                }
            } else {
                node.style.display = "inline-block";
                initialWidth = node.offsetWidth;
                initialHeight = node.offsetHeight;
            }

            if (initialWidth !== undefined) {
                this.components.push({
                    domNode: node,
                    fullWidth: initialWidth,
                    fullHeight: initialHeight
                });
            }
        });

        if (imageLoadPromises.length > 0) {
            Promise.all(imageLoadPromises).then(loadedData => {
                loadedData.forEach(data => {
                    this.components.push({
                        domNode: data.node,
                        fullWidth: data.width,
                        fullHeight: data.height
                    });
                });
                this.finalizeSetup();
            });
        } else {
            this.finalizeSetup();
        }
    }

    finalizeSetup() {
        this.mouseDownPreventer = (e) => e.preventDefault();
        this.selectStartPreventer = (e) => e.preventDefault();
        this.containerNode.addEventListener('mousedown', this.mouseDownPreventer);
        this.containerNode.addEventListener('selectstart', this.selectStartPreventer);

        if (this.autoAdvanceAmount !== 0) this.activateAutoMovement();
        this.activateControlPoints(this.settings);
        this.refreshAllPlacements();

        if (typeof this.onReadyCallback === 'function') {
            this.onReadyCallback(this);
        }
    }

    adjustComponentPlacement(componentIndex, angularCoordinate) {
        const component = this.components[componentIndex];
        const sineValue = Math.sin(angularCoordinate);
        const currentScale = this.distantScaleFactor + ((1 - this.distantScaleFactor) * (sineValue + 1) * 0.5);

        const calculatedWidth = component.fullWidth * currentScale;
        const calculatedHeight = component.fullHeight * currentScale;

        const translateX = this.horizontalAxisCenter + (currentScale * ((Math.cos(angularCoordinate) * this.horizontalOrbitRadius) - (component.fullWidth * 0.5)));
        const translateY = this.verticalAxisCenter + (currentScale * sineValue * this.verticalOrbitRadius);

        const componentStyle = component.domNode.style;
        componentStyle.zIndex = String(Math.floor(currentScale * 100));

        if (styleTransformerProperty && this.enableTransforms) {
            componentStyle[styleTransformerProperty] = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
        } else {
            componentStyle.width = `${calculatedWidth}px`;
            componentStyle.left = `${translateX}px`;
            componentStyle.top = `${translateY}px`;
        }
    }

    refreshAllPlacements() {
        const totalComponents = this.components.length;
        const angularSpacing = (2 * Math.PI) / totalComponents;
        let currentAngle = this.currentAngularPosition;

        for (let i = 0; i < totalComponents; i++) {
            this.adjustComponentPlacement(i, currentAngle);
            currentAngle += angularSpacing;
        }

        if (typeof this.onUpdateCallback === 'function') {
            this.onUpdateCallback(this);
        }
    }

    performAnimationCycle = () => {
        const remainingAngularDifference = this.targetAngularPosition - this.currentAngularPosition;
        const currentMoment = obtainCurrentTimestamp();
        const timeElapsedFactor = (currentMoment - this.lastAnimationTime) * 0.002;

        this.lastAnimationTime = currentMoment;

        if (Math.abs(remainingAngularDifference) < 0.003) {
            this.currentAngularPosition = this.targetAngularPosition;
            this.pauseAnimation();
        } else {
            this.currentAngularPosition = this.targetAngularPosition - remainingAngularDifference / (1 + (this.animationSpeedFactor * timeElapsedFactor));
            this.initiateNextCycle();
        }

        this.refreshAllPlacements();
    }

    initiateNextCycle() {
        this.lastAnimationTime = obtainCurrentTimestamp();
        if (this.useSmoothAnimation) {
            this.animationFrameHandle = requestNextRender(this.performAnimationCycle);
        } else {
            this.animationFrameHandle = setTimeout(this.performAnimationCycle, 1000 / this.fixedFrameRate);
        }
    }

    startAnimation() {
        if (this.animationFrameHandle === 0) {
            this.initiateNextCycle();
        }
    }

    pauseAnimation() {
        if (this.animationFrameHandle !== 0) {
            if (this.useSmoothAnimation) {
                cancelActiveRender(this.animationFrameHandle);
            } else {
                clearTimeout(this.animationFrameHandle);
            }
            this.animationFrameHandle = 0;
        }
    }

    advanceByUnits(unitCount) {
        this.targetAngularPosition += (2 * Math.PI / this.components.length) * unitCount;
        this.startAnimation();
    }

    deactivateSystem() {
        this.pauseAnimation();
        clearInterval(this.autoAdvanceTimerHandle);
        if (this.settings.leftButton) this.settings.leftButton.removeEventListener('click', this.leftButtonHandler);
        if (this.settings.rightButton) this.settings.rightButton.removeEventListener('click', this.rightButtonHandler);
        this.containerNode.removeEventListener('mouseover', this.mouseOverHandler);
        this.containerNode.removeEventListener('mouseout', this.mouseOutHandler);
        this.containerNode.removeEventListener('mousewheel', this.mouseWheelHandler);
        this.containerNode.removeEventListener('DOMMouseScroll', this.mouseWheelHandler);
        this.containerNode.removeEventListener('click', this.itemClickHandler);
        this.containerNode.removeEventListener('mousedown', this.mouseDownPreventer);
        this.containerNode.removeEventListener('selectstart', this.selectStartPreventer);
    }

    autoMovement() {
        this.autoAdvanceTimerHandle = setInterval(
            () => this.advanceByUnits(this.autoAdvanceAmount),
            this.autoAdvanceIntervalDuration
        );
    }

    activateAutoMovement() {
        this.mouseOverHandler = () => clearInterval(this.autoAdvanceTimerHandle);
        this.containerNode.addEventListener('mouseover', this.mouseOverHandler);

        this.mouseOutHandler = () => this.autoMovement();
        this.containerNode.addEventListener('mouseout', this.mouseOutHandler);

        this.autoMovement();
    }

    calculateFloatPosition() {
        const totalComponents = this.components.length;
        const currentItemsRotated = totalComponents * ((Math.PI / 2) - this.currentAngularPosition) / (2 * Math.PI);
        const floatIndexVal = currentItemsRotated % totalComponents;
        return (floatIndexVal < 0) ? floatIndexVal + totalComponents : floatIndexVal;
    }

    determineNearestComponentIndex() {
        return Math.round(this.calculateFloatPosition()) % this.components.length;
    }

    getNearestComponent() {
        return this.components[this.determineNearestComponentIndex()];
    }

    activateControlPoints(settings) {
        if (settings.leftButton) {
            this.leftButtonHandler = (e) => {
                e.preventDefault();
                this.advanceByUnits(-1);
            };
            settings.leftButton.addEventListener('click', this.leftButtonHandler);
        }

        if (settings.rightButton) {
            this.rightButtonHandler = (e) => {
                e.preventDefault();
                this.advanceByUnits(1);
            };
            settings.rightButton.addEventListener('click', this.rightButtonHandler);
        }

        if (settings.mouseWheelControl) {
            this.mouseWheelHandler = (e) => {
                e.preventDefault();
                const wheelData = e.wheelDelta || -e.detail;
                this.advanceByUnits((wheelData > 0) ? 1 : -1);
            };
            this.containerNode.addEventListener('mousewheel', this.mouseWheelHandler, { passive: false });
            this.containerNode.addEventListener('DOMMouseScroll', this.mouseWheelHandler, { passive: false });
        }

        if (settings.clickToFront) {
            this.itemClickHandler = (e) => {
                const clickedItem = e.target.closest('.' + settings.elementClass);
                if (clickedItem) {
                    const itemIndex = this.components.findIndex(comp => comp.domNode === clickedItem);
                    if (itemIndex !== -1) {
                        const totalComponents = this.components.length;
                        const currentFloatPosition = this.calculateFloatPosition();
                        let rotationDifference = itemIndex - (currentFloatPosition % totalComponents);

                        if (2 * Math.abs(rotationDifference) > totalComponents) {
                            rotationDifference += (rotationDifference > 0) ? -totalComponents : totalComponents;
                        }

                        this.targetAngularPosition = this.currentAngularPosition;
                        this.advanceByUnits(-rotationDifference);
                    }
                }
            };
            this.containerNode.addEventListener('click', this.itemClickHandler);
        }
    }
}

window.initializeRotator = (selector, userOptions) => {
    const defaultSettings = {
        centralX: null,
        centralY: null,
        orbitXRadius: null,
        orbitYRadius: null,
        distantObjectScale: 0.5,
        useTransforms: true,
        smoothMotion: true,
        frameRate: 30,
        moveSpeed: 4,
        autoAdvanceSteps: 0,
        autoAdvanceDelay: 4000,
        clickToFront: false,
        elementClass: 'rotator-element',
        instanceName: 'rotatorInstance',
        leftButton: null,
        rightButton: null,
        mouseWheelControl: false,
        onLoadComplete: null,
        onFrameRendered: null
    };
    const finalSettings = { ...defaultSettings, ...userOptions };

    const targetElement = document.querySelector(selector);
    if (targetElement) {
        const rotatorInstance = new DisplayRotator(targetElement, finalSettings);
        targetElement[finalSettings.instanceName] = rotatorInstance;
        return rotatorInstance;
    }
    return null;
};