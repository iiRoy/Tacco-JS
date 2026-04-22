class PointerVisuals {
    constructor(graphicSource) {
        this.graphicSource = graphicSource;
        this.visualsData = new Map();
        this.nextSpriteOffset = 0;
        this.animationCounter = 0;
    }

    registerVisual(name, offsetX = 0, offsetY = 0, frameCount = 1, animationSpeed = 1) {
        this.visualsData.set(name, {
            offsetX: offsetX,
            offsetY: offsetY,
            frameCount: frameCount,
            spriteOffset: this.nextSpriteOffset,
            animationSpeed: animationSpeed
        });
        this.nextSpriteOffset += frameCount;
    }

    initializeAllVisuals() {
        this.registerVisual('attack_target', 15, 12, 8);
        this.registerVisual('large_explosion', 15, 12, 3);
        this.registerVisual('construct_base', 15, 12, 9);
        this.registerVisual('standard_pointer');
        this.registerVisual('detonate_small', 15, 12, 3);
        this.registerVisual('load_transport', 15, 12, 3, 2);

        this.registerVisual('unknown_action_1');
        this.registerVisual('unknown_action_2');
        this.registerVisual('move_unit', 15, 12);
        this.registerVisual('no_action_default');
        this.registerVisual('no_move_unit', 15, 12);

        this.registerVisual('no_scroll_down', 15, 24);
        this.registerVisual('no_scroll_down_left', 0, 24);
        this.registerVisual('no_scroll_down_right', 30, 24);
        this.registerVisual('no_scroll_left', 0, 12);
        this.registerVisual('no_scroll_right', 30, 12);
        this.registerVisual('no_scroll_up', 15, 0);
        this.registerVisual('no_scroll_up_left', 0, 0);
        this.registerVisual('no_scroll_up_right', 30, 0);

        this.registerVisual('no_repair_item', 15, 0);
        this.registerVisual('no_sell_item', 15, 12);

        this.registerVisual('scroll_down', 15, 24);
        this.registerVisual('scroll_down_left', 0, 24);
        this.registerVisual('scroll_down_right', 30, 24);
        this.registerVisual('scroll_left', 0, 12);
        this.registerVisual('scroll_right', 30, 12);
        this.registerVisual('scroll_up', 15, 0);
        this.registerVisual('scroll_up_left', 0, 0);
        this.registerVisual('scroll_up_right', 30, 0);
        this.registerVisual('repair_item', 15, 0, 24);
        this.registerVisual('select_item', 15, 12, 6, 2);
        this.registerVisual('sell_item', 15, 12, 24);
    }

    getVisualDefinition(name) {
        return this.visualsData.get(name) || this.visualsData.get('standard_pointer');
    }

    advanceAnimation() {
        this.animationCounter++;
    }
}

class InputController {
    constructor(canvasElement, simulationCore, visualHandler, sidebarRef, fogRef) {
        this.canvasElement = canvasElement;
        this.simulationCore = simulationCore;
        this.visualHandler = visualHandler;
        this.sidebarRef = sidebarRef;
        this.fogRef = fogRef;

        this.screenX = 0;
        this.screenY = 0;
        this.worldX = 0;
        this.worldY = 0;
        this.gridCoordX = 0;
        this.gridCoordY = 0;
        this.isWithinCanvas = false;
        this.isButtonPressed = false;
        this.isDragSelecting = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.hoveredObject = null;
        this.currentScrollDirection = "";
        this.isObscuredByFog = false;

        this.scrollThreshold = 48;
        this.scrollVelocity = 24;

        this.activePointerVisual = null;

        this.bindEventHandlers();
    }

    updateCoordinates(event) {
        const rect = this.canvasElement.getBoundingClientRect();
        this.screenX = event.clientX - rect.left;
        this.screenY = event.clientY - rect.top;

        this.worldX = this.screenX + this.simulationCore.getViewportOriginX() - this.simulationCore.getViewportLeft();
        this.worldY = this.screenY + this.simulationCore.getViewportOriginY() - this.simulationCore.getViewportTop();

        this.gridCoordX = Math.floor(this.worldX / this.simulationCore.getGridDimension());
        this.gridCoordY = Math.floor(this.worldY / this.simulationCore.getGridDimension());

        this.isObscuredByFog = this.fogRef.isOver(this.worldX, this.worldY);

        if (this.isButtonPressed) {
            if (Math.abs(this.dragStartX - this.worldX) > 5 || Math.abs(this.dragStartY - this.worldY) > 5) {
                this.isDragSelecting = true;
            }
        }
    }

    calculateScrollDelta() {
        let deltaX = 0;
        let deltaY = 0;
        let directionString = "";

        const { viewportTop, viewportHeight, screenWidth } = this.simulationCore.getDisplayMetrics();

        if (this.isWithinCanvas) {
            if (this.screenY <= viewportTop + this.scrollThreshold && this.screenY >= viewportTop) {
                deltaY = -this.scrollVelocity;
                directionString += "_up";
            } else if (this.screenY >= viewportTop + viewportHeight - this.scrollThreshold && this.screenY <= viewportTop + viewportHeight) {
                deltaY = this.scrollVelocity;
                directionString += "_down";
            }

            if (this.screenX < this.scrollThreshold && this.screenY >= viewportTop && this.screenY <= viewportTop + viewportHeight) {
                deltaX = -this.scrollVelocity;
                directionString += "_left";
            } else if (this.screenX > screenWidth - this.scrollThreshold && this.screenY >= viewportTop && this.screenY <= viewportTop + viewportHeight) {
                deltaX = this.scrollVelocity;
                directionString += "_right";
            }
        }

        this.simulationCore.setViewportDelta(deltaX, deltaY);

        if (directionString !== "") {
            this.currentScrollDirection = (deltaX === 0 && deltaY === 0) ? "no_scroll" + directionString : "scroll" + directionString;
        } else {
            this.currentScrollDirection = "";
        }
    }

    detectHoveredElement() {
        this.hoveredObject = null;
        const currentLevel = this.simulationCore.getCurrentLevelData();

        for (let i = currentLevel.overlay.length - 1; i >= 0; i--) {
            const overlay = currentLevel.overlay[i];
            if (overlay.name === 'tiberium' && this.gridCoordX === overlay.x && this.gridCoordY === overlay.y) {
                this.hoveredObject = overlay;
                return this.hoveredObject;
            }
        }

        for (let i = currentLevel.buildings.length - 1; i >= 0; i--) {
            if (currentLevel.buildings[i].underPoint(this.worldX, this.worldY)) {
                this.hoveredObject = currentLevel.buildings[i];
                return this.hoveredObject;
            }
        }

        for (let i = currentLevel.turrets.length - 1; i >= 0; i--) {
            if (currentLevel.turrets[i].underPoint(this.worldX, this.worldY)) {
                this.hoveredObject = currentLevel.turrets[i];
                return this.hoveredObject;
            }
        }

        for (let i = currentLevel.units.length - 1; i >= 0; i--) {
            if (currentLevel.units[i].underPoint && currentLevel.units[i].underPoint(this.worldX, this.worldY)) {
                this.hoveredObject = currentLevel.units[i];
                return this.hoveredObject;
            }
        }

        return this.hoveredObject;
    }

    selectAndRenderPointer(renderingContext) {
        if (!this.isWithinCanvas) {
            return;
        }

        this.visualHandler.advanceAnimation();
        this.detectHoveredElement();

        let determinedVisualName = 'standard_pointer';

        const { viewportTop, viewportHeight, screenWidth } = this.simulationCore.getDisplayMetrics();
        const currentLevel = this.simulationCore.getCurrentLevelData();
        const { selectedUnits, selectedAttackers, currentTeam, obstructionGrid, buildingObstructionGrid } = currentLevel;

        if (this.screenY < viewportTop || this.screenY > viewportTop + viewportHeight) {
            // Default outside main game viewport
        } else if (this.sidebarRef.isDeploying()) {
            const deployInfo = this.sidebarRef.getDeployInfo();
            const buildingType = buildings.types[deployInfo.buildingName] || turrets.types[deployInfo.buildingName];
            const gridShape = buildingType.gridShape;

            for (let y = 0; y < gridShape.length; y++) {
                for (let x = 0; x < gridShape[y].length; x++) {
                    if (gridShape[y][x] === 1) {
                        const targetGridY = this.gridCoordY + y;
                        const targetGridX = this.gridCoordX + x;
                        let isValidPlacement = true;

                        if (targetGridY < 0 || targetGridY >= buildingObstructionGrid.length ||
                            targetGridX < 0 || targetGridX >= buildingObstructionGrid[targetGridY].length ||
                            buildingObstructionGrid[targetGridY][targetGridX] === 1) {
                            isValidPlacement = false;
                        }
                        this.simulationCore.highlightGridArea(targetGridX, targetGridY, 1, 1, isValidPlacement ? sidebar.placementWhiteImage : sidebar.placementRedImage);
                    }
                }
            }
        } else if (this.sidebarRef.isRepairMode()) {
            if (this.hoveredObject && this.hoveredObject.team === currentTeam &&
                (this.hoveredObject.type === 'building' || this.hoveredObject.type === 'turret') &&
                (this.hoveredObject.health < this.hoveredObject.hitPoints)) {
                determinedVisualName = 'repair_item';
            } else {
                determinedVisualName = 'no_repair_item';
            }
        } else if (this.sidebarRef.isSellMode()) {
            if (this.hoveredObject && this.hoveredObject.team === currentTeam &&
                (this.hoveredObject.type === 'building' || this.hoveredObject.type === 'turret')) {
                determinedVisualName = 'sell_item';
            } else {
                determinedVisualName = 'no_sell_item';
            }
        } else if (this.sidebarRef.isVisible() && this.screenX > this.sidebarRef.getLeftEdge()) {
            const activeSidebarButton = this.sidebarRef.getHoveredButton();
            if (activeSidebarButton) {
                let displayLabel = activeSidebarButton.type;
                let displayCost = `$${activeSidebarButton.cost}`;

                switch (activeSidebarButton.type) {
                    case 'infantry': displayLabel = infantry.types[activeSidebarButton.name].label; break;
                    case 'building': displayLabel = buildings.types[activeSidebarButton.name].label; break;
                    case 'turret': displayLabel = turrets.types[activeSidebarButton.name].label; break;
                    case 'vehicle': displayLabel = vehicles.types[activeSidebarButton.name].label; break;
                }

                renderingContext.fillStyle = 'black';
                renderingContext.fillRect(Math.round(this.screenX), Math.round(this.screenY + 16), displayLabel.length * 5.5 + 8, 32);
                renderingContext.strokeStyle = 'darkgreen';
                renderingContext.strokeRect(Math.round(this.screenX), Math.round(this.screenY + 16), displayLabel.length * 5.5 + 8, 32);
                renderingContext.fillStyle = 'darkgreen';
                renderingContext.font = '12px "Command and Conquer"';
                renderingContext.fillText(displayLabel, Math.round(this.screenX + 4), Math.round(this.screenY + 30));
                renderingContext.fillText(displayCost, Math.round(this.screenX + 4), Math.round(this.screenY + 44));
            }
        } else if (this.isDragSelecting) {
            const rectX = Math.min(this.worldX, this.dragStartX);
            const rectY = Math.min(this.worldY, this.dragStartY);
            const rectWidth = Math.abs(this.worldX - this.dragStartX);
            const rectHeight = Math.abs(this.worldY - this.dragStartY);
            renderingContext.strokeStyle = 'white';
            renderingContext.strokeRect(rectX + this.simulationCore.getViewportAdjustX(), rectY + this.simulationCore.getViewportAdjustY(), rectWidth, rectHeight);
            determinedVisualName = 'standard_pointer';
        } else if (this.hoveredObject && !this.isObscuredByFog) {
            if (this.hoveredObject.team && this.hoveredObject.team !== currentTeam && selectedAttackers.length > 0) {
                determinedVisualName = 'attack_target';
            } else if (selectedUnits.length === 1 && selectedUnits[0].name === 'harvester' && selectedUnits[0].team === currentTeam) {
                if (this.hoveredObject.name === 'tiberium') {
                    determinedVisualName = 'attack_target';
                } else if (this.hoveredObject.name === 'refinery' && this.hoveredObject.team === currentTeam) {
                    determinedVisualName = 'load_transport';
                }
            } else if (!this.hoveredObject.selected && this.hoveredObject.name !== 'tiberium') {
                determinedVisualName = 'select_item';
            } else if (this.hoveredObject.name === 'tiberium') {
                if (obstructionGrid[this.gridCoordY] && obstructionGrid[this.gridCoordY][this.gridCoordX] === 1) {
                    determinedVisualName = 'no_move_unit';
                } else {
                    determinedVisualName = 'move_unit';
                }
            } else if (selectedUnits.length === 1 && this.hoveredObject.selected && this.hoveredObject.team === currentTeam && this.hoveredObject.name === 'mcv') {
                determinedVisualName = 'construct_base';
            }
        } else if (this.currentScrollDirection !== "") {
            determinedVisualName = this.currentScrollDirection;
        } else if (selectedUnits.length > 0) {
            if (obstructionGrid[this.gridCoordY] && obstructionGrid[this.gridCoordY][this.gridCoordX] === 1 && !this.isObscuredByFog) {
                determinedVisualName = 'no_move_unit';
            } else {
                determinedVisualName = 'move_unit';
            }
        }

        this.activePointerVisual = this.visualHandler.getVisualDefinition(determinedVisualName);
        this.drawActivePointer(renderingContext);
    }

    drawActivePointer(renderingContext) {
        if (!this.isWithinCanvas || !this.activePointerVisual) {
            return;
        }

        const { offsetX, offsetY, frameCount, spriteOffset, animationSpeed } = this.activePointerVisual;
        const currentFrame = Math.floor(this.visualHandler.animationCounter / animationSpeed) % frameCount;
        const imageNumber = spriteOffset + currentFrame;

        renderingContext.drawImage(
            this.visualHandler.graphicSource,
            30 * imageNumber, 0, 30, 24,
            this.screenX - offsetX, this.screenY - offsetY, 30, 24
        );
    }

    processClick(event, isRightClick) {
        const { viewportTop, screenWidth, viewportHeight } = this.simulationCore.getDisplayMetrics();

        if (this.screenY <= viewportTop && this.screenY > viewportTop - 15) {
            if (this.screenX >= 0 && this.screenX < 160) {
                // Options button
            } else if (this.screenX >= 320 && this.screenX < 480) {
                // Score button
            } else if (this.screenX >= 480 && this.screenX < 640) {
                this.sidebarRef.toggleVisibility();
            }
        } else if (this.screenY >= viewportTop && this.screenY <= viewportTop + viewportHeight) {
            if (this.sidebarRef.isVisible() && this.screenX > this.sidebarRef.getLeftEdge()) {
                this.sidebarRef.click(event, isRightClick);
            } else {
                game.click(event, isRightClick);
            }
        }
    }

    bindEventHandlers() {
        this.canvasElement.addEventListener('mousemove', (event) => {
            this.updateCoordinates(event);
        });

        this.canvasElement.addEventListener('click', (event) => {
            this.processClick(event, false);
            this.isDragSelecting = false;
            event.preventDefault();
        });

        this.canvasElement.addEventListener('mousedown', (event) => {
            if (event.button === 0) {
                this.isButtonPressed = true;
                this.dragStartX = this.worldX;
                this.dragStartY = this.worldY;
                event.preventDefault();
            }
        });

        this.canvasElement.addEventListener('contextmenu', (event) => {
            this.processClick(event, true);
            event.preventDefault();
        });

        this.canvasElement.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                if (this.isDragSelecting) {
                    if (!event.shiftKey) {
                        game.clearSelection();
                    }
                    const x1 = Math.min(this.worldX, this.dragStartX);
                    const y1 = Math.min(this.worldY, this.dragStartY);
                    const x2 = Math.max(this.worldX, this.dragStartX);
                    const y2 = Math.max(this.worldY, this.dragStartY);

                    const currentLevelUnits = this.simulationCore.getCurrentLevelData().units;
                    for (let i = currentLevelUnits.length - 1; i >= 0; i--) {
                        const unit = currentLevelUnits[i];
                        if (!unit.selected && unit.team === game.currentLevel.team &&
                            x1 <= unit.x * this.simulationCore.getGridDimension() && x2 >= unit.x * this.simulationCore.getGridDimension() &&
                            y1 <= unit.y * this.simulationCore.getGridDimension() && y2 >= unit.y * this.simulationCore.getGridDimension()) {
                            game.selectItem(unit, event.shiftKey);
                        }
                    }
                }
                this.isButtonPressed = false;
            }
        });

        this.canvasElement.addEventListener('mouseleave', () => {
            this.isWithinCanvas = false;
        });

        this.canvasElement.addEventListener('mouseenter', () => {
            this.isButtonPressed = false;
            this.isWithinCanvas = true;
        });

        document.addEventListener('keypress', (event) => {
            game.keyPressed(event);
        });
    }
}

class SimulationCore {
    constructor(displayElement, pointerController) {
        this.displayElement = displayElement;
        this.renderingContext = displayElement.getContext('2d');
        this.pointerController = pointerController;

        this.surfaceWidth = displayElement.width;
        this.surfaceHeight = displayElement.height;
        this.viewTopOffset = 35;
        this.viewLeftOffset = 0;
        this.viewOriginX = 0;
        this.viewOriginY = 0;
        this.viewScrollDeltaX = 0;
        this.viewScrollDeltaY = 0;
        this.viewWidth = 0;
        this.viewHeight = 0;
        this.gridDimension = 24;

        this.currentLevel = null;
        this.movementBlockageGrid = [];
        this.unitMovementBlockageGrid = [];
        this.constructionBlockageGrid = [];

        this.animationFrameId = null;
    }

    getViewportOriginX() { return this.viewOriginX; }
    getViewportOriginY() { return this.viewOriginY; }
    getViewportLeft() { return this.viewLeftOffset; }
    getViewportTop() { return this.viewTopOffset; }
    getGridDimension() { return this.gridDimension; }
    getViewportAdjustX() { return this.viewLeftOffset - this.viewOriginX; }
    getViewportAdjustY() { return this.viewTopOffset - this.viewOriginY; }
    getCurrentLevelData() { return game.currentLevel; }
    getDisplayMetrics() {
        return {
            viewportTop: this.viewTopOffset,
            viewportHeight: this.viewHeight,
            screenWidth: this.surfaceWidth
        };
    }

    setViewportDelta(deltaX, deltaY) {
        this.viewScrollDeltaX = deltaX;
        this.viewScrollDeltaY = deltaY;
    }

    configureDisplayArea() {
        this.renderingContext.beginPath();
        this.viewWidth = sidebar.visible ? (this.surfaceWidth - sidebar.width) : this.surfaceWidth;
        this.viewHeight = 480;
        this.renderingContext.rect(this.viewLeftOffset, this.viewTopOffset, this.viewWidth - this.viewLeftOffset, this.viewHeight);
        this.renderingContext.clip();
    }

    renderTerrainAndObstacles() {
        this.currentLevel = game.currentLevel;

        this.pointerController.calculateScrollDelta();

        let nextViewOriginX = this.viewOriginX + this.viewScrollDeltaX;
        let nextViewOriginY = this.viewOriginY + this.viewScrollDeltaY;

        if (nextViewOriginX < 0) {
            nextViewOriginX = 0;
        } else if (nextViewOriginX + this.surfaceWidth + (sidebar.visible ? -sidebar.width : 0) > this.currentLevel.mapImage.width) {
            nextViewOriginX = this.currentLevel.mapImage.width - (this.surfaceWidth + (sidebar.visible ? -sidebar.width : 0));
        }

        if (!sidebar.visible && (nextViewOriginX + this.surfaceWidth > this.currentLevel.mapImage.width)) {
            nextViewOriginX = this.currentLevel.mapImage.width - this.surfaceWidth;
        }

        if (nextViewOriginY < 0) {
            nextViewOriginY = 0;
        } else if (nextViewOriginY + this.viewHeight > this.currentLevel.mapImage.height) {
            nextViewOriginY = this.currentLevel.mapImage.height - this.viewHeight;
        }

        this.viewOriginX = nextViewOriginX;
        this.viewOriginY = nextViewOriginY;

        this.renderingContext.drawImage(
            this.currentLevel.mapImage,
            this.viewOriginX, this.viewOriginY, this.viewWidth, this.viewHeight,
            this.viewLeftOffset, this.viewTopOffset, this.viewWidth, this.viewHeight
        );

        this.generateBlockageGrids();
    }

    generateBlockageGrids() {
        const levelObstructions = this.currentLevel.obstructionGrid;
        const mapHeightInGrids = levelObstructions.length;
        const mapWidthInGrids = levelObstructions[0] ? levelObstructions[0].length : 0;

        this.movementBlockageGrid = levelObstructions.map(row => [...row]);
        this.unitMovementBlockageGrid = levelObstructions.map(row => [...row]);
        this.constructionBlockageGrid = levelObstructions.map(row => [...row]);

        for (const building of this.currentLevel.buildings) {
            for (let y = 0; y < building.gridShape.length; y++) {
                for (let x = 0; x < building.gridShape[y].length; x++) {
                    if (building.gridShape[y][x] === 1) {
                        const absY = y + building.y;
                        const absX = x + building.x;

                        if (absY >= 0 && absY < mapHeightInGrids && absX >= 0 && absX < mapWidthInGrids) {
                            this.movementBlockageGrid[absY][absX] = 1;
                            this.unitMovementBlockageGrid[absY][absX] = 1;
                            this.constructionBlockageGrid[absY][absX] = 1;

                            if (y === building.gridShape.length - 1 && (absY + 1) < mapHeightInGrids) {
                                this.constructionBlockageGrid[absY + 1][absX] = 1;
                            }
                        }
                    }
                }
            }
        }
        game.obstructionGrid = this.movementBlockageGrid;
        game.heroObstructionGrid = this.unitMovementBlockageGrid;
        game.buildingObstructionGrid = this.constructionBlockageGrid;

        for (const turret of this.currentLevel.turrets) {
            const absY = turret.y;
            const absX = turret.x;
            if (absY >= 0 && absY < mapHeightInGrids && absX >= 0 && absX < mapWidthInGrids) {
                this.movementBlockageGrid[absY][absX] = 1;
                this.unitMovementBlockageGrid[absY][absX] = 1;
                this.constructionBlockageGrid[absY][absX] = 1;
            }
        }

        for (const unit of this.currentLevel.units) {
            const unitGridY = Math.floor(unit.y);
            const unitGridX = Math.floor(unit.x);
            if (unitGridY >= 0 && unitGridY < mapHeightInGrids && unitGridX >= 0 && unitGridX < mapWidthInGrids) {
                this.constructionBlockageGrid[unitGridY][unitGridX] = 1;
            }
        }
    }

    highlightGridArea(gridX, gridY, width, height, image) {
        this.renderingContext.drawImage(
            image,
            0, 0, image.width, image.height,
            gridX * this.gridDimension + this.getViewportAdjustX(),
            gridY * this.gridDimension + this.getViewportAdjustY(),
            width * this.gridDimension,
            height * this.gridDimension
        );
    }

    startLoop() {
        const animateFrame = () => {
            this.renderingContext.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);

            this.renderingContext.save();
            this.configureDisplayArea();
            this.renderTerrainAndObstacles();
            this.renderingContext.restore();

            this.pointerController.selectAndRenderPointer(this.renderingContext);

            this.animationFrameId = requestAnimationFrame(animateFrame);
        };
        this.animationFrameId = requestAnimationFrame(animateFrame);
    }

    stopLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const mainDisplaySurface = document.getElementById('canvas');
    if (!mainDisplaySurface) {
        console.error("Canvas element with ID 'canvas' not found.");
        return;
    }

    const cursorSpriteSource = preloadImage('cursors.png');

    const pointerGraphicsHandler = new PointerVisuals(cursorSpriteSource);
    pointerGraphicsHandler.initializeAllVisuals();

    const inputHandler = new InputController(mainDisplaySurface, null, pointerGraphicsHandler, sidebar, fog);
    const simulationCore = new SimulationCore(mainDisplaySurface, inputHandler);
    inputHandler.simulationCore = simulationCore;

    if (typeof game !== 'undefined' && !game.highlightGrid) {
        game.highlightGrid = simulationCore.highlightGridArea.bind(simulationCore);
    }

    simulationCore.startLoop();
});