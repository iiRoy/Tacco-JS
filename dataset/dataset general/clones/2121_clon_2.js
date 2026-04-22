/**
 * presentationSystem.js
 *
 * This presentation system leverages the capabilities of modern browser CSS3 transformations
 * and transitions, drawing inspiration from tools like prezi.com.
 *
 *
 * Copyright 2011-2012 B. Szopka (@bartaz)
 *
 * Distributed under MIT and GPL terms.
 *
 * ----------------------------------------------------
 *  developer: Bartek Szopka
 *  release:   0.5.3
 *  web:       http://bartaz.github.com/impress.js/
 *  source:    http://github.com/bartaz/impress.js/
 */

/*jslint bitwise:true, curly:true, eqeqeq:true, forin:true, latedef:true, newcap:true,
         noarg:true, noempty:true, undef:true, strict:true, browser:true */

// For those curious about the inner workings, let's explore the mechanisms
// that power this presentation framework...
(function ( docGlobal, winGlobal ) {
    "use strict";

    // SUPPORT UTILITIES

    // `vendorPrefixer` is a utility that accepts a standard CSS property name
    // and delivers its vendor-prefixed variant, tailored for the current browser.
    // This code is heavily influenced by Modernizr (http://www.modernizr.com/).
    var vendorPrefixer = (function () {

        var testElementStyle = docGlobal.createElement("div").style,
            browserPrefixes = "Webkit Moz O ms Khtml".split(" "),
            prefixCache = {};

        return function ( propertyKey ) {
            if ( typeof prefixCache[ propertyKey ] === "undefined" ) {

                var capitalizedProp = propertyKey.charAt(0).toUpperCase() + propertyKey.substr(1),
                    possibleProps = (propertyKey + " " + browserPrefixes.join(capitalizedProp + " ") + capitalizedProp).split(" ");

                prefixCache[ propertyKey ] = void 0;
                for ( var idx in possibleProps ) {
                    if ( testElementStyle[ possibleProps[idx] ] !== void 0 ) {
                        prefixCache[ propertyKey ] = possibleProps[idx];
                        break;
                    }
                }

            }

            return prefixCache[ propertyKey ];
        };

    })();

    // `convertToArray` transforms an array-like structure into a true Array,
    // granting access to all Array.prototype capabilities.
    var convertToArray = function ( collection ) {
        return [].slice.call( collection );
    };

    // `applyStyles` function sets the CSS properties specified in `styleProps`
    // onto the `targetElement`. It processes all property names through
    // `vendorPrefixer` to ensure the correct prefixed version is applied.
    var applyStyles = function ( targetElement, styleProps ) {
        var styleName, prefixedName;
        for ( styleName in styleProps ) {
            if ( styleProps.hasOwnProperty(styleName) ) {
                prefixedName = vendorPrefixer(styleName);
                if ( prefixedName !== void 0 ) {
                    targetElement.style[prefixedName] = styleProps[styleName];
                }
            }
        }
        return targetElement;
    };

    // `convertToNumber` takes a `valueToConvert` and attempts to parse it as a number.
    // If parsing fails, it returns `defaultValue` (or 0 if `defaultValue` is not provided).
    var convertToNumber = function (valueToConvert, defaultValue) {
        return isNaN(valueToConvert) ? (defaultValue || 0) : Number(valueToConvert);
    };

    // `getById` retrieves an element using its `elementId` – self-explanatory!
    var getById = function ( elementId ) {
        return docGlobal.getElementById(elementId);
    };

    // `querySelectorSingle` yields the initial element matching the given CSS `cssSelector`
    // within the specified `searchContext` or the entire document.
    var querySelectorSingle = function ( cssSelector, searchContext ) {
        searchContext = searchContext || docGlobal;
        return searchContext.querySelector(cssSelector);
    };

    // `querySelectorAllMulti` returns a collection of elements matching the CSS `cssSelector`
    // within the provided `searchContext` or the complete document.
    var querySelectorAllMulti = function ( cssSelector, searchContext ) {
        searchContext = searchContext || docGlobal;
        return convertToArray( searchContext.querySelectorAll(cssSelector) );
    };

    // `dispatchCustomEvent` constructs a custom DOM event with `eventType` and `eventData`,
    // then dispatches it on the `targetElement`.
    var dispatchCustomEvent = function (targetElement, eventType, eventData) {
        var domEvent = docGlobal.createEvent("CustomEvent");
        domEvent.initCustomEvent(eventType, true, true, eventData);
        targetElement.dispatchEvent(domEvent);
    };

    // `makeTranslateTransform` generates a CSS translate transform string from `transformCoords`.
    var makeTranslateTransform = function ( transformCoords ) {
        return " translate3d(" + transformCoords.x + "px," + transformCoords.y + "px," + transformCoords.z + "px) ";
    };

    // `makeRotateTransform` constructs a CSS rotate transform string from `rotationAngles`.
    // By default, rotations are applied in X, Y, Z order, which can be altered by
    // setting the `reverseOrder` parameter to true.
    var makeRotateTransform = function ( rotationAngles, reverseOrder ) {
        var rotX = " rotateX(" + rotationAngles.x + "deg) ",
            rotY = " rotateY(" + rotationAngles.y + "deg) ",
            rotZ = " rotateZ(" + rotationAngles.z + "deg) ";

        return reverseOrder ? rotZ+rotY+rotX : rotX+rotY+rotZ;
    };

    // `makeScaleTransform` creates a CSS scale transform string based on `scaleFactor`.
    var makeScaleTransform = function ( scaleFactor ) {
        return " scale(" + scaleFactor + ") ";
    };

    // `makePerspectiveTransform` builds a CSS perspective transform string from `perspectiveDepth`.
    var makePerspectiveTransform = function ( perspectiveDepth ) {
        return " perspective(" + perspectiveDepth + "px) ";
    };

    // `retrieveElementFromUrlHash` fetches an element by its ID, extracted from the
    // URL's hash segment.
    var retrieveElementFromUrlHash = function () {
        // Obtain the ID from the URL hash by stripping `#` or `#/` from the beginning,
        // ensuring both "fallback" `#slide-id` and "enhanced" `#/slide-id` formats are compatible.
        return getById( winGlobal.location.hash.replace(/^#\/?/,"") );
    };

    // `calculateViewportScale` determines the scaling factor between the browser window's dimensions
    // and the configured presentation size.
    var calculateViewportScale = function ( presentationSettings ) {
        var heightRatio = winGlobal.innerHeight / presentationSettings.height,
            widthRatio = winGlobal.innerWidth / presentationSettings.width,
            currentScale = heightRatio > widthRatio ? widthRatio : heightRatio;

        if (presentationSettings.maxScale && currentScale > presentationSettings.maxScale) {
            currentScale = presentationSettings.maxScale;
        }

        if (presentationSettings.minScale && currentScale < presentationSettings.minScale) {
            currentScale = presentationSettings.minScale;
        }

        return currentScale;
    };

    // FEATURE DETECTION
    var documentBody = docGlobal.body;

    var userAgentString = navigator.userAgent.toLowerCase();
    var isFeatureSupported =
                          // Browser must support CSS 3D transforms
                           ( vendorPrefixer("perspective") !== void 0 ) &&

                          // And `classList` and `dataset` APIs
                           ( documentBody.classList ) &&
                           ( documentBody.dataset ) &&

                          // However, certain mobile devices are blacklisted,
                          // as their CSS 3D support or hardware is insufficient
                          // for proper operation of this system, regrettably...
                           ( userAgentString.search(/(iphone)|(ipod)|(android)/) === -1 );

    if (!isFeatureSupported) {
        // We cannot guarantee `classList` support here
        documentBody.className += " presentation-not-supported ";
    } else {
        documentBody.classList.remove("presentation-not-supported");
        documentBody.classList.add("presentation-enabled");
    }

    // GLOBAL DEFAULTS AND CONFIGURATION

    // This object will store the root elements for all instances of the presentation system.
    // Yes, multiple instances per page are possible, though practical utility is debatable.
    var presentationInstances = {};

    // Standard configuration values.
    var standardOptions = {
        width: 1024,
        height: 768,
        maxScale: 1,
        minScale: 0,

        perspective: 1000,

        transitionDuration: 1000
    };

    // A simple, do-nothing function... and an equally unhelpful comment.
    var noOpFunction = function () { return !1; };

    // PRESENTATION SYSTEM API

    // This is where the core functionality begins.
    // The `initPresentationSystem` function returns the API for a presentation
    // linked to the element identified by `containerId` (defaulting to 'impress').
    var initPresentationSystem = winGlobal.initPresentationSystem = function ( containerId ) {

        // If the presentation system is not supported by the browser, return a mock API.
        // This may not be ideal, but it allows early exit and avoids execution
        // of code relying on unsupported browser features.
        if (!isFeatureSupported) {
            return {
                init: noOpFunction,
                goto: noOpFunction,
                prev: noOpFunction,
                next: noOpFunction
            };
        }

        containerId = containerId || "impress";

        // If the specified root is already initialized, return its existing API.
        if (presentationInstances["presentation-instance-" + containerId]) {
            return presentationInstances["presentation-instance-" + containerId];
        }

        // Object holding data for all presentation slides.
        var slideDataStore = {};

        // The currently active slide element.
        var currentActiveSlide = null;

        // The current state (position, rotation, scale) of the presentation viewport.
        var currentViewpointState = null;

        // An array of all slide elements.
        var slideElements = null;

        // Presentation configuration options.
        var presentationConfig = null;

        // The scaling factor applied to the browser window.
        var viewportScaleFactor = null;

        // Main presentation container elements.
        var mainContainer = getById( containerId );
        var drawingCanvas = docGlobal.createElement("div");

        var systemInitialized = !1;

        // SLIDE EVENTS
        //
        // Currently, two slide-related events are dispatched by the system:
        // `system:slideentered` fires when a slide becomes visible
        // (after the transition from the previous slide completes), and
        // `system:slideexited` fires when a slide is left
        // (as the transition to the next slide commences).

        // Reference to the last slide that was fully entered.
        var previouslyActiveSlide = null;

        // `handleSlideEntry` is invoked when a slide element is entered,
        // but the event is only dispatched if the slide differs from
        // the `previouslyActiveSlide`.
        var handleSlideEntry = function (currentSlide) {
            if (previouslyActiveSlide !== currentSlide) {
                dispatchCustomEvent(currentSlide, "system:slideentered");
                previouslyActiveSlide = currentSlide;
            }
        };

        // `handleSlideExit` is invoked when a slide element is exited,
        // but the event is only dispatched if the slide matches
        // the `previouslyActiveSlide`.
        var handleSlideExit = function (currentSlide) {
            if (previouslyActiveSlide === currentSlide) {
                dispatchCustomEvent(currentSlide, "system:slideexited");
                previouslyActiveSlide = null;
            }
        };

        // `initializeSlideElement` configures a given slide element by extracting data
        // from its data attributes and applying the appropriate styles.
        var initializeSlideElement = function ( slideEl, slideIdx ) {
            var elementDataSet = slideEl.dataset,
                slideDetails = {
                    translate: {
                        x: convertToNumber(elementDataSet.x),
                        y: convertToNumber(elementDataSet.y),
                        z: convertToNumber(elementDataSet.z)
                    },
                    rotate: {
                        x: convertToNumber(elementDataSet.rotateX),
                        y: convertToNumber(elementDataSet.rotateY),
                        z: convertToNumber(elementDataSet.rotateZ || elementDataSet.rotate)
                    },
                    scale: convertToNumber(elementDataSet.scale, 1),
                    el: slideEl
                };

            if ( !slideEl.id ) {
                slideEl.id = "slide-" + (slideIdx + 1);
            }

            slideDataStore["slide-instance-" + slideEl.id] = slideDetails;

            applyStyles(slideEl, {
                position: "absolute",
                transform: "translate(-50%,-50%)" +
                           makeTranslateTransform(slideDetails.translate) +
                           makeRotateTransform(slideDetails.rotate) +
                           makeScaleTransform(slideDetails.scale),
                transformStyle: "preserve-3d"
            });
        };

        // `startPresentationEngine` is the API function that initializes and launches the presentation.
        var startPresentationEngine = function () {
            if (systemInitialized) { return; }

            // First, configure the viewport for mobile devices.
            // iPads, in particular, behave erratically if this isn't handled correctly.
            var viewportMetaTag = querySelectorSingle("meta[name='viewport']") || docGlobal.createElement("meta");
            viewportMetaTag.content = "width=device-width, minimum-scale=1, maximum-scale=1, user-scalable=no";
            if (viewportMetaTag.parentNode !== docGlobal.head) {
                viewportMetaTag.name = "viewport";
                docGlobal.head.appendChild(viewportMetaTag);
            }

            // Initialize the configuration object.
            var mainContainerDataSet = mainContainer.dataset;
            presentationConfig = {
                width: convertToNumber( mainContainerDataSet.width, standardOptions.width ),
                height: convertToNumber( mainContainerDataSet.height, standardOptions.height ),
                maxScale: convertToNumber( mainContainerDataSet.maxScale, standardOptions.maxScale ),
                minScale: convertToNumber( mainContainerDataSet.minScale, standardOptions.minScale ),
                perspective: convertToNumber( mainContainerDataSet.perspective, standardOptions.perspective ),
                transitionDuration: convertToNumber( mainContainerDataSet.transitionDuration, standardOptions.transitionDuration )
            };

            viewportScaleFactor = calculateViewportScale( presentationConfig );

            // Enclose slides within the "drawingCanvas" element.
            convertToArray( mainContainer.childNodes ).forEach(function ( slideEl ) {
                drawingCanvas.appendChild( slideEl );
            });
            mainContainer.appendChild(drawingCanvas);

            // Apply initial global styles.
            docGlobal.documentElement.style.height = "100%";

            applyStyles(documentBody, {
                height: "100%",
                overflow: "hidden"
            });

            var containerBaseStyles = {
                position: "absolute",
                transformOrigin: "top left",
                transition: "all 0s ease-in-out",
                transformStyle: "preserve-3d"
            };

            applyStyles(mainContainer, containerBaseStyles);
            applyStyles(mainContainer, {
                top: "50%",
                left: "50%",
                transform: makePerspectiveTransform( presentationConfig.perspective/viewportScaleFactor ) + makeScaleTransform( viewportScaleFactor )
            });
            applyStyles(drawingCanvas, containerBaseStyles);

            documentBody.classList.remove("presentation-inactive");
            documentBody.classList.add("presentation-active");

            // Retrieve and initialize all slide elements.
            slideElements = querySelectorAllMulti(".step", mainContainer);
            slideElements.forEach( initializeSlideElement );

            // Establish a default initial state for the canvas.
            currentViewpointState = {
                translate: { x: 0, y: 0, z: 0 },
                rotate:    { x: 0, y: 0, z: 0 },
                scale:     1
            };

            systemInitialized = !0;

            dispatchCustomEvent(mainContainer, "system:initialized", { api: presentationInstances[ "presentation-instance-" + containerId ] });
        };

        // `retrieveSlideReference` is a helper that returns a slide element based on the parameter.
        // If a number is given, the slide at that index is returned. If a string, the slide with that ID.
        // If a DOM element, it's returned if it's a valid slide element.
        var retrieveSlideReference = function ( slideParam ) {
            if (typeof slideParam === "number") {
                slideParam = slideParam < 0 ? slideElements[ slideElements.length + slideParam] : slideElements[ slideParam ];
            } else if (typeof slideParam === "string") {
                slideParam = getById(slideParam);
            }
            return (slideParam && slideParam.id && slideDataStore["slide-instance-" + slideParam.id]) ? slideParam : void 0;
        };

        // Used to clear the timer for the `system:slideentered` event.
        var slideTransitionTimer = null;

        // `navigateToSlide` is the API function that transitions to the slide specified by `targetSlide`
        // (using index, ID, or element), with an optional `transitionDuration`.
        var navigateToSlide = function ( targetSlide, transitionDuration ) {

            if ( !systemInitialized || !(targetSlide = retrieveSlideReference(targetSlide)) ) {
                // Presentation not yet initialized or the provided element is not a valid slide.
                return !1;
            }

            // Occasionally, focusing on the first link via keyboard can cause issues.
            // Browsers attempt to scroll the page to make the element visible (despite `body` overflow being hidden),
            // disrupting our precise positioning.
            //
            // As a simple (and somewhat lazy) workaround, we'll scroll the page back to the top
            // whenever a slide is selected.
            //
            // If you have a more elegant solution, please share!
            winGlobal.scrollTo(0, 0);

            var slideDetails = slideDataStore["slide-instance-" + targetSlide.id];

            if ( currentActiveSlide ) {
                currentActiveSlide.classList.remove("active");
                documentBody.classList.remove("active-slide-is-" + currentActiveSlide.id);
            }
            targetSlide.classList.add("active");

            documentBody.classList.add("active-slide-is-" + targetSlide.id);

            // Calculate the desired state of the canvas based on the target slide.
            var destinationState = {
                rotate: {
                    x: -slideDetails.rotate.x,
                    y: -slideDetails.rotate.y,
                    z: -slideDetails.rotate.z
                },
                translate: {
                    x: -slideDetails.translate.x,
                    y: -slideDetails.translate.y,
                    z: -slideDetails.translate.z
                },
                scale: 1 / slideDetails.scale
            };

            // Determine if the transition involves zooming in.
            //
            // This information helps adjust the transition style:
            // for zooming in, we start with movement and rotation, delaying scaling.
            // For zooming out, we start with scaling down, delaying movement and rotation.
            var isZoomingIn = destinationState.scale >= currentViewpointState.scale;

            transitionDuration = convertToNumber(transitionDuration, presentationConfig.transitionDuration);
            var halfDuration = (transitionDuration / 2);

            // If the same slide is re-selected, force a recalculation of window scaling,
            // as this is likely due to a window resize event.
            if (targetSlide === currentActiveSlide) {
                viewportScaleFactor = calculateViewportScale(presentationConfig);
            }

            var finalScaleValue = destinationState.scale * viewportScaleFactor;

            // Trigger the exit event for the currently active element (if it's not the same slide).
            if (currentActiveSlide && currentActiveSlide !== targetSlide) {
                handleSlideExit(currentActiveSlide);
            }

            // Now, we modify the transforms of `mainContainer` and `drawingCanvas` to initiate transitions.
            //
            // The reason for two elements (`mainContainer` and `drawingCanvas`) is that they animate separately:
            // `mainContainer` handles scaling, while `drawingCanvas` manages translation and rotations.
            // Transitions on them are offset with different delays (to create visually smooth and 'natural' effects),
            // requiring us to know when both have completed.
            applyStyles(mainContainer, {
                // To maintain consistent perspective across different scales,
                // the perspective value must also be scaled.
                transform: makePerspectiveTransform( presentationConfig.perspective / finalScaleValue ) + makeScaleTransform( finalScaleValue ),