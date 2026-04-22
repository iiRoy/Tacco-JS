(function (documentContext, globalScope) {
    'use strict';

    // Helper utilities - completely renamed and restructured
    const styleProcessor = (function () {
        const testArea = documentContext.createElement('div').style;
        const knownPrefixes = ['Webkit', 'Moz', 'O', 'ms', 'Khtml'];
        const prefixCache = new Map(); // Using Map instead of plain object

        return function (propertyKey) {
            if (prefixCache.has(propertyKey)) {
                return prefixCache.get(propertyKey);
            }

            const capitalizedKey = propertyKey.charAt(0).toUpperCase() + propertyKey.slice(1);
            const potentialProps = [propertyKey, ...knownPrefixes.map(p => p + capitalizedKey)];

            let matchedProperty = null;
            for (const candidate of potentialProps) { // Using for...of
                if (testArea[candidate] !== undefined) {
                    matchedProperty = candidate;
                    break;
                }
            }
            prefixCache.set(propertyKey, matchedProperty);
            return matchedProperty;
        };
    })();

    const collectionToArray = (iterableInput) => Array.from(iterableInput); // Using Array.from

    const applyElementStyles = (targetElement, styleMap) => {
        for (const [key, value] of Object.entries(styleMap)) { // Using Object.entries
            const prefixedKey = styleProcessor(key);
            if (prefixedKey !== null) {
                targetElement.style[prefixedKey] = value;
            }
        }
        return targetElement;
    };

    const convertToNumber = (valueInput, fallbackValue = 0) => {
        const parsedValue = Number(valueInput);
        return Number.isNaN(parsedValue) ? fallbackValue : parsedValue; // Using Number.isNaN
    };

    const obtainElementById = (elementIdentifier) => documentContext.querySelector(`#${elementIdentifier}`); // Using querySelector for ID

    const obtainSingleElement = (querySelector, searchContext = documentContext) => searchContext.querySelector(querySelector);

    const obtainMultipleElements = (querySelector, searchContext = documentContext) => collectionToArray(searchContext.querySelectorAll(querySelector));

    const dispatchCustomEvent = (targetElement, eventName, eventDetail) => {
        const eventInstance = new CustomEvent(eventName, { // Using new CustomEvent
            bubbles: true,
            cancelable: true,
            detail: eventDetail
        });
        targetElement.dispatchEvent(eventInstance);
    };

    // Consolidated transform string generation
    const generateTransformString = (transformData) => {
        const { position, rotation, scaling, viewingAngle } = transformData;
        let transformParts = [];

        if (viewingAngle !== undefined) {
            transformParts.push(`perspective(${viewingAngle}px)`);
        }
        if (position) {
            transformParts.push(`translate3d(${position.x}px,${position.y}px,${position.z}px)`);
        }
        if (rotation) {
            // Default order X Y Z
            transformParts.push(`rotateX(${rotation.x}deg)`);
            transformParts.push(`rotateY(${rotation.y}deg)`);
            transformParts.push(`rotateZ(${rotation.z}deg)`);
        }
        if (scaling !== undefined) {
            transformParts.push(`scale(${scaling})`);
        }
        return transformParts.join(' ');
    };

    const extractHashTarget = () => {
        const hashFragment = globalScope.location.hash;
        if (!hashFragment) return null;
        const cleanedHash = hashFragment.startsWith('#/') ? hashFragment.slice(2) : hashFragment.slice(1);
        return obtainElementById(cleanedHash);
    };

    const assessViewportScaling = (configurationOptions) => {
        const verticalRatio = globalScope.innerHeight / configurationOptions.layoutHeight;
        const horizontalRatio = globalScope.innerWidth / configurationOptions.layoutWidth;
        let currentScale = Math.min(verticalRatio, horizontalRatio); // Using Math.min

        if (configurationOptions.maximumScale && currentScale > configurationOptions.maximumScale) {
            currentScale = configurationOptions.maximumScale;
        }
        if (configurationOptions.minimumScale && currentScale < configurationOptions.minimumScale) {
            currentScale = configurationOptions.minimumScale;
        }
        return currentScale;
    };

    // Browser capability verification
    const docBody = documentContext.body;
    const userAgentInfo = globalScope.navigator.userAgent.toLowerCase();
    const isBrowserCapable = (
        styleProcessor("perspective") !== null && // Checks for 3D transforms
        docBody.classList && // Checks for classList API
        docBody.dataset && // Checks for dataset API
        !['iphone', 'ipod', 'android'].some(device => userAgentInfo.includes(device)) // Using includes and some
    );

    if (!isBrowserCapable) {
        docBody.className += " presentation-unsupported "; // Append class as classList might not exist
    } else {
        docBody.classList.remove("presentation-unsupported");
        docBody.classList.add("presentation-supported");
    }

    // Global registry and default settings
    const presentationInstanceRegistry = new Map(); // Using Map for instances

    const defaultPresentationSettings = Object.freeze({ // Using Object.freeze
        layoutWidth: 1024,
        layoutHeight: 768,
        maximumScale: 1,
        minimumScale: 0,
        viewingPerspective: 1000,
        animationDuration: 1000
    });

    const noOperation = () => false; // Renamed empty function

    // Presentation API factory function
    const presentationSetup = (containerId = "impress") => {

        if (!isBrowserCapable) {
            return {
                initialize: noOperation,
                advanceTo: noOperation,
                previousSlide: noOperation,
                nextSlide: noOperation
            };
        }

        const instanceKey = `presentation-${containerId}`;
        if (presentationInstanceRegistry.has(instanceKey)) {
            return presentationInstanceRegistry.get(instanceKey);
        }

        const slideDataStore = new Map(); // Using Map for step data
        let currentFocusSlideElement = null;
        let currentDisplayState = null;
        let allSlideElements = null;
        let presentationConfiguration = null;
        let currentViewportScale = null;
        const mainContainerElement = obtainElementById(containerId);
        const displaySurfaceElement = documentContext.createElement("section"); // Renamed 'canvas' to 'section'
        let isSystemOperational = false;
        let lastVisitedSlide = null;

        const handleSlideActivation = (slideElement) => {
            if (lastVisitedSlide !== slideElement) {
                dispatchCustomEvent(slideElement, "presentation:slideactivated");
                lastVisitedSlide = slideElement;
            }
        };

        const handleSlideDeactivation = (slideElement) => {
            if (lastVisitedSlide === slideElement) {
                dispatchCustomEvent(slideElement, "presentation:slidedeactivated");
                lastVisitedSlide = null;
            }
        };

        const configureSlideElement = (domElement, elementIndex) => {
            const elementDataset = domElement.dataset;
            const slideAttributes = {
                position: {
                    x: convertToNumber(elementDataset.x),
                    y: convertToNumber(elementDataset.y),
                    z: convertToNumber(elementDataset.z)
                },
                rotation: {
                    x: convertToNumber(elementDataset.rotateX),
                    y: convertToNumber(elementDataset.rotateY),
                    z: convertToNumber(elementDataset.rotateZ || elementDataset.rotate)
                },
                scaling: convertToNumber(elementDataset.scale, 1),
                domReference: domElement
            };

            if (!domElement.id) {
                domElement.id = `slide-${elementIndex + 1}`;
            }

            slideDataStore.set(`slide-${domElement.id}`, slideAttributes); // Using Map.set with a different key format

            applyElementStyles(domElement, {
                position: "absolute",
                transform: `translate(-50%,-50%) ${generateTransformString({
                    position: slideAttributes.position,
                    rotation: slideAttributes.rotation,
                    scaling: slideAttributes.scaling
                })}`,
                transformStyle: "preserve-3d"
            });
        };

        const initializePresentationSystem = () => {
            if (isSystemOperational) { return; }

            const viewportMeta = obtainSingleElement("meta[name='viewport']") || documentContext.createElement("meta");
            viewportMeta.content = "width=device-width, minimum-scale=1, maximum-scale=1, user-scalable=no";
            if (viewportMeta.parentNode !== documentContext.head) {
                viewportMeta.name = 'viewport';
                documentContext.head.appendChild(viewportMeta);
            }

            const rootDataAttributes = mainContainerElement.dataset;
            presentationConfiguration = Object.fromEntries( // Using Object.fromEntries
                Object.entries(defaultPresentationSettings).map(([key, defaultValue]) => {
                    const datasetKey = Object.keys(rootDataAttributes).find(dk => dk.toLowerCase() === key.toLowerCase());
                    return [key, convertToNumber(rootDataAttributes[datasetKey], defaultValue)];
                })
            );

            currentViewportScale = assessViewportScaling(presentationConfiguration);

            collectionToArray(mainContainerElement.children).forEach(childNode => { // Iterating children directly
                displaySurfaceElement.appendChild(childNode);
            });
            mainContainerElement.appendChild(displaySurfaceElement);

            documentContext.documentElement.style.height = "100%";

            applyElementStyles(docBody, {
                height: "100%",
                overflow: "hidden"
            });

            const baseElementStyles = {
                position: "absolute",
                transformOrigin: "top left",
                transition: "all 0s ease-in-out",
                transformStyle: "preserve-3d"
            };

            applyElementStyles(mainContainerElement, baseElementStyles);
            applyElementStyles(mainContainerElement, {
                top: "50%",
                left: "50%",
                transform: generateTransformString({
                    viewingAngle: presentationConfiguration.viewingPerspective / currentViewportScale,
                    scaling: currentViewportScale
                })
            });
            applyElementStyles(displaySurfaceElement, baseElementStyles);

            docBody.classList.remove("presentation-disabled");
            docBody.classList.add("presentation-enabled");

            allSlideElements = obtainMultipleElements(".step", mainContainerElement);
            allSlideElements.forEach(configureSlideElement);

            currentDisplayState = {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scaling: 1
            };

            isSystemOperational = true;

            dispatchCustomEvent(mainContainerElement, "presentation:initialized", { api: presentationInstanceRegistry.get(instanceKey) });
        };

        const retrieveSpecificSlide = (slideInput) => {
            let targetSlide = null;
            if (typeof slideInput === "number") {
                targetSlide = allSlideElements[slideInput < 0 ? allSlideElements.length + slideInput : slideInput];
            } else if (typeof slideInput === "string") {
                targetSlide = obtainElementById(slideInput);
            } else { // Assume DOM element
                targetSlide = slideInput;
            }
            return (targetSlide && targetSlide.id && slideDataStore.has(`slide-${targetSlide.id}`)) ? targetSlide : null;
        };

        let activationTimer = null;

        const advanceToSlide = (destinationSlide, transitionDuration) => {
            if (!isSystemOperational || !(destinationSlide = retrieveSpecificSlide(destinationSlide))) {
                return false;
            }

            globalScope.scrollTo(0, 0);

            const destinationSlideData = slideDataStore.get(`slide-${destinationSlide.id}`);

            if (currentFocusSlideElement) {
                currentFocusSlideElement.classList.remove("active");
                docBody.classList.remove(`presentation-on-${currentFocusSlideElement.id}`);
            }
            destinationSlide.classList.add("active");
            docBody.classList.add(`presentation-on-${destinationSlide.id}`);

            const targetTransformState = {
                rotation: {
                    x: -destinationSlideData.rotation.x,
                    y: -destinationSlideData.rotation.y,
                    z: -destinationSlideData.rotation.z
                },
                position: {
                    x: -destinationSlideData.position.x,
                    y: -destinationSlideData.position.y,
                    z: -destinationSlideData.position.z
                },
                scaling: 1 / destinationSlideData.scaling
            };

            const isZoomingIn = targetTransformState.scaling >= currentDisplayState.scaling;

            const finalDuration = convertToNumber(transitionDuration, presentationConfiguration.animationDuration);
            const transitionDelay = (finalDuration / 2);

            if (destinationSlide === currentFocusSlideElement) {
                currentViewportScale = assessViewportScaling(presentationConfiguration);
            }

            const effectiveTargetScale = targetTransformState.scaling * currentViewportScale;

            if (currentFocusSlideElement && currentFocusSlideElement !== destinationSlide) {
                handleSlideDeactivation(currentFocusSlideElement);
            }

            // Apply transforms with different delays for root and canvas
            const mainContainerTransition = `all ${finalDuration}ms ease-in-out ${isZoomingIn ? transitionDelay : 0}ms`;
            const displaySurfaceTransition = `all ${finalDuration}ms ease-in-out ${isZoomingIn ? 0 : transitionDelay}ms`;

            applyElementStyles(mainContainerElement, {
                transform: generateTransformString({
                    viewingAngle: presentationConfiguration.viewingPerspective / effectiveTargetScale,
                    scaling: effectiveTargetScale
                }),
                transition: mainContainerTransition
            });

            applyElementStyles(displaySurfaceElement, {
                transform: generateTransformString({
                    position: targetTransformState.position,
                    rotation: targetTransformState.rotation,
                    scaling: targetTransformState.scaling
                }),
                transition: displaySurfaceTransition
            });

            currentDisplayState = targetTransformState;
            currentFocusSlideElement = destinationSlide;

            globalScope.clearTimeout(activationTimer);
            activationTimer = globalScope.setTimeout(() => {
                handleSlideActivation(currentFocusSlideElement);
            }, finalDuration);

            return true;
        };

        const api = {
            initialize: initializePresentationSystem,
            advanceTo: advanceToSlide,
            previousSlide: () => { /* Placeholder for prev */ },
            nextSlide: () => { /* Placeholder for next */ }
        };

        presentationInstanceRegistry.set(instanceKey, api);
        return api;
    };

    globalScope.presentation = presentationSetup; // Renamed `impress` to `presentation`

})(document, window);