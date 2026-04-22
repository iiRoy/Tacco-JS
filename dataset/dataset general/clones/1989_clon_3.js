const displayEngine = {

    // Queues for managing render order and asset fetching
    visualOrderQueue: [], // Stores layer IDs in rendering order (back to front)
    assetLoadQueue: [],   // Holds image paths or asset objects awaiting load
    
    // Asset loading progress tracking
    totalAssetsExpected: 0,
    loadedAssetCounter: 0,
    assetLoadErrors: {}, // Maps asset path to error message if loading fails

    // Identifiers for layers processed and their count
    processedLayerIdentifiers: [],
    processedLayerCount: 0,

    // Current game state and scene information
    currentSceneData: {}, // Contains the full data for the active room
    activeLocationIdentifier: null, // The ID of the currently loaded room
    
    // Dynamic display metrics for scrolling and positioning
    scrollableWidthRange: 0, // Maximum horizontal scroll distance
    
    // Cached DOM element dimensions for performance
    displayAreaDimensions: {
        width: null,
        height: null
    },
    containerDimensions: {
        width: null,
        height: null
    },

    // Flags for system state
    isSceneTransitioning: true, // True if a new room is actively loading
    currentLoadingAsset: null,  // Currently unused, could be for detailed progress
    
    // Performance monitoring for scene loads
    performanceMetrics: {
        startLoadTimestamp: null,
        endLoadTimestamp: null
    },

    /**
     * Initializes the display engine, sets up event listeners, and triggers the initial room load.
     * @param {string} initialLocationId - The ID of the room to load initially.
     */
    bootSystem: function(initialLocationId) {
        // Ensure jQuery is available and the document is ready
        if (typeof jQuery === 'undefined' || !$(document).ready) {
            console.error('jQuery not loaded or document not ready. Cannot boot system.');
            return; // Exit if prerequisites aren't met
        }

        // Add a handler for window resizing events
        $(window).on('resize', () => {
            try {
                const $sceneContainer = $('.scene_container');
                if ($sceneContainer.length) { // Check if element exists before accessing properties
                    this.containerDimensions.width = $sceneContainer.width();
                    this.containerDimensions.height = $sceneContainer.height();
                    // Optionally, re-calculate scrollableWidthRange here if displayAreaDimensions.width also changes
                    this.scrollableWidthRange = (this.displayAreaDimensions.width || 0) - $(window).innerWidth();
                } else {
                    console.warn('Scene container element not found during resize event.');
                }
            } catch (err) {
                // Suppress non-critical errors during resize, but log for debugging
                console.debug('Resize handler error:', err.message);
            }
        });

        // Capture initial container dimensions
        const $initialSceneContainer = $('.scene_container');
        if ($initialSceneContainer.length) {
            this.containerDimensions.width = $initialSceneContainer.width();
            this.containerDimensions.height = $initialSceneContainer.height();
        } else {
            console.error('Initial scene container element not found. Display dimensions may be incorrect.');
        }

        // Proceed with loading the specified room
        if (!initialLocationId) {
            console.error('No initial location ID provided. Cannot load scene.');
            return;
        }
        this.activateScene(initialLocationId);

        // Initialize the player module, assuming it's an external dependency
        if (typeof characterController !== 'undefined' && typeof characterController.setup === 'function') {
            characterController.setup();
        } else {
            console.warn('Character controller module not found or not correctly initialized.');
        }
    },

    /**
     * Initiates the loading process for a new room/location.
     * @param {string} targetLocationId - The identifier of the room to load.
     */
    activateScene: function(targetLocationId) {
        if (this.isSceneTransitioning) {
            console.warn(`Already transitioning to a scene. Ignoring request for ${targetLocationId}.`);
            return; // Prevent concurrent scene loads
        }

        this.performanceMetrics.startLoadTimestamp = Date.now();
        console.time(`Scene Load: ${targetLocationId}`); // Start a performance timer

        // Store the target room ID
        this.activeLocationIdentifier = targetLocationId;

        // Visually fade out the current stage and clear its contents
        const $visualCanvas = $('.render_canvas');
        if ($visualCanvas.length) {
            $visualCanvas.stop(true, true).fadeTo(1500, 0.05); // More dramatic fade
        }
        $('.current_location_label').text('');
        $('.hero_sprite_container').remove(); // Player holder
        $('.other_hero_containers').remove(); // Other players holder
        $('.chat_display_area ul').empty();
        
        // Reset player state (assuming characterController is global)
        if (typeof characterController !== 'undefined') {
            characterController.otherCharacters = {};
            characterController.isReady = false;
        }
        $('.exit_portals').empty();

        // Clear existing layer and asset queues for the new scene
        this.visualOrderQueue = [];
        this.assetLoadQueue = [];
        this.processedLayerIdentifiers = [];
        this.processedLayerCount = 0;
        this.assetLoadErrors = {}; // Clear previous errors

        // Mark the system as actively transitioning
        this.isSceneTransitioning = true;

        // Fetch room data from a remote source (simulated via script injection)
        // In a production environment, this would typically involve a proper API call.
        const githubBaseUrl = 'http://revdancatt.github.io/CAT422-glitch-location-viewer/locations/';
        const roomDataUrl = `${githubBaseUrl}${targetLocationId}.callback.json`;
        
        // Add a cache-busting parameter to prevent stale data during development
        const cacheBuster = `_=${Date.now()}`;
        $.getScript(`${roomDataUrl}?${cacheBuster}`)
            .done(() => console.log(`Room data script for ${targetLocationId} loaded successfully.`))
            .fail((jqxhr, settings, exception) => {
                console.error(`Failed to load room data for ${targetLocationId}:`, exception);
                this.isSceneTransitioning = false; // Allow new loads if this one failed
                // Optionally display an error message to the user
            });
    },

    /**
     * Configures the main display canvas (stage) based on the loaded room data.
     * Sets dimensions, background gradients, and initial visibility.
     */
    configureVisualCanvas: function() {
        const currentRoomConfiguration = this.currentSceneData;
        if (!currentRoomConfiguration || !currentRoomConfiguration.dynamic || !currentRoomConfiguration.gradient) {
            console.error('Invalid room configuration provided for stage setup.');
            this.isSceneTransitioning = false;
            return;
        }

        // Update browser title and location display
        document.title = `GLITCH VIEW : ${currentRoomConfiguration.label}`;
        $('.current_location_label').text(currentRoomConfiguration.label);

        const $visualCanvas = $('.render_canvas');
        if ($visualCanvas.length === 0) {
            console.error('Render canvas element not found. Cannot configure stage.');
            this.isSceneTransitioning = false;
            return;
        }

        // Stop any ongoing animations, clear content, and reset scroll
        $visualCanvas.stop(true, true).empty();
        $(window).scrollTop(0);
        $visualCanvas.fadeTo(700, 1); // Faster fade in
        $('.loading_overlay').fadeIn(700); // Show loading indicator

        // Calculate stage dimensions
        const stageWidthPx = Number(currentRoomConfiguration.dynamic.r) - Number(currentRoomConfiguration.dynamic.l);
        const stageHeightPx = Number(currentRoomConfiguration.dynamic.b) - Number(currentRoomConfiguration.dynamic.t);

        $visualCanvas.css({
            position: 'absolute',
            overflow: 'hidden',
            width: `${stageWidthPx}px`,
            height: `${stageHeightPx}px`,
            'z-index': -1000,
            'box-sizing': 'border-box' // Ensure padding/border don't affect width/height
        });

        // Store stage dimensions
        this.displayAreaDimensions.width = stageWidthPx;
        this.displayAreaDimensions.height = stageHeightPx;

        // Helper for converting color values
        const getColorString = (colorValue, isHex) => {
            if (isHex) {
                let hex = String(colorValue);
                while (hex.length < 6) hex = '0' + hex;
                return `#${hex}`;
            } else {
                const r = (colorValue >> 16) & 0xff;
                const g = (colorValue >> 8) & 0xff;
                const b = colorValue & 0xff;
                return `rgb(${r},${g},${b})`;
            }
        };

        let topGradientColor, bottomGradientColor;
        const topGradVal = currentRoomConfiguration.gradient.top;
        const bottomGradVal = currentRoomConfiguration.gradient.bottom;

        // Determine if colors are hex strings or integer RGB values
        const isHexFormat = typeof topGradVal === 'string' && (topGradVal.length === 6 || topGradVal.length === 4 || topGradVal.length === 1);

        topGradientColor = getColorString(topGradVal, isHexFormat);
        bottomGradientColor = getColorString(bottomGradVal, isHexFormat);

        // Apply background gradient styles
        const gradientCss = `linear-gradient(to bottom, ${topGradientColor} 0%, ${bottomGradientColor} 100%)`;
        const webkitGradientCss = `-webkit-gradient(linear, left top, left bottom, color-stop(0, ${topGradientColor}), color-stop(1, ${bottomGradientColor}))`;

        $visualCanvas.css({
            'background-image': gradientCss,
            '-webkit-background-image': webkitGradientCss, // Legacy WebKit
            '-moz-background-image': `-moz-${gradientCss}`, // Firefox
            '-o-background-image': `-o-${gradientCss}`,     // Opera
            '-ms-background-image': `-ms-${gradientCss}`    // IE
        });

        // Update scroll range based on stage width and window width
        this.scrollableWidthRange = $visualCanvas.width() - $(window).innerWidth();

        // Continue to prepare individual layers
        this.isSceneTransitioning = false; // Stage is ready, but layers/assets still loading
        this.establishRenderOrder();
    },

    /**
     * Sorts and prepares the visual layers of the room, creating their DOM elements.
     * Layers are ordered by z-index from back to front.
     */
    establishRenderOrder: function() {
        const currentRoomConfiguration = this.currentSceneData;
        if (!currentRoomConfiguration || !currentRoomConfiguration.dynamic || !currentRoomConfiguration.dynamic.layers) {
            console.error('No layer data found in room configuration.');
            return;
        }

        let minZIndex = Number.MAX_SAFE_INTEGER;
        let maxZIndex = Number.MIN_SAFE_INTEGER;
        
        // Determine the range of z-indexes present in the layers
        Object.values(currentRoomConfiguration.dynamic.layers).forEach(layer => {
            if (layer.z < minZIndex) minZIndex = layer.z;
            if (layer.z > maxZIndex) maxZIndex = layer.z;
        });

        // Populate the layer queue in ascending z-index order
        this.visualOrderQueue = [];
        this.processedLayerIdentifiers = [];
        for (let z = minZIndex; z <= maxZIndex; z++) {
            for (const layerId in currentRoomConfiguration.dynamic.layers) {
                const currentLayer = currentRoomConfiguration.dynamic.layers[layerId];
                if (currentLayer.z === z) {
                    this.visualOrderQueue.push(layerId);
                    this.processedLayerIdentifiers.push(layerId);
                }
            }
        }
        this.processedLayerCount = this.processedLayerIdentifiers.length;

        // Create DOM elements for each layer and apply initial styles/filters
        const $visualCanvas = $('.render_canvas');
        const stageHeight = this.displayAreaDimensions.height;
        const exitLinkContainer = $('<ul>'); // Container for navigation links

        for (let i = 0; i < this.visualOrderQueue.length; i++) {
            const currentLayerId = this.visualOrderQueue[i];
            const currentLayerData = currentRoomConfiguration.dynamic.layers[currentLayerId];

            if (!currentLayerData) {
                console.warn(`Layer data for ID "${currentLayerId}" is missing.`);
                continue;
            }

            const layerElement = $('<div>', { id: currentLayerId });
            layerElement.css({
                position: 'absolute',
                width: `${Number(currentLayerData.w)}px`,
                height: `${Number(currentLayerData.h)}px`,
                left: '0px',
                top: `${stageHeight - Number(currentLayerData.h)}px`,
                'z-index': Number(currentLayerData.z)
            });

            // Attach a canvas element to the layer for future rendering
            const layerCanvas = $('<canvas>', {
                id: `${currentLayerId}_display_surface`,
                width: Number(currentLayerData.w),
                height: Number(currentLayerData.h)
            }).css({
                width: `${Number(currentLayerData.w)}px`,
                height: `${Number(currentLayerData.h)}px`,
                position: 'absolute',
                top: '0px',
                left: '0px'
            });

            // Process and apply CSS filters
            const cssFilters = [];
            let tintColorValue = null;
            let tintAmountValue = null;

            if (currentLayerData.filters) {
                for (const filterKey in currentLayerData.filters) {
                    const filterValue = currentLayerData.filters[filterKey];

                    switch (filterKey) {
                        case 'brightness':
                            // Glitch brightness values are -100 to 100, CSS is 0 to N
                            cssFilters.push(`brightness(${1 + (filterValue / 100)})`);
                            break;
                        case 'contrast':
                            cssFilters.push(`contrast(${1 + (filterValue / 100)})`);
                            break;
                        case 'saturation':
                            cssFilters.push(`saturation(${1 + (filterValue / 100)})`);
                            break;
                        case 'tintColor':
                            tintColorValue = filterValue; // Store for later combination
                            break;
                        case 'tintAmount':
                            tintAmountValue = filterValue; // Store for later combination
                            break;
                        case 'blur':
                            // Blur is computationally expensive for DOM elements;
                            // Consider canvas-based blur for better performance.
                            // For now, only apply if value is significant.
                            if (filterValue > 0.5) { // Threshold to avoid tiny blurs
                                cssFilters.push(`blur(${filterValue}px)`);
                            }
                            break;
                        default:
                            console.debug(`Unhandled filter type: ${filterKey}`);
                    }
                }
            }

            // Apply collected CSS filters to the canvas
            if (cssFilters.length > 0) {
                const filterString = cssFilters.join(' ');
                layerCanvas.css({
                    'filter': filterString,
                    '-webkit-filter': filterString,
                    '-moz-filter': filterString,
                    '-o-filter': filterString,
                    '-ms-filter': filterString
                });
            }

            layerElement.append(layerCanvas);

            // Special handling for the 'middleground' layer (player sprite)
            if (currentLayerId === 'middleground') {
                const playerSpriteContainer = $('<div>', { class: 'hero_sprite_container' }).append(
                    $('<div>', { class: 'hero_visual_frame' }).append(
                        $('<div>', { class: 'player_character' }).css('background-image', 'url(img/glitchen/root_base.png)')
                    )
                );
                // Assume characterController.userName is available
                if (typeof characterController !== 'undefined' && characterController.userName) {
                    playerSpriteContainer.append($('<div>', { class: 'name_tag_label' }).text(characterController.userName));
                }

                // Set initial player position (example values, will be dynamic)
                // Assuming characterController.setCoordinates and characterController.isConnected
                if (typeof characterController !== 'undefined') {
                    characterController.setCoordinates(Number(currentLayerData.w) / 2 + 100, 100);
                    if (characterController.isConnected) {
                        // Emit event to backend that player has changed rooms
                        // socket.emit('joinroom', currentRoomConfiguration.label, characterController.position.x, characterController.position.y, characterController.position.facing);
                        console.log('Emitting "joinroom" event to server (simulated).');
                    }
                }
                layerElement.append(playerSpriteContainer);
            }

            // Append the fully constructed layer to the stage
            $visualCanvas.append(layerElement);

            // Process signposts (exits) for navigation
            if (currentLayerData.signposts) {
                Object.values(currentLayerData.signposts).forEach(signpost => {
                    // Original code had commented-out image loading for signposts.
                    // We'll skip that part for now as it's not essential functionality.

                    if (signpost.connects) {
                        signpost.connects.forEach(connection => {
                            // Ensure TSID is valid for URL and ID
                            const cleanTsid = connection.tsid ? connection.tsid.replace(/^L/, 'G') : `invalid_tsid_${Math.random().toString(36).substring(7)}`;
                            const exitListItem = $('<li>').append(
                                $('<a>', {
                                    id: cleanTsid,
                                    href: `#/location/${connection.tsid}` // Use a more explicit URL hash
                                }).text(connection.label || 'Unknown Exit')
                            );
                            exitLinkContainer.append(exitListItem);
                        });
                    }
                });
            }
        }

        // Add the compiled exit links to the UI
        const $exitsPanel = $('.exit_portals');
        if ($exitsPanel.length) {
            $exitsPanel.empty().append($('<h2>').text('Navigation Links')).append(exitLinkContainer);
            // Attach click handler using event delegation for efficiency
            $exitsPanel.on('click', 'a', function(event) {
                event.preventDefault(); // Prevent default link behavior
                const targetId = $(this).attr('id');
                if (targetId) {
                    displayEngine.activateScene(targetId); // Use displayEngine reference
                } else {
                    console.warn('Clicked exit link has no ID attribute.');
                }
            });
        } else {
            console.warn('Exit portals panel not found.');
        }

        // Inform the player module that the scene is structurally loaded
        if (typeof characterController !== 'undefined') {
            characterController.isReady = true;
        }

        // Proceed to arrange items within layers
        this.arrangeLayerElements();
    },

    /**
     * Organizes and prepares decorative items within each layer, sorting them by z-index.
     * This prepares the `assetLoadQueue` for image loading.
     */
    arrangeLayerElements: function() {
        const currentRoomConfiguration = this.currentSceneData;
        if (!currentRoomConfiguration || !currentRoomConfiguration.dynamic || !currentRoomConfiguration.dynamic.layers) {
            console.error('Missing room configuration or layer data for item arrangement.');
            return;
        }

        // Reset asset counters
        this.totalAssetsExpected = 0;
        this.assetLoadQueue = []; // Clear for new items

        // Iterate through each processed layer to sort its decorative elements
        for (const layerKey of this.visualOrderQueue) {
            const currentLayer = currentRoomConfiguration.dynamic.layers[layerKey];

            if (!currentLayer || !currentLayer.decos || currentLayer.decos.length === 0) {
                // No decorations for this layer, or layer data is missing
                continue;
            }

            let minDecoZ = Number.MAX_SAFE_INTEGER;
            let maxDecoZ = Number.MIN_SAFE_INTEGER;

            // Find min/max z-index for decorations within this layer
            currentLayer.decos.forEach(decoration => {
                const decoZ = decoration.z;
                if (decoZ < minDecoZ) minDecoZ = decoZ;
                if (decoZ > maxDecoZ) maxDecoZ = decoZ;
            });

            // Create a temporary array for sorted items within this layer
            const sortedDecoItems = [];
            // Iterate from highest Z to lowest Z to push onto the array,
            // so when popped, they are rendered from back to front.
            for (let z = maxDecoZ; z >= minDecoZ; z--) {
                currentLayer.decos.forEach(decoration => {
                    if (decoration.z === z) {
                        sortedDecoItems.push(decoration);
                        this.totalAssetsExpected++; // Increment total expected assets
                        // Add decoration image path to the global asset load queue
                        if (decoration.url) {
                            this.assetLoadQueue.push(decoration.url);
                        } else {
                            console.warn(`Decoration in layer ${layerKey} is missing a URL.`);
                        }
                    }
                });
            }

            // Replace the original 'decos' array with the sorted 'items' array
            // This is a structural change from the original, which deleted 'decos'
            // and implicitly used 'items' later. Let's make it explicit.
            currentLayer.items = sortedDecoItems;
            delete currentLayer.decos; // Clean up original decos array

        }

        // Initialize loaded asset counter for progress display
        this.loadedAssetCounter = 0; // Reset counter, will increment as assets load

        // Begin the image loading process
        this.fetchVisualResources();
    },

    /**
     * Initiates the loading of all assets (images) identified in the assetLoadQueue.
     * Includes a check to prevent loading if a room transition is still active.
     */
    fetchVisualResources: function() {
        // Guard clause: if a scene transition is still in progress, halt asset loading
        if (this.isSceneTransitioning) {
            console.log('Scene transition is active, deferring asset loading.');
            return;
        }

        // If the asset queue is empty, all assets are implicitly loaded or there were none
        if (this.assetLoadQueue.length === 0 && this.totalAssetsExpected === 0) {
            console.log('Asset load queue is empty. All resources processed.');
            this.performanceMetrics.endLoadTimestamp = Date.now();
            console.timeEnd(`Scene Load: ${this.activeLocationIdentifier}`);
            $('.loading_overlay').fadeOut(500); // Hide loading indicator
            return;
        }

        const imagesToLoad = [...this.assetLoadQueue]; // Create a copy to iterate
        this.assetLoadQueue = []; // Clear the primary queue as we're processing a batch

        // If there are no images to load but totalAssetsExpected is > 0, something is off.
        // Or, if all assets are already loaded (e.g., from cache or previous run).
        if (imagesToLoad.length === 0 && this.loadedAssetCounter === this.totalAssetsExpected) {
            console.log('All assets already loaded or no new assets to fetch.');
            this.performanceMetrics.endLoadTimestamp = Date.now();
            console.timeEnd(`Scene Load: ${this.activeLocationIdentifier}`);
            $('.loading_overlay').fadeOut(500);
            return;
        }


        imagesToLoad.forEach(imageUrl => {
            const img = new Image();
            img.onload = () => {
                this.loadedAssetCounter++;
                // Potentially render image to canvas here
                if (this.loadedAssetCounter === this.totalAssetsExpected) {
                    console.log('All assets loaded successfully.');
                    this.performanceMetrics.endLoadTimestamp = Date.now();
                    console.timeEnd(`Scene Load: ${this.activeLocationIdentifier}`);
                    $('.loading_overlay').fadeOut(500); // Hide loading indicator
                }
            };
            img.onerror = (e) => {
                this.loadedAssetCounter++;
                this.assetLoadErrors[imageUrl] = `Failed to load: ${e.message || 'Unknown error'}`;
                console.error(`Error loading image: ${imageUrl}`, e);
                // Still check if all assets (even failed ones) have been attempted
                if (this.loadedAssetCounter === this.totalAssetsExpected) {
                    console.warn('Asset loading complete, but with errors:', Object.keys(this.assetLoadErrors).length);
                    this.performanceMetrics.endLoadTimestamp = Date.now();
                    console.timeEnd(`Scene Load: ${this.activeLocationIdentifier}`);
                    $('.loading_overlay').fadeOut(500);
                }
            };
            img.src = imageUrl;
            // Optionally, add img to a temporary DOM element or cache for rendering later
        });

        // After initiating all loads, the process will continue asynchronously via onload/onerror.
        // No further synchronous steps needed here for basic image loading.
    }
};

// Assuming 'player' is now 'characterController' and it's a global object.
// We'll define a dummy one for demonstration if it's not provided externally.
if (typeof characterController === 'undefined') {
    window.characterController = {
        userName: 'GuestPlayer',
        position: { x: 0, y: 0, facing: 'right' },
        isConnected: false,
        isReady: false,
        otherCharacters: {},
        setup: function() { console.log('Dummy characterController setup.'); this.isConnected = true; },
        setCoordinates: function(x, y) { this.position.x = x; this.position.y = y; console.log(`Dummy characterController moved to ${x}, ${y}`); }
    };
}

// Global function callback for room data (as per original design)
// This function is expected to be called by the loaded .callback.json script.
function getRoom(roomData) {
    if (typeof displayEngine !== 'undefined' && typeof displayEngine.currentSceneData !== 'undefined') {
        displayEngine.currentSceneData = roomData;
        console.log(`Room data for ${roomData.label} received. Preparing stage.`);
        displayEngine.configureVisualCanvas();
    } else {
        console.error('displayEngine not initialized or accessible to process room data.');
    }
}