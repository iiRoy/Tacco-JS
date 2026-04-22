class PixelCanvasManager {
    constructor(canvasId, colorInputId, generateButtonId, undoButtonId, clearButtonId, sizeDownButtonId, sizeUpButtonId, outputCodeId) {
        this.drawingSurface = document.getElementById(canvasId);
        this.drawingContext = this.drawingSurface ? this.drawingSurface.getContext('2d') : null;
        this.colorSelectionInput = document.querySelector(colorInputId);
        this.generateOutputButton = document.getElementById(generateButtonId);
        this.undoActionButton = document.getElementById(undoButtonId);
        this.clearAllButton = document.getElementById(clearButtonId);
        this.reduceSizeButton = document.getElementById(sizeDownButtonId);
        this.increaseSizeButton = document.getElementById(sizeUpButtonId);
        this.codeDisplayElement = document.getElementById(outputCodeId);

        if (!this.drawingSurface || !this.drawingContext || !this.colorSelectionInput) {
            console.error("Critical DOM elements not found for PixelCanvasManager.");
            return;
        }

        this.gridUnitSize = 6;
        this.pixelMap = new Map(); // Stores "x_y" -> hexColor
        this.actionHistory = []; // Stack of {xGrid, yGrid, previousColor, newColor}
        this.maxHistoryDepth = 15;
        this.currentCanvasDimension = this.gridUnitSize * 20; // 120
        this.minCanvasDimension = 50;
        this.maxCanvasDimension = 200;
        this.emptyCellColor = 'transparent';
        this.firstPixelColor = this.emptyCellColor; // For CSS generation

        this.drawingSurface.width = this.currentCanvasDimension;
        this.drawingSurface.height = this.currentCanvasDimension;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.drawingSurface.addEventListener('mousedown', this.handleCanvasClick.bind(this));
        this.generateOutputButton.addEventListener('click', this.produceOutputCode.bind(this));
        this.undoActionButton.addEventListener('click', this.reverseLastAction.bind(this));
        this.clearAllButton.addEventListener('click', this.resetDrawingSurface.bind(this));
        this.reduceSizeButton.addEventListener('click', this.adjustCanvasScale.bind(this, -1));
        this.increaseSizeButton.addEventListener('click', this.adjustCanvasScale.bind(this, 1));
    }

    adjustCanvasScale(factor) {
        let proposedDimension = this.currentCanvasDimension + factor * this.gridUnitSize;
        if (proposedDimension < this.minCanvasDimension || proposedDimension > this.maxCanvasDimension) {
            return;
        }
        this.currentCanvasDimension = proposedDimension;
        this.drawingSurface.width = this.currentCanvasDimension;
        this.drawingSurface.height = this.currentCanvasDimension;
        this.resetDrawingSurface(); // Clearing also redraws
    }

    reverseLastAction() {
        const lastChange = this.actionHistory.pop();
        if (!lastChange) return;

        const pixelX = lastChange.xGrid * this.gridUnitSize;
        const pixelY = lastChange.yGrid * this.gridUnitSize;
        const key = `${lastChange.xGrid}_${lastChange.yGrid}`;

        if (lastChange.previousColor === this.emptyCellColor) { // Pixel was cleared, restore to clear
            this.drawingContext.clearRect(pixelX, pixelY, this.gridUnitSize, this.gridUnitSize);
            this.pixelMap.delete(key);
        } else { // Pixel had a color, restore that color
            this.drawingContext.fillStyle = lastChange.previousColor;
            this.drawingContext.fillRect(pixelX, pixelY, this.gridUnitSize, this.gridUnitSize);
            this.pixelMap.set(key, lastChange.previousColor);
        }
        this.updateFirstPixelColor();
    }

    resetDrawingSurface() {
        this.drawingContext.clearRect(0, 0, this.drawingSurface.width, this.drawingSurface.height);
        this.pixelMap.clear();
        this.actionHistory = [];
        if (this.codeDisplayElement) {
            this.codeDisplayElement.innerHTML = '';
        }
        this.firstPixelColor = this.emptyCellColor;
    }

    handleCanvasClick(event) {
        const rect = this.drawingSurface.getBoundingClientRect();
        const clientX = event.clientX - rect.left;
        const clientY = event.clientY - rect.top;

        const gridX = Math.floor(clientX / this.gridUnitSize);
        const gridY = Math.floor(clientY / this.gridUnitSize);

        const pixelX = gridX * this.gridUnitSize;
        const pixelY = gridY * this.gridUnitSize;

        const currentDrawingHex = this.colorSelectionInput.value;
        const existingPixelHex = this.retrievePixelColor(pixelX, pixelY);

        if (event.shiftKey) {
            this.updateColorPicker(existingPixelHex);
        } else if (event.ctrlKey || event.metaKey) {
            if (existingPixelHex === this.emptyCellColor) return; // Nothing to clear
            this.applyPixelChange(gridX, gridY, this.emptyCellColor, existingPixelHex);
        } else {
            this.applyPixelChange(gridX, gridY, currentDrawingHex, existingPixelHex);
        }
    }

    applyPixelChange(xGrid, yGrid, newHexColor, oldHexColor) {
        const pixelX = xGrid * this.gridUnitSize;
        const pixelY = yGrid * this.gridUnitSize;
        const key = `${xGrid}_${yGrid}`;

        if (newHexColor === oldHexColor) return; // No change

        this.actionHistory.push({
            xGrid: xGrid,
            yGrid: yGrid,
            previousColor: oldHexColor,
            newColor: newHexColor
        });
        if (this.actionHistory.length > this.maxHistoryDepth) {
            this.actionHistory.shift(); // Remove oldest
        }

        if (newHexColor === this.emptyCellColor) {
            this.drawingContext.clearRect(pixelX, pixelY, this.gridUnitSize, this.gridUnitSize);
            this.pixelMap.delete(key);
        } else {
            this.drawingContext.fillStyle = newHexColor;
            this.drawingContext.fillRect(pixelX, pixelY, this.gridUnitSize, this.gridUnitSize);
            this.pixelMap.set(key, newHexColor);
        }
        this.updateFirstPixelColor();
    }

    retrievePixelColor(xPx, yPx) {
        const imageData = this.drawingContext.getImageData(xPx, yPx, 1, 1).data;
        if (imageData[3] === 0) { // Alpha is 0, means transparent
            return this.emptyCellColor;
        }
        return this.rgbToHex(imageData[0], imageData[1], imageData[2]);
    }

    updateColorPicker(hexColor) {
        if (hexColor === this.emptyCellColor) return; // Cannot pick transparent
        if (this.colorSelectionInput.type === 'color') {
            this.colorSelectionInput.value = hexColor;
        } else {
            // Fallback for non-color inputs, might need more complex interaction for a custom picker
            this.colorSelectionInput.style.backgroundColor = hexColor;
        }
    }

    updateFirstPixelColor() {
        const key = `0_0`;
        this.firstPixelColor = this.pixelMap.has(key) ? this.pixelMap.get(key) : this.emptyCellColor;
    }

    produceOutputCode() {
        let cssPrefix = `#art {\n\twidth: ${this.currentCanvasDimension}px;\n\theight: ${this.currentCanvasDimension}px;\n}\n\n#art div{\n\twidth: ${this.gridUnitSize}px;\n\theight: ${this.gridUnitSize}px;\n\tbackground: ${this.firstPixelColor};\n\tbox-shadow: `;
        let shadowDeclarations = [];

        for (const [key, color] of this.pixelMap.entries()) {
            const [xGrid, yGrid] = key.split('_').map(Number);
            if (xGrid === 0 && yGrid === 0) continue; // First pixel handled by background
            shadowDeclarations.push(`${xGrid * this.gridUnitSize}px ${yGrid * this.gridUnitSize}px ${color}`);
        }

        let cssSuffix = `;\n}`;
        let finalCss = cssPrefix + shadowDeclarations.join(',') + cssSuffix;
        if (this.codeDisplayElement) {
            this.codeDisplayElement.innerHTML = finalCss;
        }
    }

    // --- Utility Color Conversion Functions ---
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
}

// Global instantiation (equivalent to $(function() { ... }))
document.addEventListener('DOMContentLoaded', () => {
    // These IDs and selectors must match the HTML structure where this script will run.
    // Assuming the HTML elements exist with these specific IDs/classes.
    new PixelCanvasManager(
        'c', // canvas element ID
        'input.color', // color input selector
        'generate-button', // generate button ID
        'undo-button', // undo button ID
        'clear-button', // clear button ID
        'sizedown-button', // size down button ID
        'sizeup-button', // size up button ID
        'css-code' // element ID to display generated CSS
    );
});