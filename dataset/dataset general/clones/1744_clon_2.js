// presentation.js
//
// This utility orchestrates dynamic web presentations, leveraging advanced CSS3
// transformations and transitions in compatible browsers. It draws inspiration
// from innovative presentation platforms like prezi.com.
//
//
// Copyright 2011-2012 B. Szopka (@bartaz)
//
// Distributed under the MIT and GPL Licenses.
//
// ----------------------------------------------------
//  creator:   B. Szopka
//  version:   0.5.3 (modified clone)
//  web-link:  http://bartaz.github.com/impress.js/
//  repo-link: http://github.com/bartaz/impress.js/
//

/* This linter directive ensures good code practices: bitwise, curly, eqeqeq, forin, latedef, newcap,
         noarg, noempty, undef, strict, browser are all enabled. */

// Interested in the inner workings of this presentation engine?
// Let's explore the mechanisms that power this system...
(function ( doc, winObj ) {
    'use strict';
    
    // SUPPORT ROUTINES
    
    // The `vendorPrefixer` function accepts a standard CSS property name
    // and yields its browser-specific prefixed variant for the current runtime environment.
    // Its implementation is heavily influenced by the Modernizr project (www.modernizr.com).
    var vendorPrefixer = (function () {
        
        var testStyle = doc.createElement('div').style,
            browserPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
            prefixCache = {}; // Stores resolved prefixes to prevent re-computation.
        
        return function ( cssProperty ) {
            if ( typeof prefixCache[ cssProperty ] === "undefined" ) {
                
                var capitalizedProp = cssProperty.charAt(0).toUpperCase() + cssProperty.substr(1),
                    propertyVariations = (cssProperty + ' ' + browserPrefixes.join(capitalizedProp + ' ') + capitalizedProp).split(' ');
                
                prefixCache[ cssProperty ] = null;
                for ( var idx in propertyVariations ) {
                    if ( testStyle[ propertyVariations[idx] ] !== undefined ) {
                        prefixCache[ cssProperty ] = propertyVariations[idx];
                        break;
                    }
                }
            
            }
            
            return prefixCache[ cssProperty ];
        };
    
    })();
    
    // The `convertToArray` utility transforms an array-like structure into a true JavaScript Array,
    // enabling access to all standard Array.prototype methods.
    var convertToArray = function ( inputArrayLike ) {
        return [].slice.call( inputArrayLike );
    };
    
    // The `applyStyles` function sets CSS properties defined in the `styleProps` object onto the `elementNode`.
    // Each property name is processed through `vendorPrefixer` to ensure the correct browser-specific prefix is used.
    var applyStyles = function ( elementNode, styleProps ) {
        var propName, prefixedPropName;
        for ( propName in styleProps ) {
            if ( styleProps.hasOwnProperty(propName) ) {
                prefixedPropName = vendorPrefixer(propName);
                if ( prefixedPropName !== null ) {
                    elementNode.style[prefixedPropName] = styleProps[propName];
                }
            }
        }
        return elementNode;
    };
    
    // `convertToNum` attempts to cast the `inputVal` parameter to a numerical type.
    // If the conversion fails, it yields 0 or an optional `defaultVal`.
    var convertToNum = function (inputVal, defaultVal) {
        return isNaN(inputVal) ? (defaultVal || 0) : Number(inputVal);
    };
    
    // `getElementByID` retrieves a DOM element using its given `elementID`.
    var getElementByID = function ( elementID ) {
        return doc.getElementById(elementID);
    };
    
    // `getFirstMatch` locates the initial element matching the provided `cssSelector`
    // within the specified `searchContext` or the entire document.
    var getFirstMatch = function ( cssSelector, searchContext ) {
        searchContext = searchContext || doc;
        return searchContext.querySelector(cssSelector);
    };
    
    // `getAllMatches` produces an array of elements corresponding to the `cssSelector`
    // within the `searchContext` or the entire document.
    var getAllMatches = function ( cssSelector, searchContext ) {
        searchContext = searchContext || doc;
        return convertToArray( searchContext.querySelectorAll(cssSelector) );
    };
    
    // `dispatchCustomEvent` constructs a custom DOM event with `eventKind` and `eventData`,
    // then dispatches it on the `elementNode`.
    var dispatchCustomEvent = function (elementNode, eventKind, eventData) {
        var domEvent = doc.createEvent("CustomEvent");
        domEvent.initCustomEvent(eventKind, true, true, eventData);
        elementNode.dispatchEvent(domEvent);
    };
    
    // `makeTranslateTransform` generates a CSS translate transform string based on `transformCoords`.
    var makeTranslateTransform = function ( transformCoords ) {
        return " translate3d(" + transformCoords.x + "px," + transformCoords.y + "px," + transformCoords.z + "px) ";
    };
    
    // `makeRotateTransform` constructs a CSS rotate transform string from `rotationAngles`.
    // By default, rotations are applied in X Y Z sequence; `reverseOrder` can invert this.
    var makeRotateTransform = function ( rotationAngles, reverseOrder ) {
        var rotX = " rotateX(" + rotationAngles.x + "deg) ",
            rotY = " rotateY(" + rotationAngles.y + "deg) ",
            rotZ = " rotateZ(" + rotationAngles.z + "deg) ";
        
        return reverseOrder ? rotZ+rotY+rotX : rotX+rotY+rotZ;
    };
    
    // `makeScaleTransform` creates a CSS scale transform string from `scaleFactor`.
    var makeScaleTransform = function ( scaleFactor ) {
        return " scale(" + scaleFactor + ") ";
    };
    
    // `makePerspectiveTransform` builds a CSS perspective transform string from `perspectiveDepth`.
    var makePerspectiveTransform = function ( perspectiveDepth ) {
        return " perspective(" + perspectiveDepth + "px) ";
    };
    
    // `getNodeFromHashFragment` retrieves a DOM element whose ID matches the hash part of the window location.
    var getNodeFromHashFragment = function () {
        // Extracts the ID from the URL hash, removing leading `#` or `#/`.
        // This supports both "legacy" `#node-id` and "enhanced" `#/node-id` formats.
        return getElementByID( winObj.location.hash.replace(/^#\/?/,"") );
    };
    
    // `calculateViewportScale` determines the scaling factor between the window dimensions
    // and the configured presentation size.
    var calculateViewportScale = function ( displayConfig ) {
        var heightRatio = winObj.innerHeight / displayConfig.height,
            widthRatio = winObj.innerWidth / displayConfig.width,
            currentScale = heightRatio > widthRatio ? widthRatio : heightRatio;
        
        if (displayConfig.maxScale && currentScale > displayConfig.maxScale) {
            currentScale = displayConfig.maxScale;
        }
        
        if (displayConfig.minScale && currentScale < displayConfig.minScale) {
            currentScale = displayConfig.minScale;
        }
        
        return currentScale;
    };
    
    // FEATURE DETECTION
    var documentBody = doc.body;
    
    var userAgentString = navigator.userAgent.toLowerCase();
    var isFeatureSupported = 
                          // The browser must support CSS 3D transformations.
                           ( vendorPrefixer("perspective") !== null ) &&
                           
                          // And it needs to provide `classList` and `dataset` APIs.
                           ( documentBody.classList ) &&
                           ( documentBody.dataset ) &&
                           
                          // Certain mobile devices are blacklisted due to
                          // insufficient CSS 3D support or hardware capabilities
                          // for proper operation of this system. Apologies.
                           ( userAgentString.search(/(iphone)|(ipod)|(android)/) === -1 );
    
    if (!isFeatureSupported) {
        // `classList` might not be available, so append directly.
        documentBody.className += " presentation-unsupported ";
    } else {
        documentBody.classList.remove("presentation-unsupported");
        documentBody.classList.add("presentation-supported");
    }
    
    // GLOBAL CONFIGURATION AND DEFAULTS
    
    // This object will hold references to the root elements of all presentation system instances.
    // Multiple instances are theoretically possible on a single page, though their practical utility is debatable.
    var instanceRegistry = {};
    
    // Default configuration values for the presentation system.
    var standardSettings = {
        width: 1024,
        height: 768,
        maxScale: 1,
        minScale: 0,
        
        perspective: 1000,
        
        transitionDuration: 1000
    };
    
    // A simple, do-nothing function.
    var noOp = function () { return false; };
    
    // PRESENTATION SYSTEM API
    
    // This is the core `presentationSystem` function, providing the API
    // for a presentation identified by `presentationRootID` (default: 'impress').
    var presentationSystem = winObj.impress = function ( presentationRootID ) {
        
        // If the browser does not support the necessary features,
        // a dummy API is returned. This avoids errors by bypassing
        // code that relies on unimplemented browser capabilities.
        if (!isFeatureSupported) {
            return {
                initializeSystem: noOp,
                transitionToNode: noOp,
                previousNode: noOp,
                nextNode: noOp
            };
        }
        
        presentationRootID = presentationRootID || "impress";
        
        // If an instance for this root ID already exists, return its API.
        if (instanceRegistry["presentation-root-" + presentationRootID]) {
            return instanceRegistry["presentation-root-" + presentationRootID];
        }
        
        // Storage for all presentation node data.
        var presentationStepsInfo = {};
        
        // The currently active presentation node element.
        var currentActiveStep = null;
        
        // The current visual state (position, rotation, scale) of the presentation.
        var systemState = null;
        
        // An array of all presentation node elements.
        var presentationNodes = null;
        
        // Configuration options for the current presentation.
        var systemConfiguration = null;
        
        // The scaling factor applied to the viewport.
        var viewportScalingFactor = null;        
        
        // References to key DOM elements for the presentation.
        var mainContainer = getElementByID( presentationRootID );
        var drawingCanvas = doc.createElement("div");
        
        var isInitialized = false;
        
        // NODE EVENTS
        //
        // Two primary events are triggered by this system:
        // `presentation:nodeentry` occurs when a node becomes visible
        // (after its transition concludes), and `presentation:nodeexit`
        // fires when a node is left (as a new transition begins).
        
        // Reference to the last node that was fully entered.
        var lastVisitedNode = null;
        
        // `handleNodeEntry` is invoked when a node element is entered.
        // The `presentation:nodeentry` event is dispatched only if
        // the node is different from the `lastVisitedNode`.
        var handleNodeEntry = function (currentNode) {
            if (lastVisitedNode !== currentNode) {
                dispatchCustomEvent(currentNode, "presentation:nodeentry");
                lastVisitedNode = currentNode;
            }
        };
        
        // `handleNodeExit` is called when a node element is exited.
        // The `presentation:nodeexit` event is dispatched only if
        // the node is the same as the `lastVisitedNode`.
        var handleNodeExit = function (currentNode) {
            if (lastVisitedNode === currentNode) {
                dispatchCustomEvent(currentNode, "presentation:nodeexit");
                lastVisitedNode = null;
            }
        };
        
        // `initializeNode` prepares a given node element by extracting data
        // from its data attributes and applying appropriate styles.
        var initializeNode = function ( targetNode, nodeIndex ) {
            var nodeAttributes = targetNode.dataset,
                nodeDetails = {
                    translate: {
                        x: convertToNum(nodeAttributes.x),
                        y: convertToNum(nodeAttributes.y),
                        z: convertToNum(nodeAttributes.z)
                    },
                    rotate: {
                        x: convertToNum(nodeAttributes.rotateX),
                        y: convertToNum(nodeAttributes.rotateY),
                        z: convertToNum(nodeAttributes.rotateZ || nodeAttributes.rotate)
                    },
                    scale: convertToNum(nodeAttributes.scale, 1),
                    element: targetNode
                };
            
            if ( !targetNode.id ) {
                targetNode.id = "node-" + (nodeIndex + 1);
            }
            
            presentationStepsInfo["presentation-" + targetNode.id] = nodeDetails;
            
            applyStyles(targetNode, {
                position: "absolute",
                transform: "translate(-50%,-50%)" +
                           makeTranslateTransform(nodeDetails.translate) +
                           makeRotateTransform(nodeDetails.rotate) +
                           makeScaleTransform(nodeDetails.scale),
                transformStyle: "preserve-3d"
            });
        };
        
        var addNewNode = function ( targetNode ) {
            initializeNode(targetNode);
            presentationNodes.push(targetNode);
            }
        
        // `initializeSystem` is the API function that sets up and starts the presentation.
        var initializeSystem = function () {
            if (isInitialized) { return; }
            
            // Configure the viewport for mobile devices, especially iPads.
            var viewportMetaTag = getFirstMatch("meta[name='viewport']") || doc.createElement("meta");
            viewportMetaTag.content = "width=device-width, minimum-scale=1, maximum-scale=1, user-scalable=no";
            if (viewportMetaTag.parentNode !== doc.head) {
                viewportMetaTag.name = 'viewport';
                doc.head.appendChild(viewportMetaTag);
            }
            
            // Populate the configuration object using data attributes from the root element.
            var mainContainerAttrs = mainContainer.dataset;
            systemConfiguration = {
                width: convertToNum( mainContainerAttrs.width, standardSettings.width ),
                height: convertToNum( mainContainerAttrs.height, standardSettings.height ),
                maxScale: convertToNum( mainContainerAttrs.maxScale, standardSettings.maxScale ),
                minScale: convertToNum( mainContainerAttrs.minScale, standardSettings.minScale ),                
                perspective: convertToNum( mainContainerAttrs.perspective, standardSettings.perspective ),
                transitionDuration: convertToNum( mainContainerAttrs.transitionDuration, standardSettings.transitionDuration )
            };
            
            viewportScalingFactor = calculateViewportScale( systemConfiguration );
            
            // Move child nodes of the root into the "drawingCanvas" element.
            convertToArray( mainContainer.childNodes ).forEach(function ( childElement ) {
                drawingCanvas.appendChild( childElement );
            });
            mainContainer.appendChild(drawingCanvas);
            
            // Apply initial document and body styles.
            doc.documentElement.style.height = "100%";
            
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
                transform: makePerspectiveTransform( systemConfiguration.perspective/viewportScalingFactor ) + makeScaleTransform( viewportScalingFactor )
            });
            applyStyles(drawingCanvas, containerBaseStyles);
            
            documentBody.classList.remove("presentation-disabled");
            documentBody.classList.add("presentation-enabled");
            
            // Locate and initialize all presentation nodes.
            presentationNodes = getAllMatches(".step", mainContainer);
            presentationNodes.forEach( initializeNode );
            
            // Set the initial state for the drawing canvas.
            systemState = {
                translate: { x: 0, y: 0, z: 0 },
                rotate:    { x: 0, y: 0, z: 0 },
                scale:     1
            };
            
            isInitialized = true;
            
            dispatchCustomEvent(mainContainer, "presentation:init", { api: instanceRegistry[ "presentation-root-" + presentationRootID ] });
        };
        
        // `retrieveNode` is a helper to get a node element.
        // It accepts an index (number), an ID (string), or a DOM element itself.
        var retrieveNode = function ( nodeIdentifier ) {
            if (typeof nodeIdentifier === "number") {
                nodeIdentifier = nodeIdentifier < 0 ? presentationNodes[ presentationNodes.length + nodeIdentifier] : presentationNodes[ nodeIdentifier ];
            } else if (typeof nodeIdentifier === "string") {
                nodeIdentifier = getElementByID(nodeIdentifier);
            }
            return (nodeIdentifier && nodeIdentifier.id && presentationStepsInfo["presentation-" + nodeIdentifier.id]) ? nodeIdentifier : null;
        };
        
        // Used to clear the timer for the `presentation:nodeentry` event.
        var nodeEntryTimer = null;
        
        // (naugtur)
        // `registerTransformCallback` API function: sets a callback to relay current transformations to an external editing tool.
        var transformUpdateCallback = null;
        var registerTransformCallback = function(callbackFn){
          transformUpdateCallback=callbackFn;
        }
        
        // `transitionToNode` is the API function that navigates to the node
        // specified by `targetNode` (index, ID, or element), with an optional
        // `transitionDurationMs`.
        var transitionToNode = function ( targetNode, transitionDurationMs ) {
            
            if ( !isInitialized || !(targetNode = retrieveNode(targetNode)) ) {
                // System not ready, or the provided identifier doesn't map to a valid node.
                return false;
            }
            
            // To counteract browser scrolling behavior when a link gains focus,
            // which can disrupt our precise positioning, we force the page to scroll back to the top.
            // If you know a better solution, please share!
            winObj.scrollTo(0, 0);
            
            var nodeDetails = presentationStepsInfo["presentation-" + targetNode.id];
            
            if ( currentActiveStep ) {
                currentActiveStep.classList.remove("active");
                documentBody.classList.remove("presentation-on-" + currentActiveStep.id);
            }
            targetNode.classList.add("active");
            
            documentBody.classList.add("presentation-on-" + targetNode.id);
            
            // Calculate the desired state of the drawing canvas based on the target node.
            var destinationState = {
                rotate: {
                    x: -nodeDetails.rotate.x,
                    y: -nodeDetails.rotate.y,
                    z: -nodeDetails.rotate.z
                },
                translate: {
                    x: -nodeDetails.translate.x,
                    y: -nodeDetails.translate.y,
                    z: -nodeDetails.translate.z
                },
                scale: 1 / nodeDetails.scale
            };
            
            // (naugtur)
            // Execute the registered callback if present.
            if(transformUpdateCallback) { 
                transformUpdateCallback({
                  scale:nodeDetails.scale,
                  rotate:nodeDetails.rotate,
                  translate:nodeDetails.translate
                });
            }
            
            // Determine if the transition involves zooming in.
            // This dictates the transition style: zooming in starts with move/rotate and delays scaling,
            // while zooming out starts with scaling down and delays move/rotate.
            var isZoomingIn = destinationState.scale >= systemState.scale;
            
            transitionDurationMs = convertToNum(transitionDurationMs, systemConfiguration.transitionDuration);
            var transitionDelayMs = (transitionDurationMs / 2);
            
            // If the same node is selected again, re-calculate the viewport scaling.
            // This typically happens due to a window resize event.
            if (targetNode === currentActiveStep) {