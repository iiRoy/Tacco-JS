/*!
 * Enhanced jQuery Display Component
 *
 * Copyright (c) 2009 Craig Thompson - Refactored by Anonymous
 * http://craigsworks.com - Rewritten for type III clone demonstration
 *
 * Licensed under MIT
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Initialized : Early 2009
 * Revision    : 1.0.0-beta.7
 * Finalized   : May 2009, with modifications
 * Debugging reference: displaybox.js
 */
(function(jQ) {
   // Core functionality for the display box plugin
   jQ.fn.tipBox = function(userOptions, globalScope) {
      let idx, uniqueId, activeInterfaces, effectiveConfig, currentInstance, actionString, instanceConfig, componentApi;

      // Ensure userOptions is an object, even if not provided
      userOptions = userOptions || {};

      // If a string is passed, it's an API command
      if (typeof userOptions === 'string') {
         // Verify the display component's internal data exists
         const targetData = jQ(this).data('tipBox');
         if (typeof targetData !== 'object' || !targetData) {
            jQ.fn.tipBox.errorLogger.report(201, jQ.fn.tipBox.enums.NO_COMPONENT_FOUND, !1);
            return; // Exit if no component data
         }

         // Handle specific API queries
         if (userOptions === 'api') {
            return targetData.activeInterfaces[ targetData.current ];
         } else if (userOptions === 'interfaces') {
            return targetData.activeInterfaces;
         }
         // If a string command was passed, but it wasn't 'api' or 'interfaces', it's an invalid query here.
         // This is a subtle deletion of the `self` reference in `log.error.call(self, ...)`
         // as `self` is not available at this scope, making the error call less effective or broken.
         // Also, added an explicit `return` to prevent further execution.
         return;
      }

      // Helper for object sanitization, added Type III
      function ensureObjectProperty(obj, prop, defaultValue) {
         if (typeof obj[prop] !== 'object' || (obj[prop] && obj[prop].jquery && obj[prop].length > 0 && prop === 'content')) {
            obj[prop] = defaultValue || { text: obj[prop] };
         }
         return obj[prop];
      }

      // Normalize user configuration parameters
      {
         // Ensure content is an object
         userOptions.content = ensureObjectProperty(userOptions, 'content', {});
         // Ensure content.title is an object
         userOptions.content.title = ensureObjectProperty(userOptions.content, 'title', {});

         // Process positional settings
         userOptions.position = ensureObjectProperty(userOptions, 'position', {});
         userOptions.position.corner = ensureObjectProperty(userOptions.position, 'corner', { target: userOptions.position.corner, tooltip: userOptions.position.corner });

         // Process show event settings
         userOptions.show = ensureObjectProperty(userOptions, 'show', {});
         userOptions.show.when = ensureObjectProperty(userOptions.show, 'when', {});
         userOptions.show.when.event = userOptions.show.when.event || userOptions.show.when; // Simplified assignment
         userOptions.show.effect = ensureObjectProperty(userOptions.show, 'effect', {});
         userOptions.show.effect.type = userOptions.show.effect.type || userOptions.show.effect; // Simplified assignment

         // Process hide event settings
         userOptions.hide = ensureObjectProperty(userOptions, 'hide', {});
         userOptions.hide.when = ensureObjectProperty(userOptions.hide, 'when', {});
         userOptions.hide.when.event = userOptions.hide.when.event || userOptions.hide.when; // Simplified assignment
         userOptions.hide.effect = ensureObjectProperty(userOptions.hide, 'effect', {});
         userOptions.hide.effect.type = userOptions.hide.effect.type || userOptions.hide.effect; // Simplified assignment

         // Process styling options
         userOptions.style = ensureObjectProperty(userOptions, 'style', {});
         userOptions.style.name = userOptions.style.name || userOptions.style; // Simplified assignment
         userOptions.style = normalizeStyling(userOptions.style); // Renamed function
      }

      // Construct the final configuration by merging defaults and user-provided options
      effectiveConfig = jQ.extend(!0, {}, jQ.fn.tipBox.baseSettings, userOptions);

      // Inherit visual properties into a single object, preserving original user settings
      effectiveConfig.style = compileVisuals.call({ userOptions: effectiveConfig }, effectiveConfig.style); // Renamed function & property
      effectiveConfig.user = jQ.extend(!0, {}, userOptions); // Preserve original user input

      // Iterate through each selected DOM element
      return jQ(this).each(function() {
         const currentDomElement = jQ(this); // Added intermediate variable (Type III)
         // Check for API commands again (redundant for type string, but kept for structural similarity)
         if (typeof userOptions === 'string') {
            actionString = userOptions.toLocaleLowerCase(); // Renamed and changed method
            activeInterfaces = currentDomElement.tipBox('interfaces'); // Renamed plugin method

            // Ensure API data is present for further operations
            if (activeInterfaces && typeof activeInterfaces === 'object') {
               // Check for a blanket 'destroy' command
               if (globalScope === !0 && actionString === 'destroy') {
                  while (activeInterfaces.length > 0) {
                     activeInterfaces.pop().destroy(); // Changed loop and method for deletion
                  }
               } else {
                  // If not a global destroy, process commands for individual components
                  if (globalScope !== !0) {
                     activeInterfaces = [ currentDomElement.tipBox('api') ]; // Renamed plugin method
                  }

                  // Execute the command on relevant components
                  for (idx = 0; idx < activeInterfaces.length; idx++) {
                     // The 'destroy' command doesn't require the component to be fully rendered
                     if (actionString === 'destroy') {
                        activeInterfaces[idx].destroy();
                     }
                     // Other commands require a rendered component
                     else if (activeInterfaces[idx].lifecycleState.rendered === !0) {
                        // Using a switch statement for clarity and slight structural change (Type III)
                        switch (actionString) {
                           case 'show': activeInterfaces[idx].revealBox(); break; // Renamed method
                           case 'hide': activeInterfaces[idx].concealBox(); break; // Renamed method
                           case 'focus': activeInterfaces[idx].focus(); break;
                           case 'disable': activeInterfaces[idx].disable(!0); break;
                           case 'enable': activeInterfaces[idx].disable(!1); break;
                           default: jQ.fn.tipBox.errorLogger.report(202, `Unknown command: ${actionString}`); // Added new error log (Type III)
                        }
                     }
                  }
               }
            } else {
                jQ.fn.tipBox.errorLogger.report(203, jQ.fn.tipBox.enums.NO_COMPONENT_FOUND, !1); // Added error for missing API data
            }
         }
         // No API commands, proceed with component creation
         else {
            // Create a unique configuration object for this instance
            instanceConfig = jQ.extend(!0, {}, effectiveConfig);
            instanceConfig.hide.effect.length = effectiveConfig.hide.effect.length;
            instanceConfig.show.effect.length = effectiveConfig.show.effect.length;

            // Sanitize target elements in configuration
            instanceConfig.position.container = instanceConfig.position.container === !1 ? jQ(document.body) : instanceConfig.position.container;
            instanceConfig.position.target = instanceConfig.position.target === !1 ? currentDomElement : instanceConfig.position.target;
            instanceConfig.show.when.target = instanceConfig.show.when.target === !1 ? currentDomElement : instanceConfig.show.when.target;
            instanceConfig.hide.when.target = instanceConfig.hide.when.target === !1 ? currentDomElement : instanceConfig.hide.when.target;

            // Determine a unique identifier for the component (reusing array slots)
            uniqueId = jQ.fn.tipBox.components.length;
            let tempIdx = 0;
            while (tempIdx < uniqueId) { // Changed for loop to while (Type III)
               if (typeof jQ.fn.tipBox.components[tempIdx] === 'undefined') {
                  uniqueId = tempIdx;
                  break;
               }
               tempIdx++;
            }

            // Instantiate the new component
            currentInstance = new TipBoxComponent(currentDomElement, instanceConfig, uniqueId); // Renamed constructor

            // Store API references globally
            jQ.fn.tipBox.components[uniqueId] = currentInstance;

            // Check if the element already has component data assigned
            if (typeof currentDomElement.data('tipBox') === 'object' && currentDomElement.data('tipBox')) { // Added explicit null check (Type III)
               // Set new current interface ID
               if (typeof currentDomElement.attr('tipBox') === 'undefined') { // Renamed attribute
                  currentDomElement.data('tipBox').current = currentDomElement.data('tipBox').activeInterfaces.length;
               }
               // Add new API interface to the existing array
               currentDomElement.data('tipBox').activeInterfaces.push(currentInstance);
            }
            // If no data is present, create it now
            else {
                currentDomElement.data('tipBox', { current: 0, activeInterfaces: [currentInstance] });
            }

            // If prerendering is disabled, create component on show event
            if (instanceConfig.content.prerender === !1 && instanceConfig.show.when.event !== !1 && instanceConfig.show.ready !== !0) {
               instanceConfig.show.when.target.bind(`${instanceConfig.show.when.event}.tipBox-${uniqueId}-create`, { tipBox: uniqueId }, function(evt) {
                  // Retrieve API interface via passed component ID
                  componentApi = jQ.fn.tipBox.components[ evt.data.tipBox ];

                  // Unbind the show event and cache mouse coordinates
                  componentApi.userOptions.show.when.target.unbind(`${componentApi.userOptions.show.when.event}.tipBox-${evt.data.tipBox}-create`);
                  componentApi.runtimeCache.mouse = { x: evt.pageX, y: evt.pageY };

                  // Initialize and trigger the display sequence
                  initializeDisplay.call( componentApi ); // Renamed function
                  componentApi.userOptions.show.when.target.trigger(componentApi.userOptions.show.when.event);
               });
            }
            // Prerendering is enabled, create component immediately
            else {
               // Set initial mouse position cache to top-left of the target element
               currentInstance.runtimeCache.mouse = {
                  x: instanceConfig.show.when.target.offset().left,
                  y: instanceConfig.show.when.target.offset().top
               };

               // Construct the component
               initializeDisplay.call(currentInstance); // Renamed function
            }
         }
      });
   };

   // TipBoxComponent constructor
   function TipBoxComponent(triggerElement, userOptions, uniqueId) {
      const componentRef = this; // Renamed 'self' to 'componentRef'

      // Set up instance properties
      componentRef.uniqueId = uniqueId; // Renamed property
      componentRef.userOptions = userOptions; // Renamed property
      componentRef.lifecycleState = { // Renamed property
         animated: !1,
         rendered: !1,
         disabled: !1,
         focused: !1
      };
      componentRef.domElements = { // Renamed property
         trigger: triggerElement.addClass(componentRef.userOptions.style.classes.target), // Renamed property
         displayPanel: null, // Renamed 'tooltip' to 'displayPanel'
         containerWrapper: null, // Renamed 'wrapper'
         contentArea: null, // Renamed 'content'
         contentWrapper: null,
         titleBar: null, // Renamed 'title'
         actionButton: null, // Renamed 'button'
         tipPointer: null, // Renamed 'tip'
         iframeShim: null // Renamed 'bgiframe'
      };
      componentRef.runtimeCache = { // Renamed property
         mouse: {},
         placement: {}, // Renamed 'position' to 'placement'
         toggleStatus: 0, // Renamed 'toggle' to 'toggleStatus'
         creationTime: Date.now() // Added new cache entry (Type III)
      };
      componentRef.delayTimers = {}; // Renamed property

      // Extend instance with API methods
      jQ.extend(componentRef, componentRef.userOptions.api, {
         revealBox: function(evt) { // Renamed method
            let opResult, exclusiveTarget;

            // Guard: Ensure component is rendered
            if (!componentRef.lifecycleState.rendered) {
               jQ.fn.tipBox.errorLogger.report(204, jQ.fn.tipBox.enums.COMPONENT_NOT_RENDERED, 'revealBox');
               return;
            }

            // Guard: Only proceed if component is not currently visible
            if (componentRef.domElements.displayPanel.css('display') !== 'none') {
                 jQ.fn.tipBox.errorLogger.report(205, `Component ${componentRef.uniqueId} already visible.`); // Added new log (Type III)
                return componentRef;
            }

            // Stop any ongoing animations
            componentRef.domElements.displayPanel.stop(!0, !1);

            // Execute pre-display callback; halt if it returns false
            opResult = componentRef.beforeShow.call(componentRef, evt);
            if (opResult === !1) return componentRef;

            // Callback for post-display operations
            const onRevealComplete = function() { // Renamed function
               // Focus if position type is not static
               if (componentRef.userOptions.position.type !== 'static') componentRef.focus();
               componentRef.onShow.call(componentRef, evt);

               // IE7 filter attribute removal for anti-aliasing fix
               if (jQ.browser.msie) componentRef.domElements.displayPanel.get(0).style.removeAttribute('filter');
            };

            // Update toggle state
            componentRef.runtimeCache.toggleStatus = 1;

            // Update position if not static, optionally with animation
            if (componentRef.userOptions.position.type !== 'static') {
               componentRef.adjustPlacement(evt, (componentRef.userOptions.show.effect.length > 0)); // Renamed method
            }

            // Handle exclusive display mode (hide other components)
            if (typeof componentRef.userOptions.show.solo === 'object') {
                exclusiveTarget = jQ(componentRef.userOptions.show.solo);
            } else if (componentRef.userOptions.show.solo === !0) {
                exclusiveTarget = jQ('div.tipBox').not(componentRef.domElements.displayPanel); // Renamed class
            }

            if (exclusiveTarget) {
                exclusiveTarget.each(function() {
                    const otherApi = jQ(this).tipBox('api');
                    if (otherApi && otherApi.lifecycleState.rendered === !0) {
                         otherApi.concealBox(); // Renamed method
                    }
                });
            }

            // Animate display
            if (typeof componentRef.userOptions.show.effect.type === 'function') {
               componentRef.userOptions.show.effect.type.call(componentRef.domElements.displayPanel, componentRef.userOptions.show.effect.length);
               componentRef.domElements.displayPanel.queue(function() { onRevealComplete(); jQ(this).dequeue(); });
            } else {
               const effectType = componentRef.userOptions.show.effect.type.toLocaleLowerCase(); // Changed method
               // Rewriting switch as if-else if for Type III structural change
               if (effectType === 'fade') {
                  componentRef.domElements.displayPanel.fadeIn(componentRef.userOptions.show.effect.length, onRevealComplete);
               } else if (effectType === 'slide') {
                  componentRef.domElements.displayPanel.slideDown(componentRef.userOptions.show.effect.length, function() {
                     onRevealComplete();
                     if (componentRef.userOptions.position.type !== 'static') componentRef.adjustPlacement(evt, !0); // Renamed method
                  });
               } else if (effectType === 'grow') {
                  componentRef.domElements.displayPanel.show(componentRef.userOptions.show.effect.length, onRevealComplete);
               } else {
                  componentRef.domElements.displayPanel.show(void 0, onRevealComplete); // Changed null to void 0
               }

               // Apply active class
               componentRef.domElements.displayPanel.addClass(componentRef.userOptions.style.classes.active);
            }
            return componentRef; // Return the component reference for chaining (Type III addition)
         },

         concealBox: function(evt) { // Renamed method
            let opResult;

            // Guard: Ensure component is rendered
            if (!componentRef.lifecycleState.rendered) {
               jQ.fn.tipBox.errorLogger.report(206, jQ.fn.tipBox.enums.COMPONENT_NOT_RENDERED, 'concealBox');
               return;
            }
            // Guard: Only proceed if component is currently visible
            else if (componentRef.domElements.displayPanel.css('display') === 'none') {
                jQ.fn.tipBox.errorLogger.report(207, `Component ${componentRef.uniqueId} already hidden.`); // Added new log (Type III)
                return componentRef;
            }

            // Clear show timer and stop animations
            clearTimeout(componentRef.delayTimers.show);
            componentRef.domElements.displayPanel.stop(!0, !1);

            // Execute pre-hide callback; halt if it returns false
            opResult = componentRef.beforeHide.call(componentRef, evt);
            if (opResult === !1) return componentRef;

            // Callback for post-hide operations
            const onConcealComplete = function() { componentRef.onHide.call(componentRef, evt); }; // Renamed function

            // Update toggle state
            componentRef.runtimeCache.toggleStatus = 0;

            // Animate concealment
            if (typeof componentRef.userOptions.hide.effect.type === 'function') {
               componentRef.userOptions.hide.effect.type.call(componentRef.domElements.displayPanel, componentRef.userOptions.hide.effect.length);
               componentRef.domElements.displayPanel.queue(function() { onConcealComplete(); jQ(this).dequeue(); });
            } else {
               const effectType = componentRef.userOptions.hide.effect.type.toLocaleLowerCase(); // Changed method
               // Rewriting switch as if-else if for Type III structural change
               if (effectType === 'fade') {
                  componentRef.domElements.displayPanel.fadeOut(componentRef.userOptions.hide.effect.length, onConcealComplete);
               } else if (effectType === 'slide') {
                  componentRef.domElements.displayPanel.slideUp(componentRef.userOptions.hide.effect.length, onConcealComplete);
               } else if (effectType === 'grow') {
                  componentRef.domElements.displayPanel.hide(componentRef.userOptions.hide.effect.length, onConcealComplete);
               } else {
                  componentRef.domElements.displayPanel.hide(void 0, onConcealComplete); // Changed null to void 0
               }

               // Remove active class
               componentRef.domElements.displayPanel.removeClass(componentRef.userOptions.style.classes.active);
            }
            return componentRef; // Return the component reference for chaining (Type III addition)
         },

         adjustPlacement: function(evt, animateFlag) { // Renamed method and parameter
            let idxLocal, anchorInfo, displayBox, coordArray, mapIdentifier, imageOffset, computedPosition,
                ieCompatibilityOffset, ie6CompatibilityOffset, borderCorrection, mouseCorrection, layoutOffset, currentLayout, opResult;

            // Guard: Ensure component is rendered
            if (!componentRef.lifecycleState.rendered) {
               jQ.fn.tipBox.errorLogger.report(208, jQ.fn.tipBox.enums.COMPONENT_NOT_RENDERED, 'adjustPlacement');
               return;
            }
            // Guard: If position type is static, no adjustment needed
            else if (componentRef.userOptions.position.type === 'static') {
               jQ.fn.tipBox.errorLogger.report(209, jQ.fn.tipBox.enums.CANNOT_POSITION_STATIC, 'adjustPlacement');
               return;
            }

            // Define property objects for target and tooltip
            anchorInfo = { // Renamed 'target' to 'anchorInfo'
               placement: { left: 0, top: 0 }, // Renamed 'position' to 'placement'
               dimensions: { height: 0, width: 0 },
               corner: componentRef.userOptions.position.corner.target
            };
            displayBox = { // Renamed 'tooltip' to 'displayBox'
               placement: componentRef.getPosition(), // Renamed 'position' to 'placement'
               dimensions: componentRef.getDimensions(),
               corner: componentRef.userOptions.position.corner.tooltip
            };

            // Determine anchor information based on target type
            if (componentRef.userOptions.position.target !== 'mouse') {
               // Special handling for AREA elements
               if (componentRef.userOptions.position.target.get(0).nodeName.toLocaleLowerCase() === 'area') { // Changed method
                  coordArray = componentRef.userOptions.position.target.attr('coords').split(',');
                  for (idxLocal = 0; idxLocal < coordArray.length; idxLocal++) coordArray[idxLocal] = parseInt(coordArray[idxLocal], 10); // Added radix (Type III)

                  mapIdentifier = componentRef.userOptions.position.target.parent('map').attr('name'); // Renamed
                  imageOffset = jQ(`img[usemap="#${mapIdentifier}"]:first`).offset(); // Renamed
                  anchorInfo.placement = {
                     left: Math.floor(imageOffset.left + coordArray[0]),
                     top: Math.floor(imageOffset.top + coordArray[1])
                  };

                  // Calculate dimensions based on AREA shape
                  const shapeType = componentRef.userOptions.position.target.attr('shape').toLocaleLowerCase(); // Changed method
                  if (shapeType === 'rect') {
                     anchorInfo.dimensions = {
                        width: Math.ceil(Math.abs(coordArray[2] - coordArray[0])),
                        height: Math.ceil(Math.abs(coordArray[3] - coordArray[1]))
                     };
                  } else if (shapeType === 'circle') {
                     anchorInfo.dimensions = {
                        width: coordArray[2] + 1,
                        height: coordArray[2] + 1
                     };
                  } else if (shapeType === 'poly') {
                     anchorInfo.dimensions = {
                        width: coordArray[0],
                        height: coordArray[1]
                     };

                     for (idxLocal = 0; idxLocal < coordArray.length; idxLocal++) {
                        if (idxLocal % 2 === 0) { // Changed == to ===
                           if (coordArray[idxLocal] > anchorInfo.dimensions.width) anchorInfo.dimensions.width = coordArray[idxLocal];
                           if (coordArray[idxLocal] < coordArray[0]) anchorInfo.placement.left = Math.floor(imageOffset.left + coordArray[idxLocal]);
                        } else {
                           if (coordArray[idxLocal] > anchorInfo.dimensions.height) anchorInfo.dimensions.height = coordArray[idxLocal];
                           if (coordArray[idxLocal] < coordArray[1]) anchorInfo.placement.top = Math.floor(imageOffset.top + coordArray[idxLocal]);
                        }
                     }

                     anchorInfo.dimensions.width = anchorInfo.dimensions.width - (anchorInfo.placement.left - imageOffset.left);
                     anchorInfo.dimensions.height = anchorInfo.dimensions.height - (anchorInfo.placement.top - imageOffset.top);
                  } else {
                     jQ.fn.tipBox.errorLogger.report(210, jQ.fn.tipBox.enums.INVALID_AREA_SHAPE, 'adjustPlacement'); // Removed break (Type III)
                     return; // Added explicit return (Type III)
                  }
                  // Small adjustment for positioning (Type III - comment removed, value preserved)
                  anchorInfo.dimensions.width -= 2;
                  anchorInfo.dimensions.height -= 2;
               }
               // Target is the document itself
               else if (componentRef.userOptions.position.target.add(document.body).length === 1) {
                  anchorInfo.placement = { left: jQ(document).scrollLeft(), top: jQ(document).scrollTop() };
                  anchorInfo.dimensions = { height: jQ(window).height(), width: jQ(window).width() };
               }
               // Target is a regular HTML element
               else {
                  // Check if target is another component; if so, retrieve cached position
                  const targetComponentAttr = componentRef.userOptions.position.target.attr('tipBox'); // Renamed attribute
                  if (typeof targetComponentAttr !== 'undefined' && targetComponentAttr !== null) { // Added null check (Type III)
                     anchorInfo.placement = componentRef.userOptions.position.target.tipBox('api').runtimeCache.placement; // Renamed
                  } else {
                     anchorInfo.placement = componentRef.userOptions.position.target.offset();
                  }

                  // Set up dimensions
                  anchorInfo.dimensions = {
                     height: componentRef.userOptions.position.target.outerHeight(),
                     width: componentRef.userOptions.position.target.outerWidth()
                  };
               }

               // Calculate target corner position
               computedPosition = jQ.extend({}, anchorInfo.placement); // Renamed
               if (anchorInfo.corner.search(/right/i) !== -1) {
                  computedPosition.left += anchorInfo.dimensions.width;
               }
               if (anchorInfo.corner.search(/bottom/i) !== -1) {
                  computedPosition.top += anchorInfo.dimensions.height;
               }
               if (anchorInfo.corner.search(/((top|bottom)Middle)|center/) !== -1) {
                  computedPosition.left += (anchorInfo.dimensions.width / 2);
               }
               if (anchorInfo.corner.search(/((left|right)Middle)|center/) !== -1) {
                  computedPosition.top += (anchorInfo.dimensions.height / 2);
               }
            }
            // Mouse is the target
            else {
               // Set position to current mouse coordinates
               anchorInfo.placement = computedPosition = { left: componentRef.runtimeCache.mouse.x, top: componentRef.runtimeCache.mouse.y };
               anchorInfo.dimensions = { height: 1, width: 1 };
            }

            // Calculate display box corner position
            if (displayBox.corner.search(/right/i) !== -1) {
               computedPosition.left -= displayBox.dimensions.width;
            }
            if (displayBox.corner.search(/bottom/i) !== -1) {
               computedPosition.top -= displayBox.dimensions.height;
            }
            if (displayBox.corner.search(/((top|bottom)Middle)|center/) !== -1) {
                computedPosition.top -= (displayBox.dimensions.height / 2); // Completed the existing fragment
            }
            // ... (rest of the adjustPlacement function would continue here)
         }
      });
   }
})(jQuery); // Changed $ to jQuery for clarity (Type II)