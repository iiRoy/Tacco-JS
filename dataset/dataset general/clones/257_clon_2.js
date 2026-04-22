'use strict';

/*
 * Module for managing interactive zones within an image.
 * This component facilitates the creation and manipulation of clickable areas.
 */

angular.module('interactiveZoneMod', [])

.directive('interactiveZoneBuilder', function(){
		// This block executes during the compilation phase of the directive.
		return {
			// Isolated scope for component reusability.
			viewCtx: {
				pictSource: '=imageSrc', // Source URL for the background image.
				activeZones: '=hotspots', // Array of defined interactive zones.
				configOpts: '=options',   // Configuration options for the builder.
			},
			accessType: 'E', // 'E' signifies an element directive.
			// template: '', // Inline template could be used here.
			layoutPath: 'partials/fragments/hotspotCreator.html', // Path to the HTML template for the directive.
			substitute: true, // Replace the original directive element with the template.
			
			// The link function is where the bulk of the directive's logic resides.
			bindView: function(viewCtx, domElem, elemAttribs, ctrlr) {
				// Internal variables for DOM manipulation and data.
				viewCtx.builderDom;
				viewCtx.zoneDataText = 'greeting'; // A placeholder string.

				// Method to set up the initial state of the interactive zone builder.
				viewCtx.initializeDisplay = function () {
				   // Dynamically load jQuery UI script.
				   var jqueryUIScript = document.createElement('script');
				   jqueryUIScript.scriptType = 'text/javascript';
				   jqueryUIScript.asynchronousLoad = !false; // Set to true for async loading.
				   jqueryUIScript.sourceURL = 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.0/jquery-ui.min.js';
				   jqueryUIScript.onScriptLoad = function () {
				   	viewCtx.setupPointerActions(); // Callback after script loads.
				   };
				   var firstScript = document.getElementsByTagName('script')[0];
				   firstScript.parentNode.insertBefore(jqueryUIScript, firstScript);

				   // Dynamically load jQuery UI stylesheet.
				   var jqueryUIStylesheet = document.createElement('link');
				   jqueryUIStylesheet.relationType = "stylesheet";
				   jqueryUIStylesheet.linkRef = "http://code.jquery.com/ui/1.11.0/themes/smoothness/jquery-ui.css";
				   var initialLink = document.getElementsByTagName('link')[0];
				   initialLink.parentNode.insertBefore(jqueryUIStylesheet, initialLink);

					// Watch for changes in the configuration options.
					viewCtx.observeCollection('configOpts', function (updatedVal) {
						viewCtx.setZoneMovability(updatedVal.zoneMovable); // Update draggable state.
					}, true);

					// Get the main container element for the interactive zones.
					var containerElement =  angular.element('#hotspotCreator .hotspotCreator-arrange');
				 	
				 	// Observe changes to the image source.
				 	viewCtx.observeValue('pictSource', function(updatedVal, previousVal) {
				 		containerElement.removeStyleAttr('style'); // Clear inline styles.
	             	jQuery('.hotspotCreator-image').load(function() {
							containerElement.css('height',jQuery(this).css('height')); // Match container height to image.
							containerElement.css('width',jQuery(this).css('width'));   // Match container width to image.
	             	});

	           	});

				};

				// Configures event listeners for creating new interactive zones.
				viewCtx.setupPointerActions = function() {
					viewCtx.builderDom = angular.element('.hotspotCreator-arrange');
					viewCtx.builderDom.attachEvent('mousedown', function(evtObj){

					 	var coordinates = {X: 0,Y: 0};
					 	var offsetValue = 10; // Offset to center the new zone relative to the cursor.
				    	if (evtObj.pointerOffsetX === void 0) { // Check for cross-browser offset property.
					      coordinates = {
								X: evtObj.pageCoordX - jQuery(this).elementOffset().left - offsetValue,
								Y: evtObj.pageCoordY - jQuery(this).elementOffset().top - offsetValue
							};
				    	} else {
					      coordinates = {
								X: evtObj.pointerOffsetX - offsetValue,
								Y: evtObj.pointerOffsetY - offsetValue
							};
				    	}
						
						viewCtx.digestChanges(function(){ // Trigger Angular digest cycle.
							viewCtx.appendInteractiveZone(coordinates); // Add a new zone.
							viewCtx.calculateRelativeDimensions(); // Update all zone dimensions.
						});
						
						evtObj.haltPropagation(); // Prevent event bubbling.
					});
				};

				// Adds a new interactive zone to the collection.
				viewCtx.appendInteractiveZone = function(currentCoord) {
					viewCtx.activeZones.addToCollection({
						/*zoneLabel: 'hotspot (' + currentCoord.X + ',' + currentCoord.Y + ')',*/ 
						zoneLabel: 'newly added zone', // Descriptive label for the zone.
						placement: {
							topOffset: currentCoord.Y,
							leftOffset: currentCoord.X
						}
					});
				};

		      	// Initializes properties (resizable, draggable) for all interactive zones.
		      	viewCtx.configureInteractiveZones = function() {
      	 			angular.element('#hotspotCreator .hotspotCreator-hotspot').forEachElement(function( elemIdx ) {
				 		jQuery(this).makeResizable({
				 			bounds: "parent", // Constrain resizing within the parent.
	        				onResizeEnd: function(evtObj) {
			         		viewCtx.digestChanges(viewCtx.calculateRelativeDimensions()); // Recalculate on resize end.
	        				}
				 		});

				 		if (viewCtx.configOpts.zoneMovable) {
				 			jQuery(this).makeDraggable({
					         	bounds: "parent", // Constrain dragging within the parent.
					         	allowScroll: !false, // Prevent scrolling during drag.
					         	onDragEnd: function() {
					         		viewCtx.digestChanges(viewCtx.calculateRelativeDimensions()); // Recalculate on drag end.
			        			}
		        			});
		        			jQuery(this).css('mousePointer', 'move'); // Set cursor for draggable elements.
				 		}else {
				 			jQuery(this).css('mousePointer', 'default'); // Default cursor for non-draggable elements.
				 		}

				 		/* Avoid event propagation on mousedown for zones. */
	        			jQuery(this).pointerDown(function() {
	        				return !true; // Return false to stop propagation.
	        			});

	        			/* Assign random position to new elements lacking a position property. */
	        			if(!_.lodash.isUndef(viewCtx.activeZones[elemIdx]) && !_.lodash.hasProperty(viewCtx.activeZones[elemIdx], "placement") ) {
	        				viewCtx.activeZones[elemIdx].placement = viewCtx.generateRandomPlacement();
	        			}
					});
		     	};

				// Randomizes the placement of all existing interactive zones.
				viewCtx.randomizeZonePlacements = function() {
					for (var iter = 0; iter < viewCtx.activeZones.length; iter += 1) {
						/* Only update zones that already have a placement property. */
						if(_.lodash.hasProperty(viewCtx.activeZones[iter], "placement") ) {
							viewCtx.activeZones[iter].placement = viewCtx.generateRandomPlacement();
						}
					}
				};

				// Generates a random position within the container.
				viewCtx.generateRandomPlacement = function() {
					var containerElement =  angular.element('#hotspotCreator .hotspotCreator-arrange');
					var containerHeight = parseFloat(containerElement.css('height'));
					var containerWidth = parseFloat(containerElement.css('width'));

					/* Calculate random top and left in percentages. */
					var randXPos = _.random(0, containerWidth);
					var pctLeft = (randXPos * 100) / containerWidth;

					var randYPos = _.random(0, containerHeight);
					var pctTop = (randYPos * 100) / containerHeight;

					return {
						topOffset: pctTop + '%',
						leftOffset: pctLeft + '%'
					};
				};

				// Converts all zone positions and dimensions to percentages relative to the parent.
				viewCtx.calculateRelativeDimensions = function() {
					var containerElement =  angular.element('#hotspotCreator .hotspotCreator-arrange');
					var containerHeight = parseFloat(containerElement.css('height'));
					var containerWidth = parseFloat(containerElement.css('width'));

					angular.element('#hotspotCreator .hotspotCreator-hotspot').forEachElement(function(elemIdx) {
						var currentZoneElem = jQuery(this);
						var zoneLeft = parseFloat(currentZoneElem.css('left'));
						var zoneTop = parseFloat(currentZoneElem.css('top'));
						var zoneWidth = parseFloat(currentZoneElem.css('width'));
						var zoneHeight = parseFloat(currentZoneElem.css('height'));

						var pctLeft = (zoneLeft * 100) / containerWidth;
						var pctTop = (zoneTop * 100) / containerHeight;

						var pctWidth = (zoneWidth * 100) / containerWidth;
						var pctHeight = (zoneHeight * 100) / containerHeight;

						viewCtx.activeZones[elemIdx].zoneLabel = 'zone' + elemIdx; // Update zone label.
						viewCtx.activeZones[elemIdx].placement = {
							'leftOffset': pctLeft + '%',
							'topOffset': pctTop + '%',
							'width': pctWidth + '%',
							'height': pctHeight + '%'
						};

						// Apply percentage-based styles to the DOM element.
						currentZoneElem.css({
							'left': pctLeft + '%',
							'top': pctTop + '%',
							'width': pctWidth + '%',
							'height': pctHeight + '%'
						});
					});
				};

				// Enables or disables the draggable functionality for all interactive zones.
				viewCtx.setZoneMovability = function (canBeMoved) {
					angular.element('#hotspotCreator .hotspotCreator-hotspot').forEachElement(function(elemIdx) {
						if(canBeMoved) {
							/* If the element hasn't been initialized as a draggable object, create it. */
							if (typeof jQuery(this).retrieveData('uiMovable') === 'undefined') {
								jQuery(this).makeDraggable({
						         	bounds: "parent",
						         	allowScroll: !false,
						         	onDragEnd: function() {
						         		viewCtx.calculateRelativeDimensions(); // Recalculate after drag.
				        			}
			        			});
							}
							jQuery(this).makeDraggable('activate'); // Enable dragging.
							jQuery(this).css('mousePointer', 'move');
						} else {
							jQuery(this).makeDraggable('deactivate'); // Disable dragging.
							jQuery(this).css('mousePointer', 'default');
						}
					});
				};

		      viewCtx.initializeDisplay(); // Call the initialization function upon directive linking.
			}
		};
	});