(function ( docRef, winObj ) {
    'use strict';
    
    // This section contains various utility functions,
    // essential for the core mechanics of our presentation engine.
    
    // `vendorPrefixResolver` identifies the correct vendor-prefixed CSS property name
    // for the current browser, ensuring cross-browser compatibility for advanced styles.
    // Inspired by Modernizr's approach.
    const vendorPrefixResolver = (function () {
        
        const testStyleElement = docRef.createElement('div').style;
        const potentialPrefixes = ['webkit', 'moz', 'o', 'ms', 'khtml']; // Common prefixes
        const propertyCache = {}; // Stores resolved property names
        
        /**
         * Resolves the vendor-prefixed version of a CSS property.
         * @param {string} baseProp - The standard CSS property name (e.g., 'transform').
         * @returns {string|null} The prefixed property name, or null if not supported.
         */
        return function ( baseProp ) {
            // Early exit if property is invalid or already cached
            if (!baseProp || typeof baseProp !== 'string') {
                return null;
            }
            if (propertyCache.hasOwnProperty(baseProp)) {
                return propertyCache[baseProp];
            }
            
            const capitalizedProp = baseProp.charAt(0).toUpperCase() + baseProp.slice(1);
            const testProps = [baseProp, ...potentialPrefixes.map(p => p + capitalizedProp)];
            
            for (let currentPropCandidate of testProps) {
                if (testStyleElement[currentPropCandidate] !== undefined) {
                    propertyCache[baseProp] = currentPropCandidate;
                    return currentPropCandidate;
                }
            }
            
            propertyCache[baseProp] = null; // Mark as unsupported
            return null;
        };
    
    })();
    
    // `toArrayConvertor` transforms array-like objects (e.g., NodeList) into genuine Arrays,
    // granting access to full Array prototype methods.
    const toArrayConvertor = function ( collection ) {
        // A modern and concise way to convert array-like objects.
        return Array.from( collection || [] );
    };
    
    // `applyStyles` function applies a set of CSS properties to a given DOM element.
    // It automatically resolves vendor prefixes for each property.
    const applyStyles = function ( targetElement, styleProperties ) {
        if (!targetElement || !styleProperties) {
            return targetElement; // Guard against invalid inputs
        }
        
        for (let propKey in styleProperties) {
            if (styleProperties.hasOwnProperty(propKey)) {
                const prefixedKey = vendorPrefixResolver(propKey);
                if (prefixedKey !== null) {
                    targetElement.style[prefixedKey] = styleProperties[propKey];
                }
            }
        }
        return targetElement;
    };
    
    // `parseNumericValue` attempts to convert a value to a number.
    // If conversion fails, it returns a specified fallback value or 0.
    const parseNumericValue = function ( value, fallbackValue = 0 ) {
        const num = Number.parseFloat(value);
        return Number.isNaN(num) ? fallbackValue : num;
    };
    
    // `fetchElementById` retrieves a DOM element by its ID.
    const fetchElementById = function ( elementId ) {
        return docRef.getElementById(elementId);
    };
    
    // `querySingleElement` finds the first element matching a CSS selector
    // within a specified context or the entire document.
    const querySingleElement = function ( selectorString, searchContext ) {
        const effectiveContext = searchContext || docRef;
        return effectiveContext.querySelector(selectorString);
    };
    
    // `queryMultipleElements` retrieves all elements matching a CSS selector
    // within a specified context or the entire document, returning them as an Array.
    const queryMultipleElements = function ( selectorString, searchContext ) {
        const effectiveContext = searchContext || docRef;
        return toArrayConvertor( effectiveContext.querySelectorAll(selectorString) );
    };
    
    // `dispatchCustomEvent` creates and dispatches a custom DOM event.
    const dispatchCustomEvent = function ( targetElement, eventName, eventData ) {
        if (!targetElement || !eventName) return; // Basic validation
        
        const customEvent = new CustomEvent(eventName, {
            bubbles: true,
            cancelable: true,
            detail: eventData
        });
        targetElement.dispatchEvent(customEvent);
    };
    
    // Transform string builders for CSS 3D transforms.
    // These functions generate parts of the `transform` CSS property.
    
    const buildTranslateString = function ( coords ) {
        return ` translate3d(${coords.x}px,${coords.y}px,${coords.z}px) `;
    };
    
    const buildRotateString = function ( rotationAngles, reverseOrder = false ) {
        const rotX = ` rotateX(${rotationAngles.x}deg) `;
        const rotY = ` rotateY(${rotationAngles.y}deg) `;
        const rotZ = ` rotateZ(${rotationAngles.z}deg) `;
        
        return reverseOrder ? (rotZ + rotY + rotX) : (rotX + rotY + rotZ);
    };
    
    const buildScaleString = function ( scaleFactor ) {
        return ` scale(${scaleFactor}) `;
    };
    
    const buildPerspectiveString = function ( perspectiveValue ) {
        return ` perspective(${perspectiveValue}px) `;
    };
    
    // `getSlideIdFromUrlHash` extracts an element ID from the URL hash.
    // Handles both `#id` and `#/id` formats.
    const getSlideIdFromUrlHash = function () {
        const currentHash = winObj.location.hash;
        // Strip leading '#' or '#/'
        const cleanId = currentHash.startsWith('#/') ? currentHash.slice(2) : currentHash.slice(1);
        return fetchElementById(cleanId);
    };
    
    // `calculatePresentationScale` determines the appropriate scaling factor
    // for the presentation based on window dimensions and configuration.
    const calculatePresentationScale = function ( presentationConfig ) {
        const heightRatio = winObj.innerHeight / presentationConfig.height;
        const widthRatio = winObj.innerWidth / presentationConfig.width;
        
        let currentScale = Math.min(heightRatio, widthRatio);
        
        // Apply min/max scale constraints
        if (presentationConfig.maxScale && currentScale > presentationConfig.maxScale) {
            currentScale = presentationConfig.maxScale;
        }
        if (presentationConfig.minScale && currentScale < presentationConfig.minScale) {
            currentScale = presentationConfig.minScale;
        }
        
        return currentScale;
    };
    
    // --- BROWSER CAPABILITY CHECK ---
    const pageBody = docRef.body;
    
    const userAgentString = navigator.userAgent.toLowerCase();
    const isPresentationSupported = 
        // Requires CSS 3D transforms
        ( vendorPrefixResolver("perspective") !== null ) &&
        // Needs `classList` API for dynamic styling
        ( pageBody.classList ) &&
        // And `dataset` API for configuration
        ( pageBody.dataset ) &&
        // Exclude specific mobile devices with poor 3D performance
        ( userAgentString.indexOf("iphone") === -1 ) &&
        ( userAgentString.indexOf("ipod") === -1 ) &&
        ( userAgentString.indexOf("android") === -1 );
    
    // Apply initial body classes based on support
    if (!isPresentationSupported) {
        // Fallback for unsupported browsers
        pageBody.classList.add("presentation-unsupported");
    } else {
        pageBody.classList.remove("presentation-unsupported");
        pageBody.classList.add("presentation-supported");
    }
    
    // --- GLOBAL STATE AND DEFAULT SETTINGS ---
    
    // A registry for multiple presentation instances on a single page.
    const presentationInstances = {};
    
    // Default configuration values for new presentations.
    const defaultSettings = {
        baseWidth: 1024,
        baseHeight: 768,
        maximumScaling: 1.0,
        minimumScaling: 0.0,
        
        viewPerspective: 1000,
        
        transitionTimeMs: 1000
    };
    
    // A simple no-op function for unsupported API calls.
    const noOperation = () => false;
    
    // --- CORE PRESENTATION API ---
    
    // `initializePresentation` is the main entry point, returning the API
    // for a presentation instance based on a given root element ID.
    const initializePresentation = winObj.presentationEngine = function ( rootElementId ) {
        
        // If the browser lacks necessary features, provide a dummy API
        // to prevent errors and allow graceful degradation.
        if (!isPresentationSupported) {
            return {
                start: noOperation,
                advance: noOperation,
                recede: noOperation,
                jumpTo: noOperation
            };
        }
        
        const presentationIdentifier = rootElementId || "impress"; // Default ID
        
        // Return existing API if this presentation is already initialized.
        const instanceKey = `presentation-instance-${presentationIdentifier}`;
        if (presentationInstances[instanceKey]) {
            return presentationInstances[instanceKey];
        }
        
        // Internal state variables for the presentation.
        let slideMetadata = {}; // Data for each slide/step
        let currentActiveSlideElement = null;
        let currentTransformState = null; // Current position, rotation, scale
        let allSlideElements = null; // Array of DOM elements for steps
        let currentConfig = null; // Merged configuration
        let windowScaleFactor = null; // Scale based on window size
        
        // DOM elements for the presentation structure.
        const rootContainer = fetchElementById( presentationIdentifier );
        if (!rootContainer) {
            console.error(`Presentation root element with ID '${presentationIdentifier}' not found.`);
            return { start: noOperation, advance: noOperation, recede: noOperation, jumpTo: noOperation };
        }
        
        const presentationCanvas = docRef.createElement("div"); // Wrapper for slides
        
        let isEngineInitialized = false;
        
        // --- EVENT HANDLING FOR SLIDES ---
        // `presentation:slideEnter` and `presentation:slideLeave` events.
        
        let lastEnteredSlide = null;
        
        // Triggers `presentation:slideEnter` when a new slide becomes active.
        const onSlideActivation = function ( slideElement ) {
            if (lastEnteredSlide !== slideElement) {
                dispatchCustomEvent(slideElement, "presentation:slideEnter");
                lastEnteredSlide = slideElement;
            }
        };
        
        // Triggers `presentation:slideLeave` when a slide is no longer active.
        const onSlideDeactivation = function ( slideElement ) {
            if (lastEnteredSlide === slideElement) {
                dispatchCustomEvent(slideElement, "presentation:slideLeave");
                lastEnteredSlide = null;
            }
        };
        
        // `processSlideElement` reads data attributes and applies initial styles to a slide.
        const processSlideElement = function ( slideDomElement, index ) {
            const domData = slideDomElement.dataset;
            const slideAttributes = {
                translation: {
                    x: parseNumericValue(domData.x),
                    y: parseNumericValue(domData.y),
                    z: parseNumericValue(domData.z)
                },
                rotation: {
                    x: parseNumericValue(domData.rotateX),
                    y: parseNumericValue(domData.rotateY),
                    z: parseNumericValue(domData.rotateZ || domData.rotate)
                },
                scaling: parseNumericValue(domData.scale, 1),
                domRef: slideDomElement
            };
            
            // Ensure each slide has a unique ID.
            if ( !slideDomElement.id ) {
                slideDomElement.id = `slide-${index + 1}`;
            }
            
            slideMetadata[`slide-data-${slideDomElement.id}`] = slideAttributes;
            
            // Apply initial CSS for slide positioning.
            applyStyles(slideDomElement, {
                position: "absolute",
                transform: `translate(-50%,-50%)${
                           buildTranslateString(slideAttributes.translation)}${
                           buildRotateString(slideAttributes.rotation)}${
                           buildScaleString(slideAttributes.scaling)}`,
                transformStyle: "preserve-3d"
            });
        };
        
        // `setupViewportMeta` ensures the viewport meta tag is correctly set for mobile.
        const setupViewportMeta = function () {
            let viewportMeta = querySingleElement("meta[name='viewport']");
            if (!viewportMeta) {
                viewportMeta = docRef.createElement("meta");
                viewportMeta.name = 'viewport';
                docRef.head.appendChild(viewportMeta);
            }
            viewportMeta.content = "width=device-width, minimum-scale=1, maximum-scale=1, user-scalable=no";
        };
        
        // `startPresentation` API function: initializes and prepares the presentation.
        const startPresentation = function () {
            if (isEngineInitialized) { return; }
            
            setupViewportMeta();
            
            // Parse configuration from root element's dataset, falling back to defaults.
            const rootDataSet = rootContainer.dataset;
            currentConfig = {
                width: parseNumericValue( rootDataSet.width, defaultSettings.baseWidth ),
                height: parseNumericValue( rootDataSet.height, defaultSettings.baseHeight ),
                maxScale: parseNumericValue( rootDataSet.maxScale, defaultSettings.maximumScaling ),
                minScale: parseNumericValue( rootDataSet.minScale, defaultSettings.minimumScaling ),                
                perspective: parseNumericValue( rootDataSet.perspective, defaultSettings.viewPerspective ),
                transitionDuration: parseNumericValue( rootDataSet.transitionDuration, defaultSettings.transitionTimeMs )
            };
            
            windowScaleFactor = calculatePresentationScale( currentConfig );
            
            // Move all 'step' elements into the canvas.
            presentationCanvas.classList.add("presentation-canvas"); // Add a class for styling
            toArrayConvertor( rootContainer.children ).forEach( childNode => {
                // Only move actual slide elements, not other potential children
                if (childNode.classList && childNode.classList.contains('step')) {
                    presentationCanvas.appendChild( childNode );
                }
            });
            rootContainer.appendChild(presentationCanvas);
            
            // Apply global document and body styles.
            docRef.documentElement.style.height = "100%";
            applyStyles(pageBody, {
                height: "100%",
                overflow: "hidden" // Prevent browser scrolling
            });
            
            const commonTransformStyles = {
                position: "absolute",
                transformOrigin: "top left",
                transition: "all 0s ease-in-out", // Initial zero duration
                transformStyle: "preserve-3d"
            };
            
            applyStyles(rootContainer, { ...commonTransformStyles, // Spread operator for merging
                top: "50%",
                left: "50%",
                transform: buildPerspectiveString( currentConfig.perspective / windowScaleFactor ) + buildScaleString( windowScaleFactor )
            });
            applyStyles(presentationCanvas, commonTransformStyles);
            
            // Update body classes to reflect active presentation state.
            pageBody.classList.remove("presentation-disabled"); // Assuming this class exists
            pageBody.classList.add("presentation-active");
            
            // Discover and initialize all slide elements.
            allSlideElements = queryMultipleElements(".step", presentationCanvas);
            if (allSlideElements.length === 0) {
                console.warn("No slides found. Ensure elements with class 'step' are present.");
                return;
            }
            allSlideElements.forEach( processSlideElement );
            
            // Set the initial internal transform state.
            currentTransformState = {
                translation: { x: 0, y: 0, z: 0 },
                rotation:    { x: 0, y: 0, z: 0 },
                scaling:     1
            };
            
            isEngineInitialized = true;
            
            // Announce that the presentation has been initialized.
            dispatchCustomEvent(rootContainer, "presentation:initialized", { api: presentationInstances[instanceKey] });
        };
        
        // `resolveSlideReference` converts various inputs (index, ID, element)
        // into a valid slide DOM element.
        const resolveSlideReference = function ( slideInput ) {
            let resolvedElement = null;
            
            if (typeof slideInput === "number") {
                resolvedElement = (slideInput < 0) ? allSlideElements[allSlideElements.length + slideInput] : allSlideElements[slideInput];
            } else if (typeof slideInput === "string") {
                resolvedElement = fetchElementById(slideInput);
            } else if (slideInput instanceof HTMLElement) {
                resolvedElement = slideInput;
            }
            
            // Validate if the resolved element is indeed a registered slide.
            return (resolvedElement && resolvedElement.id && slideMetadata[`slide-data-${resolvedElement.id}`])
                   ? resolvedElement
                   : null;
        };
        
        // Timeout ID for delaying `presentation:slideEnter` event.
        let slideEnterEventDelayTimer = null;
        
        // Callback function to expose current transformations to external tools.
        let externalTransformCallback = null;
        const setExternalTransformCallback = function(callbackFn){
          externalTransformCallback = callbackFn;
        };
        
        // `jumpToSlide` API function: navigates to a specified slide.
        const jumpToSlide = function ( targetSlide, transitionDurationMs ) {
            
            // Guard clauses for uninitialized state or invalid target.
            if ( !isEngineInitialized || !(targetSlide = resolveSlideReference(targetSlide)) ) {
                console.warn("Cannot navigate: Presentation not initialized or target slide invalid.");
                return false;
            }
            
            // Prevent browser scrolling behavior from interfering with our positioning.
            winObj.scrollTo(0, 0);
            
            const targetSlideData = slideMetadata[`slide-data-${targetSlide.id}`];
            
            // Update active classes on slides and body.
            if ( currentActiveSlideElement ) {
                currentActiveSlideElement.classList.remove("active-slide");
                pageBody.classList.remove(`presentation-on-${currentActiveSlideElement.id}`);
                onSlideDeactivation(currentActiveSlideElement); // Trigger leave event
            }
            targetSlide.classList.add("active-slide");
            pageBody.classList.add(`presentation-on-${targetSlide.id}`);
            
            // Calculate the inverse transform needed for the canvas to show the target slide.
            const inverseTransform = {
                rotation: {
                    x: -targetSlideData.rotation.x,
                    y: -targetSlideData.rotation.y,
                    z: -targetSlideData.rotation.z
                },
                translation: {
                    x: -targetSlideData.translation.x,
                    y: -targetSlideData.translation.y,
                    z: -targetSlideData.translation.z
                },
                scaling: 1 / targetSlideData.scaling
            };
            
            // Notify external systems if a callback is registered.
            if(externalTransformCallback) { 
                externalTransformCallback({
                  scale: targetSlideData.scaling,
                  rotate: targetSlideData.rotation,
                  translate: targetSlideData.translation
                });
            }
            
            // Determine if the transition is a "zoom-in" or "zoom-out" for styling purposes.
            const isZoomInTransition = inverseTransform.scaling >= currentTransformState.scaling;
            
            const finalDuration = parseNumericValue(transitionDurationMs, currentConfig.transitionDuration);
            const halfDuration = finalDuration / 2;
            
            // If navigating to the same slide (e.g., due to window resize),
            // recompute window scale and update root transform.
            if (targetSlide === currentActiveSlideElement) {
                windowScaleFactor = calculatePresentationScale( currentConfig );
                applyStyles(rootContainer, {
                    transform: buildPerspectiveString( currentConfig.perspective / windowScaleFactor ) + buildScaleString( windowScaleFactor )
                });
            }
            
            // Apply the new transform to the canvas.
            // The transition property is dynamically set to create different animation effects
            // for zooming in vs. zooming out.
            applyStyles(presentationCanvas, {
                transitionDuration: `${finalDuration}ms`,
                transitionDelay: `${isZoomInTransition ? halfDuration : 0}ms`,
                transform: buildScaleString(inverseTransform.scaling) +
                           buildRotateString(inverseTransform.rotation, true) + // ZYX order for out
                           buildTranslateString(inverseTransform.translation)
            });
            
            // After the initial scale/rotate, apply the final transform.
            // This creates the staggered animation effect.
            // This part is slightly simplified from original, often achieved by a second CSS rule.
            // For programmatic control, a timeout or a second `applyStyles` would be needed.
            // For Type III, I'll keep it as one combined transform, but the `transition-delay`
            // on the first part already implies a staggered effect.
            
            // Update the current state of the presentation.
            currentTransformState = { ...inverseTransform }; // Clone the object
            currentActiveSlideElement = targetSlide;
            
            // Clear any pending `slideEnter` event and set a new one after transition.
            clearTimeout(slideEnterEventDelayTimer);
            slideEnterEventDelayTimer = setTimeout(() => {
                onSlideActivation(currentActiveSlideElement);
                slideEnterEventDelayTimer = null; // Reset timer ID
            }, finalDuration);
            
            return true; // Navigation successful
        };
        
        // --- API EXPOSURE ---
        const presentationAPI = {
            init: startPresentation,
            goto: jumpToSlide,
            // Simple navigation functions
            next: function () {
                const currentIndex = allSlideElements.indexOf(currentActiveSlideElement);
                const nextIndex = (currentIndex + 1) % allSlideElements.length;
                jumpToSlide(allSlideElements[nextIndex]);
            },
            prev: function () {
                const currentIndex = allSlideElements.indexOf(currentActiveSlideElement);
                const prevIndex = (currentIndex - 1 + allSlideElements.length) % allSlideElements.length;
                jumpToSlide(allSlideElements[prevIndex]);
            },
            // Additional utility functions
            getSlides: () => [...allSlideElements], // Return a copy
            getCurrentSlide: () => currentActiveSlideElement,
            setTransformObserver: setExternalTransformCallback, // Renamed from setTransformationCallback
            // Added for potential external debugging or state inspection
            _debugState: () => ({
                config: currentConfig,
                windowScale: windowScaleFactor,
                currentTransform: currentTransformState,
                activeSlideId: currentActiveSlideElement ? currentActiveSlideElement.id : null
            })
        };
        
        presentationInstances[instanceKey] = presentationAPI;
        return presentationAPI;
    };
    
})( document, window );