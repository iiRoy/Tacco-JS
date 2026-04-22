(function (docObj, winObj) {
    'use strict';

    // --- Core Utility Functions ---

    // `stylePrefixer` determines the vendor-prefixed version of a CSS property.
    // Inspired by Modernizr, it caches results for efficiency.
    const stylePrefixer = (function () {
        const tempStyleElem = docObj.createElement('div').style;
        const vendorPrefixes = ['Webkit', 'Moz', 'O', 'ms', 'Khtml']; // Common browser prefixes
        const prefixCache = {}; // Stores previously computed prefixed properties

        return function (cssProperty) {
            if (typeof cssProperty !== 'string' || cssProperty.trim() === '') {
                console.warn('Invalid CSS property provided to stylePrefixer:', cssProperty);
                return null;
            }

            if (prefixCache[cssProperty] === undefined) { // Check if not in cache
                const capitalizedProp = cssProperty.charAt(0).toUpperCase() + cssProperty.slice(1);
                const possibleProps = [cssProperty, ...vendorPrefixes.map(p => p + capitalizedProp)].join(' ').split(' ');

                let foundPrefix = null;
                for (let i = 0; i < possibleProps.length; i++) {
                    const currentProp = possibleProps[i];
                    if (tempStyleElem[currentProp] !== undefined) {
                        foundPrefix = currentProp;
                        break;
                    }
                }
                prefixCache[cssProperty] = foundPrefix; // Store result in cache
            }
            return prefixCache[cssProperty];
        };
    })();

    // `convertToArray` transforms array-like objects (e.g., NodeList) into genuine Arrays.
    const convertToArray = function (collection) {
        if (!collection || typeof collection.length === 'undefined') {
            return []; // Return empty array for invalid input
        }
        return Array.from(collection);
    };

    // `applyStyles` sets multiple CSS properties on a given DOM element,
    // automatically handling vendor prefixes.
    const applyStyles = function (targetElement, styleProps) {
        if (!targetElement || !(targetElement instanceof Element)) {
            console.warn('Attempted to apply styles to an invalid DOM element.');
            return targetElement;
        }

        for (const propKey in styleProps) {
            if (Object.prototype.hasOwnProperty.call(styleProps, propKey)) {
                const prefixedKey = stylePrefixer(propKey);
                if (prefixedKey !== null) {
                    targetElement.style[prefixedKey] = styleProps[propKey];
                }
            }
        }
        return targetElement;
    };

    // `parseNum` attempts to convert a value to a number.
    // Returns `defaultVal` if conversion fails.
    const parseNum = function (inputVal, defaultVal = 0) {
        const num = Number(inputVal);
        return isNaN(num) ? defaultVal : num;
    };

    // `getElemById` retrieves a DOM element using its ID.
    const getElemById = function (elementId) {
        if (typeof elementId !== 'string' || elementId.trim() === '') {
            console.warn('Attempted to get element with invalid ID:', elementId);
            return null;
        }
        return docObj.getElementById(elementId);
    };

    // `selectOne` finds the first element matching a CSS selector within a specific context or the entire document.
    const selectOne = function (cssSelector, searchContext = docObj) {
        if (!searchContext || !(searchContext instanceof Element || searchContext instanceof HTMLDocument)) {
            console.warn('Invalid search context provided for selectOne:', searchContext);
            return null;
        }
        return searchContext.querySelector(cssSelector);
    };

    // `selectAll` retrieves all elements matching a CSS selector, returning them as an Array.
    const selectAll = function (cssSelector, searchContext = docObj) {
        if (!searchContext || !(searchContext instanceof Element || searchContext instanceof HTMLDocument)) {
            console.warn('Invalid search context provided for selectAll:', searchContext);
            return [];
        }
        return convertToArray(searchContext.querySelectorAll(cssSelector));
    };

    // `dispatchCustomEvent` creates and dispatches a custom DOM event.
    const dispatchCustomEvent = function (targetElement, eventIdentifier, eventData) {
        if (!targetElement || !(targetElement instanceof Element)) {
            console.warn('Attempted to dispatch event on an invalid DOM element.');
            return;
        }
        const domEvent = new CustomEvent(eventIdentifier, {
            detail: eventData,
            bubbles: true,
            cancelable: true
        });
        targetElement.dispatchEvent(domEvent);
    };

    // --- Transform String Builders ---

    const buildTranslateTransform = function (transformCoords) {
        return ` translate3d(${transformCoords.x}px,${transformCoords.y}px,${transformCoords.z}px) `;
    };

    const buildRotateTransform = function (rotationAngles, reverseOrder = false) {
        const rotXStr = ` rotateX(${rotationAngles.x}deg) `;
        const rotYStr = ` rotateY(${rotationAngles.y}deg) `;
        const rotZStr = ` rotateZ(${rotationAngles.z}deg) `;
        return reverseOrder ? rotZStr + rotYStr + rotXStr : rotXStr + rotYStr + rotZStr;
    };

    const buildScaleTransform = function (scaleFactor) {
        return ` scale(${scaleFactor}) `;
    };

    const buildPerspectiveTransform = function (perspectiveDepth) {
        return ` perspective(${perspectiveDepth}px) `;
    };

    // --- URL and Window Utilities ---

    // `retrieveElementFromUrlHash` extracts an ID from the URL hash and finds the corresponding element.
    const retrieveElementFromUrlHash = function () {
        const hashSegment = winObj.location.hash.replace(/^#\/?/, "");
        return hashSegment ? getElemById(hashSegment) : null;
    };

    // `calculateViewportScale` computes the scaling factor based on window dimensions and presentation settings.
    const calculateViewportScale = function (presentationConfig) {
        const heightRatio = winObj.innerHeight / presentationConfig.viewportHeight;
        const widthRatio = winObj.innerWidth / presentationConfig.viewportWidth;
        let computedScale = Math.min(heightRatio, widthRatio); // Use Math.min for conciseness

        // Apply max/min scale constraints
        if (presentationConfig.maxZoomLevel && computedScale > presentationConfig.maxZoomLevel) {
            computedScale = presentationConfig.maxZoomLevel;
        }
        if (presentationConfig.minZoomLevel && computedScale < presentationConfig.minZoomLevel) {
            computedScale = presentationConfig.minZoomLevel;
        }

        return computedScale;
    };

    // --- Browser Support Check ---
    const mainDocumentBody = docObj.body;
    const userDeviceAgent = navigator.userAgent.toLowerCase();

    // Check for essential CSS 3D support, ClassList, Dataset APIs, and blacklist known problematic mobile devices.
    const isImpressSupported =
        (stylePrefixer("perspective") !== null) &&
        (mainDocumentBody && mainDocumentBody.classList && mainDocumentBody.dataset) &&
        (userDeviceAgent.indexOf('iphone') === -1 && userDeviceAgent.indexOf('ipod') === -1 && userDeviceAgent.indexOf('android') === -1); // Simpler combined check

    if (!isImpressSupported) {
        mainDocumentBody.className += " presentation-unsupported "; // Old school class addition for maximum compatibility
        console.warn("Presentation framework not fully supported by this browser/device.");
    } else {
        mainDocumentBody.classList.remove("presentation-unsupported");
        mainDocumentBody.classList.add("presentation-enabled");
    }

    // --- Global State and Configuration ---

    // `instanceRegistry` stores references to all initialized presentation instances.
    const instanceRegistry = {};

    // Default configuration values for the presentation.
    const defaultSettings = {
        viewportWidth: 1024,
        viewportHeight: 768,
        maxZoomLevel: 1,
        minZoomLevel: 0,
        viewPerspective: 1000,
        animationDuration: 1000
    };

    // A no-operation function for unsupported environments or dummy APIs.
    const noOp = function () { return false; };

    // --- Main Presentation API ---

    // `presentationCore` is the main entry point, initializing and returning the API.
    winObj.presentationCore = function (containerId = "impress") { // Default to "impress" if no ID provided

        // If core features are not supported, return a minimal dummy API.
        if (!isImpressSupported) {
            console.log("Returning dummy API due to unsupported browser features.");
            return {
                initializePresentation: noOp,
                navigateToStep: noOp,
                previousStep: noOp,
                nextStep: noOp
            };
        }

        // Validate container ID
        if (typeof containerId !== 'string' || containerId.trim() === '') {
            console.error('Invalid container ID provided to presentationCore.');
            return null;
        }

        // Return existing instance if already initialized.
        const instanceKey = `presentation-instance-${containerId}`;
        if (instanceRegistry[instanceKey]) {
            return instanceRegistry[instanceKey];
        }

        // --- Internal State Variables ---
        let presentationStepsData = {}; // Stores computed data for each step
        let currentActiveStep = null; // The currently visible step element
        let currentVisualState = null; // Current transform state of the presentation
        let allPresentationSteps = []; // Array of all step DOM elements
        let presentationConfig = {}; // Merged configuration for this instance
        let currentWindowScale = 1; // Dynamic scaling factor of the viewport
        let isInitialized = false; // Flag to track initialization status
        let isTransitioning = false; // Flag to prevent rapid navigation during animation

        // DOM elements for the presentation
        const mainContainerElement = getElemById(containerId);
        if (!mainContainerElement) {
            console.error(`Presentation container element with ID "${containerId}" not found.`);
            return null; // Cannot proceed without the root element
        }
        const drawingCanvasElement = docObj.createElement("div"); // The 'canvas' element wraps steps for transforms

        // --- Step Event Management ---

        let lastInteractedStep = null; // Tracks the last step that had focus

        // `handleStepEntry` triggers a custom event when a step becomes active.
        const handleStepEntry = function (targetStepElement) {
            if (lastInteractedStep !== targetStepElement) {
                clearTimeout(entryTimeoutHandle); // Clear any pending exit events for the previous step
                dispatchCustomEvent(targetStepElement, "presentation:stepentered");
                lastInteractedStep = targetStepElement;
                console.log(`Step entered: ${targetStepElement.id}`);
            }
        };

        // `handleStepExit` triggers a custom event when a step is left.
        // A timeout is used to ensure the event fires after the transition starts.
        let entryTimeoutHandle = null;
        const handleStepExit = function (targetStepElement) {
            if (lastInteractedStep === targetStepElement) {
                dispatchCustomEvent(targetStepElement, "presentation:stepexited");
                lastInteractedStep = null;
                console.log(`Step exited: ${targetStepElement.id}`);
            }
        };

        // --- Step Initialization ---

        // `initializeSingleStep` reads data attributes from a step element and sets its initial styles.
        const initializeSingleStep = function (stepDomElement, stepIndex) {
            const elementDataSet = stepDomElement.dataset;
            const stepData = {
                translate: {
                    x: parseNum(elementDataSet.x),
                    y: parseNum(elementDataSet.y),
                    z: parseNum(elementDataSet.z)
                },
                rotate: {
                    x: parseNum(elementDataSet.rotateX),
                    y: parseNum(elementDataSet.rotateY),
                    z: parseNum(elementDataSet.rotateZ || elementDataSet.rotate) // Support 'rotate' as alias for 'rotateZ'
                },
                scale: parseNum(elementDataSet.scale, 1),
                domElement: stepDomElement
            };

            if (!stepDomElement.id) {
                stepDomElement.id = `step-auto-${stepIndex + 1}`; // Auto-generate ID if missing
            }

            presentationStepsData[stepDomElement.id] = stepData;

            applyStyles(stepDomElement, {
                position: "absolute",
                transform: `translate(-50%,-50%) ${buildTranslateTransform(stepData.translate)}${buildRotateTransform(stepData.rotate)}${buildScaleTransform(stepData.scale)}`,
                transformStyle: "preserve-3d"
            });
            console.debug(`Initialized step: ${stepDomElement.id}`);
        };

        // --- Core Initialization Function ---

        // `initializePresentation` sets up the entire presentation environment.
        const initializePresentation = function () {
            if (isInitialized) {
                console.log("Presentation already initialized. Skipping.");
                return;
            }

            console.log("Starting presentation initialization...");

            // Set up viewport meta tag for mobile responsiveness.
            let viewportMetaTag = selectOne("meta[name='viewport']");
            if (!viewportMetaTag) {
                viewportMetaTag = docObj.createElement("meta");
                viewportMetaTag.name = 'viewport';
                docObj.head.appendChild(viewportMetaTag);
            }
            viewportMetaTag.content = "width=device-width, minimum-scale=1, maximum-scale=1, user-scalable=no";

            // Merge default settings with user-defined data attributes from the root element.
            const containerDataSet = mainContainerElement.dataset;
            presentationConfig = {
                ...defaultSettings, // Start with defaults
                viewportWidth: parseNum(containerDataSet.width, defaultSettings.viewportWidth),
                viewportHeight: parseNum(containerDataSet.height, defaultSettings.viewportHeight),
                maxZoomLevel: parseNum(containerDataSet.maxScale, defaultSettings.maxZoomLevel),
                minZoomLevel: parseNum(containerDataSet.minScale, defaultSettings.minZoomLevel),
                viewPerspective: parseNum(containerDataSet.perspective, defaultSettings.viewPerspective),
                animationDuration: parseNum(containerDataSet.transitionDuration, defaultSettings.animationDuration)
            };

            currentWindowScale = calculateViewportScale(presentationConfig);

            // Move all child nodes of the root into the canvas element.
            convertToArray(mainContainerElement.children).forEach(child => {
                drawingCanvasElement.appendChild(child);
            });
            mainContainerElement.appendChild(drawingCanvasElement);

            // Apply base styles to document and body.
            docObj.documentElement.style.height = "100%";
            applyStyles(mainDocumentBody, {
                height: "100%",
                overflow: "hidden" // Prevent scrolling
            });

            const baseTransformStyles = {
                position: "absolute",
                transformOrigin: "top left",
                transition: "all 0s ease-in-out", // Initial transition duration can be 0
                transformStyle: "preserve-3d"
            };

            applyStyles(mainContainerElement, baseTransformStyles);
            applyStyles(mainContainerElement, {
                top: "50%",
                left: "50%",
                transform: `${buildPerspectiveTransform(presentationConfig.viewPerspective / currentWindowScale)}${buildScaleTransform(currentWindowScale)}`
            });
            applyStyles(drawingCanvasElement, baseTransformStyles); // Canvas also needs base styles

            mainDocumentBody.classList.replace("presentation-unsupported", "presentation-enabled"); // Safely replace class

            // Find and initialize all step elements.
            allPresentationSteps = selectAll(".step", mainContainerElement);
            if (allPresentationSteps.length === 0) {
                console.warn("No steps found within the presentation container.");
                return; // Cannot proceed without steps
            }
            allPresentationSteps.forEach(initializeSingleStep);

            // Set initial state for the presentation.
            currentVisualState = {
                translate: { x: 0, y: 0, z: 0 },
                rotate: { x: 0, y: 0, z: 0 },
                scale: 1,
                lastUpdate: Date.now() // Track when state was last updated
            };

            // Add window resize listener to dynamically adjust scale.
            winObj.addEventListener('resize', () => {
                currentWindowScale = calculateViewportScale(presentationConfig);
                applyStyles(mainContainerElement, {
                    transform: `${buildPerspectiveTransform(presentationConfig.viewPerspective / currentWindowScale)}${buildScaleTransform(currentWindowScale)}`
                });
                console.log(`Window resized, new scale: ${currentWindowScale}`);
                if (currentActiveStep) {
                    // Re-apply current step to ensure correct scaling after resize
                    navigateToStep(currentActiveStep, 0);
                }
            });

            isInitialized = true;
            dispatchCustomEvent(mainContainerElement, "presentation:initialized", { api: instanceRegistry[instanceKey] });
            console.log("Presentation initialization complete.");
        };

        // --- Step Resolution ---

        // `resolveStepReference` converts various inputs (index, ID, element) into a valid step element.
        const resolveStepReference = function (stepReference) {
            let resolvedElement = null;

            if (typeof stepReference === "number") {
                // Handle negative indices (from end of array)
                const effectiveIndex = stepReference < 0 ? allPresentationSteps.length + stepReference : stepReference;
                resolvedElement = allPresentationSteps[effectiveIndex];
            } else if (typeof stepReference === "string") {
                resolvedElement = getElemById(stepReference);
            } else if (stepReference instanceof Element && stepReference.classList.contains('step')) {
                resolvedElement = stepReference; // Already a valid step element
            }

            // Ensure the resolved element is a valid, initialized step.
            return (resolvedElement && resolvedElement.id && presentationStepsData[resolvedElement.id]) ? resolvedElement : null;
        };

        // --- Navigation Function ---

        // `navigateToStep` transitions the presentation to the specified step.
        const navigateToStep = function (targetStepRef, animationDurationMs) {
            if (!isInitialized) {
                console.warn("Presentation not initialized. Cannot navigate.");
                return false;
            }
            if (isTransitioning) {
                console.log("Transition in progress, skipping navigation request.");
                return false;
            }

            const destinationStepElement = resolveStepReference(targetStepRef);
            if (!destinationStepElement) {
                console.warn("Invalid step reference provided for navigation:", targetStepRef);
                return false;
            }

            // Scroll window to top to prevent browser scroll interference.
            winObj.scrollTo(0, 0);

            const destinationStepData = presentationStepsData[destinationStepElement.id];
            if (!destinationStepData) {
                console.error(`Data for step ${destinationStepElement.id} not found.`);
                return false;
            }

            // Update active classes
            if (currentActiveStep) {
                currentActiveStep.classList.remove("active");
                mainDocumentBody.classList.remove(`presentation-on-${currentActiveStep.id}`);
                handleStepExit(currentActiveStep); // Trigger exit event
            }
            destinationStepElement.classList.add("active");
            mainDocumentBody.classList.add(`presentation-on-${destinationStepElement.id}`);

            // Calculate the target transform state for the canvas.
            const targetCanvasState = {
                rotate: {
                    x: -destinationStepData.rotate.x,
                    y: -destinationStepData.rotate.y,
                    z: -destinationStepData.rotate.z
                },
                translate: {
                    x: -destinationStepData.translate.x,
                    y: -destinationStepData.translate.y,
                    z: -destinationStepData.translate.z
                },
                scale: 1 / destinationStepData.scale
            };

            // Determine if we are zooming in or out for staggered transitions.
            const isZoomingIn = targetCanvasState.scale >= currentVisualState.scale;

            const actualDuration = parseNum(animationDurationMs, presentationConfig.animationDuration);
            const halfDuration = actualDuration / 2; // For staggered transitions

            // Recompute window scale if navigating to the same step (likely due to window resize).
            if (destinationStepElement === currentActiveStep) {
                currentWindowScale = calculateViewportScale(presentationConfig);
            }

            const effectiveTargetScale = targetCanvasState.scale * currentWindowScale;

            isTransitioning = true; // Set transition flag

            // Apply transforms to root and canvas elements with staggered delays.
            // Root handles perspective and overall scaling.
            applyStyles(mainContainerElement, {
                transition: `all ${actualDuration}ms ease-in-out`,
                transform: `${buildPerspectiveTransform(presentationConfig.viewPerspective / effectiveTargetScale)}${buildScaleTransform(effectiveTargetScale)}`
            });

            // Canvas handles translation and rotation.
            applyStyles(drawingCanvasElement, {
                transition: `all ${actualDuration}ms ease-in-out`,
                transform: `${buildRotateTransform(targetCanvasState.rotate, !isZoomingIn)}${buildTranslateTransform(targetCanvasState.translate)}${buildRotateTransform(targetCanvasState.rotate, isZoomingIn)}`
            });

            // Update current state after CSS transition starts
            currentVisualState = { ...targetCanvasState, lastUpdate: Date.now() };
            currentActiveStep = destinationStepElement;

            // Use a timeout to trigger the `stepentered` event after the transition is visually complete.
            entryTimeoutHandle = setTimeout(() => {
                handleStepEntry(destinationStepElement);
                isTransitioning = false; // Reset transition flag
                console.log(`Navigation to ${destinationStepElement.id} complete.`);
            }, actualDuration);

            return true;
        };

        // --- Navigation API ---
        const api = {
            initializePresentation: initializePresentation,
            navigateToStep: navigateToStep,
            previousStep: function () {
                const currentIndex = allPresentationSteps.indexOf(currentActiveStep);
                if (currentIndex > 0) {
                    navigateToStep(allPresentationSteps[currentIndex - 1]);
                } else {
                    console.log("Already at the first step.");
                }
            },
            nextStep: function () {
                const currentIndex = allPresentationSteps.indexOf(currentActiveStep);
                if (currentIndex < allPresentationSteps.length - 1) {
                    navigateToStep(allPresentationSteps[currentIndex + 1]);
                } else {
                    console.log("Already at the last step.");
                }
            },
            getContainerElement: () => mainContainerElement,
            getCurrentStep: () => currentActiveStep,
            getStepData: () => ({ ...presentationStepsData }),
            getConfig: () => ({ ...presentationConfig })
        };

        // Store this instance in the global registry.
        instanceRegistry[instanceKey] = api;

        return api;
    };

    // --- Auto-initialization on document load ---
    docObj.addEventListener("DOMContentLoaded", function () {
        const defaultPresentation = winObj.presentationCore(); // Initialize default instance
        if (defaultPresentation) {
            defaultPresentation.initializePresentation();
            // Navigate to the first step or a step specified in the URL hash
            const initialStep = retrieveElementFromUrlHash() || defaultPresentation.getStepData()[Object.keys(defaultPresentation.getStepData())[0]].domElement;
            if (initialStep) {
                defaultPresentation.navigateToStep(initialStep, 0); // No animation for initial load
            }
        }
    });

})(document, window);