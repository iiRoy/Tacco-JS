jQ(function() { // Initialize operations once the document is fully loaded

    // Secure a reference to the main drawing surface element
    const drawingSurface = jQ('#canvas')[0];
    // Obtain the 2D rendering context from the canvas for drawing
    const renderingContext = drawingSurface.getContext('2d');

    // Define an object to manage all user pointer interactions and states
    let pointerInput = {
        currentX:         0, // Current X-coordinate on the canvas
        currentY:         0, // Current Y-coordinate on the canvas
        tileX:            0, // X-coordinate in game grid units
        tileY:            0, // Y-coordinate in game grid units
        worldX:           0, // X-coordinate in world units (accounting for viewport)
        worldY:           0, // Y-coordinate in world units (accounting for viewport)
        withinBounds:     false, // Flag: true if pointer is currently over the canvas
        scrollDirection:  "", // String indicating active map scrolling direction
        scrollBoundary:   48, // Distance from canvas edge to trigger scrolling
        scrollSpeed:      24, // Speed of map scrolling in pixels per frame
        
        // Function to manage automatic map scrolling based on pointer position
        manageScrolling: function() {
            let currentScrollDir = ""; // Temporary variable to build scroll direction string

            if (pointerInput.withinBounds) {
                // Determine vertical scrolling
                if (pointerInput.currentY <= worldState.viewTopOffset + pointerInput.scrollBoundary && pointerInput.currentY >= worldState.viewTopOffset) {
                    worldState.viewScrollDeltaY = -pointerInput.scrollSpeed;
                    currentScrollDir += "_up";
                } else if (pointerInput.currentY >= worldState.viewTopOffset + worldState.viewWindowHeight - pointerInput.scrollBoundary && pointerInput.currentY <= worldState.viewTopOffset + worldState.viewWindowHeight) {
                    worldState.viewScrollDeltaY = pointerInput.scrollSpeed;
                    currentScrollDir += "_down";
                } else {
                    worldState.viewScrollDeltaY = 0;
                    currentScrollDir += "";
                }   

                // Determine horizontal scrolling
                if (pointerInput.currentX < pointerInput.scrollBoundary && pointerInput.currentY >= worldState.viewTopOffset && pointerInput.currentY <= worldState.viewTopOffset + worldState.viewWindowHeight) {
                    worldState.viewScrollDeltaX = -pointerInput.scrollSpeed;
                    currentScrollDir += "_left";
                } else if (pointerInput.currentX > worldState.displayAreaWidth - pointerInput.scrollBoundary && pointerInput.currentY >= worldState.viewTopOffset && pointerInput.currentY <= worldState.viewTopOffset + worldState.viewWindowHeight) {
                    worldState.viewScrollDeltaX = pointerInput.scrollSpeed;
                    currentScrollDir += "_right";
                } else {
                    worldState.viewScrollDeltaX = 0;
                    currentScrollDir += "";
                }
            }

            // Boundary checks for horizontal scrolling
            if ((worldState.viewOffsetX + worldState.viewScrollDeltaX < 0) || (worldState.viewOffsetX + worldState.viewScrollDeltaX + worldState.displayAreaWidth + (sidePanel.visible ? -sidePanel.width : 0) > worldState.activeScenario.terrainImage.width)) {
                worldState.viewScrollDeltaX = 0;
            } 
            
            // Adjust viewport if side panel is not visible and map is too wide
            if (!sidePanel.visible && (worldState.viewOffsetX + worldState.displayAreaWidth > worldState.activeScenario.terrainImage.width)) {
                worldState.viewOffsetX = worldState.activeScenario.terrainImage.width - worldState.displayAreaWidth;
                worldState.viewScrollDeltaX = 0;
            }

            // Boundary checks for vertical scrolling
            if ((worldState.viewOffsetY + worldState.viewScrollDeltaY < 0) || (worldState.viewOffsetY + worldState.viewScrollDeltaY + worldState.viewWindowHeight > worldState.activeScenario.terrainImage.height)) {
                worldState.viewScrollDeltaY = 0;
            } 		 	

            // Update the stored scroll direction string
            if (currentScrollDir !== "") {
                if (worldState.viewScrollDeltaX === 0 && worldState.viewScrollDeltaY === 0) {
                    currentScrollDir = "no_scroll" + currentScrollDir; 
                } else {
                    currentScrollDir = "scroll" + currentScrollDir;
                }
            }	
            pointerInput.scrollDirection = currentScrollDir;    
            
            // Apply the calculated scroll deltas to the viewport
            worldState.viewOffsetX += worldState.viewScrollDeltaX;
            worldState.viewOffsetY += worldState.viewScrollDeltaY;
            
            // Update world coordinates of the pointer
            pointerInput.worldX = pointerInput.currentX + worldState.viewOffsetX - worldState.viewLeftOffset;
            pointerInput.worldY = pointerInput.currentY + worldState.viewOffsetY - worldState.viewTopOffset;
            
            // Calculate viewport adjustments for drawing entities relative to the screen
            worldState.viewAdjustX = worldState.viewLeftOffset - worldState.viewOffsetX;
            worldState.viewAdjustY = worldState.viewTopOffset - worldState.viewOffsetY;
        }, // End of manageScrolling

        animationFrameCounter: 0, // Counter for pointer animation frames
        
        // Renders the current pointer graphic on the canvas
        renderIndicator: function() {
            if (!this.withinBounds) {
                return; // Only draw if pointer is within canvas bounds
            }
            this.animationFrameCounter++;
            if (this.animationFrameCounter >= this.activePointer.frameRate * this.activePointer.count) {
                this.animationFrameCounter = 0; // Reset animation counter for looping
            }
            
            // Draw a white selection rectangle if drag-selecting
            if (this.isDraggingSelection) {    
                let startX = Math.min(this.worldX, this.selectionStartX);
                let startY = Math.min(this.worldY, this.selectionStartY);
                let rectWidth = Math.abs(this.worldX - this.selectionStartX);
                let rectHeight = Math.abs(this.worldY - this.selectionStartY);
                renderingContext.strokeStyle = 'white';
                renderingContext.strokeRect(startX + worldState.viewAdjustX, startY + worldState.viewAdjustY, rectWidth, rectHeight);
            }
            
            // Calculate the correct frame number from the sprite sheet
            let imageFrameNum = this.activePointer.spriteOffset + Math.floor(this.animationFrameCounter / this.activePointer.frameRate);
            renderingContext.drawImage(this.indicatorSheet, 30 * (imageFrameNum), 0, 30, 24, this.currentX - this.activePointer.offsetX, this.currentY - this.activePointer.offsetY, 30, 24);
        }, // End of renderIndicator

        // Checks if the pointer is currently hovering over any game object
        detectHoveredEntity: function() {
            this.hoveredEntity = null; // Reset the currently hovered entity

            // Check for map decorations (e.g., resource crystals)
            for (let i = worldState.mapDecorations.length - 1; i >= 0; i--) {
                let decoration = worldState.mapDecorations[i];
                if (decoration.entityName === 'resourceCrystal' && this.tileX === decoration.x && this.tileY === decoration.y) {
                    this.hoveredEntity = decoration;
                    break; // Found an overlay, stop checking
                }
            }
            // Check for structures
            if (!this.hoveredEntity) {
                for (let i = worldState.structures.length - 1; i >= 0; i--) {
                    if (worldState.structures[i].containsPoint(this.worldX, this.worldY)) {
                        this.hoveredEntity = worldState.structures[i];
                        break;
                    }
                }
            }
            // Check for defenses
            if (!this.hoveredEntity) {
                for (let i = worldState.defenses.length - 1; i >= 0; i--) {
                    if (worldState.defenses[i].containsPoint(this.worldX, this.worldY)) {
                        this.hoveredEntity = worldState.defenses[i];
                        break;
                    }
                }
            }
            // Check for mobile units
            if (!this.hoveredEntity) {
                for (let i = worldState.mobileUnits.length - 1; i >= 0; i--) {
                    if (worldState.mobileUnits[i].containsPoint && worldState.mobileUnits[i].containsPoint(this.worldX, this.worldY)) {
                        this.hoveredEntity = worldState.mobileUnits[i];
                        break;
                    }
                }
            }
            return this.hoveredEntity;
        }, // End of detectHoveredEntity

        // Main function to determine and display the correct pointer graphic and related UI
        displayPointer: function() {
            this.activePointer = this.pointerTypes['default']; // Default pointer initially
            let currentHovered = this.detectHoveredEntity(); // Get the entity under the pointer
            
            // Logic for pointer appearance based on various game states
            if (this.currentY < worldState.viewTopOffset || this.currentY > worldState.viewTopOffset + worldState.viewWindowHeight) {
                // Pointer is outside the main game view area (e.g., in the top UI bar)
                // Default cursor remains active.
            } else if (sidePanel.placementMode) {
                // Building placement mode: highlight grid cells
                const blueprint = structures.types[sidePanel.itemToPlace] || defenses.types[sidePanel.itemToPlace];
                let placementLayout = jQ.extend([], blueprint.gridShape);
                placementLayout.push(placementLayout[placementLayout.length - 1]); // Duplicate last row for visual consistency

                for (let y = 0; y < placementLayout.length; y++) {
                    for (let x = 0; x < placementLayout[y].length; x++) {
                        if (placementLayout[y][x] === 1) {
                            const gridY = pointerInput.tileY + y;
                            const gridX = pointerInput.tileX + x;
                            // Check for obstructions or out-of-bounds placement
                            if (gridY < 0 || gridY >= worldState.constructionBlockGrid.length || gridX < 0 || gridX >= worldState.constructionBlockGrid[gridY].length || worldState.constructionBlockGrid[gridY][gridX] === 1) {
                                worldState.markTileArea(gridX, gridY, 1, 1, sidePanel.redHighlightImage);
                            } else {
                                worldState.markTileArea(gridX, gridY, 1, 1, sidePanel.whiteHighlightImage);
                            }
                        }
                    }
                }
            } else if (sidePanel.mendMode) {
                // Repair mode: show repair cursor if applicable
                if (currentHovered && currentHovered.faction === worldState.activeScenario.faction && (currentHovered.type === 'structure' || currentHovered.type === 'defense') && (currentHovered.currentHealth < currentHovered.maxHealth)) {
                    this.activePointer = this.pointerTypes['repair'];
                } else {
                    this.activePointer = this.pointerTypes['no_mend'];
                }
            } else if (sidePanel.deconstructMode) {
                // Sell mode: show sell cursor if applicable
                if (currentHovered && currentHovered.faction === worldState.activeScenario.faction && (currentHovered.type === 'structure' || currentHovered.type === 'defense')) {
                    this.activePointer = this.pointerTypes['sell_item'];
                } else {
                    this.activePointer = this.pointerTypes['no_deconstruct'];
                }
            } else if (sidePanel.visible && pointerInput.currentX > sidePanel.left) {
                // Pointer over side panel: display button tooltips
                let activeButton = sidePanel.activeButton();
                if (activeButton) {
                    let infoLabel = activeButton.type;
                    let itemPrice = "$" + activeButton.cost;
                    
                    // Customize tooltip based on entity type
                    switch (activeButton.type) {
                        case 'footSoldiers': infoLabel = footSoldiers.types[activeButton.name].displayLabel; break;
                        case 'structure': infoLabel = structures.types[activeButton.name].displayLabel; break;
                        case 'defense': infoLabel = defenses.types[activeButton.name].displayLabel; break;
                        case 'groundUnits': infoLabel = groundUnits.types[activeButton.name].displayLabel; break;
                    }
                    
                    // Draw tooltip background and text
                    renderingContext.fillStyle = 'black';
                    renderingContext.fillRect(Math.round(this.currentX), Math.round(this.currentY + 16), infoLabel.length * 5.5 + 8, 32);
                    renderingContext.strokeStyle = 'darkgreen';
                    renderingContext.strokeRect(Math.round(this.currentX), Math.round(this.currentY + 16), infoLabel.length * 5.5 + 8, 32);
                    renderingContext.fillStyle = 'darkgreen';
                    
                    renderingContext.font = '12px "Command and Conquer"';
                    renderingContext.fillText(infoLabel, Math.round(this.currentX + 4), Math.round(this.currentY + 30));
                    renderingContext.fillText(itemPrice, Math.round(this.currentX + 4), Math.round(this.currentY + 44));
                }	            
            } else if (this.isDraggingSelection) {
                this.activePointer = this.pointerTypes['default']; // Default pointer during selection drag
            } else if (currentHovered && !this.isObscured) {
                // If hovering over an visible object in the game world
                if (currentHovered.faction && currentHovered.faction !== worldState.activeScenario.faction && worldState.chosenAttackers.length > 0) {
                    this.activePointer = this.pointerTypes['attack']; // Attack hostile entity
                } else if (worldState.chosenUnits.length === 1 && worldState.chosenUnits[0].entityName === 'collectorVehicle' && 
                        worldState.chosenUnits[0].faction === worldState.activeScenario.faction &&
                        (currentHovered.entityName === 'resourceCrystal' || currentHovered.entityName === 'processorPlant')) {
                    // Special logic for collector vehicles
                    if (currentHovered.entityName === 'resourceCrystal') {
                        this.activePointer = this.pointerTypes['attack']; // Collector "attacks" crystals to harvest
                    }
                    if (currentHovered.entityName === 'processorPlant' && currentHovered.faction === worldState.activeScenario.faction) {
                        this.activePointer = this.pointerTypes['load_vehicle']; // Collector enters friendly refinery
                    }
                } else if (worldState.chosenUnits.length === 1 && currentHovered.selected && currentHovered.faction === worldState.activeScenario.faction) {
                    // Special logic for selected player units (e.g., MCV deploy)
                    if (currentHovered.entityName === 'mobileConstructionVehicle') {
                        this.activePointer = this.pointerTypes['build_command'];
                    } 
                } else if (!currentHovered.selected && currentHovered.entityName !== 'resourceCrystal') {
                    this.activePointer = this.pointerTypes['selection_tool']; // Select unselected entity
                } else if (currentHovered.entityName === 'resourceCrystal') {
                    // Resource crystal under pointer
                    if (worldState.collisionGrid[pointerInput.tileY] && worldState.collisionGrid[pointerInput.tileY][pointerInput.tileX] === 1) {
                        this.activePointer = this.pointerTypes['no_move_target'];
                    } else {
                        this.activePointer = this.pointerTypes['move_target'];
                    }
                }
            } else if (this.scrollDirection && this.scrollDirection !== "") {
                this.activePointer = this.pointerTypes[this.scrollDirection]; // Show scrolling pointer
            } else if (worldState.chosenUnits.length > 0) {
                // If player units are selected
                if (worldState.collisionGrid[pointerInput.tileY] && worldState.collisionGrid[pointerInput.tileY][pointerInput.tileX] === 1 && !this.isObscured) {
                    this.activePointer = this.pointerTypes['no_move_target']; // Cannot move here
                } else {
                    this.activePointer = this.pointerTypes['move_target']; // Can move here
                }
            } 

            // Finally, draw the determined pointer graphic
            if (this.withinBounds) {
                this.renderIndicator();
            }
        }, // End of displayPointer

        // Handles user click events on the canvas
        processClick: function(eventData, isRightClick) {
            // Check for clicks in the top UI bar area
            if (pointerInput.currentY <= worldState.viewTopOffset && pointerInput.currentY > worldState.viewTopOffset - 15) {
                if (pointerInput.currentX >= 0 && pointerInput.currentX < 160) {
                    // Options button clicked
                    // console.log('Options button clicked');
                } else if (pointerInput.currentX >= 320 && pointerInput.currentX < 480) {
                    // Score button clicked
                    // console.log('Score button clicked');
                } else if (pointerInput.currentX >= 480 && pointerInput.currentX < 640) {
                    // Side panel toggle button clicked
                    sidePanel.visible = !sidePanel.visible;
                } 
            } else if (pointerInput.currentY >= worldState.viewTopOffset && pointerInput.currentY <= worldState.viewTopOffset + worldState.viewWindowHeight) {
                // Click occurred within the main game view area
                if (sidePanel.visible && pointerInput.currentX > sidePanel.left) {
                    // Click on the side panel itself
                    sidePanel.click(eventData, isRightClick);
                } else {
                    // Click within the game world
                    worldState.processWorldClick(eventData, isRightClick);
                }
            }    
        }, // End of processClick

        // Sets up all event listeners for pointer and keyboard input
        setupInputHandlers: function() {
            jQ('#canvas').mousemove(function(eventData) {
                const canvasOffset = jQ('#canvas').offset(); // Get canvas position on the page
                pointerInput.currentX = eventData.pageX - canvasOffset.left;
                pointerInput.currentY = eventData.pageY - canvasOffset.top;  
                
                // Update grid and world coordinates for the pointer
                pointerInput.tileX = Math.floor((pointerInput.worldX) / worldState.tileDimension);
                pointerInput.tileY = Math.floor((pointerInput.worldY) / worldState.tileDimension);
                pointerInput.isObscured = obscurity.isOver(pointerInput.worldX, pointerInput.worldY); // Check if pointer is over fog
                
                // Manage drag selection state
                if (pointerInput.isButtonPressed) {
                    if (Math.abs(pointerInput.selectionStartX - pointerInput.worldX) > 5 || Math.abs(pointerInput.selectionStartY - pointerInput.worldY) > 5) {
                        pointerInput.isDraggingSelection = true; // Activate drag selection if pointer moved significantly
                    }
                } else {
                    pointerInput.isDraggingSelection = false; // Reset if mouse button is not pressed
                }         
            });
            
            jQ('#canvas').click(function(eventData) {
                pointerInput.processClick(eventData, false); // Handle left-click
                pointerInput.isDraggingSelection = false; // Disable drag selection after a click
                return false; // Prevent default browser behavior
            });
            
            jQ('#canvas').mousedown(function(eventData) {
                if (eventData.which === 1) { // Check for left mouse button
                    pointerInput.isButtonPressed = true;
                    pointerInput.selectionStartX = pointerInput.worldX; // Record starting point for drag selection
                    pointerInput.selectionStartY = pointerInput.worldY;
                    eventData.preventDefault(); // Prevent default browser actions (e.g., image drag)
                }
                return false;
            });
            
            jQ('#canvas').bind('contextmenu', function(eventData) {
                pointerInput.processClick(eventData, true); // Handle right-click
                return false; // Prevent browser context menu
            });
            
            jQ('#canvas').mouseup(function(eventData) {
                if (eventData.which === 1) { // Check for left mouse button release
                    if (pointerInput.isDraggingSelection) {
                        if (!eventData.shiftKey) {
                            worldState.deselectAll(); // Clear existing selection unless Shift is held
                        }
                        // Calculate selection rectangle boundaries
                        let x1 = Math.min(pointerInput.worldX, pointerInput.selectionStartX);
                        let y1 = Math.min(pointerInput.worldY, pointerInput.selectionStartY);
                        let x2 = Math.max(pointerInput.worldX, pointerInput.selectionStartX);
                        let y2 = Math.max(pointerInput.worldY, pointerInput.selectionStartY);
                        
                        // Select units within the defined rectangle
                        for (let i = worldState.mobileUnits.length - 1; i >= 0; i--) {
                            let unitEntity = worldState.mobileUnits[i];
                            if (!unitEntity.selected && unitEntity.faction === worldState.activeScenario.faction && 
                                x1 <= unitEntity.x * worldState.tileDimension && x2 >= unitEntity.x * worldState.tileDimension &&
                                y1 <= unitEntity.y * worldState.tileDimension && y2 >= unitEntity.y * worldState.tileDimension) {
                                worldState.selectEntity(unitEntity, eventData.shiftKey);
                            }
                        }
                    }
                    pointerInput.isButtonPressed = false; // Reset button pressed state
                }
                return false;
            });
            
            jQ('#canvas').mouseleave(function(eventData) {
                pointerInput.withinBounds = false; // Pointer has left the canvas area
            });
            
            jQ('#canvas').mouseenter(function(eventData) {
                pointerInput.isButtonPressed = false; // Reset button state on re-entry
                pointerInput.withinBounds = true; // Pointer has entered the canvas area
            });	        
            
            jQ(document).keypress(function(eventData) {
                worldState.handleKeyPress(eventData); // Global keyboard input handler
            });
            
        }, // End of setupInputHandlers

        assetsReady:     false, // Flag indicating if all pointer assets are loaded
        pendingAssets:   0, // Count of assets currently being loaded
        loadedAssets:    0, // Count of assets successfully loaded
        fetchImageAsset: fetchImageAsset, // Reference to a global image loading utility
        indicatorSheet:  null, // Sprite sheet image for all pointer graphics
        pointerTypes:    [], // Array to store definitions of different pointer types
        pointerTypeCount:0, // Total number of individual pointer frames defined

        // Registers a new pointer type with its visual and animation properties
        registerPointerType: function(typeIdentifier, offsetX, offsetY, frameTotal, frameRate) {
            // Default values for optional parameters
            if (!offsetX && !offsetY) { offsetX = 0; offsetY = 0; }
            if (!frameRate) { frameRate = 1; }
            if (!frameTotal) { frameTotal = 1; }
            
            this.pointerTypes[typeIdentifier] = {
                offsetX: offsetX,
                offsetY: offsetY,
                name: typeIdentifier,
                count: frameTotal,
                spriteOffset: this.pointerTypeCount,
                frameRate: frameRate
            };
            this.pointerTypeCount += frameTotal; // Increment the total frame count
        }, // End of registerPointerType
        
        // Loads the pointer sprite sheet and registers all predefined pointer types
        initializeAllPointers: function() {
            pointerInput.indicatorSheet = this.fetchImageAsset('cursors.png'); // Load the main pointer sprite sheet

            // Register various pointer types and their animation properties
            pointerInput.registerPointerType('attack', 15, 12, 8);
            pointerInput.registerPointerType('big_detonate', 15, 12, 3);
            pointerInput.registerPointerType('build_command', 15, 12, 9);
            pointerInput.registerPointerType('default');
            pointerInput.registerPointerType('detonate', 15, 12, 3);
            pointerInput.registerPointerType('load_vehicle', 15, 12, 3, 2);
            
            pointerInput.registerPointerType('unknown_1'); // Differentiated from original 'unknown'
            pointerInput.registerPointerType('unknown_2'); // Differentiated from original 'unknown'
            pointerInput.registerPointerType('move_target', 15, 12);
            pointerInput.registerPointerType('no_action');
            pointerInput.registerPointerType('no_move_target', 15, 12);
            
            pointerInput.registerPointerType('no_scroll_down', 15, 24); 
            pointerInput.registerPointerType('no_scroll_down_left', 0, 24);
            pointerInput.registerPointerType('no_scroll_down_right', 30, 24); 
            pointerInput.registerPointerType('no_scroll_left', 0, 12); 
            pointerInput.registerPointerType('no_scroll_right', 30, 12);
            pointerInput.registerPointerType('no_scroll_up', 15, 0);
            pointerInput.registerPointerType('no_scroll_up_left', 0, 0);
            pointerInput.registerPointerType('no_scroll_up_right', 30, 0);
            
            pointerInput.registerPointerType('no_mend', 15, 0);
            pointerInput.registerPointerType('no_deconstruct', 15, 12);
            
            pointerInput.registerPointerType('scroll_down', 15, 24); 
            pointerInput.registerPointerType('scroll_down_left', 0, 24);
            pointerInput.registerPointerType('scroll_down_right', 30, 24); 
            pointerInput.registerPointerType('scroll_left', 0, 12); 
            pointerInput.registerPointerType('scroll_right', 30, 12);
            pointerInput.registerPointerType('scroll_up', 15, 0);
            pointerInput.registerPointerType('scroll_up_left', 0, 0);
            pointerInput.registerPointerType('scroll_up_right', 30, 0);
            pointerInput.registerPointerType('repair', 15, 0, 24);
            pointerInput.registerPointerType('selection_tool', 15, 12, 6, 2); 
            pointerInput.registerPointerType('sell_item', 15, 12, 24);
        }
    }; // End of pointerInput object definition
    
    // Object encapsulating the core game state, map, and entity management
    let worldState = {
        displayAreaWidth:     drawingSurface.width,
        displayAreaHeight:    drawingSurface.height,
        viewTopOffset:        35, // Top pixel offset for the game viewport
        viewLeftOffset:       0, // Left pixel offset for the game viewport
        viewOffsetX:          0, // Current X-offset of the map in world coordinates
        viewOffsetY:          0, // Current Y-offset of the map in world coordinates
        viewScrollDeltaX:     0, // Change in X-offset for map scrolling
        viewScrollDeltaY:     0, // Change in Y-offset for map scrolling
        tileDimension:        24, // Size of a single grid tile in pixels
        renderLoopId:         null, // Identifier for the main animation loop
        renderInterval:       50, // Milliseconds between rendering frames
        debuggingEnabled:     false, // Flag to enable/disable debug features
        simulationSpeedFactor:0.2, // Factor to adjust overall game speed
        
        // Configures the rendering context to clip drawing to the game viewport
        configureViewWindow: function() {
            renderingContext.beginPath();
            this.viewWindowWidth = (sidePanel.visible) ? (this.displayAreaWidth - sidePanel.width) : this.displayAreaWidth;
            this.viewWindowHeight = 480; // Fixed height for the main game view area
            renderingContext.rect(this.viewLeftOffset, this.viewTopOffset, this.viewWindowWidth - this.viewLeftOffset, this.viewWindowHeight);
            renderingContext.clip(); // Apply the clipping path
        }, // End of configureViewWindow

        // Renders the background map and updates various collision grids
        renderMapBackground: function() {
            pointerInput.manageScrolling(); // Handle map scrolling based on pointer position

            // Draw the visible portion of the map image onto the canvas
            renderingContext.drawImage(this.activeScenario.terrainImage,
                this.viewOffsetX, this.viewOffsetY, this.viewWindowWidth, this.viewWindowHeight, 
                this.viewLeftOffset, this.viewTopOffset, this.viewWindowWidth, this.viewWindowHeight);
            
            // Initialize and populate different types of obstruction grids
            worldState.collisionGrid = []; // General grid for movement obstructions
            worldState.playerUnitCollisionGrid = []; // Grid for player unit movement, potentially considering fog
            worldState.constructionBlockGrid = [];  // Grid for valid building placement
            
            // Copy initial obstruction data from the active level's scenario
            for (let y = 0; y < this.activeScenario.obstructionGrid.length; y++) {
                worldState.collisionGrid[y] = [];
                worldState.playerUnitCollisionGrid[y] = [];
                worldState.constructionBlockGrid[y] = [];
                for (let x = 0; x < this.activeScenario.obstructionGrid[y].length; x++) {
                    worldState.collisionGrid[y][x] = this.activeScenario.obstructionGrid[y][x];
                    worldState.playerUnitCollisionGrid[y][x] = this.activeScenario.obstructionGrid[y][x];
                    worldState.constructionBlockGrid[y][x] = this.activeScenario.obstructionGrid[y][x];
                }
            }
            
            // Mark grid cells occupied by structures as obstructed
            for (let i = this.structures.length - 1; i >= 0; i--) {
                let currentStructure = this.structures[i];
                for (let y = 0; y < currentStructure.gridShape.length; y++) {
                    for (let x = 0; x < currentStructure.gridShape[y].length; x++) {
                        if (currentStructure.gridShape[y][x] === 1) {
                            worldState.collisionGrid[y + currentStructure.y][x + currentStructure.x] = 1;
                            worldState.playerUnitCollisionGrid[y + currentStructure.y][x + currentStructure.x] = 1;
                            worldState.constructionBlockGrid[y + currentStructure.y][x + currentStructure.x] = 1;

                            // Add an extra row below the structure as a no-building zone (for 'bib' area)
                            if (y === currentStructure.gridShape.length - 1) {
                                if (worldState.constructionBlockGrid[y + 1 + currentStructure.y] && worldState.constructionBlockGrid[y + 1 + currentStructure.y][x + currentStructure.x] !== undefined) {
                                    worldState.constructionBlockGrid[y + 1 + currentStructure.y][x + currentStructure.x] = 1;
                                }
                            }
                        }
                    }
                }
            }

            // Mark grid cells occupied by defenses as obstructed
            for (let i = this.defenses.length - 1; i >= 0; i--) {
                if (worldState.collisionGrid[this.defenses[i].y] && worldState.collisionGrid[this.defenses[i].y][this.defenses[i].x] !== undefined) {
                    worldState.collisionGrid[this.defenses[i].y][this.defenses[i].x] = 1;
                    worldState.playerUnitCollisionGrid[this.defenses[i].y][this.defenses[i].x] = 1; // Defenses block player units
                    worldState.constructionBlockGrid[this.defenses[i].y][this.defenses[i].x] = 1; // Defenses block construction
                }
            }
            
            // Mark grid cells occupied by mobile units as obstructed in the construction grid
            for (let i = this.mobileUnits.length - 1; i >= 0; i--) {
                let activeUnit = this.mobileUnits[i];
                let unitGridX = Math.floor(activeUnit.x);
                let unitGridY = Math.floor(activeUnit.y);
                if (worldState.constructionBlockGrid[unitGridY] && worldState.constructionBlockGrid[unitGridY][unitGridX] !== undefined) {
                    worldState.constructionBlockGrid[unitGridY][unitGridX] = 1;
                }
            }
        } // End of renderMapBackground
    }; // End of worldState object
    
    // Additional game objects (sidebar, buildings, turrets, etc.) would typically be defined here
    // as they are referenced in the above code, but their definitions were not provided in the snippet.

}); // End of jQuery ready function wrapper