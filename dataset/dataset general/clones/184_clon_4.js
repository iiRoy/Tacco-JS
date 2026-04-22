(function(global) {
    const CanvasSketch = global.CanvasSketch || {};

    class EventBus {
        constructor() {
            this.subscribers = new Map();
        }

        listen(eventName, callback) {
            if (!this.subscribers.has(eventName)) {
                this.subscribers.set(eventName, new Set());
            }
            this.subscribers.get(eventName).add(callback);
        }

        silence(eventName, callback) {
            if (this.subscribers.has(eventName)) {
                this.subscribers.get(eventName).delete(callback);
            }
        }

        signal(eventName, ...args) {
            if (this.subscribers.has(eventName)) {
                this.subscribers.get(eventName).forEach(callback => callback(...args));
            }
        }
    }

    function getNumericStyleValue(element, prop) {
        const value = window.getComputedStyle(element)[prop];
        return parseFloat(value) || 0;
    }

    function deepMerge(target, source) {
        const output = { ...target };
        if (target && typeof target === 'object' && source && typeof source === 'object') {
            Object.keys(source).forEach(key => {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    function checkColorFormat(colorString) {
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(colorString);
    }

    function hexToRgbInt(hex) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        return (r << 16) | (g << 8) | b;
    }

    function getPixelColorValue(imageData, x, y) {
        if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) return -1;
        const index = (y * imageData.width + x) * 4;
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        return (r << 16) | (g << 8) | b;
    }

    function areColorsSimilar(color1, color2, tolerance) {
        if (color1 === color2) return true;
        const r1 = (color1 >> 16) & 0xFF;
        const g1 = (color1 >> 8) & 0xFF;
        const b1 = color1 & 0xFF;

        const r2 = (color2 >> 16) & 0xFF;
        const g2 = (color2 >> 8) & 0xFF;
        const b2 = color2 & 0xFF;

        return (Math.abs(r1 - r2) <= tolerance &&
                Math.abs(g1 - g2) <= tolerance &&
                Math.abs(b1 - b2) <= tolerance);
    }

    class SketchPad {
        constructor(containerIdentifier, initialSettings) {
            this.options = this.combineSettings(initialSettings);
            this.emitter = new EventBus();
            this.isValid = true;

            this.mainContainer = document.getElementById(containerIdentifier);
            if (!this.mainContainer) {
                console.error(`Container with ID "${containerIdentifier}" not found. SketchPad will be non-functional.`);
                this.isValid = false;
            }

            if (!this.isValid) return this;

            this.mainContainer.classList.add('drawing-board');

            const canvasHTML = `
                <div class="drawing-board-canvas-wrapper">
                    <canvas class="drawing-board-canvas"></canvas>
                    <div class="drawing-board-cursor drawing-board-utils-hidden"></div>
                </div>`;
            const controlsHTML = '<div class="drawing-board-controls"></div>';

            if (this.options.toolbarPlacement.includes("bottom")) {
                this.mainContainer.innerHTML = canvasHTML + controlsHTML;
            } else {
                this.mainContainer.innerHTML = controlsHTML + canvasHTML;
            }

            this.internalElements = {
                canvasWrapper: this.mainContainer.querySelector('.drawing-board-canvas-wrapper'),
                drawingSurface: this.mainContainer.querySelector('.drawing-board-canvas'),
                pointerOverlay: this.mainContainer.querySelector('.drawing-board-cursor'),
                toolbar: this.mainContainer.querySelector('.drawing-board-controls')
            };

            ['left', 'right', 'center'].forEach(alignment => {
                if (this.options.toolbarPlacement.includes(alignment)) {
                    this.internalElements.toolbar.setAttribute('data-align', alignment);
                }
            });

            this.drawingSurface = this.internalElements.drawingSurface;
            this.renderContext = this.drawingSurface && this.drawingSurface.getContext ? this.drawingSurface.getContext('2d') : null;

            if (!this.renderContext) {
                if (this.options.errorDisplayMessage) {
                    this.mainContainer.innerHTML = this.options.errorDisplayMessage;
                }
                console.error("Canvas context not available. SketchPad will be non-functional.");
                this.isValid = false;
            }

            if (!this.isValid) return this;

            this.currentStrokeColor = this.options.penColor;
            this.persistentStorageKey = this.determineStorageType();

            this.initializeLog();
            this.clearAndConfigure({ persistentStorage: false, logHistory: false, backgroundUpdate: false });
            this.setupTools();
            this.adjustDimensions();
            this.clearAndConfigure({ persistentStorage: false, logHistory: true, backgroundUpdate: true });
            this.retrieveSessionData();
            this.activateDropSupport();
            this.activateDrawingEvents();
        }

        static defaultSettings = {
            toolbarItems: ['HuePicker', 'ThicknessAdjuster', 'TimelineNavigator'],
            toolbarPlacement: "top left",
            penColor: "#000000",
            penSize: 1,
            backgroundColor: "#fff",
            eraserHue: "background",
            fillThreshold: 100,
            fillWorkaround: true,
            persistentStorage: 'session',
            allowDrop: false,
            expandContainer: false,
            errorDisplayMessage: "<p>Your browser is outdated. <a href=\"http://browsehappy.com/\" target=\"_blank\">Update it</a> to start sketching.</p>",
            stretchDroppedImage: false
        };

        combineSettings(userSettings) {
            const merged = deepMerge(SketchPad.defaultSettings, userSettings);
            if (!merged.backgroundColor && merged.eraserHue === "background") {
                merged.eraserHue = "transparent";
            }
            return merged;
        }

        clearAndConfigure(overrides) {
            if (!this.isValid) return;
            const settings = {
                penColor: this.options.penColor,
                penSize: this.options.penSize,
                persistentStorage: true,
                logHistory: true,
                backgroundUpdate: false,
                ...overrides
            };

            this.setCurrentMode('pencil');

            if (settings.backgroundUpdate) this.resetCanvasBackground(this.options.backgroundColor, false);

            if (settings.penColor) this.setStrokeColor(settings.penColor);
            if (settings.penSize) this.renderContext.lineWidth = settings.penSize;

            this.renderContext.lineCap = "round";
            this.renderContext.lineJoin = "round";

            if (settings.persistentStorage) this.storeSessionData();
            if (settings.logHistory) this.recordAction();

            this.emptyCanvasSnapshot = this.captureImage();

            this.emitter.signal('pad:cleared', settings);
        }

        resetCanvasBackground(bgColor, recordHistoryFlag) {
            if (!this.isValid) return;
            bgColor = bgColor || this.options.backgroundColor;
            recordHistoryFlag = typeof recordHistoryFlag !== "undefined" ? recordHistoryFlag : true;
            const isBgColor = checkColorFormat(bgColor);
            const previousMode = this.getCurrentMode();
            this.setCurrentMode('pencil');
            this.renderContext.clearRect(0, 0, this.renderContext.canvas.width, this.renderContext.canvas.height);
            if (isBgColor) {
                this.renderContext.fillStyle = bgColor;
                this.renderContext.fillRect(0, 0, this.renderContext.canvas.width, this.renderContext.canvas.height);
            } else if (bgColor) {
                this.placeImage(bgColor);
            }
            this.setCurrentMode(previousMode);
            if (recordHistoryFlag) this.recordAction();
        }

        adjustDimensions() {
            if (!this.isValid) return;
            this.internalElements.toolbar.classList.toggle('drawing-board-controls-hidden', (!this.tools || !this.tools.length));

            let actualCanvasWidth, actualCanvasHeight;

            const getStyleVal = (element, prop) => getNumericStyleValue(element, prop);

            const getHorizontalMetrics = (element, includePadding = false, includeMargin = false) => {
                let total = getStyleVal(element, 'borderLeftWidth') + getStyleVal(element, 'borderRightWidth');
                if (includePadding) total += getStyleVal(element, 'paddingLeft') + getStyleVal(element, 'paddingRight');
                if (includeMargin) total += getStyleVal(element, 'marginLeft') + getStyleVal(element, 'marginRight');
                return total;
            };

            const getVerticalMetrics = (element, includePadding = false, includeMargin = false) => {
                let total = getStyleVal(element, 'borderTopWidth') + getStyleVal(element, 'borderBottomWidth');
                if (includePadding) total += getStyleVal(element, 'paddingTop') + getStyleVal(element, 'paddingBottom');
                if (includeMargin) total += getStyleVal(element, 'marginTop') + getStyleVal(element, 'marginBottom');
                return total;
            };

            if (this.options.expandContainer) {
                const containerContentWidth = this.mainContainer.clientWidth;
                const containerContentHeight = this.mainContainer.clientHeight;

                const mainContainerHBorder = getHorizontalMetrics(this.mainContainer);
                const mainContainerVBorder = getVerticalMetrics(this.mainContainer);

                const wrapperHBorderPaddingMargin = getHorizontalMetrics(this.internalElements.canvasWrapper, true, true);
                const wrapperVBorderPaddingMargin = getVerticalMetrics(this.internalElements.canvasWrapper, true, true);

                const toolbarHeight = this.internalElements.toolbar.offsetHeight;
                const toolbarVMargin = getVerticalMetrics(this.internalElements.toolbar, false, true);

                this.mainContainer.style.width = (containerContentWidth + mainContainerHBorder + wrapperHBorderPaddingMargin) + 'px';
                this.mainContainer.style.height = (containerContentHeight + mainContainerVBorder + toolbarHeight + toolbarVMargin + wrapperVBorderPaddingMargin) + 'px';

                actualCanvasWidth = this.mainContainer.clientWidth;
                actualCanvasHeight = this.mainContainer.clientHeight;
            } else {
                actualCanvasWidth = this.mainContainer.clientWidth
                                    - getHorizontalMetrics(this.mainContainer)
                                    - getHorizontalMetrics(this.internalElements.canvasWrapper, true, true);

                actualCanvasHeight = this.mainContainer.clientHeight
                                    - getVerticalMetrics(this.mainContainer)
                                    - this.internalElements.toolbar.offsetHeight
                                    - getVerticalMetrics(this.internalElements.toolbar, false, true)
                                    - getVerticalMetrics(this.internalElements.canvasWrapper, true, true);
            }

            actualCanvasWidth = Math.max(0, actualCanvasWidth);
            actualCanvasHeight = Math.max(0, actualCanvasHeight);

            this.internalElements.canvasWrapper.style.width = actualCanvasWidth + 'px';
            this.internalElements.canvasWrapper.style.height = actualCanvasHeight + 'px';

            this.internalElements.drawingSurface.style.width = actualCanvasWidth + 'px';
            this.internalElements.drawingSurface.style.height = actualCanvasHeight + 'px';

            this.drawingSurface.width = actualCanvasWidth;
            this.drawingSurface.height = actualCanvasHeight;
        }

        setupTools() {
            if (!this.isValid) return;
            this.tools = [];
            if (!this.options.toolbarItems.length || !CanvasSketch.Tool) return;
            for (let i = 0; i < this.options.toolbarItems.length; i++) {
                let currentTool = null;
                if (typeof this.options.toolbarItems[i] === "string") {
                    currentTool = new CanvasSketch.Tool[this.options.toolbarItems[i]](this);
                } else if (typeof this.options.toolbarItems[i] === "object") {
                    for (const toolName in this.options.toolbarItems[i]) {
                        currentTool = new CanvasSketch.Tool[toolName](this, this.options.toolbarItems[i][toolName]);
                        break;
                    }
                }
                if (currentTool) {
                    this.includeTool(currentTool);
                }
            }
        }

        includeTool(toolInstance, position) {
            if (!this.isValid) return;
            if (!(toolInstance instanceof Object) || !('element' in toolInstance)) {
                console.warn('Invalid tool instance provided:', toolInstance);
                return false;
            }

            position = position ? position * 1 : null;

            if (position !== null && position < this.internalElements.toolbar.children.length) {
                this.internalElements.toolbar.children[position].before(toolInstance.element);
            } else {
                this.internalElements.toolbar.appendChild(toolInstance.element);
            }

            if (!this.tools) {
                this.tools = [];
            }
            this.tools.push(toolInstance);
            this.internalElements.toolbar.classList.remove('drawing-board-controls-hidden');
        }

        initializeLog() {
            if (!this.isValid) return;
            this.actionLog = {
                entries: [],
                currentPosition: 0
            };
        }

        recordAction() {
            if (!this.isValid) return;
            const MAX_HISTORY = 30;
            while (this.actionLog.entries.length >= MAX_HISTORY) {
                this.actionLog.entries.shift();
                this.actionLog.currentPosition--;
            }
            if (this.actionLog.currentPosition !== 0 && this.actionLog.currentPosition < this.actionLog.entries.length) {
                this.actionLog.entries = this.actionLog.entries.slice(0, this.actionLog.currentPosition);
                this.actionLog.currentPosition++;
            } else {
                this.actionLog.currentPosition = this.actionLog.entries.length + 1;
            }
            this.actionLog.entries.push(this.captureImage());
            this.emitter.signal('timelineUpdate', this.actionLog.currentPosition);
        }

        traverseLog(forward) {
            if (!this.isValid) return;
            if ((forward && this.actionLog.currentPosition === this.actionLog.entries.length) ||
                (!forward && this.actionLog.currentPosition === 1)) {
                return;
            }
            const newPosition = forward ? this.actionLog.currentPosition + 1 : this.actionLog.currentPosition - 1;
            if (this.actionLog.entries.length && this.actionLog.entries[newPosition - 1] !== undefined) {
                this.actionLog.currentPosition = newPosition;
                this.placeImage(this.actionLog.entries[newPosition - 1]);
            }
            this.emitter.signal('timelineUpdate', newPosition);
            this.storeSessionData();
        }

        undoAction() {
            if (!this.isValid) return;
            this.traverseLog(false);
        }

        redoAction() {
            if (!this.isValid) return;
            this.traverseLog(true);
        }

        placeImage(source, options) {
            if (!this.isValid) return;
            options = {
                stretch: this.options.stretchDroppedImage,
                ...options
            };
            const context = this.renderContext;
            const imgElement = new Image();
            const originalGCO = context.globalCompositeOperation;

            imgElement.onload = () => {
                context.globalCompositeOperation = "source-over";
                context.clearRect(0, 0, context.canvas.width, context.canvas.height);

                if (options.stretch) {
                    context.drawImage(imgElement, 0, 0, context.canvas.width, context.canvas.height);
                } else {
                    context.drawImage(imgElement, 0, 0);
                }
                context.globalCompositeOperation = originalGCO;
            };
            imgElement.src = source;
        }

        captureImage() {
            if (!this.isValid) return '';
            return this.drawingSurface.toDataURL("image/png");
        }

        exportImage() {
            if (!this.isValid) return;
            let imageDataURL = this.captureImage();
            imageDataURL = imageDataURL.replace("image/png", "image/octet-stream");
            window.location.href = imageDataURL;
        }

        storeSessionData() {
            if (!this.isValid) return;
            if (window[this.persistentStorageKey]) {
                window[this.persistentStorageKey].setItem('sketch-data-' + this.mainContainer.id, this.captureImage());
                this.emitter.signal('pad:dataSaved', this.captureImage());
            }
        }

        retrieveSessionData() {
            if (!this.isValid) return;
            if (window[this.persistentStorageKey] && window[this.persistentStorageKey].getItem('sketch-data-' + this.mainContainer.id) !== null) {
                this.placeImage(window[this.persistentStorageKey].getItem('sketch-data-' + this.mainContainer.id));
                this.emitter.signal('pad:dataRestored', window[this.persistentStorageKey].getItem('sketch-data-' + this.mainContainer.id));
            }
        }

        eraseSessionData() {
            if (!this.isValid) return;
            if (window[this.persistentStorageKey] && window[this.persistentStorageKey].getItem('sketch-data-' + this.mainContainer.id) !== null) {
                window[this.persistentStorageKey].removeItem('sketch-data-' + this.mainContainer.id);
                this.emitter.signal('pad:dataErased');
            }
        }

        determineStorageType() {
            if (!this.isValid) return false;
            if (!this.options.persistentStorage || !(this.options.persistentStorage === 'session' || this.options.persistentStorage === 'local')) return false;
            return this.options.persistentStorage + 'Storage';
        }

        activateDropSupport() {
            if (!this.isValid) return;
            if (!this.options.allowDrop) return;

            const handleDragEvent = (e) => {
                e.preventDefault();
                e.stopPropagation();
            };

            this.internalElements.drawingSurface.addEventListener('dragover', handleDragEvent);
            this.internalElements.drawingSurface.addEventListener('dragenter', handleDragEvent);
            this.internalElements.drawingSurface.addEventListener('drop', this.handleDroppedFile.bind(this));
        }

        handleDroppedFile(e) {
            if (!this.isValid) return;
            e.preventDefault();
            e.stopPropagation();

            const dataTransfer = e.dataTransfer || (e.originalEvent ? e.originalEvent.dataTransfer : null);
            const files = dataTransfer ? dataTransfer.files : null;

            if (!files || !files.length || files[0].type.indexOf('image') === -1 || !window.FileReader) {
                return false;
            }

            const fileReader = new FileReader();
            fileReader.readAsDataURL(files[0]);
            fileReader.onload = (ev) => {
                this.placeImage(ev.target.result);
                this.emitter.signal('pad:imageAdded', ev.target.result);
                this.emitter.signal('pad:interaction');
                this.recordAction();
            };
        }

        setCurrentMode(newOperatingMode, silent = false) {
            if (!this.isValid) return;
            newOperatingMode = newOperatingMode || 'pencil';

            this.emitter.silence('pad:startDrawing', this.floodFill.bind(this));

            if (this.options.eraserHue === "transparent") {
                this.renderContext.globalCompositeOperation = newOperatingMode === "eraser" ? "destination-out" : "source-over";
            } else {
                if (newOperatingMode === "eraser") {
                    if (this.options.eraserHue === "background" && checkColorFormat(this.options.backgroundColor)) {
                        this.renderContext.strokeStyle = this.options.backgroundColor;
                    } else if (checkColorFormat(this.options.eraserHue)) {
                        this.renderContext.strokeStyle = this.options.eraserHue;
                    }
                } else if (!this.operatingMode || this.operatingMode === "eraser") {
                    this.renderContext.strokeStyle = this.currentStrokeColor;
                }

                if (newOperatingMode === "filler") {
                    this.emitter.listen('pad:startDrawing', this.floodFill.bind(this));
                }
            }
            this.operatingMode = newOperatingMode;
            if (!silent) {
                this.emitter.signal('pad:modeChanged', this.operatingMode);
            }
        }

        getCurrentMode() {
            if (!this.isValid) return 'none';
            return this.operatingMode || "pencil";
        }

        setStrokeColor(newColor) {
            if (!this.isValid) return;
            newColor = newColor || this.currentStrokeColor;
            if (!checkColorFormat(newColor)) return false;

            this.currentStrokeColor = newColor;
            if (this.options.eraserHue !== "transparent" && this.operatingMode === "eraser") {
                const handleModeChange = (mode) => {
                    if (mode !== "eraser") {
                        this.renderContext.strokeStyle = this.currentStrokeColor;
                    }
                    this.emitter.silence('pad:modeChanged', handleModeChange);
                };
                this.emitter.listen('pad:modeChanged', handleModeChange);
            } else {
                this.renderContext.strokeStyle = this.currentStrokeColor;
            }
        }

        floodFill(eventCoordinates) {
            if (!this.isValid) return;
            if (this.captureImage() === this.emptyCanvasSnapshot) {
                this.renderContext.clearRect(0, 0, this.renderContext.canvas.width, this.renderContext.canvas.width);
                this.renderContext.fillStyle = this.currentStrokeColor;
                this.renderContext.fillRect(0, 0, this.renderContext.canvas.width, this.renderContext.canvas.height);
                return;
            }

            const imgData = this.renderContext.getImageData(0, 0, this.drawingSurface.width, this.drawingSurface.height);
            const targetX = Math.floor(eventCoordinates.x);
            const targetY = Math.floor(eventCoordinates.y);

            const fillTargetColor = hexToRgbInt(this.renderContext.strokeStyle);
            const initialPixelColor = getPixelColorValue(imgData, targetX, targetY);

            if (initialPixelColor === -1 || areColorsSimilar(initialPixelColor, fillTargetColor, this.options.fillThreshold)) {
                return;
            }

            const pixelQueue = [[targetX, targetY]];
            const width = imgData.width;
            const height = imgData.height;
            const data = imgData.data;

            const targetR = (fillTargetColor >> 16) & 0xFF;
            const targetG = (fillTargetColor >> 8) & 0xFF;
            const targetB = fillTargetColor & 0xFF;

            while (pixelQueue.length > 0) {
                const [x, y] = pixelQueue.shift();

                if (x < 0 || x >= width || y < 0 || y >= height) continue;

                const currentColor = getPixelColorValue(imgData, x, y);

                if (areColorsSimilar(currentColor, initialPixelColor, this.options.fillThreshold)) {
                    const index = (y * width + x) * 4;
                    if (data[index] === targetR && data[index+1] === targetG && data[index+2] === targetB) continue;

                    data[index] = targetR;
                    data[index + 1] = targetG;
                    data[index + 2] = targetB;
                    data[index + 3] = 255;

                    pixelQueue.push([x + 1, y]);
                    pixelQueue.push([x - 1, y]);
                    pixelQueue.push([x, y + 1]);
                    pixelQueue.push([x, y - 1]);
                }
            }

            this.renderContext.putImageData(imgData, 0, 0);

            if (this.options.fillWorkaround) {
                this.renderContext.fillStyle = this.renderContext.strokeStyle;
                this.renderContext.fillRect(targetX - 1, targetY - 1, 3, 3);
            }
        }

        activateDrawingEvents() {
            if (!this.isValid) return;
            const canvas = this.drawingSurface;
            let isDrawing = false;

            const startDrawing = (e) => {
                isDrawing = true;
                this.renderContext.beginPath();
                this.renderContext.moveTo(e.offsetX, e.offsetY);
                this.emitter.signal('pad:startDrawing', { x: e.offsetX, y: e.offsetY });
            };

            const draw = (e) => {
                if (!isDrawing || this.operatingMode === 'filler') return;
                this.renderContext.lineTo(e.offsetX, e.offsetY);
                this.renderContext.stroke();
                this.emitter.signal('pad:drawing', { x: e.offsetX, y: e.offsetY });
            };

            const stopDrawing = () => {
                if (!isDrawing) return;
                isDrawing = false;
                this.renderContext.closePath();
                this.emitter.signal('pad:endDrawing');
                this.recordAction();
            };

            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);
        }
    }

    CanvasSketch.SketchPad = SketchPad;
    CanvasSketch.Tool = {};

    global.CanvasSketch = CanvasSketch;

})(window);