(function() {
    // Acquire references to the primary rendering surface and its 2D drawing context.
    const renderSurface = $('#gameCanvasElement')[0];
    if (!renderSurface) {
        console.error("Critical: Canvas element with ID 'gameCanvasElement' not found. Please ensure it exists.");
        return;
    }
    const drawingContext = renderSurface.getContext('2d');

    // Constants for sprite dimensions and other magic numbers, enhancing readability.
    const POINTER_SPRITE_WIDTH = 30;
    const POINTER_SPRITE_HEIGHT = 24;
    const TOOLTIP_HORIZONTAL_PADDING = 4;
    const TOOLTIP_VERTICAL_OFFSET = 16;
    const TOOLTIP_LINE_HEIGHT_ESTIMATE = 14; // Approximate line height for 12px font
    const MIN_DRAG_THRESHOLD_PX = 5; // Minimum pixels moved before a drag selection is registered

    // Centralized asset loading and management.
    const assetManager = {
        loadedAssetCount: 0,
        totalAssetsToLoad: 0,
        // Loads an image and updates internal loading progress.
        loadImage: function(imagePath) {
            this.totalAssetsToLoad++;
            const imgElement = new Image();
            imgElement.src = imagePath;
            imgElement.onload = () => {
                this.loadedAssetCount++;
                // Optional: Trigger a loading screen update here.
            };
            imgElement.onerror = () => {
                console.warn(`Failed to load image: ${imagePath}.`);
                this.loadedAssetCount++; // Still count to avoid blocking, but flag as warning.
            };
            return imgElement;
        }
    };

    // Manages all user pointer (mouse) interactions, including position, cursor display, and panning logic.
    const pointerCtrl = {
        currentX: 0, // Pointer's X-coordinate relative to the canvas.
        currentY: 0, // Pointer's Y-coordinate relative to the canvas.
        tileX: 0, // Pointer's X-coordinate in game tile units.
        tileY: 0, // Pointer's Y-coordinate in game tile units.
        worldX: 0, // Pointer's X-coordinate in game world units.
        worldY: 0, // Pointer's Y-coordinate in game world units.
        isWithinBounds: false, // True if the pointer is currently within the canvas boundaries.
        scrollDirection: "", // String indicating active panning direction (e.g., "pan_top_left").
        scrollTriggerDistance: 48, // Distance from canvas edge to initiate panning.
        scrollRatePx: 24, // Pixels per frame the map scrolls when panning.
        
        animationFrameCounter: 0, // Counter for animating the pointer's sprite frames.
        pointerSpriteSheet: null, // The image containing all pointer sprites.
        pointerStates: {}, // Object mapping pointer state names to their sprite data.
        nextSpriteOffset: 0, // Tracks the next available horizontal offset on the sprite sheet for new cursors.
        activePointerState: null, // The currently determined pointer state object.
        
        isDraggingSelection: false, // Flag indicating if a selection box is being dragged.
        selectionStartX: 0, // World X-coordinate where the drag selection started.
        selectionStartY: 0, // World Y-coordinate where the drag selection started.
        isMouseButtonDown: false, // Flag for when the primary mouse button is depressed.
        hoveredEntity: null, // Reference to the game entity currently under the pointer.
        isOverObscuredArea: false, // True if the pointer is currently over a fog-of-war-covered area.

        // Calculates and applies viewport scrolling based on pointer proximity to screen edges.
        updateScrollState: function() {
            let determinedScrollDirection = ""; // Builds up the direction string.
            simulationEnv.scrollVelocityX = 0; // Reset velocities at the start of each frame.
            simulationEnv.scrollVelocityY = 0;

            if (this.isWithinBounds) {
                const gameViewportTop = simulationEnv.viewOriginY;
                const gameViewportBottom = gameViewportTop + simulationEnv.viewportHeight;

                // Check for vertical scrolling conditions.
                if (this.currentY <= gameViewportTop + this.scrollTriggerDistance && this.currentY >= gameViewportTop) {
                    simulationEnv.scrollVelocityY = -this.scrollRatePx;
                    determinedScrollDirection += "_top";
                } else if (this.currentY >= gameViewportBottom - this.scrollTriggerDistance && this.currentY <= gameViewportBottom) {
                    simulationEnv.scrollVelocityY = this.scrollRatePx;
                    determinedScrollDirection += "_bottom";
                }

                // Check for horizontal scrolling conditions.
                if (this.currentX < this.scrollTriggerDistance && this.currentY >= gameViewportTop && this.currentY <= gameViewportBottom) {
                    simulationEnv.scrollVelocityX = -this.scrollRatePx;
                    determinedScrollDirection += "_left";
                } else if (this.currentX > simulationEnv.displayAreaWidth - this.scrollTriggerDistance && this.currentY >= gameViewportTop && this.currentY <= gameViewportBottom) {
                    simulationEnv.scrollVelocityX = this.scrollRatePx;
                    determinedScrollDirection += "_right";
                }
            }

            // Apply map boundary constraints to horizontal scrolling.
            const projectedMapOffsetX = simulationEnv.mapOffsetX + simulationEnv.scrollVelocityX;
            const effectiveRenderWidth = simulationEnv.viewportWidth + (sidebar.isVisible ? -sidebar.width : 0);
            if (projectedMapOffsetX < 0 || (projectedMapOffsetX + effectiveRenderWidth > simulationEnv.activeScenario.mapImage.width)) {
                simulationEnv.scrollVelocityX = 0;
            }
            // Special case: if sidebar is hidden, ensure map doesn't scroll past right edge.
            if (!sidebar.isVisible && (simulationEnv.mapOffsetX + simulationEnv.displayAreaWidth > simulationEnv.activeScenario.mapImage.width)) {
                simulationEnv.mapOffsetX = simulationEnv.activeScenario.mapImage.width - simulationEnv.displayAreaWidth;
                simulationEnv.scrollVelocityX = 0;
            }

            // Apply map boundary constraints to vertical scrolling.
            const projectedMapOffsetY = simulationEnv.mapOffsetY + simulationEnv.scrollVelocityY;
            if (projectedMapOffsetY < 0 || (projectedMapOffsetY + simulationEnv.viewportHeight > simulationEnv.activeScenario.mapImage.height)) {
                simulationEnv.scrollVelocityY = 0;
            }

            // Update the stored scroll direction string.
            if (determinedScrollDirection !== "") {
                const isStationaryScroll = (simulationEnv.scrollVelocityX === 0 && simulationEnv.scrollVelocityY === 0);
                this.scrollDirection = isStationaryScroll ? `no_pan${determinedScrollDirection}` : `pan${determinedScrollDirection}`;
            } else {
                this.scrollDirection = "";
            }

            // Update the actual map offsets.
            simulationEnv.mapOffsetX += simulationEnv.scrollVelocityX;
            simulationEnv.mapOffsetY += simulationEnv.scrollVelocityY;

            // Recalculate pointer's world coordinates after map offset update.
            this.worldX = this.currentX + simulationEnv.mapOffsetX - simulationEnv.viewOriginX;
            this.worldY = this.currentY + simulationEnv.mapOffsetY - simulationEnv.viewOriginY;
            
            // Update viewport adjustments, used for drawing game elements relative to the viewport.
            simulationEnv.viewportAdjustX = simulationEnv.viewOriginX - simulationEnv.mapOffsetX;
            simulationEnv.viewportAdjustY = simulationEnv.viewOriginY - simulationEnv.mapOffsetY;
        },

        // Renders the visual representation of the pointer (cursor) on the canvas.
        renderPointerVisual: function() {
            if (!this.isWithinBounds || !this.pointerSpriteSheet || !this.activePointerState) {
                return; // Nothing to draw if pointer is out of bounds or assets/state are missing.
            }

            this.animationFrameCounter++;
            const currentPointerState = this.activePointerState;

            // Loop the animation frames if the counter exceeds the total animation duration.
            if (this.animationFrameCounter >= currentPointerState.cursorSpeed * currentPointerState.count) {
                this.animationFrameCounter = 0;
            }
            
            // If a drag selection is active, draw the selection rectangle.
            if (this.isDraggingSelection) {
                const rectLeft = Math.min(this.worldX, this.selectionStartX);
                const rectTop = Math.min(this.worldY, this.selectionStartY);
                const rectWidth = Math.abs(this.worldX - this.selectionStartX);
                const rectHeight = Math.abs(this.worldY - this.selectionStartY);
                
                drawingContext.strokeStyle = 'white';
                drawingContext.strokeRect(rectLeft + simulationEnv.viewportAdjustX, rectTop + simulationEnv.viewportAdjustY, rectWidth, rectHeight);
            }
            
            // Calculate the specific sprite frame to draw based on animation state.
            const spriteFrameIndex = currentPointerState.spriteOffset + Math.floor(this.animationFrameCounter / currentPointerState.cursorSpeed);
            const sourceXPosition = POINTER_SPRITE_WIDTH * spriteFrameIndex;

            // Draw the cursor sprite on the canvas.
            drawingContext.drawImage(
                this.pointerSpriteSheet,
                sourceXPosition, 0, // Source X, Y on the sprite sheet.
                POINTER_SPRITE_WIDTH, POINTER_SPRITE_HEIGHT, // Dimensions of the sprite frame.
                this.currentX - currentPointerState.anchorX, this.currentY - currentPointerState.anchorY, // Destination X, Y on canvas (adjusted for anchor point).
                POINTER_SPRITE_WIDTH, POINTER_SPRITE_HEIGHT // Dimensions to draw the sprite on canvas.
            );
        },

        // Identifies and returns the interactive game entity currently under the pointer.
        detectHoveredEntity: function() {
            this.hoveredEntity = null; // Reset previous hovered object.

            // Iterate through resource overlays (e.g., Tiberium fields).
            for (let i = simulationEnv.resourceOverlays.length - 1; i >= 0; i--) {
                const currentOverlay = simulationEnv.resourceOverlays[i];
                // Check if pointer's tile coordinates match the overlay's.
                if (currentOverlay.name === 'tiberium' && this.tileX === currentOverlay.x && this.tileY === currentOverlay.y) {
                    this.hoveredEntity = currentOverlay;
                    return this.hoveredEntity; // Prioritize overlays if found.
                }
            }

            // Iterate through structural elements (buildings).
            for (let i = simulationEnv.structuralElements.length - 1; i >= 0; i--) {
                const building = simulationEnv.structuralElements[i];
                if (building.checkCollision && building.checkCollision(this.worldX, this.worldY)) { // Assuming 'underPoint' is now 'checkCollision'
                    this.hoveredEntity = building;
                    return this.hoveredEntity; // Found a building.
                }
            }
            
            // Iterate through defensive structures (turrets).
            for (let i = simulationEnv.defensiveStructures.length - 1; i >= 0; i--) {
                const turret = simulationEnv.defensiveStructures[i];
                if (turret.checkCollision && turret.checkCollision(this.worldX, this.worldY)) {
                    this.hoveredEntity = turret;
                    return this.hoveredEntity; // Found a turret.
                }
            }

            // Iterate through mobile entities (units).
            for (let i = simulationEnv.mobileEntities.length - 1; i >= 0; i--) {
                const unit = simulationEnv.mobileEntities[i];
                if (unit.checkCollision && unit.checkCollision(this.worldX, this.worldY)) {
                    this.hoveredEntity = unit;
                    return this.hoveredEntity; // Found a unit.
                }
            }
            
            return this.hoveredEntity; // Returns null if no entity is under the pointer.
        },

        // Determines the correct pointer visual (cursor) to display based on game context.
        determineAndRenderCursor: function() {
            this.activePointerState = this.pointerStates['default']; // Default to generic cursor.

            const isPointerOutsideGameViewport = this.currentY < simulationEnv.viewOriginY || this.currentY > simulationEnv.viewOriginY + simulationEnv.viewportHeight;
            if (isPointerOutsideGameViewport) {
                // No special cursor logic for areas outside the main game viewport.
            } else if (sidebar.isDeploymentModeActive) {
                // Logic for showing building placement previews.
                const deployableItem = structuralElements.entityTypes[sidebar.itemToDeploy] || defensiveStructures.entityTypes[sidebar.itemToDeploy];
                if (deployableItem && deployableItem.gridShape) { // Ensure deployable item and its shape exist.
                    const placementFootprint = [...deployableItem.gridShape]; // Create a copy of the grid shape.
                    
                    for (let yOffset = 0; yOffset < placementFootprint.length; yOffset++) {
                        for (let xOffset = 0; xOffset < placementFootprint[yOffset].length; xOffset++) {
                            if (placementFootprint[yOffset][xOffset] === 1) { // If this cell is part of the building's footprint.
                                const targetGridX = this.tileX + xOffset;
                                const targetGridY = this.tileY + yOffset;
                                
                                let isPlacementObstructed = false;
                                // Check grid bounds and obstruction grid.
                                if (targetGridY < 0 || targetGridY >= simulationEnv.constructionBlockers.length ||
                                    targetGridX < 0 || targetGridX >= simulationEnv.constructionBlockers[0].length) {
                                    isPlacementObstructed = true; // Out of bounds is an obstruction.
                                } else if (simulationEnv.constructionBlockers[targetGridY][targetGridX] === 1) {
                                    isPlacementObstructed = true; // Specific tile is obstructed.
                                }

                                const highlightVisual = isPlacementObstructed ? sidebar.redPlacementOverlay : sidebar.whitePlacementOverlay;
                                simulationEnv.highlightGridTile(targetGridX, targetGridY, 1, 1, highlightVisual);
                            }
                        }
                    }
                }
            } else if (sidebar.isRepairModeActive) {
                const entityUnderPointer = this.detectHoveredEntity();
                const canTargetForRepair = entityUnderPointer && 
                                           entityUnderPointer.team === simulationEnv.activeScenario.playerTeam &&
                                           (entityUnderPointer.type === 'building' || entityUnderPointer.type === 'turret') &&
                                           (entityUnderPointer.health < entityUnderPointer.maxHealthPoints);
                this.activePointerState = canTargetForRepair ? this.pointerStates['repair'] : this.pointerStates['no_repair'];
            } else if (sidebar.isSellModeActive) {
                const entityUnderPointer = this.detectHoveredEntity();
                const canTargetForSell = entityUnderPointer && 
                                         entityUnderPointer.team === simulationEnv.activeScenario.playerTeam &&
                                         (entityUnderPointer.type === 'building' || entityUnderPointer.type === 'turret');
                this.activePointerState = canTargetForSell ? this.pointerStates['sell'] : this.pointerStates['no_sell'];
            } else if (sidebar.isVisible && this.currentX > sidebar.leftEdgeCoordinate) {
                // Pointer is over the sidebar UI area.
                const interactedButton = sidebar.getButtonAtPointer(this.currentX, this.currentY);
                if (interactedButton) {
                    let tooltipDisplayLabel = interactedButton.entityKind;
                    // Map entity kinds to user-friendly labels.
                    const labelLookup = {
                        'infantry': infantry.unitDefinitions[interactedButton.name].displayLabel,
                        'building': structuralElements.entityTypes[interactedButton.name].displayLabel,
                        'turret': defensiveStructures.entityTypes[interactedButton.name].displayLabel,
                        'vehicle': vehicles.unitDefinitions[interactedButton.name].displayLabel,
                    };
                    tooltipDisplayLabel = labelLookup[interactedButton.entityKind] || interactedButton.entityKind;

                    const tooltipPrice = `$${interactedButton.costValue}`;

                    // Calculate tooltip dimensions and position.
                    const maxTextWidth = Math.max(tooltipDisplayLabel.length, tooltipPrice.length) * 5.5; // Rough text width estimate.
                    const tooltipTotalWidth = maxTextWidth + (TOOLTIP_HORIZONTAL_PADDING * 2);
                    const tooltipTotalHeight = (TOOLTIP_LINE_HEIGHT_ESTIMATE * 2) + TOOLTIP_VERTICAL_OFFSET; // For two lines of text.
                    const tooltipRenderX = Math.round(this.currentX);
                    const tooltipRenderY = Math.round(this.currentY + TOOLTIP_VERTICAL_OFFSET);

                    // Draw tooltip background.
                    drawingContext.fillStyle = 'black';
                    drawingContext.fillRect(tooltipRenderX, tooltipRenderY, tooltipTotalWidth, tooltipTotalHeight);
                    drawingContext.strokeStyle = 'darkgreen';
                    drawingContext.strokeRect(tooltipRenderX, tooltipRenderY, tooltipTotalWidth, tooltipTotalHeight);
                    
                    // Draw tooltip text.
                    drawingContext.fillStyle = 'darkgreen';
                    drawingContext.font = '12px "Command and Conquer"'; // Keeping font name as per original.
                    drawingContext.fillText(tooltipDisplayLabel, tooltipRenderX + TOOLTIP_HORIZONTAL_PADDING, tooltipRenderY + TOOLTIP_LINE_HEIGHT_ESTIMATE);
                    drawingContext.fillText(tooltipPrice, tooltipRenderX + TOOLTIP_HORIZONTAL_PADDING, tooltipRenderY + (TOOLTIP_LINE_HEIGHT_ESTIMATE * 2));
                }
            } else if (this.isDraggingSelection) {
                this.activePointerState = this.pointerStates['default']; // Standard cursor during selection drag.
            } else {
                // General game area interactions.
                const entityUnderPointer = this.detectHoveredEntity();
                const hasPlayerUnitsSelected = simulationEnv.playerControlledUnits.length > 0;
                const hasOffensiveUnitsSelected = simulationEnv.offensiveUnitsSelected.length > 0;
                const isEntityOnPlayerTeam = entityUnderPointer && entityUnderPointer.team === simulationEnv.activeScenario.playerTeam;

                if (entityUnderPointer && !this.isOverObscuredArea) {
                    if (!isEntityOnPlayerTeam && hasOffensiveUnitsSelected) {
                        this.activePointerState = this.pointerStates['attack'];
                    } else if (hasPlayerUnitsSelected && simulationEnv.playerControlledUnits[0].name === 'harvester' && isEntityOnPlayerTeam) {
                        // Special logic for harvester unit interactions.
                        if (entityUnderPointer.name === 'tiberium') {
                            this.activePointerState = this.pointerStates['attack']; // Harvester "attacks" tiberium to gather.
                        } else if (entityUnderPointer.name === 'refinery' && isEntityOnPlayerTeam) {
                            this.activePointerState = this.pointerStates['load_vehicle']; // Harvester enters own refinery.
                        }
                    } else if (hasPlayerUnitsSelected && simulationEnv.playerControlledUnits[0].name === 'mcv' && entityUnderPointer.isSelected) {
                        this.activePointerState = this.pointerStates['build_command'];
                    } else if (!entityUnderPointer.isSelected && entityUnderPointer.name !== 'tiberium') {
                        this.activePointerState = this.pointerStates['select'];
                    } else if (entityUnderPointer.name === 'tiberium') {
                        if (simulationEnv.movementBlockers[this.tileY] && simulationEnv.movementBlockers[this.tileY][this.tileX] === 1) {
                            this.activePointerState = this.pointerStates['no_move'];
                        } else {
                            this.activePointerState = this.pointerStates['move'];
                        }
                    }
                } else if (this.scrollDirection !== "") {
                    this.activePointerState = this.pointerStates[this.scrollDirection];
                } else if (hasPlayerUnitsSelected) {
                    // If player units are selected, default to a move cursor unless obstruction.
                    if (simulationEnv.movementBlockers[this.tileY] && simulationEnv.movementBlockers[this.tileY][this.tileX] === 1 && !this.isOverObscuredArea) {
                        this.activePointerState = this.pointerStates['no_move'];
                    } else {
                        this.activePointerState = this.pointerStates['move'];
                    }
                }
            }

            // Render the determined cursor visual if within canvas bounds.
            if (this.isWithinBounds) {
                this.renderPointerVisual();
            }
        },

        // Handles a click event, routing it to the appropriate game or UI component.
        processClickEvent: function(eventData, isRightClick) {
            // Check for clicks in the top "tab" area.
            if (this.currentY <= simulationEnv.viewOriginY && this.currentY > simulationEnv.viewOriginY - 15) {
                if (this.currentX >= 0 && this.currentX < 160) {
                    // Options button area.
                    // simulationEnv.displayOptionsPanel();
                } else if (this.currentX >= 320 && this.currentX < 480) {
                    // Score button area.
                    // simulationEnv.showScoreboard();
                } else if (this.currentX >= 480 && this.currentX < 640) {
                    // Sidebar toggle button area.
                    sidebar.toggleVisibility();
                }
            } else if (this.currentY >= simulationEnv.viewOriginY && this.currentY <= simulationEnv.viewOriginY + simulationEnv.viewportHeight) {
                // Click within the main game area.
                if (sidebar.isVisible && this.currentX > sidebar.leftEdgeCoordinate) {
                    // Click within the sidebar panel.
                    sidebar.handlePointerClick(eventData, isRightClick);
                } else {
                    // Click within the main game viewport itself.
                    simulationEnv.handleGameAreaClick(eventData, isRightClick);
                }
            }
        },

        // Configures all necessary DOM event listeners for pointer interactions.
        setupInputListeners: function() {
            const $canvasElement = $('#gameCanvasElement');

            // Mouse movement event handler.
            $canvasElement.mousemove(event => {
                const canvasOffset = $canvasElement.offset();
                this.currentX = event.pageX - canvasOffset.left;
                this.currentY = event.pageY - canvasOffset.top;

                // Update world and tile coordinates based on current map offset.
                this.worldX = this.currentX + simulationEnv.mapOffsetX - simulationEnv.viewOriginX;
                this.worldY = this.currentY + simulationEnv.mapOffsetY - simulationEnv.viewOriginY;
                this.tileX = Math.floor(this.worldX / simulationEnv.tileDimension);
                this.tileY = Math.floor(this.worldY / simulationEnv.tileDimension);
                
                this.isOverObscuredArea = fogOfWar.isPointObscured(this.worldX, this.worldY);

                // Check for drag selection initiation.
                if (this.isMouseButtonDown) {
                    if (Math.abs(this.selectionStartX - this.worldX) > MIN_DRAG_THRESHOLD_PX ||
                        Math.abs(this.selectionStartY - this.worldY) > MIN_DRAG_THRESHOLD_PX) {
                        this.isDraggingSelection = true;
                    }
                } else {
                    this.isDraggingSelection = false; // Reset drag state if button is not pressed.
                }
            });
            
            // Primary click (left mouse button release).
            $canvasElement.click(event => {
                this.processClickEvent(event, false); // False indicates left click.
                this.isDraggingSelection = false; // Clear drag state after a click.
                return false; // Prevent default browser behavior.
            });
            
            // Mouse button down (any button).
            $canvasElement.mousedown(event => {
                if (event.which === 1) { // Check for left mouse button.
                    this.isMouseButtonDown = true;
                    this.selectionStartX = this.worldX; // Store starting point for potential drag.
                    this.selectionStartY = this.worldY;
                    event.preventDefault(); // Prevent default browser actions like image dragging.
                }
                return false;
            });
            
            // Context menu event (right click).
            $canvasElement.bind('contextmenu', event => { // Using jQuery's .bind for specific contextmenu event.
                this.processClickEvent(event, true); // True indicates right click.
                return false; // Prevent default browser context menu.
            });
            
            // Mouse button up (any button).
            $canvasElement.mouseup(event => {
                if (event.which === 1) { // Check for left mouse button release.
                    if (this.isDraggingSelection) {
                        // Process units within the drag selection rectangle.
                        if (!event.shiftKey) {
                            simulationEnv.clearAllSelections(); // Clear previous selections if Shift is not held.
                        }
                        const dragRectLeft = Math.min(this.worldX, this.selectionStartX);
                        const dragRectTop = Math.min(this.worldY, this.selectionStartY);
                        const dragRectRight = Math.max(this.worldX, this.selectionStartX);
                        const dragRectBottom = Math.max(this.worldY, this.selectionStartY);

                        for (let i = simulationEnv.mobileEntities.length - 1; i >= 0; i--) {
                            const unit = simulationEnv.mobileEntities[i];
                            // Check if unit's world coordinates fall within the selection rectangle.
                            const unitWorldX = unit.x * simulationEnv.tileDimension;
                            const unitWorldY = unit.y * simulationEnv.tileDimension;

                            if (!unit.isSelected && unit.team === simulationEnv.activeScenario.playerTeam &&
                                unitWorldX >= dragRectLeft && unitWorldX <= dragRectRight &&
                                unitWorldY >= dragRectTop && unitWorldY <= dragRectBottom) {
                                simulationEnv.toggleUnitSelection(unit, event.shiftKey);
                            }
                        }
                    }
                    this.isMouseButtonDown = false; // Reset button state.
                }
                return false;
            });
            
            // Mouse leaves the canvas area.
            $canvasElement.mouseleave(() => {
                this.isWithinBounds = false;
            });
            
            // Mouse enters the canvas area.
            $canvasElement.mouseenter(() => {
                this.isMouseButtonDown = false; // Reset button state on re-entry.
                this.isWithinBounds = true;
            });
            
            // Global keyboard input listener.
            $(document).keypress(event => {
                simulationEnv.handleKeyboardInput(event);
            });
        },

        // Defines and registers a new pointer state (cursor type) with its sprite details.
        registerPointerState: function(stateName, anchorX = 0, anchorY = 0, frameCount = 1, animationSpeed = 1) {
            this.pointerStates[stateName] = {
                anchorX: anchorX, // X-offset for the sprite's hot spot.
                anchorY: anchorY, // Y-offset for the sprite's hot spot.
                name: stateName,
                count: frameCount, // Total animation frames for this state.
                spriteOffset: this.nextSpriteOffset, // Starting offset on the sprite sheet.
                cursorSpeed: animationSpeed // Speed of animation (frames per sprite frame).
            };
            this.nextSpriteOffset += frameCount; // Increment for the next registered state.
        },

        // Loads the cursor sprite sheet and registers all predefined pointer states.
        initializeAllPointerStates: function() {
            this.pointerSpriteSheet = assetManager.loadImage('assets/images/cursors_sheet.png'); // Renamed image path.

            // Register various cursor types with their specific properties.
            this.registerPointerState('attack', 15, 12, 8);
            this.registerPointerState('big_detonate', 15, 12, 3);
            this.registerPointerState('build_command', 15, 12, 9);
            this.registerPointerState('default'); // Default anchor 0,0, frameCount 1, speed 1.
            this.registerPointerState('detonate', 15, 12, 3);
            this.registerPointerState('load_vehicle', 15, 12, 3, 2);
            
            // Placeholder states for unknown or reserved cursor types.
            this.registerPointerState('unknown_cursor_1');
            this.registerPointerState('unknown_cursor_2');
            
            this.registerPointerState('move', 15, 12);
            this.registerPointerState('no_default');
            this.registerPointerState('no_move', 15, 12);
            
            // Register all panning and no-panning variants.
            this.registerPointerState('no_pan_bottom', 15, 24); 
            this.registerPointerState('no_pan_bottom_left', 0, 24);
            this.registerPointerState('no_pan_bottom_right', 30, 24); 
            this.registerPointerState('no_pan_left', 0, 12); 
            this.registerPointerState('no_pan_right', 30, 12);
            this.registerPointerState('no_pan_top', 15, 0);
            this.registerPointerState('no_pan_top_left', 0, 0);
            this.registerPointerState('no_pan_top_right', 30, 0);
            
            this.registerPointerState('no_repair', 15, 0);
            this.registerPointerState('no_sell', 15, 12);
            
            this.registerPointerState('pan_bottom', 15, 24); 
            this.registerPointerState('pan_bottom_left', 0, 24);
            this.registerPointerState('pan_bottom_right', 30, 24); 
            this.registerPointerState('pan_left', 0, 12); 
            this.registerPointerState('pan_right', 30, 12);
            this.registerPointerState('pan_top', 15, 0);
            this.registerPointerState('pan_top_left', 0, 0);
            this.registerPointerState('pan_top_right', 30, 0);
            
            this.registerPointerState('repair', 15, 0, 24);
            this.registerPointerState('select', 15, 12, 6, 2); 
            this.registerPointerState('sell', 15, 12, 24);
        }
    }; 
    
    // Core game engine responsible for managing the game world, rendering, and logic updates.
    const simulationEnv = {
        displayAreaWidth: renderSurface.width,
        displayAreaHeight: renderSurface.height,
        viewOriginY: 35, // Y-coordinate of the game viewport's top edge on the canvas.
        viewOriginX: 0, // X-coordinate of the game viewport's left edge on the canvas.
        mapOffsetX: 0, // Current X-offset of the map relative to its origin.
        mapOffsetY: 0, // Current Y-offset of the map relative to its origin.
        scrollVelocityX: 0, // Current horizontal scrolling speed applied to the map.
        scrollVelocityY: 0, // Current vertical scrolling speed applied to the map.
        tileDimension: 24, // Size of a single game tile in pixels.
        
        gameLoopHandle: null, // Identifier for the main game animation interval.
        frameIntervalMs: 50, // Desired milliseconds between game frames.
        isDebuggingActive: false, // Flag to enable or disable debug output and features.
        timeScaleFactor: 0.2, // Global factor to adjust game speed.

        viewportWidth: 0, // Calculated width of the active game viewport.
        viewportHeight: 0, // Calculated height of the active game viewport.
        viewportAdjustX: 0, // X-offset to draw world coordinates correctly within the viewport.
        viewportAdjustY: 0, // Y-offset to draw world coordinates correctly within the viewport.

        activeScenario: { // Details of the currently loaded game level.
            mapImage: null,
            obstructionGrid: [], // Base grid for permanent map obstructions.
            playerTeam: 'blue' // The team associated with the player.
        },
        structuralElements: [], // Array of all buildings in the game.
        defensiveStructures: [], // Array of all turrets in the game.
        mobileEntities: [], // Array of all units (infantry, vehicles) in the game.
        resourceOverlays: [], // Array of dynamic map elements like Tiberium fields.

        movementBlockers: [], // Grid indicating general movement obstructions for units.
        playerUnitBlockers: [], // Grid specifically for player-controlled units' movement.
        constructionBlockers: [], // Grid indicating where new structures cannot be built.

        // Sets the clipping region for the drawing context to confine rendering to the game viewport.
        configureClipRegion: function() {
            drawingContext.beginPath();
            this.viewportWidth = sidebar.isVisible ? (this.displayAreaWidth - sidebar.width) : this.displayAreaWidth;
            this.viewportHeight = 480; // Fixed height for the main game area.

            drawingContext.rect(this.viewOriginX, this.viewOriginY, this.viewportWidth - this.viewOriginX, this.viewportHeight);
            drawingContext.clip(); // Apply the clipping path.
        },

        // Renders the game map and dynamically updates all obstruction grids.
        renderGameMap: function() {
            // Guard against drawing before the map image is fully loaded.
            if (!this.activeScenario.mapImage || !this.activeScenario.mapImage.complete) {
                console.warn("Map image is not yet loaded or is invalid. Skipping map render.");
                return;
            }

            pointerCtrl.updateScrollState(); // Update map scrolling based on pointer position.

            // Draw the visible portion of the map image to the canvas viewport.
            drawingContext.drawImage(
                this.activeScenario.mapImage,
                this.mapOffsetX, this.mapOffsetY, // Source rectangle (X,Y) on the map image.
                this.viewportWidth, this.viewportHeight, // Source rectangle (Width,Height) to take from the map.
                this.viewOriginX, this.viewOriginY, // Destination (X,Y) on the canvas to draw.
                this.viewportWidth, this.viewportHeight // Destination (Width,Height) to draw on the canvas.
            );
            
            // --- Obstruction Grid Regeneration ---
            // Grids are regenerated each frame to accurately reflect all dynamic obstacles.
            // Using `Array.from` with `map` for clean deep copying of the base obstruction grid.
            this.movementBlockers = Array.from(this.activeScenario.obstructionGrid, row => [...row]);
            this.playerUnitBlockers = Array.from(this.activeScenario.obstructionGrid, row => [...row]);
            this.constructionBlockers = Array.from(this.activeScenario.obstructionGrid, row => [...row]);

            const OBSTRUCTED_TILE_VALUE = 1; // Constant for clarity.

            // Mark structural elements (buildings) as obstructed in all relevant grids.
            for (const structure of this.structuralElements) {
                for (let y = 0; y < structure.gridShape.length; y++) {
                    for (let x = 0; x < structure.gridShape[y].length; x++) {
                        if (structure.gridShape[y][x] === OBSTRUCTED_TILE_VALUE) {
                            const gridY = y + structure.y;
                            const gridX = x + structure.x;
                            
                            // Ensure grid coordinates are valid before marking.
                            if (gridY >= 0 && gridY < this.movementBlockers.length &&
                                gridX >= 0 && gridX < this.movementBlockers[gridY].length) {
                                this.movementBlockers[gridY][gridX] = OBSTRUCTED_TILE_VALUE;
                                this.playerUnitBlockers[gridY][gridX] = OBSTRUCTED_TILE_VALUE;
                                this.constructionBlockers[gridY][gridX] = OBSTRUCTED_TILE_VALUE;

                                // Add an extra tile below buildings as a no-build zone (e.g., for foundations).
                                if (y === structure.gridShape.length - 1 && (gridY + 1) < this.constructionBlockers.length) {
                                    this.constructionBlockers[gridY + 1][gridX] = OBSTRUCTED_TILE_VALUE;
                                }
                            }
                        }
                    }
                }
            }

            // Mark defensive structures (turrets) as obstructed.
            for (const turret of this.defensiveStructures) {
                const gridY = turret.y;
                const gridX = turret.x;
                if (gridY >= 0 && gridY < this.movementBlockers.length &&
                    gridX >= 0 && gridX < this.movementBlockers[gridY].length) {
                    this.movementBlockers[gridY][gridX] = OBSTRUCTED_TILE_VALUE;
                    this.playerUnitBlockers[gridY][gridX] = OBSTRUCTED_TILE_VALUE;
                    this.constructionBlockers[gridY][gridX] = OBSTRUCTED_TILE_VALUE;
                }
            }
            
            // Mark mobile entities (units) as obstructing construction (units block building placement).
            for (const entity of this.mobileEntities) {
                // Units might have sub-tile positions; round down to get the containing tile.
                const gridY = Math.floor(entity.y);
                const gridX = Math.floor(entity.x);
                if (gridY >= 0 && gridY < this.constructionBlockers.length &&
                    gridX >= 0 && gridX < this.constructionBlockers[gridY].length) {
                    this.constructionBlockers[gridY][gridX] = OBSTRUCTED_TILE_VALUE;
                }
            }
        },

        // Renders a visual highlight on a specified grid tile (e.g., for building placement feedback).
        highlightGridTile: function(tileX, tileY, tileWidth, tileHeight, highlightImage) {
            // This function is called by `pointerCtrl.determineAndRenderCursor`.
            // It draws the provided `highlightImage` at the calculated screen position for the given tile.
            drawingContext.drawImage(highlightImage,
                tileX * this.tileDimension + this.viewportAdjustX,
                tileY * this.tileDimension + this.viewportAdjustY,
                tileWidth * this.tileDimension,
                tileHeight * this.tileDimension
            );
        },

        // Clears the selection state of all currently selected units.
        clearAllSelections: function() {
            // Iterate through `playerControlledUnits` and set `isSelected` to false.
            this.playerControlledUnits.forEach(unit => unit.isSelected = false);
            this.playerControlledUnits = []; // Empty the array of selected units.
            this.offensiveUnitsSelected = []; // Clear offensive units as well.
            console.log("All player units have been deselected.");
        },

        // Toggles the selection state of a given unit, optionally adding to existing selection.
        toggleUnitSelection: function(unitToToggle, addToExistingSelection) {
            if (!unitToToggle) return; // Guard clause for null unit.

            if (addToExistingSelection) {
                if (unitToToggle.isSelected) {
                    unitToToggle.isSelected = false;
                    // Remove the unit from the selected arrays.
                    this.playerControlledUnits = this.playerControlledUnits.filter(u => u !== unitToToggle);
                    this.offensiveUnitsSelected = this.offensiveUnitsSelected.filter(u => u !== unitToToggle);
                } else {
                    unitToToggle.isSelected = true;
                    this.playerControlledUnits.push(unitToToggle);
                    if (unitToToggle.canAttack) { // Assuming units have a `canAttack` property.
                        this.offensiveUnitsSelected.push(unitToToggle);
                    }
                }
            } else {
                this.clearAllSelections(); // Deselect all others first.
                unitToToggle.isSelected = true;
                this.playerControlledUnits.push(unitToToggle);
                if (unitToToggle.canAttack) {
                    this.offensiveUnitsSelected.push(unitToToggle);
                }
            }
            console.log(`Unit '${unitToToggle.name}' selection state updated. Total selected: ${this.playerControlledUnits.length}`);
        },

        // Placeholder for handling clicks within the main game viewport.
        handleGameAreaClick: function(eventData, isRightClick) {
            console.log(`Game area interaction at World X=${pointerCtrl.worldX}, Y=${pointerCtrl.worldY}. Right click: ${isRightClick}`);
            // This method would contain the core logic for issuing commands to selected units,
            // interacting with hovered entities, or moving units to a specific location.
        },

        // Placeholder for processing keyboard input relevant to game commands.
        handleKeyboardInput: function(eventData) {
            console.log(`Keyboard input detected: Key '${eventData.key}' pressed.`);
            // Implement hotkey actions, game commands, etc.
        }
    };

    // --- Mock/Placeholder Objects for referenced globals (not defined in original snippet) ---
    // These objects simulate the behavior of external game components to make the clone runnable.
    const sidebar = {
        isVisible: false, // Controls the visibility of the sidebar.
        width: 160, // Width of the sidebar in pixels.
        leftEdgeCoordinate: renderSurface.width - 160, // X-coordinate where the sidebar begins.
        isDeploymentModeActive: false, // True if a building/unit is selected for deployment.
        itemToDeploy: null, // Name of the building/unit currently selected for deployment.
        isRepairModeActive: false, // True if repair mode is active.
        isSellModeActive: false, // True if sell mode is active.
        redPlacementOverlay: new Image(), // Image for invalid placement feedback.
        whitePlacementOverlay: new Image(), // Image for valid placement feedback.
        
        // Toggles the sidebar's visibility and updates the game viewport.
        toggleVisibility: function() {
            this.isVisible = !this.isVisible;
            simulationEnv.configureClipRegion(); // Re-configure clipping as viewport dimensions change.
            console.log(`Sidebar visibility toggled to: ${this.isVisible}`);
        },
        // Determines if a button within the sidebar is currently under the pointer.
        getButtonAtPointer: function(pointerX, pointerY) {
            // Simplified mock: returns a dummy button if pointer is within sidebar bounds.
            if (pointerX > this.leftEdgeCoordinate && pointerY > simulationEnv.viewOriginY) {
                return { entityKind: 'building', name: 'powerplant', costValue: 800 };
            }
            return null;
        },
        // Handles pointer clicks specifically within the sidebar area.
        handlePointerClick: function(eventData, isRightClick) {
            console.log(`Sidebar received click: X=${pointerCtrl.currentX}, Y=${pointerCtrl.currentY}, Right click: ${isRightClick}`);
            // This is where logic for sidebar button presses (e.g., build commands, unit production) would go.
        }
    };
    // Assign placeholder image sources for sidebar overlays.
    sidebar.redPlacementOverlay.src = 'assets/images/red_placement_overlay.png';
    sidebar.whitePlacementOverlay.src = 'assets/images/white_placement_overlay.png';

    const fogOfWar = {
        // Determines if a given world point is obscured by fog of war.
        isPointObscured: function(worldX, worldY) {
            // Mock logic: For now, always returns false (no fog).
            return false;
        }
    };

    // Mock type definitions for various game entities, used for tooltips and placement logic.
    const structuralElements = { entityTypes: { 'powerplant': { displayLabel: 'Power Plant', gridShape: [[1,1],[1,1]] } } };
    const defensiveStructures = { entityTypes: { 'guardtower': { displayLabel: 'Guard Tower', gridShape: [[1]] } } };
    const infantry = { unitDefinitions: { 'rifleman': { displayLabel: 'Rifleman' } } };
    const vehicles = { unitDefinitions: { 'harvester': { displayLabel: 'Harvester' } } };

    // --- Initialization Block ---
    // This code runs once the DOM is fully loaded, setting up the game environment.
    $(function() {
        // Initialize pointer control's event listeners and load its cursor sprites.
        pointerCtrl.setupInputListeners();
        pointerCtrl.initializeAllPointerStates();

        // Load a mock map image for the active scenario.
        simulationEnv.activeScenario.mapImage = assetManager.loadImage('assets/images/mock_game_map.png');
        simulationEnv.activeScenario.mapImage.onload = () => {
            // Once the map image is loaded, initialize the base obstruction grid.
            // This is a dummy 20x40 grid for demonstration.
            simulationEnv.activeScenario.obstructionGrid = Array(20).fill(0).map(() => Array(40).fill(0));
            
            // Add some mock entities to the game for testing cursor interactions.
            simulationEnv.structuralElements.push({
                x: 5, y: 5, type: 'building', name: 'powerplant', gridShape: [[1,1],[1,1]], team: 'blue', health: 50, maxHealthPoints: 100, isSelected: false,
                checkCollision: (wx, wy) => wx >= 5*simulationEnv.tileDimension && wx < 7*simulationEnv.tileDimension && wy >= 5*simulationEnv.tileDimension && wy < 7*simulationEnv.tileDimension
            });
            simulationEnv.mobileEntities.push({
                x: 10, y: 10, type: 'unit', name: 'harvester', team: 'blue', isSelected: false, canAttack: false,
                checkCollision: (wx, wy) => wx >= 10*simulationEnv.tileDimension && wx < 11*simulationEnv.tileDimension && wy >= 10*simulationEnv.tileDimension && wy < 11*simulationEnv.tileDimension
            });
            simulationEnv.resourceOverlays.push({
                x: 12, y: 12, name: 'tiberium'
            });

            // Start the main game loop, which continuously updates and renders the game state.
            simulationEnv.gameLoopHandle = setInterval(() => {
                drawingContext.clearRect(0, 0, renderSurface.width, renderSurface.height); // Clear the entire canvas.

                // Save the current drawing context state (before applying clipping).
                drawingContext.save(); 
                simulationEnv.configureClipRegion(); // Define the game viewport clipping area.
                simulationEnv.renderGameMap(); // Draw the map and update grids.
                drawingContext.restore(); // Restore context to draw outside clipped region (e.g., UI).

                pointerCtrl.determineAndRenderCursor(); // Update and draw the custom pointer.

                // Additional game logic updates (e.g., unit movement, AI, projectiles) would be called here.

            }, simulationEnv.frameIntervalMs);
        };
    });
})();