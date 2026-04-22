'use strict';

// This module provides advanced functionalities for managing interactive graphical regions.
angular.module('interactiveZoneApp', [])

// The 'interactiveZoneEditor' directive allows users to define and manipulate zones
// directly on a displayed image within an Angular application.
.directive('interactiveZoneEditor', function() {
    // Defines the configuration object for the directive.
    const componentConfig = {
        // Isolated scope ensures strict data binding and prevents unintended side effects.
        scope: {
            displayImage: '=imageSrc',   // Binds to the source URL of the background image.
            activeZones: '=hotspots',    // Binds to an array containing definitions of all interactive zones.
            editorConfig: '=options',    // Binds to an object holding various configuration settings for the editor.
        },
        restrict: 'E', // This directive can only be used as an element (e.g., <interactive-zone-editor>).
        // Specifies the path to the HTML template that defines the visual structure of the editor.
        templateUrl: 'templates/components/zoneEditorPanel.html',
        replace: true, // The directive's element will be replaced by its template content.

        // The link function is where DOM manipulation and event listeners are set up.
        link: function(viewModel, hostElement, attributes, controller) {
            // Internal reference to the main container where zones are placed.
            let zoneArrangementSurface = null;
            // A simple string to display status or debug messages internally.
            viewModel.statusMessage = 'Editor ready.';

            // --- Configuration Constants and Utility Helpers ---
            const NEW_ZONE_PLACEMENT_OFFSET_PX = 12; // Pixels to offset new zones from the mouse click.
            const INITIAL_ZONE_DIMENSION_PX = 60; // Default side length for new square zones.
            const SURFACE_CSS_SELECTOR = '#interactiveZoneEditor .zone-arrangement-surface';
            const ZONE_ITEM_CSS_SELECTOR = '#interactiveZoneEditor .interactive-zone-item';

            // Generates a unique identifier for each new interactive zone.
            let uniqueIdCounter = 0;
            const createUniqueZoneIdentifier = () => `zone-${Date.now()}-${uniqueIdCounter++}`;

            // Safely retrieves a property value from an object, providing a fallback if undefined.
            const getPropertyOrDefault = (targetObject, propertyName, defaultValue) => {
                if (targetObject && typeof targetObject === 'object' && targetObject.hasOwnProperty(propertyName)) {
                    return targetObject[propertyName];
                }
                return defaultValue;
            };

            // --- Core Editor Initialization Logic ---

            /**
             * Main entry point for initializing the interactive zone editor.
             * Handles external script loading, data validation, and watcher setup.
             */
            viewModel.initializeEditor = function() {
                // Ensure 'activeZones' is an array; if not, initialize it to prevent errors.
                if (!Array.isArray(viewModel.activeZones)) {
                    console.warn('InteractiveZoneEditor: "activeZones" model is not an array. Initializing an empty array.');
                    viewModel.activeZones = [];
                }

                // Dynamically load jQuery UI dependencies if they are not already available.
                // This improves performance by only loading external scripts when necessary.
                if (typeof jQuery === 'undefined' || typeof jQuery.ui === 'undefined') {
                    console.info('InteractiveZoneEditor: Attempting to load jQuery UI libraries...');
                    const uiScriptLoader = document.createElement('script');
                    uiScriptLoader.type = 'text/javascript';
                    uiScriptLoader.async = true;
                    uiScriptLoader.src = 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js'; // Using a stable, newer version.
                    uiScriptLoader.onload = () => {
                        console.log('jQuery UI script loaded successfully.');
                        viewModel.setupUserInteractionListeners(); // Proceed with event setup.
                        viewModel.configureExistingZoneElements();  // Apply features to any pre-existing zones.
                    };
                    uiScriptLoader.onerror = () => console.error('Failed to load jQuery UI script. Zone features may be limited.');
                    document.head.appendChild(uiScriptLoader); // Appending to head is generally good practice.

                    const uiStylesheetLoader = document.createElement('link');
                    uiStylesheetLoader.rel = 'stylesheet';
                    uiStylesheetLoader.href = 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/base/jquery-ui.css'; // Corresponding theme.
                    uiStylesheetLoader.onerror = () => console.error('Failed to load jQuery UI stylesheet.');
                    document.head.appendChild(uiStylesheetLoader); // Appending to head.
                } else {
                    console.info('jQuery UI detected. Skipping dynamic load.');
                    viewModel.setupUserInteractionListeners();
                    viewModel.configureExistingZoneElements();
                }

                // Establish a deep watch on 'editorConfig' to react to configuration changes.
                viewModel.$watchCollection('editorConfig', (newConfiguration) => {
                    if (newConfiguration && typeof newConfiguration === 'object') {
                        const canDragZones = getPropertyOrDefault(newConfiguration, 'allowZoneDragging', false);
                        viewModel.setZoneDraggability(canDragZones);
                        viewModel.statusMessage = `Editor config updated. Dragging: ${canDragZones ? 'enabled' : 'disabled'}.`;
                    } else {
                        console.warn('Editor configuration is either invalid or not provided.');
                        viewModel.statusMessage = 'Warning: Invalid editor configuration.';
                    }
                }, true); // The 'true' argument enables deep watching for nested property changes.

                // Monitor changes to 'displayImage' to adjust the editor surface size accordingly.
                viewModel.$watch('displayImage', (newImageSource, oldImageSource) => {
                    if (newImageSource && newImageSource !== oldImageSource) {
                        const drawingSurfaceElement = angular.element(SURFACE_CSS_SELECTOR);
                        // Clear previous inline styles to ensure proper recalculation.
                        drawingSurfaceElement.css({ height: '', width: '' });

                        // Attach a 'load' event listener to the image. Using jQuery's .one()
                        // ensures the handler runs only once per image load event.
                        jQuery('.zone-image-display').one('load', function() {
                            const loadedImage = jQuery(this);
                            drawingSurfaceElement.css({
                                height: loadedImage.css('height'),
                                width: loadedImage.css('width')
                            });
                            console.log(`Image loaded. Drawing surface resized to ${loadedImage.css('width')}x${loadedImage.css('height')}.`);
                            viewModel.updateZoneDimensionsAsPercentages(); // Recalculate zone positions after surface resize.
                        }).each(function() {
                            // This part handles cached images: if the image is already loaded,
                            // manually trigger the 'load' event to ensure the size is set.
                            if (this.complete) { jQuery(this).trigger('load'); }
                        });
                    }
                });
            };

            // --- Event Handling and Zone Manipulation Functions ---

            /**
             * Sets up event listeners on the editor surface for adding new zones via mouse clicks.
             */
            viewModel.setupUserInteractionListeners = function() {
                zoneArrangementSurface = angular.element(SURFACE_CSS_SELECTOR);
                if (zoneArrangementSurface.length === 0) {
                    console.error('InteractiveZoneEditor: The main arrangement surface element was not found. Cannot attach interaction listeners.');
                    return;
                }

                zoneArrangementSurface.on('mousedown', (mouseEvent) => {
                    // Only process left-clicks (button 0).
                    if (mouseEvent.button !== 0) { return; }

                    const clickPosition = { x: 0, y: 0 };
                    // Calculate click coordinates relative to the editor surface.
                    // Fallback for browsers that may not provide offsetX/Y or if they are zero.
                    if (typeof mouseEvent.offsetX === 'undefined' || mouseEvent.offsetX === 0) {
                        const surfaceOffset = jQuery(zoneArrangementSurface).offset();
                        clickPosition.x = mouseEvent.pageX - surfaceOffset.left - NEW_ZONE_PLACEMENT_OFFSET_PX;
                        clickPosition.y = mouseEvent.pageY - surfaceOffset.top - NEW_ZONE_PLACEMENT_OFFSET_PX;
                    } else {
                        clickPosition.x = mouseEvent.offsetX - NEW_ZONE_PLACEMENT_OFFSET_PX;
                        clickPosition.y = mouseEvent.offsetY - NEW_ZONE_PLACEMENT_OFFSET_PX;
                    }

                    // Ensure calculated coordinates are not negative.
                    clickPosition.x = Math.max(0, clickPosition.x);
                    clickPosition.y = Math.max(0, clickPosition.y);

                    // Use $apply to ensure Angular's digest cycle runs and updates the view.
                    viewModel.$apply(() => {
                        viewModel.addInteractiveZone(clickPosition);
                        viewModel.updateZoneDimensionsAsPercentages(); // Refresh all zones after adding a new one.
                    });

                    mouseEvent.stopPropagation(); // Prevent the event from propagating further up the DOM.
                });
            };

            /**
             * Creates and adds a new interactive zone object to the 'activeZones' array.
             * @param {object} initialCoords - An object with 'x' and 'y' properties for initial placement.
             */
            viewModel.addInteractiveZone = function(initialCoords) {
                const newZoneData = {
                    id: createUniqueZoneIdentifier(), // Assign a unique ID.
                    name: `Zone ${viewModel.activeZones.length + 1}`, // Generate a default name.
                    type: 'standard', // A default type for the zone.
                    position: {
                        top: initialCoords.y,
                        left: initialCoords.x,
                        width: INITIAL_ZONE_DIMENSION_PX,
                        height: INITIAL_ZONE_DIMENSION_PX
                    },
                    metadata: {} // Placeholder for additional custom data.
                };
                viewModel.activeZones.push(newZoneData);
                console.log(`New zone '${newZoneData.name}' (ID: ${newZoneData.id}) added at (${initialCoords.x}, ${initialCoords.y}).`);
            };

            /**
             * Applies jQuery UI's resizable and draggable functionalities to all zone elements.
             * Also handles initial positioning for zones without predefined coordinates.
             */
            viewModel.configureExistingZoneElements = function() {
                angular.element(ZONE_ITEM_CSS_SELECTOR).each(function(index) {
                    const currentZoneElement = jQuery(this);
                    const zoneModel = viewModel.activeZones[index];

                    // Guard clause: Ensure a corresponding model exists for the DOM element.
                    if (!zoneModel) {
                        console.warn(`No model found for zone element at index ${index}. Skipping configuration.`);
                        return;
                    }

                    // Enable/disable resizability based on editor configuration.
                    const isResizingAllowed = getPropertyOrDefault(viewModel.editorConfig, 'allowZoneResizing', true);
                    if (isResizingAllowed) {
                        // Initialize resizable if not already.
                        if (!currentZoneElement.is('.ui-resizable')) {
                            currentZoneElement.resizable({
                                containment: 'parent',
                                stop: () => {
                                    viewModel.$apply(() => viewModel.updateZoneDimensionsAsPercentages());
                                }
                            });
                        } else {
                            currentZoneElement.resizable('enable');
                        }
                        currentZoneElement.addClass('resizable-active');
                    } else {
                        // If resizable was initialized, destroy it.
                        if (currentZoneElement.is('.ui-resizable')) {
                            currentZoneElement.resizable('destroy');
                        }
                        currentZoneElement.removeClass('resizable-active');
                    }

                    // Set draggability based on configuration.
                    const canZoneBeDragged = getPropertyOrDefault(viewModel.editorConfig, 'allowZoneDragging', false);
                    viewModel.setZoneDraggability(canZoneBeDragged, currentZoneElement);

                    // Prevent mouse events on the zone from bubbling up to the editor surface.
                    currentZoneElement.on('mousedown', (event) => event.stopPropagation());

                    // If a zone in the model lacks position data, assign a random one.
                    if (!zoneModel.position || typeof zoneModel.position.top === 'undefined' || typeof zoneModel.position.left === 'undefined') {
                        console.info(`Zone ${zoneModel.id} has no initial position; assigning random coordinates.`);
                        zoneModel.position = viewModel.generateRandomZoneCoordinates();
                    }
                });
            };

            /**
             * Iterates through all zones in the model and assigns them new random positions.
             */
            viewModel.randomizeAllZonePositions = function() {
                viewModel.activeZones.forEach((zoneItem, idx) => {
                    if (zoneItem.position) { // Only randomize if a position object exists.
                        zoneItem.position = viewModel.generateRandomZoneCoordinates();
                        console.log(`Randomized position for zone: ${zoneItem.name}`);
                    }
                });
                viewModel.updateZoneDimensionsAsPercentages(); // Update the DOM to reflect new positions.
            };

            /**
             * Generates a set of random percentage-based coordinates and dimensions for a new zone.
             * The random position ensures the zone is fully visible within the parent container.
             * @returns {object} An object containing 'top', 'left', 'width', and 'height' as percentage strings.
             */
            viewModel.generateRandomZoneCoordinates = function() {
                const drawingSurfaceElement = angular.element(SURFACE_CSS_SELECTOR);
                const surfaceHeight = parseFloat(drawingSurfaceElement.css('height')) || 1;
                const surfaceWidth = parseFloat(drawingSurfaceElement.css('width')) || 1;

                // Critical check: prevent division by zero or negative dimensions.
                if (surfaceWidth <= 0 || surfaceHeight <= 0) {
                    console.error('Drawing surface dimensions are invalid for random position generation.');
                    return { top: '0%', left: '0%', width: '0%', height: '0%' };
                }

                // Generate random pixel coordinates, ensuring the zone fits within the bounds.
                const randomX_px = Math.floor(Math.random() * (surfaceWidth - INITIAL_ZONE_DIMENSION_PX));
                const randomY_px = Math.floor(Math.random() * (surfaceHeight - INITIAL_ZONE_DIMENSION_PX));

                // Convert pixel values to percentages, formatted to two decimal places.
                const leftPercentage = (randomX_px / surfaceWidth * 100).toFixed(2);
                const topPercentage = (randomY_px / surfaceHeight * 100).toFixed(2);
                const widthPercentage = (INITIAL_ZONE_DIMENSION_PX / surfaceWidth * 100).toFixed(2);
                const heightPercentage = (INITIAL_ZONE_DIMENSION_PX / surfaceHeight * 100).toFixed(2);

                return {
                    top: `${topPercentage}%`,
                    left: `${leftPercentage}%`,
                    width: `${widthPercentage}%`,
                    height: `${heightPercentage}%`
                };
            };

            /**
             * Converts all zone positions and dimensions from pixel values (as read from DOM)
             * into percentage values, updating both the model and the DOM elements' styles.
             */
            viewModel.updateZoneDimensionsAsPercentages = function() {
                const drawingSurfaceElement = angular.element(SURFACE_CSS_SELECTOR);
                const surfaceHeight = parseFloat(drawingSurfaceElement.css('height')) || 1;
                const surfaceWidth = parseFloat(drawingSurfaceElement.css('width')) || 1;

                // Guard against invalid surface dimensions to prevent calculation errors.
                if (surfaceWidth <= 0 || surfaceHeight <= 0) {
                    console.warn('Drawing surface dimensions are invalid. Cannot convert zone positions to percentages.');
                    return;
                }

                angular.element(ZONE_ITEM_CSS_SELECTOR).each(function(index) {
                    const currentZoneElement = jQuery(this);
                    const zoneModel = viewModel.activeZones[index];

                    // Ensure there's a corresponding data model for the current DOM element.
                    if (!zoneModel) {
                        console.warn(`No data model found for zone element at index ${index}. Skipping percentage update.`);
                        return;
                    }

                    // Retrieve current pixel dimensions from the DOM element.
                    const zoneLeft_px = parseFloat(currentZoneElement.css('left')) || 0;
                    const zoneTop_px = parseFloat(currentZoneElement.css('top')) || 0;
                    const zoneWidth_px = parseFloat(currentZoneElement.css('width')) || 0;
                    const zoneHeight_px = parseFloat(currentZoneElement.css('height')) || 0;

                    // Calculate the percentage values.
                    const left_pct = (zoneLeft_px / surfaceWidth * 100).toFixed(2);
                    const top_pct = (zoneTop_px / surfaceHeight * 100).toFixed(2);
                    const width_pct = (zoneWidth_px / surfaceWidth * 100).toFixed(2);
                    const height_pct = (zoneHeight_px / surfaceHeight * 100).toFixed(2);

                    // Update the Angular model with percentage values.
                    zoneModel.name = `Zone #${index + 1}`; // Consistent naming.
                    zoneModel.position = {
                        left: `${left_pct}%`,
                        top: `${top_pct}%`,
                        width: `${width_pct}%`,
                        height: `${height_pct}%`
                    };

                    // Apply the percentage styles directly to the DOM element.
                    currentZoneElement.css({
                        'left': zoneModel.position.left,
                        'top': zoneModel.position.top,
                        'width': zoneModel.position.width,
                        'height': zoneModel.position.height
                    });
                });
            };

            /**
             * Toggles the draggable functionality for zone elements based on the provided flag.
             * @param {boolean} enableDragging - If true, enables dragging; otherwise, disables it.
             * @param {object} [targetJqueryElement=null] - Optional: a specific jQuery element to update.
             *                                             If null, all zone elements will be updated.
             */
            viewModel.setZoneDraggability = function(enableDragging, targetJqueryElement = null) {
                // Determine which elements to apply the change to.
                const elementsToModify = targetJqueryElement || angular.element(ZONE_ITEM_CSS_SELECTOR);

                elementsToModify.each(function() {
                    const currentElement = jQuery(this);
                    const isDraggableInitialized = currentElement.data('ui-draggable'); // Check if jQuery UI draggable is initialized.

                    if (enableDragging) {
                        // Initialize draggable if it hasn't been already.
                        if (!isDraggableInitialized) {
                            currentElement.draggable({
                                containment: 'parent', // Confine dragging to the parent container.
                                scroll: false,         // Disable scrolling during drag.
                                stop: () => {
                                    // Update model after drag ends.
                                    viewModel.$apply(() => viewModel.updateZoneDimensionsAsPercentages());
                                }
                            });
                        } else {
                            currentElement.draggable('enable'); // Re-enable if already initialized.
                        }
                        // Update visual cues.
                        currentElement.addClass('is-draggable').removeClass('is-not-draggable');
                        currentElement.css('cursor', 'grab');
                    } else {
                        // Disable draggable if it was initialized.
                        if (isDraggableInitialized) {
                            currentElement.draggable('disable');
                        }
                        // Update visual cues.
                        currentElement.addClass('is-not-draggable').removeClass('is-draggable');
                        currentElement.css('cursor', 'default');
                    }
                });
            };

            // Execute the primary initialization function when the directive is linked.
            viewModel.initializeEditor();
        }
    };
    return componentConfig;
});