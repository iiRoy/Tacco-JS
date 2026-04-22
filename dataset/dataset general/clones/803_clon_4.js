class ApplicationSettings {
    constructor() {
        this.baseItemHeight = 100;
        this.baseItemWidth = 60;
        this.totalItemCount = 40;

        this.sceneWidth = 800;
        this.sceneHeight = 600;
        this.bottomAnchor = 400; // Unused in original, but kept for completeness

        this.slantAngle = Math.PI / 8;
        this.orthogonalSlant = Math.PI / 2 - this.slantAngle;

        this.itemGap = 2;

        this.slantedItemHeight = Math.sin(this.orthogonalSlant) * this.baseItemHeight + 2;
        this.slantedItemWidth = Math.cos(this.orthogonalSlant) * this.baseItemHeight;
        this.tieredStructureWidth = this.slantedItemWidth * 2 + this.itemGap * 2;
    }

    updateSceneDimensions(containerElement) {
        this.sceneWidth = containerElement.clientWidth;
        this.sceneHeight = containerElement.clientHeight;
        this.baseItemWidth = this.sceneWidth * 0.05;
        this.baseItemHeight = this.sceneHeight * 0.15;
        this.slantedItemHeight = Math.sin(this.orthogonalSlant) * this.baseItemHeight + 2;
        this.slantedItemWidth = Math.cos(this.orthogonalSlant) * this.baseItemHeight;
        this.tieredStructureWidth = this.slantedItemWidth * 2 + this.itemGap * 2;
    }
}

const colorPalette = (typeof randomColor !== 'undefined') ? randomColor({
    count: 40,
    luminosity: 'dark',
}) : Array.from({length: 40}, (_, i) => `hsl(${i * 9}, 70%, 30%)`);

const ArrangementModes = Object.freeze({
    STACK_MODE: Symbol('StackMode'),
    TIERED_MODE: Symbol('TieredMode'),
    GRID_MODE: Symbol('GridMode'),
    CIRCULAR_MODE: Symbol('CircularMode'),
});

class VisualElementManager {
    constructor(displaySurfaceNode, totalElements, colors) {
        this._itemElements = [];
        this._currentElementPointer = 0;
        this._colorSource = colors;

        for (let j = 0; j < totalElements; ++j) {
            this._itemElements.push(this._createVisualElement(displaySurfaceNode, j));
        }
    }

    _createVisualElement(parentContainer, elementIndex) {
        const visualItem = document.createElement('div');
        visualItem.className = 'card';
        visualItem.style.background = this._colorSource[elementIndex % this._colorSource.length];
        parentContainer.appendChild(visualItem);
        return visualItem;
    }

    fetchNextElement() {
        if (this._currentElementPointer >= this._itemElements.length) {
            return null;
        }
        return this._itemElements[this._currentElementPointer++];
    }

    getElementAt(idx) {
        return this._itemElements[idx];
    }

    resetElementPointer() {
        this._currentElementPointer = 0;
    }

    getAllElements() {
        return this._itemElements;
    }
}

class LayoutGenerator {
    constructor(settings) {
        this._config = settings;
    }

    generateStackLayout() {
        this._config.updateSceneDimensions(document.getElementById('container'));
        const horizontalCenter = (this._config.sceneWidth - this._config.baseItemWidth) / 2;
        const verticalBase = this._config.sceneHeight - this._config.sceneHeight * 0.2;

        return Array.from({ length: this._config.totalItemCount }).map((_, i) => ({
            location: [horizontalCenter, verticalBase - i * 0.5, this._config.sceneWidth * 0.1],
            orientation: [Math.PI / 2, 0, 0],
        }));
    }

    generateTieredStructureLayout() {
        this._config.updateSceneDimensions(document.getElementById('container'));
        const levelCount = 5;
        const initialY = (levelCount - 1) * this._config.slantedItemHeight + this._config.slantedItemHeight / 2;
        const initialZ = -this._config.sceneWidth * 0.2;
        const initialX = (this._config.sceneWidth - this._config.tieredStructureWidth * levelCount) / 2 - this._config.slantedItemWidth;

        return Array.from({ length: levelCount }).flatMap((_, i) => {
            const currentX = initialX + i * this._config.slantedItemWidth + i * this._config.itemGap;
            const currentY = initialY - i * this._config.slantedItemHeight - i * this._config.itemGap;
            return this._createTieredRowLayout(levelCount - i, currentX, currentY, initialZ);
        });
    }

    _createTieredRowLayout(segmentCount, xCoord, yCoord, zCoord) {
        const positions = [];
        Array.from({ length: segmentCount }).forEach((_, i) => {
            const pairedPositions = this._calculatePairedSlantPositions(xCoord + i * this._config.tieredStructureWidth, yCoord, zCoord);
            positions.push(
                { location: pairedPositions[0].location, orientation: pairedPositions[0].orientation },
                { location: pairedPositions[1].location, orientation: pairedPositions[1].orientation }
            );
        });
        Array.from({ length: segmentCount - 1 }).forEach((_, i) => {
            positions.push({
                location: [
                    xCoord + i * this._config.tieredStructureWidth + this._config.slantedItemWidth,
                    yCoord - this._config.slantedItemHeight / 2 - this._config.itemGap / 2,
                    zCoord
                ],
                orientation: [Math.PI / 2, Math.PI / 2, 0],
            });
        });
        return positions;
    }

    _calculatePairedSlantPositions(x, y, z) {
        const offset = (this._config.slantedItemWidth / 2) + this._config.itemGap / 2;

        return [{
            location: [x - offset, y, z],
            orientation: [-this._config.slantAngle, Math.PI / 2, 0],
        }, {
            location: [x + offset, y, z],
            orientation: [this._config.slantAngle, Math.PI / 2, 0],
        }];
    }

    generatePlanarGridLayout() {
        this._config.updateSceneDimensions(document.getElementById('container'));
        const itemWidthAdjusted = this._config.baseItemWidth + 10;
        const itemHeightAdjusted = this._config.baseItemHeight + 10;
        const startX = (this._config.sceneWidth - 10 * itemWidthAdjusted) / 2;
        const startY = (this._config.sceneHeight - 4 * itemHeightAdjusted) / 2;

        return Array.from({ length: this._config.totalItemCount }).map((_, i) => ({
            location: [
                (i % 10) * itemWidthAdjusted + startX,
                (Math.floor(i / 10)) * itemHeightAdjusted + startY,
                0
            ],
            orientation: [0, 0, 0]
        }));
    }

    generateCylindricalArrayLayout() {
        this._config.updateSceneDimensions(document.getElementById('container'));
        const centerX = this._config.sceneWidth / 2;
        const startY = this._config.sceneHeight * 0.1;
        const cylinderRadius = this._config.sceneWidth * 0.2;

        return Array.from({ length: this._config.totalItemCount }).map((_, i) => {
            const currentAngle = ((i % 10) / 10) * 2 * Math.PI;
            const xPos = Math.cos(currentAngle) * cylinderRadius + centerX;
            const zPos = Math.sin(currentAngle) * cylinderRadius;
            const yPos = Math.floor(i / 10) * 1.2 * this._config.baseItemHeight + startY;
            return {
                location: [xPos, yPos, zPos],
                orientation: [0, Math.PI / 2 + currentAngle, 0],
            };
        });
    }
}

class DisplayOrchestrator {
    constructor(rootContainerId, surfaceId) {
        this._settings = new ApplicationSettings();
        this._rootContainerElement = document.getElementById(rootContainerId);
        this._surfaceElement = document.getElementById(surfaceId);
        this._itemManager = new VisualElementManager(this._surfaceElement, this._settings.totalItemCount, colorPalette);
        this._layoutEngine = new LayoutGenerator(this._settings);
        this._currentDisplayMode = null;

        this._modeHandlers = new Map([
            [ArrangementModes.STACK_MODE, this._layoutEngine.generateStackLayout.bind(this._layoutEngine)],
            [ArrangementModes.TIERED_MODE, this._layoutEngine.generateTieredStructureLayout.bind(this._layoutEngine)],
            [ArrangementModes.GRID_MODE, this._layoutEngine.generatePlanarGridLayout.bind(this._layoutEngine)],
            [ArrangementModes.CIRCULAR_MODE, this._layoutEngine.generateCylindricalArrayLayout.bind(this._layoutEngine)],
        ]);
    }

    adjustDisplayDimensions() {
        this._settings.updateSceneDimensions(this._rootContainerElement);
        this._itemManager.getAllElements().forEach(item => {
            item.style.height = this._settings.baseItemHeight + 'px';
            item.style.width = this._settings.baseItemWidth + 'px';
        });
    }

    applyLayoutToElements(layoutInstructions) {
        this._itemManager.resetElementPointer();
        layoutInstructions.forEach((instruction, i) => {
            const targetElement = this._itemManager.fetchNextElement();
            if (targetElement) {
                if (typeof snabbt !== 'undefined') {
                    snabbt(targetElement, {
                        position: instruction.location,
                        rotation: instruction.orientation,
                        easing: 'ease',
                        delay: i * 50
                    });
                } else {
                    targetElement.style.transform = `translate3d(${instruction.location[0]}px, ${instruction.location[1]}px, ${instruction.location[2]}px) rotateX(${instruction.orientation[0]}rad) rotateY(${instruction.orientation[1]}rad) rotateZ(${instruction.orientation[2]}rad)`;
                    targetElement.style.position = 'absolute';
                }
            }
        });
    }

    setArrangementConfiguration(newMode) {
        this.adjustDisplayDimensions();
        if (newMode === this._currentDisplayMode) {
            return;
        }

        const layoutFunction = this._modeHandlers.get(newMode);
        if (layoutFunction) {
            const generatedLayout = layoutFunction();
            this.applyLayoutToElements(generatedLayout);
            this._currentDisplayMode = newMode;
        } else {
            console.warn(`Unknown arrangement mode: ${newMode}`);
        }
    }

    initiateSurfaceRotation() {
        if (typeof snabbt !== 'undefined') {
            snabbt(this._surfaceElement, {
                rotation: [0, 2 * Math.PI, 0],
                duration: 10000,
                perspective: 2000,
                loop: Infinity
            });
        }
    }

    bootstrapApplication() {
        this.adjustDisplayDimensions();
        this._itemManager.resetElementPointer();
        this.setArrangementConfiguration(ArrangementModes.STACK_MODE);
        this.initiateSurfaceRotation();

        if (typeof FastClick !== 'undefined') {
            FastClick.attach(document.body);
        }

        this._setupUserInteraction();
    }

    _setupUserInteraction() {
        const buttonMappings = new Map([
            ["pile_button", ArrangementModes.STACK_MODE],
            ["house_button", ArrangementModes.TIERED_MODE],
            ["wall_button", ArrangementModes.GRID_MODE],
            ["cylinder_button", ArrangementModes.CIRCULAR_MODE]
        ]);

        const handleButtonClick = (buttonKey, mode) => {
            buttonMappings.forEach((_, key) => {
                const btn = document.getElementById(key);
                if (btn) btn.className = '';
            });
            const clickedBtn = document.getElementById(buttonKey);
            if (clickedBtn) clickedBtn.className = 'button-primary';
            this.setArrangementConfiguration(mode);
        };

        buttonMappings.forEach((mode, key) => {
            const buttonElement = document.getElementById(key);
            if (buttonElement) {
                buttonElement.addEventListener('click', () => handleButtonClick(key, mode));
            }
        });
    }
}

function commenceDisplay() {
    const mainDisplay = new DisplayOrchestrator('container', 'surface');
    mainDisplay.bootstrapApplication();
}