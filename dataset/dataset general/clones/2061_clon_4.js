((globalScope) => {

    // --- Configuration Constants (renamed from jscolor.images) ---
    const VISUAL_ASSETS = Object.freeze({
        spectrumPad: [181, 101],
        sliderBar: [16, 101],
        crosshair: [15, 15],
        indicatorArrow: [7, 11]
    });

    // --- Image Resource Management (replaces jscolor.imgRequire, jscolor.imgLoaded, requireImage, loadImage) ---
    const ResourceRegistry = (() => {
        const requiredAssets = new Set();
        const loadedAssets = new Map();

        const requestAsset = (filename) => requiredAssets.add(filename);

        const loadAsset = (filename, basePath) => {
            if (!loadedAssets.has(filename)) {
                const img = new Image();
                img.src = basePath + filename;
                loadedAssets.set(filename, img);
            }
            return loadedAssets.get(filename);
        };

        return { requestAsset, loadAsset, getRequired: () => requiredAssets };
    })();

    // --- DOM Interaction & Event Handling (replaces jscolor.fetchElement, addEvent, fireEvent, getElementPos, getElementSize, getRelMousePos, getViewPos, getViewSize) ---
    const DOMOperations = (() => {

        const retrieveElement = (identifier) =>
            typeof identifier === 'string' ? document.getElementById(identifier) : identifier;

        const attachEventTo = (element, eventName, handlerFunction) => {
            if (element.addEventListener) {
                element.addEventListener(eventName, handlerFunction, false);
            } else if (element.attachEvent) { // Legacy IE support
                element.attachEvent('on' + eventName, handlerFunction);
            }
        };

        const dispatchCustomEvent = (targetElement, eventType) => {
            if (!targetElement) return;
            if (document.createEvent) {
                const customEvt = document.createEvent('HTMLEvents');
                customEvt.initEvent(eventType, true, true);
                targetElement.dispatchEvent(customEvt);
            } else if (document.createEventObject) { // Legacy IE support
                const customEvt = document.createEventObject();
                targetElement.fireEvent('on' + eventType, customEvt);
            } else if (targetElement['on' + eventType]) { // Very old IE support
                targetElement['on' + eventType]();
            }
        };

        const calculateElementOffset = (element) => {
            let currentElement = element;
            let currentX = 0, currentY = 0;
            if (currentElement.offsetParent) {
                do {
                    currentX += currentElement.offsetLeft;
                    currentY += currentElement.offsetTop;
                } while (currentElement = currentElement.offsetParent);
            }
            let scrollParent = element;
            while ((scrollParent = scrollParent.parentNode) && scrollParent.nodeName.toUpperCase() !== 'BODY') {
                currentX -= scrollParent.scrollLeft;
                currentY -= scrollParent.scrollTop;
            }

            return [currentX, currentY];
        };

        const measureElementDimensions = (element) => [element.offsetWidth, element.offsetHeight];

        const determineRelativeMousePosition = (eventObject) => {
            const evt = eventObject || globalScope.event;
            let posX = 0, posY = 0;
            if (typeof evt.offsetX === 'number') { // Modern browsers usually support this
                posX = evt.offsetX;
                posY = evt.offsetY;
            } else if (typeof evt.layerX === 'number') { // Firefox specific
                posX = evt.layerX;
                posY = evt.layerY;
            } else { // Fallback, less accurate but tries to mimic
                const rect = evt.target.getBoundingClientRect();
                posX = evt.clientX - rect.left;
                posY = evt.clientY - rect.top;
            }
            return { x: posX, y: posY };
        };

        const retrieveViewportScroll = () => {
            if (typeof globalScope.pageYOffset === 'number') {
                return [globalScope.pageXOffset, globalScope.pageYOffset];
            } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
                return [document.body.scrollLeft, document.body.scrollTop];
            } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
                return [document.documentElement.scrollLeft, document.documentElement.scrollTop];
            } else {
                return [0, 0];
            }
        };

        const retrieveViewportDimensions = () => {
            if (typeof globalScope.innerWidth === 'number') {
                return [globalScope.innerWidth, globalScope.innerHeight];
            } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
                return [document.body.clientWidth, document.body.clientHeight];
            } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
                return [document.documentElement.clientWidth, document.documentElement.clientHeight];
            } else {
                return [0, 0];
            }
        };

        return {
            retrieveElement,
            attachEventTo,
            dispatchCustomEvent,
            calculateElementOffset,
            measureElementDimensions,
            determineRelativeMousePosition,
            retrieveViewportScroll,
            retrieveViewportDimensions
        };
    })();


    // --- Path Resolution and URI Parsing (replaces jscolor.URI, detectDir, getDir) ---
    const PathNavigator = (() => {

        // Internal class for handling URI components, completely separate from original URI.
        class WebLocation {
            constructor(inputPath) {
                this._components = {
                    protocol: null,
                    authority: null,
                    path: '',
                    query: null,
                    fragment: null
                };
                if (inputPath) {
                    this.deconstruct(inputPath);
                }
            }

            deconstruct(uriString) {
                let temp = uriString;
                let match;

                // Fragment
                match = temp.match(/#(.*)$/);
                if (match) {
                    this._components.fragment = match[1];
                    temp = temp.substring(0, match.index);
                }

                // Query
                match = temp.match(/\?(.*)$/);
                if (match) {
                    this._components.query = match[1];
                    temp = temp.substring(0, match.index);
                }

                // Scheme and Authority
                match = temp.match(/^([A-Za-z][0-9A-Za-z+.-]*):(\/\/)?([^\/?#]*)(.*)$/);
                if (match) {
                    this._components.protocol = match[1];
                    if (match[2]) { // Has //
                        this._components.authority = match[3];
                        this._components.path = match[4];
                    } else { // No //, path starts immediately after scheme:
                        this._components.path = match[3] + match[4];
                    }
                } else {
                    this._components.path = temp; // No scheme/authority, just path
                }

                return this;
            }

            compose() {
                let result = '';
                if (this._components.protocol !== null) { result += this._components.protocol + ':'; }
                if (this._components.authority !== null) { result += '//' + this._components.authority; }
                if (this._components.path !== null) { result += this._components.path; }
                if (this._components.query !== null) { result += '?' + this._components.query; }
                if (this._components.fragment !== null) { result += '#' + this._components.fragment; }
                return result;
            }

            // Re-implementation of removeDotSegments
            #stripDotSegments(inputPath) {
                let outputSegments = [];
                const segments = inputPath.split('/');

                segments.forEach(segment => {
                    if (segment === '..') {
                        outputSegments.pop(); // Go up one level
                    } else if (segment !== '.' && segment !== '') {
                        outputSegments.push(segment);
                    }
                });
                // Ensure leading slash if original had one, or if path is not empty
                if (inputPath.startsWith('/') || outputSegments.length > 0) {
                    return '/' + outputSegments.join('/');
                }
                return outputSegments.join('/');
            }

            resolveToAbsolute(baseUriString) {
                const base = new WebLocation(baseUriString);
                const relative = this;
                const resolved = new WebLocation();

                if (base._components.protocol === null) { return false; } // Base must be absolute

                if (relative._components.protocol !== null && relative._components.protocol.toLowerCase() === base._components.protocol.toLowerCase()) {
                    // Scheme is same, nullify it for relative resolution
                    relative._components.protocol = null;
                }

                if (relative._components.protocol !== null) {
                    resolved._components.protocol = relative._components.protocol;
                    resolved._components.authority = relative._components.authority;
                    resolved._components.path = this.#stripDotSegments(relative._components.path);
                    resolved._components.query = relative._components.query;
                } else {
                    if (relative._components.authority !== null) {
                        resolved._components.authority = relative._components.authority;
                        resolved._components.path = this.#stripDotSegments(relative._components.path);
                        resolved._components.query = relative._components.query;
                    } else {
                        if (relative._components.path === '') {
                            resolved._components.path = base._components.path;
                            resolved._components.query = relative._components.query !== null ? relative._components.query : base._components.query;
                        } else {
                            if (relative._components.path.startsWith('/')) {
                                resolved._components.path = this.#stripDotSegments(relative._components.path);
                            } else {
                                if (base._components.authority !== null && base._components.path === '') {
                                    resolved._components.path = '/' + relative._components.path;
                                } else {
                                    resolved._components.path = base._components.path.replace(/[^\/]+$/, '') + relative._components.path;
                                }
                                resolved._components.path = this.#stripDotSegments(resolved._components.path);
                            }
                            resolved._components.query = relative._components.query;
                        }
                        resolved._components.authority = base._components.authority;
                    }
                    resolved._components.protocol = base._components.protocol;
                }
                resolved._components.fragment = relative._components.fragment;

                return resolved;
            }

            // Getters for external access
            get protocol() { return this._components.protocol; }
            get authority() { return this._components.authority; }
            get path() { return this._components.path; }
            set path(value) { this._components.path = value; } // Allow modification for detectDir
            get query() { return this._components.query; }
            set query(value) { this._components.query = value; }
            get fragment() { return this._components.fragment; }
            set fragment(value) { this._components.fragment = value; }
        }

        let cachedDirectory = '';

        const discoverScriptDirectory = () => {
            if (cachedDirectory) return cachedDirectory;

            const currentBase = globalScope.location.href;
            let effectiveBase = currentBase;

            // Handle <base> tags
            Array.from(document.getElementsByTagName('base'))
                 .filter(el => el.href)
                 .forEach(el => { effectiveBase = el.href; });

            // Find the script itself
            const scriptElements = Array.from(document.getElementsByTagName('script'));
            for (const script of scriptElements) {
                if (script.src && /(^|\/)jscolor\.js([?#].*)?$/i.test(script.src)) { // Original name for matching
                    const scriptLocation = new WebLocation(script.src);
                    const absoluteScriptLocation = scriptLocation.resolveToAbsolute(effectiveBase);

                    if (absoluteScriptLocation) {
                        absoluteScriptLocation.path = absoluteScriptLocation.path.replace(/[^\/]+$/, ''); // Remove filename
                        absoluteScriptLocation.query = null;
                        absoluteScriptLocation.fragment = null;
                        cachedDirectory = absoluteScriptLocation.compose();
                        return cachedDirectory;
                    }
                }
            }
            return false;
        };

        const retrieveToolDirectory = () => {
            if (!cachedDirectory) {
                const detected = discoverScriptDirectory();
                cachedDirectory = detected !== false ? detected : 'jscolor/'; // Fallback to original default
            }
            return cachedDirectory;
        };

        return {
            WebLocation,
            retrieveToolDirectory,
            discoverScriptDirectory
        };
    })();


    // --- Color Conversion Algorithms (replaces HSV_RGB, RGB_HSV, HUEtoRGB) ---
    const ColorConverter = (() => {

        const transformHsvToRgb = (hVal, sVal, vVal) => {
            let r, g, b;
            const h = hVal / 6; // Normalize hue to 0-1 range (original uses 0-6)

            const i = Math.floor(h * 6);
            const f = h * 6 - i;
            const p = vVal * (1 - sVal);
            const q = vVal * (1 - f * sVal);
            const t = vVal * (1 - (1 - f) * sVal);

            switch (i % 6) {
                case 0: r = vVal; g = t; b = p; break;
                case 1: r = q; g = vVal; b = p; break;
                case 2: r = p; g = vVal; b = t; break;
                case 3: r = p; g = q; b = vVal; break;
                case 4: r = t; g = p; b = vVal; break;
                case 5: r = vVal; g = p; b = q; break;
            }
            return [r, g, b];
        };

        const transformRgbToHsv = (rVal, gVal, bVal) => {
            const max = Math.max(rVal, gVal, bVal);
            const min = Math.min(rVal, gVal, bVal);
            const v = max;

            const d = max - min;
            const s = max === 0 ? 0 : d / max;

            let h = 0; // Default to 0 if achromatic

            if (max !== min) {
                switch (max) {
                    case rVal: h = (gVal - bVal) / d + (gVal < bVal ? 6 : 0); break;
                    case gVal: h = (bVal - rVal) / d + 2; break;
                    case bVal: h = (rVal - gVal) / d + 4; break;
                }
                h /= 6; // Normalize to 0-1 range
            }
            return [h * 6, s, v]; // Convert hue back to 0-6 range for consistency with original's internal representation
        };

        const hexComponentToString = (c) => {
            const hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return {
            toRgbFromHsv: transformHsvToRgb,
            toHsvFromRgb: transformRgbToHsv,
            toHex: (r, g, b) => hexComponentToString(r) + hexComponentToString(g) + hexComponentToString(b)
        };
    })();

    // --- Color Picker Widget (replaces jscolor.color) ---
    class HueController {
        constructor(domTarget, initialSettings) {
            this.mandatoryInput = true; // from required
            this.normalizeValue = true; // from adjust
            this.prependHash = false; // from hash
            this.uppercaseOutput = true; // from caps
            this.showSlider = true; // from slider
            this.valueElement = domTarget; // from valueElement
            this.styleElement = domTarget; // from styleElement
            this.immediateChangeCallback = null; // from onImmediateChange
            this.currentHsv = [0, 0, 1]; // from hsv (0-6, 0-1, 0-1)
            this.currentRgb = [1, 1, 1]; // from rgb (0-1, 0-1, 0-1)

            this.activateOnFocus = true; // from pickerOnfocus
            this.modePreference = 'HSV'; // from pickerMode
            this.positionStrategy = 'bottom'; // from pickerPosition
            this.smartPositioning = true; // from pickerSmartPosition
            this.buttonHeight = 20; // from pickerButtonHeight
            this.closableInterface = false; // from pickerClosable
            this.closeText = 'Close'; // from pickerCloseText
            this.buttonColor = 'ButtonText'; // from pickerButtonColor
            this.facePadding = 10; // from pickerFace
            this.faceColor = 'ThreeDFace'; // from pickerFaceColor
            this.borderThickness = 1; // from pickerBorder
            this.borderColor = 'ThreeDHighlight ThreeDShadow ThreeDShadow ThreeDHighlight'; // from pickerBorderColor
            this.insetThickness = 1; // from pickerInset
            this.insetColor = 'ThreeDShadow ThreeDHighlight ThreeDHighlight ThreeDShadow'; // from pickerInsetColor
            this.displayLayerIndex = 10000; // from pickerZIndex

            // Apply custom settings, ensuring renamed properties are mapped
            if (initialSettings) {
                const settingMap = {
                    required: 'mandatoryInput',
                    adjust: 'normalizeValue',
                    hash: 'prependHash',
                    caps: 'uppercaseOutput',
                    slider: 'showSlider',
                    valueElement: 'valueElement',
                    styleElement: 'styleElement',
                    onImmediateChange: 'immediateChangeCallback',
                    pickerOnfocus: 'activateOnFocus',
                    pickerMode: 'modePreference',
                    pickerPosition: 'positionStrategy',
                    pickerSmartPosition: 'smartPositioning',
                    pickerButtonHeight: 'buttonHeight',
                    pickerClosable: 'closableInterface',
                    pickerCloseText: 'closeText',
                    pickerButtonColor: 'buttonColor',
                    pickerFace: 'facePadding',
                    pickerFaceColor: 'faceColor',
                    pickerBorder: 'borderThickness',
                    pickerBorderColor: 'borderColor',
                    pickerInset: 'insetThickness',
                    pickerInsetColor: 'insetColor',
                    pickerZIndex: 'displayLayerIndex'
                };

                for (const originalProp in initialSettings) {
                    if (initialSettings.hasOwnProperty(originalProp)) {
                        const newProp = settingMap[originalProp] || originalProp; // Fallback if not mapped
                        if (this.hasOwnProperty(newProp)) { // Only apply if it's a known property
                            this[newProp] = initialSettings[originalProp];
                        }
                    }
                }
            }

            // Internal state for the picker UI
            let pickerInstance = null; // Represents the currently active picker DOM element
            const pickerFlags = {
                preserveValue: 1,
                preserveStyle: 2,
                preservePad: 4,
                preserveSlider: 8
            };

            const isPickerActive = () => pickerInstance !== null;

            const removeActivePicker = () => {
                if (pickerInstance && pickerInstance.parentNode) {
                    pickerInstance.parentNode.removeChild(pickerInstance);
                }
                pickerInstance = null;
            };

            const getPickerDimensions = (controller) => {
                const width = VISUAL_ASSETS.spectrumPad[0] + (controller.showSlider ? VISUAL_ASSETS.sliderBar[0] : 0) +
                              (controller.showSlider ? 10 : 0) + // spacing between pad and slider
                              (controller.facePadding * 2) + (controller.borderThickness * 2) + (controller.insetThickness * 2);
                const height = Math.max(VISUAL_ASSETS.spectrumPad[1], controller.showSlider ? VISUAL_ASSETS.sliderBar[1] : 0) +
                               (controller.facePadding * 2) + (controller.borderThickness * 2) + (controller.insetThickness * 2) +
                               (controller.closableInterface ? controller.buttonHeight : 0);
                return [width, height];
            };

            const drawColorPicker = (xPos, yPos) => {
                removeActivePicker();

                pickerInstance = document.createElement('div');
                pickerInstance.style.cssText = `
                    position: absolute;
                    left: ${xPos}px;
                    top: ${yPos}px;
                    z-index: ${this.displayLayerIndex};
                    border: ${this.borderThickness}px solid;
                    border-color: ${this.borderColor.split(' ').join(';')};
                    background-color: ${this.faceColor};
                    padding: ${this.facePadding}px;
                    box-sizing: content-box;
                    display: block;
                `;

                const innerContainer = document.createElement('div');
                innerContainer.style.cssText = `
                    border: ${this.insetThickness}px solid;
                    border-color: ${this.insetColor.split(' ').join(';')};
                    padding: 5px;
                    display: flex;
                `;

                const padArea = document.createElement('div');
                padArea.style.width = VISUAL_ASSETS.spectrumPad[0] + 'px';
                padArea.style.height = VISUAL_ASSETS.spectrumPad[1] + 'px';
                padArea.style.backgroundImage = `url(${PathNavigator.retrieveToolDirectory()}pad.gif)`;
                padArea.style.position = 'relative';
                DOMOperations.attachEventTo(padArea, 'mousedown', (e) => {
                    const { x, y } = DOMOperations.determineRelativeMousePosition(e);
                    const h = (x / VISUAL_ASSETS.spectrumPad[0]) * 6;
                    const s = 1 - (y / VISUAL_ASSETS.spectrumPad[1]);
                    this.applyHsv(h, s, null);
                });
                innerContainer.appendChild(padArea);

                if (this.showSlider) {
                    const sldArea = document.createElement('div');
                    sldArea.style.width = VISUAL_ASSETS.sliderBar[0] + 'px';
                    sldArea.style.height = VISUAL_ASSETS.sliderBar[1] + 'px';
                    sldArea.style.marginLeft = '10px';
                    sldArea.style.backgroundImage = `url(${PathNavigator.retrieveToolDirectory()}sld.gif)`;
                    sldArea.style.position = 'relative';
                    DOMOperations.attachEventTo(sldArea, 'mousedown', (e) => {
                        const { y } = DOMOperations.determineRelativeMousePosition(e);
                        const v = 1 - (y / VISUAL_ASSETS.sliderBar[1]);
                        this.applyHsv(null, null, v);
                    });
                    innerContainer.appendChild(sldArea);
                }

                pickerInstance.appendChild(innerContainer);

                if (this.closableInterface) {
                    const closeButton = document.createElement('button');
                    closeButton.textContent = this.closeText;
                    closeButton.style.backgroundColor = this.buttonColor;
                    DOMOperations.attachEventTo(closeButton, 'click', removeActivePicker);
                    pickerInstance.appendChild(closeButton);
                }

                document.body.appendChild(pickerInstance);
            };


            this.concealInterface = () => {
                if (isPickerActive()) {
                    removeActivePicker();
                }
            };

            this.revealInterface = () => {
                if (!isPickerActive()) {
                    const targetPos = DOMOperations.calculateElementOffset(domTarget);
                    const targetSize = DOMOperations.measureElementDimensions(domTarget);
                    const viewportScroll = DOMOperations.retrieveViewportScroll();
                    const viewportSize = DOMOperations.retrieveViewportDimensions();
                    const pickerSize = getPickerDimensions(this);

                    let axisA = 0, axisB = 0, signC = 0;
                    switch (this.positionStrategy.toLowerCase()) {
                        case 'left': axisA = 1; axisB = 0; signC = -1; break;
                        case 'right': axisA = 1; axisB = 0; signC = 1; break;
                        case 'top': axisA = 0; axisB = 1; signC = -1; break;
                        default: axisA = 0; axisB = 1; signC = 1; break; // bottom
                    }

                    const halfPickerB = (targetSize[axisB] + pickerSize[axisB]) / 2;
                    let calculatedPickerPos = [0, 0];

                    if (!this.smartPositioning) {
                        calculatedPickerPos[axisA] = targetPos[axisA];
                        calculatedPickerPos[axisB] = targetPos[axisB] + targetSize[axisB] - halfPickerB + halfPickerB * signC;
                    } else {
                        const targetX = targetPos[0], targetY = targetPos[1];
                        const targetW = targetSize[0], targetH = targetSize[1];
                        const viewportX = viewportScroll[0], viewportY = viewportScroll[1];
                        const viewportW = viewportSize[0], viewportH = viewportSize[1];
                        const pickerW = pickerSize[0], pickerH = pickerSize[1];

                        // Determine the effective position of the picker if placed without smart adjustment
                        const potentialPickerRight = -viewportX + targetX + pickerW;
                        const potentialPickerBottom = -viewportY + targetY + targetH + pickerH - halfPickerB + halfPickerB * signC;

                        // X-axis positioning (axisA=0 for horizontal, axisA=1 for vertical)
                        if (potentialPickerRight > viewportW) { // Picker goes off right edge
                            if ((-viewportX + targetX + targetW / 2 > viewportW / 2) && (targetX + targetW - pickerW >= 0)) {
                                calculatedPickerPos[0] = targetX + targetW - pickerW;
                            } else {
                                calculatedPickerPos[0] = targetX;
                            }
                        } else {
                            calculatedPickerPos[0] = targetX;
                        }

                        // Y-axis positioning (axisB=1 for vertical, axisB=0 for horizontal)
                        if (potentialPickerBottom > viewportH) { // Picker goes off bottom edge
                            if ((-viewportY + targetY + targetH / 2 > viewportH / 2) && (targetY + targetH - halfPickerB - halfPickerB * signC >= 0)) {
                                calculatedPickerPos[1] = targetY + targetH - halfPickerB - halfPickerB * signC;
                            } else {
                                calculatedPickerPos[1] = targetY + targetH - halfPickerB + halfPickerB * signC;
                            }
                        } else {
                            if (targetY + targetH - halfPickerB + halfPickerB * signC >= 0) {
                                calculatedPickerPos[1] = targetY + targetH - halfPickerB + halfPickerB * signC;
                            } else {
                                calculatedPickerPos[1] = targetY + targetH - halfPickerB - halfPickerB * signC;
                            }
                        }
                    }
                    drawColorPicker(calculatedPickerPos[0], calculatedPickerPos[1]);
                }
            };

            this.ingestValue = () => {
                if (!this.valueElement) {
                    this.emitValue();
                } else {
                    const inputValue = this.valueElement.value;
                    const emptyOrWhitespace = /^\s*$/.test(inputValue);

                    if (!this.normalizeValue) {
                        if (!this.interpretString(inputValue, pickerFlags.preserveValue)) {
                            this.styleElement.style.backgroundColor = this.styleElement.originalBgColor;
                            this.styleElement.style.color = this.styleElement.originalTextColor;
                            this.emitValue(pickerFlags.preserveValue | pickerFlags.preserveStyle);
                        }
                    } else if (!this.mandatoryInput && emptyOrWhitespace) {
                        this.valueElement.value = '';
                        this.styleElement.style.backgroundColor = this.styleElement.originalBgColor;
                        this.styleElement.style.color = this.styleElement.originalTextColor;
                        this.emitValue(pickerFlags.preserveValue | pickerFlags.preserveStyle);
                    } else if (this.interpretString(inputValue)) {
                        // Successfully parsed
                    } else {
                        this.emitValue(); // Revert to current internal color if input is invalid
                    }
                }
            };

            this.emitValue = (optionFlags = 0) => {
                if (!(optionFlags & pickerFlags.preserveValue) && this.valueElement) {
                    let outputValue = this.exportHexadecimal();
                    if (this.uppercaseOutput) { outputValue = outputValue.toUpperCase(); }
                    if (this.prependHash) { outputValue = '#' + outputValue; }
                    this.valueElement.value = outputValue;
                }
                if (!(optionFlags & pickerFlags.preserveStyle) && this.styleElement) {
                    this.styleElement.style.backgroundColor = '#' + this.exportHexadecimal();
                    this.styleElement.style.color =
                        (0.213 * this.currentRgb[0] +
                         0.715 * this.currentRgb[1] +
                         0.072 * this.currentRgb[2]) < 0.5 ? '#FFF' : '#000';
                }
                // These refer to redrawing internal picker parts, which are abstracted in drawColorPicker
                if (!(optionFlags & pickerFlags.preservePad) && isPickerActive()) {
                    // redrawPad();
                }
                if (!(optionFlags & pickerFlags.preserveSlider) && isPickerActive()) {
                    // redrawSld();
                }
            };

            this.applyHsv = (h, s, v, optionFlags = 0) => {
                const _h = (h === null) ? this.currentHsv[0] : Math.max(0, Math.min(6, h));
                const _s = (s === null) ? this.currentHsv[1] : Math.max(0, Math.min(1, s));
                const _v = (v === null) ? this.currentHsv[2] : Math.max(0, Math.min(1, v));

                this.currentRgb = ColorConverter.toRgbFromHsv(_h, _s, _v);
                this.currentHsv = [_h, _s, _v];
                this.emitValue(optionFlags);
            };

            this.applyRgb = (r, g, b, optionFlags = 0) => {
                const _r = (r === null) ? this.currentRgb[0] : Math.max(0, Math.min(1, r));
                const _g = (g === null) ? this.currentRgb[1] : Math.max(0, Math.min(1, g));
                const _b = (b === null) ? this.currentRgb[2] : Math.max(0, Math.min(1, b));

                const newHsv = ColorConverter.toHsvFromRgb(_r, _g, _b);

                this.currentHsv[2] = newHsv[2];
                if (newHsv[0] !== null) { this.currentHsv[0] = newHsv[0]; }
                if (newHsv[2] !== 0) { this.currentHsv[1] = newHsv[1]; }

                this.currentRgb = [_r, _g, _b];
                this.emitValue(optionFlags);
            };

            this.interpretString = (hexString, optionFlags = 0) => {
                const match = hexString.match(/^\W*([0-9A-F]{3}([0-9A-F]{3})?)\W*$/i);
                if (!match) {
                    return false;
                } else {
                    let hexValue = match[1];
                    if (hexValue.length === 3) {
                        hexValue = hexValue.split('').map(c => c + c).join('');
                    }
                    this.applyRgb(
                        parseInt(hexValue.substring(0, 2), 16) / 255,
                        parseInt(hexValue.substring(2, 4), 16) / 255,
                        parseInt(hexValue.substring(4, 6), 16) / 255,
                        optionFlags
                    );
                    return true;
                }
            };

            this.exportHexadecimal = () => ColorConverter.toHex(this.currentRgb[0], this.currentRgb[1], this.currentRgb[2]);
            this.exportRgb = () => [...this.currentRgb];
            this.exportHsv = () => [...this.currentHsv];

            // Store original styles for revert if needed
            this.styleElement.originalBgColor = this.styleElement.style.backgroundColor;
            this.styleElement.originalTextColor = this.styleElement.style.color;

            // Initial import
            this.ingestValue();
        }
    }

    // --- Main Application Manager (replaces jscolor global object) ---
    const SpectralAdjuster = {
        // Renamed properties
        assetDirectory: '', // from dir
        targetClassName: 'spectral', // from bindClass
        autoActivation: true, // from binding
        resourcePreload: true, // from preloading

        // Renamed methods
        setupGlobalListeners: function() {
            DOMOperations.attachEventTo(globalScope, 'load', SpectralAdjuster.initializeSystem);
        },

        initializeSystem: function() {
            if (SpectralAdjuster.autoActivation) {
                SpectralAdjuster.activateInputElements();
            }
            if (SpectralAdjuster.resourcePreload) {
                SpectralAdjuster.primeRequiredResources();
            }
        },

        // Re-implement getDir using PathNavigator
        acquireAssetDirectory: function() {
            if (!this.assetDirectory) {
                this.assetDirectory = PathNavigator.retrieveToolDirectory();
            }
            return this.assetDirectory;
        },

        // Re-implement bind
        activateInputElements: function() {
            const classPattern = new RegExp('(^|\\s)(' + this.targetClassName + ')\\s*(\\{[^}]*\\})?', 'i');
            const inputElements = Array.from(document.getElementsByTagName('input'));

            inputElements.forEach(inputEl => {
                let matchResult;
                if (!inputEl._spectralAdjusterInitialized && inputEl.className && (matchResult = inputEl.className.match(classPattern))) {
                    let settings = {};
                    if (matchResult[3]) { // Matched properties string
                        try {
                            const propString = matchResult[3].trim().slice(1, -1); // Remove {}
                            propString.split(',').forEach(pair => {
                                const [key, ...valueParts] = pair.split(':');
                                const valStr = valueParts.join(':').trim();
                                if (key && valStr) {
                                    const cleanedKey = key.trim();
                                    try {
                                        settings[cleanedKey] = JSON.parse(valStr);
                                    } catch (e) {
                                        settings[cleanedKey] = valStr.replace(/^['"]|['"]$/g, '');
                                    }
                                }
                            });
                        } catch (eInvalidProp) {
                            // console.warn("Failed to parse input settings:", eInvalidProp);
                        }
                    }
                    inputEl._spectralAdjusterInitialized = new HueController(inputEl, settings);
                }
            });
        },

        // Re-implement preload
        primeRequiredResources: function() {
            ResourceRegistry.getRequired().forEach(filename => {
                ResourceRegistry.loadAsset(filename, this.acquireAssetDirectory());
            });
        },

        // Expose resource request for the HueController
        registerImageRequirement: function(filename) {
            ResourceRegistry.requestAsset(filename);
        },

        // Expose image dimensions
        getVisualAssetDimensions: function(assetName) {
            return VISUAL_ASSETS[assetName];
        }
    };

    // Attach to global scope with a new, distinct name
    globalScope.ColorSpectralTool = SpectralAdjuster;

    // Initial setup call
    SpectralAdjuster.setupGlobalListeners();

})(window);