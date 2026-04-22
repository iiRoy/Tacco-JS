(function(global) {

    const moduleIdentifier = 'visualMotionEngine';
    const maxFrameRate = 30; // Target maximum frames per second for rendering
    const standardOptions = {
        visualUpdateMethod: 'position', // 'position' (top/left) or 'transform' (translate3d)
        horizontalEffect: true,
        verticalEffect: true,
        backgroundParallax: true,
        elementParallax: true,
        adaptiveScaling: false,
        usePointerInput: true,
        useDeviceOrientation: true,
        orientationSmoothness: 0.9, // Low-pass filter alpha for sensor readings (1 = no filter)
        motionProfile: 'natural',
        pointerMotionProfile: 'gaussian',
        inputPreference: 'mouse', // 'mouse' or 'gyroscope'
        pitchRange: 80, // Delta angle for max parallax (0 < angle < 90)
        rollRange: 80,
        autoAdjustBase: true, // Use low-pass filter to adjust base position
        baseAdjustmentAlpha: 0.05 // Alpha for low-pass filter for base position
    };

    // --- Utility Functions ---

    // Approximation of Gaussian cumulative distribution function with parameter 'a' for standard deviation
    const gaussianCDFApproximation = (x, a) => {
        return 1 / (1 + Math.exp(-(0.07056 * a * (x ** 3)) - (1.5976 * a * x)));
    };

    // Low-pass filter for smoothing signals
    const smoothValue = (currentSignal, previousSignal, alpha) => {
        if (previousSignal === null || previousSignal === undefined) return currentSignal;
        if (typeof alpha === "undefined") alpha = 0.5;
        return (alpha * currentSignal) + ((1 - alpha) * previousSignal);
    };

    // Cache for pre-calculated coefficients in motion algorithms
    let algorithmCoefficientCache = {};

    // Defines how motion input (delta angle) is translated into a parallax factor (-1 to 1)
    const movementCalculators = {
        straight: (delta, maxDelta) => {
            if (delta <= -maxDelta) return 1;
            if (delta >= maxDelta) return -1;
            return -delta / maxDelta;
        },
        natural: (delta, maxDelta) => {
            if (delta <= -maxDelta) return 1;
            if (delta >= maxDelta) return -1;
            const cacheKey = `n${maxDelta}`;
            if (algorithmCoefficientCache[cacheKey] === undefined) algorithmCoefficientCache[cacheKey] = Math.tan(maxDelta * 0.01745);
            return -Math.tan(delta * 0.01745) / algorithmCoefficientCache[cacheKey];
        },
        powerCurve: (delta, maxDelta) => {
            if (delta <= -maxDelta) return 1;
            if (delta >= maxDelta) return -1;
            const cacheKey = `p${maxDelta}`;
            if (algorithmCoefficientCache[cacheKey] === undefined) algorithmCoefficientCache[cacheKey] = (maxDelta / 90) + (4.2 * Math.pow(maxDelta / 90, 7));
            return -((delta / 90) + (4.2 * Math.pow(delta / 90, 7))) / algorithmCoefficientCache[cacheKey];
        },
        bellCurve: (delta, maxDelta) => {
            return 1 - 2 * gaussianCDFApproximation(delta / 90, 135 / maxDelta);
        }
    };

    // Determines the appropriate CSS vendor prefix for 'transform'
    const getVendorCssPrefix = (() => {
        const prefixes = /^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/,
            tempDiv = document.createElement('div'),
            style = tempDiv.style;
        let prefix = '';

        for (const prop in style) {
            if (prefixes.test(prop)) {
                prefix = prop.match(prefixes)[0];
                break;
            }
        }
        if ('WebkitOpacity' in style) {
            prefix = 'Webkit';
        } // Specific checks for Webkit/Khtml that might not follow the general pattern
        if ('KhtmlOpacity' in style) {
            prefix = 'Khtml';
        }

        return (property) => {
            return prefix + (prefix.length > 0 ? property.charAt(0).toUpperCase() + property.slice(1) : property);
        };
    })();

    const cssTransformProperty = getVendorCssPrefix('transform');

    // Checks if 'background-position-x' and 'background-position-y' are supported
    const backgroundPositionXYSupported = (() => {
        const tempDiv = document.createElement('div');
        tempDiv.style.background = '#fff';
        return tempDiv.style.backgroundPositionX !== undefined;
    })();

    // Sets background position
    const setElementBackgroundPosition = backgroundPositionXYSupported ?
        (element, x, y) => {
            element.style.backgroundPositionX = x;
            element.style.backgroundPositionY = y;
        } :
        (element, x, y) => {
            element.style.backgroundPosition = `${x} ${y}`;
        };

    // Gets background position
    const getElementBackgroundPosition = backgroundPositionXYSupported ?
        (element) => {
            return [
                element.style.backgroundPositionX,
                element.style.backgroundPositionY
            ];
        } :
        (element) => {
            return element.style.backgroundPosition.split(' ');
        };

    // Cross-browser requestAnimationFrame with fallback
    const scheduleAnimationFrame = (
        global.requestAnimationFrame ||
        global.webkitRequestAnimationFrame ||
        global.mozRequestAnimationFrame ||
        global.oRequestAnimationFrame ||
        global.msRequestAnimationFrame ||
        function(callback) {
            setTimeout(callback, 1000 / maxFrameRate);
        }
    );

    // --- Core Motion Controller Factory ---

    function ParallaxMotionController(targetElement, userOptions) {
        const currentSettings = { ...standardOptions, ...userOptions
        };
        const baseElement = targetElement;
        const viewportSource = global; // Window object for events and dimensions

        let state = {
            uniqueId: moduleIdentifier + '_' + Math.floor(Math.random() * 1e9),
            deviceOrientationData: {
                beta: 0,
                gamma: 0
            },
            mobileDetected: false,
            sensorInputActive: false,
            webkitSensor: false,
            mozSensor: false,
            pointerInputActive: false,
            viewportWidth: 0,
            viewportHeight: 0,
            viewportFlipped: false,
            viewportLandscape: false,
            lastPointerX: null,
            lastPointerY: null,
            originalPointerX: null, // Used if mouse input is the fallback
            originalPointerY: null,
            initialPitch: null,
            initialRoll: null,
            activeComponents: [], // Elements with data-parallaxify attributes
            activeBackgrounds: [], // Elements with data-parallaxify-background attributes
            animationFrameId: null,
            isAnimating: false
        };

        // --- Private Methods ---

        const establishBaseElements = () => {
            // No direct equivalent for _defineElements from original, as we use baseElement directly.
            // The original used jQuery to wrap 'this.element', this is now implicit.
        };

        const setupMotionRetrievers = () => {
            const motionProfileAdapter = movementCalculators[currentSettings.motionProfile];
            const pointerMotionProfileAdapter = movementCalculators[currentSettings.pointerMotionProfile];

            state.retrieveHorizontalMotionFactor = () => {
                let factor = 0;
                let motionUsed = false;

                if (state.pointerInputActive && state.lastPointerX !== null && state.lastPointerX !== state.originalPointerX) {
                    factor = pointerMotionProfileAdapter(currentSettings.pitchRange * (1 - (2 * state.lastPointerX / state.viewportWidth)), currentSettings.pitchRange);
                    motionUsed = true;
                }

                if (state.sensorInputActive && state.deviceOrientationData.beta !== null && state.deviceOrientationData.gamma !== null) {
                    const tilt = state.deviceOrientationData;
                    let sensorFactor;

                    if (state.viewportLandscape) {
                        sensorFactor = motionProfileAdapter(state.viewportFlipped ? -tilt.beta : tilt.beta, currentSettings.pitchRange);
                    } else {
                        sensorFactor = motionProfileAdapter(state.viewportFlipped ? -tilt.gamma : tilt.gamma, currentSettings.pitchRange);
                    }

                    if (!motionUsed || (currentSettings.inputPreference === 'gyroscope')) {
                        factor = sensorFactor;
                        motionUsed = true;
                    }
                }

                if (!motionUsed) { // Fallback if no active input, use last known mouse position or default
                    factor = pointerMotionProfileAdapter(currentSettings.pitchRange * (1 - (2 * (state.originalPointerX || state.viewportWidth / 2) / state.viewportWidth)), currentSettings.pitchRange);
                }
                return factor;
            };

            state.retrieveVerticalMotionFactor = () => {
                let factor = 0;
                let motionUsed = false;

                if (state.pointerInputActive && state.lastPointerY !== null && state.lastPointerY !== state.originalPointerY) {
                    factor = pointerMotionProfileAdapter(currentSettings.rollRange * (1 - (2 * state.lastPointerY / state.viewportHeight)), currentSettings.rollRange);
                    motionUsed = true;
                }

                if (state.sensorInputActive && state.deviceOrientationData.beta !== null && state.deviceOrientationData.gamma !== null) {
                    const tilt = state.deviceOrientationData;
                    let sensorFactor;

                    if (state.viewportLandscape) {
                        sensorFactor = motionProfileAdapter(state.viewportFlipped ? -tilt.gamma : tilt.gamma, currentSettings.rollRange);
                    } else {
                        sensorFactor = motionProfileAdapter(state.viewportFlipped ? -tilt.beta : tilt.beta, currentSettings.rollRange);
                    }

                    if (!motionUsed || (currentSettings.inputPreference === 'gyroscope')) {
                        factor = sensorFactor;
                        motionUsed = true;
                    }
                }

                if (!motionUsed) { // Fallback if no active input, use last known mouse position or default
                    factor = pointerMotionProfileAdapter(currentSettings.rollRange * (1 - (2 * (state.originalPointerY || state.viewportHeight / 2) / state.viewportHeight)), currentSettings.rollRange);
                }
                return factor;
            };
        };

        const setupVisualAppliers = () => {
            const visualMethod = visualUpdateMethods[currentSettings.visualUpdateMethod];

            state.applyElementVisuals = visualMethod.setPosition ||
                (elementData, newLeft, originalLeft, newTop, originalTop) => {
                    if (currentSettings.horizontalEffect) {
                        visualMethod.setLeft(elementData.domElement, newLeft);
                    }
                    if (currentSettings.verticalEffect) {
                        visualMethod.setTop(elementData.domElement, newTop);
                    }
                };
        };

        const reinitializeContent = (options) => {
            if (!options || !options.initialLoad) {
                revertAllVisuals();
            }
            locateParallaxElements();
            locateParallaxBackgrounds();

            // WebKit rendering bug fix from original
            if (options && options.initialLoad && /WebKit/.test(navigator.userAgent)) {
                global.addEventListener('load', () => {
                    const body = document.body;
                    const oldLeft = body.scrollLeft;
                    const oldTop = body.scrollTop;

                    body.scrollLeft = oldLeft + 1;
                    body.scrollTop = oldTop + 1;

                    body.scrollLeft = oldLeft;
                    body.scrollTop = oldTop;
                }, {
                    once: true
                });
            }
        };

        const captureViewportDimensions = () => {
            state.viewportWidth = viewportSource.innerWidth;
            state.viewportHeight = viewportSource.innerHeight;
            if (state.sensorInputActive) {
                state.viewportFlipped = (global.orientation === 180);
                state.viewportLandscape = (Math.abs(global.orientation) === 90);
            }
        };

        const identifyMobileDevice = () => {
            const browserAgent = navigator.userAgent || navigator.vendor || global.opera;
            state.mobileDetected = (/(bb\d+|meego).+mobile|android|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|playbook|plucker|pocket|psp|series(4|6)0|silk|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(browserAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(browserAgent.substr(0, 4)));
        };

        const determineInputAvailability = () => {
            state.sensorInputActive = false;
            state.webkitSensor = false;
            state.mozSensor = false;
            state.pointerInputActive = false;

            if (currentSettings.useDeviceOrientation && (state.mobileDetected || currentSettings.inputPreference === 'gyroscope')) {
                state.webkitSensor = global.DeviceOrientationEvent !== undefined;
                state.mozSensor = global.OrientationEvent !== undefined;
                state.sensorInputActive = state.webkitSensor || state.mozSensor;
            }
            if (currentSettings.usePointerInput && !state.mobileDetected) {
                state.pointerInputActive = viewportSource.onmousemove !== undefined;
            }
        };

        const locateParallaxElements = () => {
            if (state.activeComponents) {
                for (let i = state.activeComponents.length - 1; i >= 0; i--) {
                    state.activeComponents[i].domElement.dataset.visualMotionElementActive = ''; // Clear flag
                }
            }

            state.activeComponents = [];
            if (!currentSettings.elementParallax) return;

            const elementsToScan = baseElement.querySelectorAll('[data-motion-range],[data-motion-range-x],[data-motion-range-y]');
            elementsToScan.forEach(element => {
                if (element.dataset.visualMotionElementActive) {
                    return; // Already processed
                }
                element.dataset.visualMotionElementActive = 'true';

                // Save/restore original positions
                if (!element.dataset.originalMotionLeft) {
                    element.dataset.originalMotionLeft = element.style.left || window.getComputedStyle(element).left;
                    element.dataset.originalMotionTop = element.style.top || window.getComputedStyle(element).top;
                } else {
                    element.style.left = element.dataset.originalMotionLeft;
                    element.style.top = element.dataset.originalMotionTop;
                }

                state.activeComponents.push({
                    domElement: element,
                    initialLeft: element.offsetLeft,
                    initialTop: element.offsetTop,
                    movementX: parseFloat(element.dataset.motionRangeX || element.dataset.motionRange || 0),
                    movementY: parseFloat(element.dataset.motionRangeY || element.dataset.motionRange || 0),
                    width: element.offsetWidth,
                    height: element.offsetHeight
                });
            });
        };

        const locateParallaxBackgrounds = () => {
            state.activeBackgrounds = [];
            if (!currentSettings.backgroundParallax) return;

            let backgroundElements = Array.from(baseElement.querySelectorAll('[data-motion-background-range],[data-motion-background-range-x],[data-motion-background-range-y]'));

            if (baseElement.dataset.motionBackgroundRange || baseElement.dataset.motionBackgroundRangeX || baseElement.dataset.motionBackgroundRangeY) {
                backgroundElements.push(baseElement);
            }

            backgroundElements.forEach(element => {
                if (element.dataset.visualMotionBackgroundActive) {
                    return; // Already processed
                }
                element.dataset.visualMotionBackgroundActive = 'true';

                const backgroundPos = getElementBackgroundPosition(element);

                // Save/restore original background positions
                if (!element.dataset.originalBgLeft) {
                    element.dataset.originalBgLeft = backgroundPos[0];
                    element.dataset.originalBgTop = backgroundPos[1];
                } else {
                    setElementBackgroundPosition(element, element.dataset.originalBgLeft, element.dataset.originalBgTop);
                }

                state.activeBackgrounds.push({
                    domElement: element,
                    storedValueLeft: backgroundPos[0],
                    storedValueTop: backgroundPos[1],
                    initialBgX: parseInt(backgroundPos[0], 10) || 0,
                    initialBgY: parseInt(backgroundPos[1], 10) || 0,
                    initialOffsetX: element.offsetLeft,
                    initialOffsetY: element.offsetTop,
                    movementX: parseFloat(element.dataset.motionBackgroundRangeX || element.dataset.motionBackgroundRange || 0),
                    movementY: parseFloat(element.dataset.motionBackgroundRangeY || element.dataset.motionBackgroundRange || 0)
                });
            });
        };

        const revertAllVisuals = () => {
            let item;

            for (let i = state.activeComponents.length - 1; i >= 0; i--) {
                item = state.activeComponents[i];
                const originalLeft = item.domElement.dataset.originalMotionLeft;
                const originalTop = item.domElement.dataset.originalMotionTop;

                // Use the setter for consistency, even if it's just setting original values
                state.applyElementVisuals(item, originalLeft, originalLeft, originalTop, originalTop);

                item.domElement.dataset.originalMotionLeft = '';
                item.domElement.dataset.originalMotionTop = '';
                item.domElement.dataset.visualMotionElementActive = '';
            }

            for (let i = state.activeBackgrounds.length - 1; i >= 0; i--) {
                item = state.activeBackgrounds[i];
                item.domElement.dataset.originalBgLeft = '';
                item.domElement.dataset.originalBgTop = '';
                item.domElement.dataset.visualMotionBackgroundActive = '';

                setElementBackgroundPosition(item.domElement, item.storedValueLeft, item.storedValueTop);
            }
        };

        const processRawSensorInput = (event) => {
            if (!state.sensorInputActive) return;

            let currentBeta = event.beta;
            let currentGamma = event.gamma;

            // Counteract Android bugs where values jump to 270
            if (currentBeta > 90) currentBeta -= 180;
            if (currentGamma > 180) currentGamma -= 360;

            if (state.initialPitch === null && currentBeta !== null) {
                state.initialPitch = currentBeta;
                if (state.sensorInputActive && currentSettings.inputPreference === 'gyroscope') {
                    state.pointerInputActive = false;
                    if (state.pointerInputActive) viewportSource.removeEventListener('mousemove', handleMouseCursorMovement);
                }
            }

            if (state.initialRoll === null && currentGamma !== null) {
                state.initialRoll = currentGamma;
                if (state.sensorInputActive && currentSettings.inputPreference === 'gyroscope') {
                    state.pointerInputActive = false;
                    if (state.pointerInputActive) viewportSource.removeEventListener('mousemove', handleMouseCursorMovement);
                }
            }

            if (currentSettings.autoAdjustBase && state.initialRoll !== null && state.initialPitch !== null) {
                state.initialRoll = smoothValue(currentGamma, state.initialRoll, currentSettings.baseAdjustmentAlpha);
                state.initialPitch = smoothValue(currentBeta, state.initialPitch, currentSettings.baseAdjustmentAlpha);
            }

            state.deviceOrientationData.beta = smoothValue(currentBeta - state.initialPitch, state.deviceOrientationData.beta, currentSettings.orientationSmoothness);
            state.deviceOrientationData.gamma = smoothValue(currentGamma - state.initialRoll, state.deviceOrientationData.gamma, currentSettings.orientationSmoothness);
        };

        const handleWebkitOrientation = (event) => {
            // Webkit `deviceorientation` event has alpha, beta, gamma
            processRawSensorInput(event);
        };

        const handleMozillaOrientation = (event) => {
            // Mozilla `MozOrientation` event has x, y, z
            // Map x, y, z to beta, gamma (approximate mapping)
            processRawSensorInput({
                beta: event.x * 90, // Assuming x relates to pitch
                gamma: event.y * 180 // Assuming y relates to roll
            });
        };

        const handleMouseCursorMovement = (event) => {
            if (!state.pointerInputActive) return;

            if (state.lastPointerX === null) {
                state.originalPointerX = event.clientX;
                state.originalPointerY = event.clientY;
                if (currentSettings.inputPreference === 'mouse') {
                    state.sensorInputActive = false;
                    if (state.webkitSensor) global.removeEventListener('deviceorientation', handleWebkitOrientation, false);
                    if (state.mozSensor) global.removeEventListener('MozOrientation', handleMozillaOrientation, false);
                }
            }

            state.lastPointerX = event.clientX;
            state.lastPointerY = event.clientY;
        };

        const registerWindowEvents = () => {
            viewportSource.addEventListener('resize', captureViewportDimensions);
            viewportSource.addEventListener('orientationchange', captureViewportDimensions); // For mobile
        };

        const teardownEventObservers = () => {
            if (state.pointerInputActive) viewportSource.removeEventListener('mousemove', handleMouseCursorMovement);
            if (state.webkitSensor) global.removeEventListener('deviceorientation', handleWebkitOrientation, false);
            if (state.mozSensor) global.removeEventListener('MozOrientation', handleMozillaOrientation, false);

            viewportSource.removeEventListener('resize', captureViewportDimensions);
            viewportSource.removeEventListener('orientationchange', captureViewportDimensions);

            if (state.animationFrameId) {
                global.cancelAnimationFrame(state.animationFrameId);
                state.animationFrameId = null;
                state.isAnimating = false;
            }
        };

        const performFrameUpdate = () => {
            if (!state.isAnimating) return;

            const horizontalFactor = state.retrieveHorizontalMotionFactor();
            const verticalFactor = state.retrieveVerticalMotionFactor();

            // Update elements
            state.activeComponents.forEach(item => {
                const newLeft = item.initialLeft + (item.movementX * horizontalFactor);
                const newTop = item.initialTop + (item.movementY * verticalFactor);
                state.applyElementVisuals(item, newLeft, item.initialLeft, newTop, item.initialTop);
            });

            // Update backgrounds
            state.activeBackgrounds.forEach(item => {
                const newBgX = item.initialBgX + (item.movementX * horizontalFactor);
                const newBgY = item.initialBgY + (item.movementY * verticalFactor);
                setElementBackgroundPosition(item.domElement, `${newBgX}px`, `${newBgY}px`);
            });

            state.animationFrameId = scheduleAnimationFrame(performFrameUpdate);
        };

        const initiateAnimationLoop = () => {
            if (!state.isAnimating) {
                state.isAnimating = true;
                state.animationFrameId = scheduleAnimationFrame(performFrameUpdate);
            }
        };

        // --- Public Interface ---

        const initializeModule = () => {
            establishBaseElements();
            setupMotionRetrievers();
            setupVisualAppliers();
            identifyMobileDevice();
            determineInputAvailability();
            captureViewportDimensions();
            registerWindowEvents();

            if (state.pointerInputActive) {
                viewportSource.addEventListener('mousemove', handleMouseCursorMovement);
            }
            if (state.webkitSensor) {
                global.addEventListener('deviceorientation', handleWebkitOrientation, false);
            } else if (state.mozSensor) {
                global.addEventListener('MozOrientation', handleMozillaOrientation, false);
            }

            reinitializeContent({
                initialLoad: true
            });
            initiateAnimationLoop();
        };

        const terminateController = () => {
            revertAllVisuals();
            teardownEventObservers();
            // Optionally, clear internal state variables
            state = {};
        };

        const updateContent = () => {
            reinitializeContent();
        };

        return {
            start: initializeModule,
            stop: terminateController,
            refresh: updateContent
        };
    }

    // --- Positioning Methods for visualUpdateMethod option ---
    const visualUpdateMethods = {
        position: {
            setLeft: (element, left) => {
                element.style.left = `${left}px`;
            },
            setTop: (element, top) => {
                element.style.top = `${top}px`;
            }
        },
        transform: {
            setPosition: (element, left, originalLeft, top, originalTop) => {
                element.style[cssTransformProperty] = `translate3d(${left - originalLeft}px, ${top - originalTop}px, 0)`;
            }
        }
    };

    // Expose the factory function globally
    global[moduleIdentifier] = ParallaxMotionController;

})(window);