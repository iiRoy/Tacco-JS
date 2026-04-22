const ColorUtilityService = (function() {
    function parseHexValue(hex) {
        if (!hex || typeof hex !== 'string') return null;
        hex = hex.startsWith('#') ? hex.slice(1) : hex;
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        if (hex.length !== 6) return null;
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return { r, g, b };
    }

    function generateHexValue(r, g, b) {
        return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function convertHslToRgb(h, s, l) {
        s = Math.max(0, Math.min(1, s)); // Ensure s is 0-1
        l = Math.max(0, Math.min(1, l)); // Ensure l is 0-1

        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c / 2,
            r = 0, g = 0, b = 0;

        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        return { r, g, b };
    }

    function convertRgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s, l: l };
    }

    class HueSatLightColor {
        constructor(colorRepresentation) {
            this.hslData = { h: 0, s: 0, l: 0 };
            this.rgbData = { r: 0, g: 0, b: 0 };
            this.hexData = '000000';
            this.processInput(colorRepresentation);
        }

        processInput(input) {
            if (typeof input === 'string') {
                if (input.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)) {
                    this.hexData = input.startsWith('#') ? input.slice(1) : input;
                    this.rgbData = parseHexValue(this.hexData);
                    if (this.rgbData) this.hslData = convertRgbToHsl(this.rgbData.r, this.rgbData.g, this.rgbData.b);
                } else if (input.startsWith('rgb')) {
                    const parts = input.match(/\d+/g).map(Number);
                    if (parts.length >= 3) {
                        this.rgbData = { r: parts[0], g: parts[1], b: parts[2] };
                        this.hexData = generateHexValue(parts[0], parts[1], parts[2]);
                        this.hslData = convertRgbToHsl(parts[0], parts[1], parts[2]);
                    }
                } else if (input.startsWith('hsl')) {
                    const parts = input.match(/\d+(\.\d+)?/g).map(Number);
                    if (parts.length >= 3) {
                        this.hslData = { h: parts[0], s: parts[1] / 100, l: parts[2] / 100 };
                        this.rgbData = convertHslToRgb(parts[0], parts[1] / 100, parts[2] / 100);
                        if (this.rgbData) this.hexData = generateHexValue(this.rgbData.r, this.rgbData.g, this.rgbData.b);
                    }
                }
            } else if (typeof input === 'object' && input !== null) {
                if (input.h !== undefined && input.s !== undefined && input.l !== undefined) {
                    this.hslData = { h: input.h, s: input.s, l: input.l };
                    this.rgbData = convertHslToRgb(input.h, input.s, input.l);
                    if (this.rgbData) this.hexData = generateHexValue(this.rgbData.r, this.rgbData.g, this.rgbData.b);
                } else if (input.r !== undefined && input.g !== undefined && input.b !== undefined) {
                    this.rgbData = { r: input.r, g: input.g, b: input.b };
                    this.hexData = generateHexValue(input.r, input.g, input.b);
                    this.hslData = convertRgbToHsl(input.r, input.g, input.b);
                }
            }
            // Fallback to black if parsing failed
            if (!this.hexData || (this.hexData === 'NaNNaNNaN' && this.rgbData === null)) {
                this.hexData = '000000';
                this.rgbData = { r: 0, g: 0, b: 0 };
                this.hslData = { h: 0, s: 0, l: 0 };
            }
        }

        retrieveHex() { return this.hexData; }
        retrieveHsl() { return { ...this.hslData }; }
        retrieveHslString() {
            const { h, s, l } = this.hslData;
            return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
        }

        updateHsl(h, s, l) {
            this.hslData = { h: h, s: s, l: l };
            this.rgbData = convertHslToRgb(h, s, l);
            if (this.rgbData) this.hexData = generateHexValue(this.rgbData.r, this.rgbData.g, this.rgbData.b);
            return this;
        }

        adjustLightness(factor) {
            const newHsl = { ...this.hslData };
            newHsl.l += factor;
            newHsl.l = Math.max(0, Math.min(1, newHsl.l));
            return new HueSatLightColor(newHsl);
        }
    }

    return (colorRepresentation) => new HueSatLightColor(colorRepresentation);
})();

class ColorPaletteCreator {
    constructor(inputElement, settingsOverride) {
        if (!inputElement || !(inputElement instanceof HTMLElement)) {
            console.error("ColorPaletteCreator requires a valid HTML input element.");
            return;
        }
        this.hostElement = inputElement;
        this.configuration = Object.assign({}, {
            showSpectrumArea: true,
            showUserSavedColors: true,
            saveColorsPerComponent: false,
            smoothMenuToggle: true,
            showAdvancedControls: true,
            showPrimaryColors: true,
showHexInputBox: true,
            primaryColorMap: {
                pureWhite: 'fff',
                cherryRed: 'f00',
                brightOrange: 'f60',
                sunYellow: 'ff0',
                deepGreen: '008000',
                oceanBlue: '00f',
                royalPurple: '800080',
                solidBlack: '000'
            }
        }, settingsOverride);

        this.hasMultipleTabs = (this.configuration.showUserSavedColors && this.configuration.showAdvancedControls) ||
            (this.configuration.showPrimaryColors && this.configuration.showUserSavedColors) ||
            (this.configuration.showPrimaryColors && this.configuration.showAdvancedControls);

        this.componentState = {
            activeColor: null,
            currentInputHex: null
        };

        this.dimensionSettings = {
            menuRows: 8,
            menuColumns: 2
        };

        this.envCapabilities = {
            isTouchEnabled: 'ontouchstart' in window,
            isSmallViewport: (parseInt(window.innerWidth, 10) < 767),
            hasLocalStorage: 'localStorage' in window && window.localStorage !== null && typeof JSON === 'object',
            isOldIE: document.all && !window.atob,
            browserCookies: document.cookie
        };

        this.interactionEvents = {
            startAction: this.envCapabilities.isTouchEnabled ? "touchstart" : "mousedown",
            moveAction: this.envCapabilities.isTouchEnabled ? "touchmove" : "mousemove",
            endAction: this.envCapabilities.isTouchEnabled ? "touchend" : "mouseup",
            clickAction: this.envCapabilities.isTouchEnabled ? "touchend" : "click",
            dragInitiated: "dragging",
            dragTerminated: "endDrag"
        };

        this.userColorStore = [];
        this.tenYearDurationMs = 315360000000;

        this.setupComponent();
    }

    setupComponent() {
        let componentId = this.hostElement.name || `color-input-${Math.random().toString(36).substring(2, 9)}`;
        this.hostElement.setAttribute("name", componentId);
        this.hostElement.setAttribute("id", `enhanced-color-field-${componentId}`);
        this.hostElement.classList.add("color-picker-field");

        const initialColorUtil = ColorUtilityService(this.hostElement.value);
        this.componentState.activeColor = initialColorUtil.retrieveHex();
        this.componentState.currentInputHex = this.componentState.activeColor;
        this.hostElement.value = this.componentState.activeColor;

        const containerWrapper = document.createElement('div');
        containerWrapper.classList.add('input-field-group', 'color-component-wrapper');
        containerWrapper.id = `wrapper-${componentId}`;

        if (this.configuration.showHexInputBox) {
            const hexPrefix = document.createElement('span');
            hexPrefix.classList.add('hex-prefix-symbol');
            hexPrefix.textContent = '#';
            containerWrapper.appendChild(hexPrefix);
        }

        this.hostElement.parentNode.insertBefore(containerWrapper, this.hostElement);
        containerWrapper.appendChild(this.hostElement);

        const dropdownInterface = this.buildUserInterface();
        containerWrapper.appendChild(dropdownInterface);

        if (!this.configuration.showHexInputBox) {
            this.hostElement.type = "hidden";
        }

        this.retrieveStoredColors();
        this.attachComponentListeners();
        this.updateColorDisplay(this.hostElement);
    }

    retrieveStoredColors() {
        if (this.configuration.showUserSavedColors) {
            if (this.envCapabilities.hasLocalStorage && localStorage.getItem('storedColorList')) {
                try {
                    this.userColorStore = JSON.parse(localStorage.getItem('storedColorList'));
                } catch (e) {
                    console.error("Failed to parse saved colors from local storage:", e);
                    this.userColorStore = [];
                }
            } else if (this.envCapabilities.browserCookies.includes("colorPaletteSavedColors-allSavedColors=")) {
                const cookies = this.envCapabilities.browserCookies.split(';');
                cookies.forEach(cookie => {
                    if (cookie.includes("colorPaletteSavedColors-allSavedColors=")) {
                        this.userColorStore = cookie.split('=')[1].split(',');
                    }
                });
            }
        }
    }

    attachComponentListeners() {
        this.hostElement.addEventListener('input', (e) => this.handleInputFieldChange(e.target));
        this.hostElement.addEventListener('change', (e) => this.handleInputFieldChange(e.target));

        const activationButton = this.hostElement.closest('.color-component-wrapper').querySelector('.color-menu-toggle-btn');
        if (activationButton) {
            activationButton.addEventListener(this.interactionEvents.clickAction, (e) => this.handleDropdownActivation(e));
        }

        const tabElements = this.hostElement.closest('.color-component-wrapper').querySelectorAll('.menu-navigation-tab');
        tabElements.forEach(tab => this.configureTabNavigation(tab));

        const draggers = this.hostElement.closest('.color-component-wrapper').querySelectorAll('.spectrum-indicator-band');
        draggers.forEach(dragger => this.enableHorizontalDragging(dragger));

        document.addEventListener(this.interactionEvents.endAction, () => {
            const openMenus = document.querySelectorAll('.color-menu-panel.visible');
            openMenus.forEach(menu => {
                const btnGroup = menu.closest('.input-field-group').querySelector('.color-menu-btn-group');
                this.hideColorMenu(btnGroup, menu);
            });
        });
    }

    updateColorDisplay(targetInput) {
        const currentHex = ColorUtilityService(targetInput.value).retrieveHex();
        this.componentState.currentInputHex = currentHex;
        const previewElement = targetInput.closest('.input-field-group').querySelector(".current-color-display");
        if (previewElement) {
            previewElement.style.backgroundColor = "#" + currentHex;
        }
    }

    handleDropdownActivation(event) {
        event.stopPropagation();
        const wrapper = event.target.closest('.input-field-group');
        const buttonGroup = wrapper.querySelector('.color-menu-btn-group');
        const menuPanel = wrapper.querySelector('.color-menu-panel');
        this.toggleMenuVisibility(buttonGroup, menuPanel);
    }

    showColorMenu(buttonGroup, menuPanel) {
        document.querySelectorAll('.color-menu-panel.visible').forEach(openMenu => {
            const openBtnGroup = openMenu.closest('.input-field-group').querySelector('.color-menu-btn-group');
            this.hideColorMenu(openBtnGroup, openMenu);
        });

        if (this.configuration.smoothMenuToggle && !this.envCapabilities.isTouchEnabled) {
            menuPanel.style.opacity = '0';
            menuPanel.style.display = 'block';
            setTimeout(() => menuPanel.style.opacity = '1', 10);
        } else {
            menuPanel.style.display = 'block';
        }
        buttonGroup.classList.add("active-menu");
        menuPanel.classList.add("visible");
    }

    hideColorMenu(buttonGroup, menuPanel) {
        if (this.configuration.smoothMenuToggle && !this.envCapabilities.isTouchEnabled) {
            menuPanel.style.opacity = '0';
            setTimeout(() => menuPanel.style.display = 'none', 200);
        } else {
            menuPanel.style.display = 'none';
        }
        buttonGroup.classList.remove("active-menu");
        menuPanel.classList.remove("visible");
    }

    toggleMenuVisibility(buttonGroup, menuPanel) {
        if (menuPanel.style.display === "none" || menuPanel.style.display === "") {
            this.showColorMenu(buttonGroup, menuPanel);
        } else {
            this.hideColorMenu(buttonGroup, menuPanel);
        }
    }

    configureTabNavigation(tabElement) {
        tabElement.addEventListener(this.interactionEvents.clickAction, (event) => {
            event.preventDefault();
            const clickedTab = event.currentTarget;
            const parentWrapper = clickedTab.closest('.color-component-wrapper');
            const targetContentClass = clickedTab.className.split(' ').find(cls => cls.endsWith('-tab')).replace('-tab', '-content-panel');
            const targetContent = parentWrapper.querySelector(`.${targetContentClass}`);

            if (!clickedTab.classList.contains("active-tab")) {
                parentWrapper.querySelectorAll(".active-tab").forEach(activeTab => activeTab.classList.remove("active-tab"));
                parentWrapper.querySelectorAll(".active-content-panel").forEach(activePanel => activePanel.classList.remove("active-content-panel"));

                clickedTab.classList.add("active-tab");
                targetContent.classList.add("active-content-panel");
            }
        });
    }

    calculateColorModifier(bandType, currentPosition, contextCategory) {
        const spectrumWidth = (contextCategory === "basic") ?
            parseInt(this.hostElement.closest('.color-component-wrapper').querySelector('.color-spectrum-box').offsetWidth, 10) :
            parseInt(this.hostElement.closest('.color-component-wrapper').querySelector('.advanced-control-list .color-spectrum-box').offsetWidth, 10);

        const actualSpectrumWidth = spectrumWidth === 0 ? (contextCategory === "basic" ? (this.envCapabilities.isTouchEnabled ? 160 : 200) : (this.envCapabilities.isTouchEnabled ? 160 : 300)) : spectrumWidth;
        const halfWidth = actualSpectrumWidth / 2;
        const percentage = currentPosition / actualSpectrumWidth;

        if (bandType === "two-way") {
            return (percentage <= 0.5) ?
                (1 - (currentPosition / halfWidth)) / 2 :
                -((currentPosition - halfWidth) / halfWidth) / 2;
        } else {
            return (bandType === "darken-right") ? -(percentage / 2) : (percentage / 2);
        }
    }

    determineDragBounds(element) {
        const bounds = {};
        const parentElement = element.parentElement;
        const elementWidth = element.offsetWidth;
        const parentWidth = parentElement.offsetWidth;
        const parentRect = parentElement.getBoundingClientRect();

        bounds.minCoordX = parentRect.left + window.scrollX;
        bounds.maxCoordX = parentWidth - elementWidth;
        return bounds;
    }

    positionIndicatorBand(bandElement, bounds, event) {
        const bandWidth = bandElement.offsetWidth;
        const threeQuartersBandWidth = bandWidth * 0.75;
        const pointerX = this.envCapabilities.isTouchEnabled ? event.touches[0].pageX : event.pageX;
        let newPos = pointerX - bounds.minCoordX - threeQuartersBandWidth;

        newPos = Math.max(0, Math.min(newPos, bounds.maxCoordX));
        bandElement.style.position = "absolute";
        bandElement.style.left = `${newPos}px`;
    }

    enableHorizontalDragging(draggableElement) {
        let activeDrag = false;
        let currentBounds = null;
        const currentInputRef = this.hostElement;

        const startDrag = (event) => {
            event.preventDefault();
            activeDrag = true;
            draggableElement.style.cursor = "-webkit-grabbing";
            draggableElement.style.cursor = "-moz-grabbing";
            currentBounds = this.determineDragBounds(draggableElement);

            document.addEventListener(this.interactionEvents.moveAction, duringDrag);
            document.addEventListener(this.interactionEvents.endAction, endDrag);
            draggableElement.dispatchEvent(new CustomEvent(this.interactionEvents.dragInitiated));
        };

        const duringDrag = (event) => {
            if (!activeDrag) return;
            this.positionIndicatorBand(draggableElement, currentBounds, event);
            draggableElement.dispatchEvent(new CustomEvent(this.interactionEvents.dragInitiated));

            const container = draggableElement.closest('.color-component-wrapper');
            const inputField = container.querySelector('.color-picker-field');
            const spectrumBox = draggableElement.closest('.color-spectrum-box');

            if (spectrumBox.classList.contains('basic-spectrum-type')) {
                const colorName = spectrumBox.classList.value.split(' ').find(cls => cls.startsWith('spectrum-')).replace('spectrum-', '');
                const colorHex = this.configuration.primaryColorMap[colorName];
                this.processSpectrumSelection(draggableElement, { type: "basic", initialHex: colorHex, input: inputField });
            } else if (spectrumBox.classList.contains('advanced-spectrum-type')) {
                const currentHsl = ColorUtilityService(inputField.value).retrieveHsl();
                this.processSpectrumSelection(draggableElement, { type: "advanced", hsl: currentHsl, input: inputField });
            }
        };

        const endDrag = (event) => {
            if (!activeDrag) return;
            activeDrag = false;
            draggableElement.style.cursor = "-webkit-grab";
            draggableElement.style.cursor = "-moz-grab";
            document.removeEventListener(this.interactionEvents.moveAction, duringDrag);
            document.removeEventListener(this.interactionEvents.endAction, endDrag);
            draggableElement.dispatchEvent(new CustomEvent(this.interactionEvents.dragTerminated));

            const container = draggableElement.closest('.color-component-wrapper');
            const inputField = container.querySelector('.color-picker-field');
            const spectrumBox = draggableElement.closest('.color-spectrum-box');

            if (spectrumBox.classList.contains('basic-spectrum-type')) {
                const colorName = spectrumBox.classList.value.split(' ').find(cls => cls.startsWith('spectrum-')).replace('spectrum-', '');
                const colorHex = this.configuration.primaryColorMap[colorName];
                this.processSpectrumSelection(draggableElement, { type: "basic", initialHex: colorHex, input: inputField });
            } else if (spectrumBox.classList.contains('advanced-spectrum-type')) {
                const currentHsl = ColorUtilityService(inputField.value).retrieveHsl();
                this.processSpectrumSelection(draggableElement, { type: "advanced", hsl: currentHsl, input: inputField });
            }
        };

        draggableElement.addEventListener(this.interactionEvents.startAction, startDrag);
    }

    adjustIndicatorStyle(bandElement, colorAdjustFactor, spectrumKind) {
        const darkGrayHsl = { h: 0, s: 0, l: 0.05 };
        const midGrayHsl = { h: 0, s: 0, l: 0.5 };
        const indicatorColorFactor = -colorAdjustFactor;
        const stripeElements = bandElement.querySelectorAll(".indicator-segment");

        let newIndicatorColor;
        if (spectrumKind === "lighten-right") {
            newIndicatorColor = ColorUtilityService(midGrayHsl).adjustLightness(indicatorColorFactor).retrieveHslString();
        } else {
            newIndicatorColor = ColorUtilityService(darkGrayHsl).adjustLightness(indicatorColorFactor).retrieveHslString();
        }
        bandElement.style.borderColor = newIndicatorColor;
        stripeElements.forEach(stripe => stripe.style.backgroundColor = newIndicatorColor);
    }

    processSpectrumSelection(indicatorElement, opts) {
        const bandWidth = indicatorElement.offsetWidth;
        const halfBandWidth = bandWidth / 2;
        const currentIndicatorPos = parseInt(indicatorElement.style.left, 10) + halfBandWidth;
        let selectedColorInstance;
        let spectrumKind;

        if (opts.type === "basic") {
            const baseColorHex = opts.initialHex;
            selectedColorInstance = ColorUtilityService(baseColorHex);
            const baseColorHsl = selectedColorInstance.retrieveHsl();

            switch (baseColorHex) {
                case "fff": spectrumKind = "darken-right"; break;
                case "000": spectrumKind = "lighten-right"; break;
                default: spectrumKind = "two-way"; break;
            }
            selectedColorInstance.updateHsl(baseColorHsl.h, baseColorHsl.s, 0.5);
        } else {
            const inputHsl = opts.hsl;
            selectedColorInstance = ColorUtilityService(inputHsl);
            spectrumKind = "two-way";

            const spectrumBox = indicatorElement.closest('.color-spectrum-box');
            if (spectrumBox.classList.contains('spectrum-hue')) {
                const hueDisplay = indicatorElement.closest('.advanced-control-list').querySelector('.hue-value-display');
                const hueFactor = currentIndicatorPos / spectrumBox.offsetWidth;
                const newHue = Math.round(hueFactor * 359);
                selectedColorInstance.updateHsl(newHue, inputHsl.s, inputHsl.l);
                if (hueDisplay) hueDisplay.textContent = newHue;
            } else if (spectrumBox.classList.contains('spectrum-saturation')) {
                const saturationDisplay = indicatorElement.closest('.advanced-control-list').querySelector('.saturation-value-display');
                const saturationFactor = currentIndicatorPos / spectrumBox.offsetWidth;
                const newSaturation = Math.max(0, Math.min(1, saturationFactor));
                selectedColorInstance.updateHsl(inputHsl.h, newSaturation, inputHsl.l);
                if (saturationDisplay) saturationDisplay.textContent = `${Math.round(newSaturation * 100)}%`;
            } else if (spectrumBox.classList.contains('spectrum-lightness')) {
                const lightnessDisplay = indicatorElement.closest('.advanced-control-list').querySelector('.lightness-value-display');
                const lightnessFactor = currentIndicatorPos / spectrumBox.offsetWidth;
                const newLightness = Math.max(0, Math.min(1, lightnessFactor));
                selectedColorInstance.updateHsl(inputHsl.h, inputHsl.s, newLightness);
                if (lightnessDisplay) lightnessDisplay.textContent = `${Math.round(newLightness * 100)}%`;
            }
        }

        const adjustmentFactor = this.calculateColorModifier(spectrumKind, currentIndicatorPos, opts.type);
        const finalColorInstance = selectedColorInstance.adjustLightness(adjustmentFactor);
        const finalHex = finalColorInstance.retrieveHex();

        opts.input.value = finalHex;
        this.updateColorDisplay(opts.input);
        this.adjustIndicatorStyle(indicatorElement, adjustmentFactor, spectrumKind);
    }

    handleInputFieldChange(inputElement) {
        const newColor = ColorUtilityService(inputElement.value).retrieveHex();
        inputElement.value = newColor;
        this.updateColorDisplay(inputElement);
    }

    applyChosenColor(colorHex, inputElement) {
        inputElement.value = colorHex;
        this.updateColorDisplay(inputElement);
        const wrapper = inputElement.closest('.input-field-group');
        const buttonGroup = wrapper.querySelector('.color-menu-btn-group');
        const menuPanel = wrapper.querySelector('.color-menu-panel');
        this.hideColorMenu(buttonGroup, menuPanel);
    }

    // --- User Interface Construction ---
    buildUserInterface() {
        const dropdownEnclosure = document.createElement('div');
        dropdownEnclosure.classList.add('color-menu-btn-group');

        const menuActivationButton = document.createElement('button');
        menuActivationButton.setAttribute('type', 'button');
        menuActivationButton.classList.add('btn-element', 'color-menu-toggle-btn', 'dropdown-trigger');

        const colorVisual = document.createElement('span');
        colorVisual.classList.add('color-preview-box', 'current-color-display');
        menuActivationButton.appendChild(colorVisual);

        const dropdownArrow = document.createElement('span');
        dropdownArrow.classList.add('caret-icon');
        menuActivationButton.appendChild(dropdownArrow);

        dropdownEnclosure.appendChild(menuActivationButton);

        const menuPanel = document.createElement('div');
        menuPanel.classList.add('color-menu-panel', 'dropdown-content');
        menuPanel.style.display = 'none';

        if (!this.configuration.showHexInputBox) {
            menuActivationButton.classList.add('no-hex-input-style');
            menuPanel.classList.add('no-hex-input-style');
        }

        if (!this.hasMultipleTabs && !this.configuration.showSpectrumArea) {
            menuPanel.classList.add('compact-layout');
        }

        if (this.hasMultipleTabs) {
            const tabStrip = document.createElement('div');
            tabStrip.classList.add('menu-tab-strip');

            if (this.configuration.showPrimaryColors) {
                const primaryTab = document.createElement('span');
                primaryTab.classList.add('primary-colors-tab', 'menu-navigation-tab', 'active-tab');
                const primaryLink = document.createElement('a');
                primaryLink.textContent = 'Primary Hues';
                primaryTab.appendChild(primaryLink);
                tabStrip.appendChild(primaryTab);
            }
            if (this.configuration.showUserSavedColors) {
                const savedTab = document.createElement('span');
                savedTab.classList.add('saved-colors-tab', 'menu-navigation-tab');
                if (!this.configuration.showPrimaryColors) savedTab.classList.add('active-tab');
                const savedLink = document.createElement('a');
                savedLink.textContent = 'Saved Swatches';
                savedTab.appendChild(savedLink);
                tabStrip.appendChild(savedTab);
            }
            if (this.configuration.showAdvancedControls) {
                const advancedTab = document.createElement('span');
                advancedTab.classList.add('advanced-controls-tab', 'menu-navigation-tab');
                const advancedLink = document.createElement('a');
                advancedLink.textContent = 'Fine Tune';
                advancedTab.appendChild(advancedLink);
                tabStrip.appendChild(advancedTab);
            }
            menuPanel.appendChild(tabStrip);
        }

        if (this.configuration.showPrimaryColors) {
            const primaryColorsContent = document.createElement('div');
            primaryColorsContent.classList.add('primary-colors-content-panel', 'color-content-panel', 'active-content-panel');
            if (this.configuration.showSpectrumArea) {
                const instructions = document.createElement('h6');
                instructions.classList.add('panel-guide-text');
                instructions.textContent = 'Drag slider or tap spectrum to alter shade';
                primaryColorsContent.appendChild(instructions);
            }
            const colorList = document.createElement('ul');
            colorList.classList.add('primary-color-list');

            Object.entries(this.configuration.primaryColorMap).forEach(([name, hex]) => {
                const listItem = document.createElement('li');
                listItem.classList.add('color-entry-item');
                const colorLink = document.createElement('a');
                colorLink.classList.add(`${name}-color-link`, 'color-action-link');
                const colorSwatch = document.createElement('span');
                colorSwatch.classList.add('color-display-box', name);

                let actualHex = hex.startsWith('#') ? hex : '#' + hex;
                colorSwatch.style.backgroundColor = actualHex;

                const colorLabel = document.createElement('span');
                colorLabel.classList.add('color-name-label');
                colorLabel.textContent = name;

                colorLink.appendChild(colorSwatch);
                colorLink.appendChild(colorLabel);

                if (this.configuration.showSpectrumArea) {
                    const colorSpectrum = document.createElement('span');
                    colorSpectrum.classList.add('color-spectrum-box', 'basic-spectrum-type', `spectrum-${name}`);

                    if (this.envCapabilities.isOldIE) {
                        for (let i = 0; i < 2; i++) {
                            const ieStrip = document.createElement('span');
                            ieStrip.classList.add(`${name}-spectrum-${i}-ie`, 'ie-gradient-segment');
                            colorSpectrum.appendChild(ieStrip);
                        }
                    }
                    const highlightBand = document.createElement('span');
                    highlightBand.classList.add('spectrum-indicator-band');
                    for (let i = 0; i < 3; i++) {
                        const stripe = document.createElement('span');
                        stripe.classList.add('indicator-segment');
                        highlightBand.appendChild(stripe);
                    }
                    colorSpectrum.appendChild(highlightBand);
                    colorLink.appendChild(colorSpectrum);
                }
                listItem.appendChild(colorLink);
                colorList.appendChild(listItem);

                colorLink.addEventListener(this.interactionEvents.clickAction, (e) => {
                    e.preventDefault();
                    this.applyChosenColor(actualHex, this.hostElement);
                });
            });
            primaryColorsContent.appendChild(colorList);
            menuPanel.appendChild(primaryColorsContent);
        }

        if (this.configuration.showUserSavedColors) {
            const savedColorsContent = document.createElement('div');
            savedColorsContent.classList.add('saved-colors-content-panel', 'color-content-panel');
            if (this.configuration.showPrimaryColors) savedColorsContent.classList.add('inactive-content-panel'); else savedColorsContent.classList.add('active-content-panel');

            const instructions = document.createElement('p');
            instructions.classList.add('saved-color-guidance-text');
            instructions.textContent = 'Input a color directly or use the spectrums to modify an existing one.';
            savedColorsContent.appendChild(instructions);

            menuPanel.appendChild(savedColorsContent);
        }

        if (this.configuration.showAdvancedControls) {
            const advancedControlsContent = document.createElement('div');
            advancedControlsContent.classList.add('advanced-controls-content-panel', 'color-content-panel');
            if (this.configuration.showPrimaryColors || this.configuration.showUserSavedColors) advancedControlsContent.classList.add('inactive-content-panel'); else advancedControlsContent.classList.add('active-content-panel');

            const instructions = document.createElement('h6');
            instructions.classList.add('panel-guide-text');
            instructions.textContent = 'Drag slider or tap spectrum to alter shade';
            advancedControlsContent.appendChild(instructions);

            const advancedList = document.createElement('ul');
            advancedList.classList.add('advanced-control-list');

            // Hue
            const hueItem = document.createElement('li');
            hueItem.classList.add('hue-control-item');
            const hueLabel = document.createElement('span');
            hueLabel.classList.add('hue-text-label');
            hueLabel.textContent = 'Hue: ';
            const hueValue = document.createElement('span');
            hueValue.classList.add('hue-value-display');
            hueValue.textContent = '0';
            hueLabel.appendChild(hueValue);
            hueItem.appendChild(hueLabel);

            const hueSpectrum = document.createElement('span');
            hueSpectrum.classList.add('color-spectrum-box', 'advanced-spectrum-type', 'spectrum-hue');
            if (this.envCapabilities.isOldIE) {
                for (let i = 0; i < 7; i++) {
                    const ieStrip = document.createElement('span');
                    ieStrip.classList.add(`hue-spectrum-${i}-ie`, 'ie-gradient-segment', 'hue-gradient-segment');
                    hueSpectrum.appendChild(ieStrip);
                }
            }
            const hueHighlightBand = document.createElement('span');
            hueHighlightBand.classList.add('spectrum-indicator-band');
            for (let i = 0; i < 3; i++) {
                const stripe = document.createElement('span');
                stripe.classList.add('indicator-segment');
                hueHighlightBand.appendChild(stripe);
            }
            hueSpectrum.appendChild(hueHighlightBand);
            hueItem.appendChild(hueSpectrum);
            advancedList.appendChild(hueItem);

            // Lightness
            const lightnessItem = document.createElement('li');
            lightnessItem.classList.add('lightness-control-item');
            const lightnessLabel = document.createElement('span');
            lightnessLabel.classList.add('lightness-text-label');
            lightnessLabel.textContent = 'Lightness: ';
            const lightnessValue = document.createElement('span');
            lightnessValue.classList.add('lightness-value-display');
            lightnessValue.textContent = '50%';
            lightnessLabel.appendChild(lightnessValue);
            lightnessItem.appendChild(lightnessLabel);

            const lightnessSpectrum = document.createElement('span');
            lightnessSpectrum.classList.add('color-spectrum-box', 'advanced-spectrum-type', 'spectrum-lightness');
            if (this.envCapabilities.isOldIE) {
                for (let i = 0; i < 2; i++) {
                    const ieStrip = document.createElement('span');
                    ieStrip.classList.add(`lightness-spectrum-${i}-ie`, 'ie-gradient-segment');
                    lightnessSpectrum.appendChild(ieStrip);
                }
            }
            const lightnessHighlightBand = document.createElement('span');
            lightnessHighlightBand.classList.add('spectrum-indicator-band');
            for (let i = 0; i < 3; i++) {
                const stripe = document.createElement('span');
                stripe.classList.add('indicator-segment');
                lightnessHighlightBand.appendChild(stripe);
            }
            lightnessSpectrum.appendChild(lightnessHighlightBand);
            lightnessItem.appendChild(lightnessSpectrum);
            advancedList.appendChild(lightnessItem);

            // Saturation
            const saturationItem = document.createElement('li');
            saturationItem.classList.add('saturation-control-item');
            const saturationLabel = document.createElement('span');
            saturationLabel.classList.add('saturation-text-label');
            saturationLabel.textContent = 'Saturation: ';
            const saturationValue = document.createElement('span');
            saturationValue.classList.add('saturation-value-display');
            saturationValue.textContent = '100%';
            saturationLabel.appendChild(saturationValue);
            saturationItem.appendChild(saturationLabel);

            const saturationSpectrum = document.createElement('span');
            saturationSpectrum.classList.add('color-spectrum-box', 'advanced-spectrum-type', 'spectrum-saturation');
            if (this.envCapabilities.isOldIE) {
                for (let i = 0; i < 2; i++) {
                    const ieStrip = document.createElement('span');
                    ieStrip.classList.add(`saturation-spectrum-${i}-ie`, 'ie-gradient-segment');
                    saturationSpectrum.appendChild(ieStrip);
                }
            }
            const saturationHighlightBand = document.createElement('span');
            saturationHighlightBand.classList.add('spectrum-indicator-band');
            for (let i = 0; i < 3; i++) {
                const stripe = document.createElement('span');
                stripe.classList.add('indicator-segment');
                saturationHighlightBand.appendChild(stripe);
            }
            saturationSpectrum.appendChild(saturationHighlightBand);
            saturationItem.appendChild(saturationSpectrum);
            advancedList.appendChild(saturationItem);

            // Preview
            const previewItem = document.createElement('li');
            previewItem.classList.add('color-preview-item');
            const previewLabel = document.createElement('span');
            previewLabel.classList.add('preview-text-label');
            previewLabel.textContent = 'Preview';
            previewItem.appendChild(previewLabel);

            const advancedPreview = document.createElement('span');
            advancedPreview.classList.add('color-display-box', 'advanced-preview-display');
            const selectButton = document.createElement('button');
            selectButton.classList.add('color-selection-button', 'small-button', 'advanced-select-button');
            selectButton.setAttribute('type', 'button');
            selectButton.textContent = 'Select';
            advancedPreview.appendChild(selectButton);
            previewItem.appendChild(advancedPreview);
            advancedList.appendChild(previewItem);

            advancedControlsContent.appendChild(advancedList);
            menuPanel.appendChild(advancedControlsContent);
        }

        dropdownEnclosure.appendChild(menuPanel);
        return dropdownEnclosure;
    }
}

if (typeof Element !== 'undefined') {
    Element.prototype.activateColorPicker = function(options) {
        return new ColorPaletteCreator(this, options);
    };
}