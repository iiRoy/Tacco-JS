class VisualInterfaceComponent {
    constructor(componentSettings) {
        this.componentSettings = componentSettings;
        this.elementHolder = componentSettings.containerElement;
        this.drawingContext = componentSettings.drawingSurface;
    }

    onContextRestored(resetOptions) {
        // Base implementation, can be overridden by derived classes
    }
}

class PigmentSelectionModule extends VisualInterfaceComponent {
    constructor(moduleConfig) {
        super(moduleConfig);

        this.componentIdentifier = 'color-selection-tool';

        this.activeColorDisplay = null;
        this.paletteGridContainer = null;

        this.setupControl();
    }

    setupControl() {
        this.renderUserInterface();

        this.paletteGridContainer.addEventListener('click', (eventObject) => {
            const potentialSwatch = eventObject.target.closest('.color-swatch-item');
            if (potentialSwatch && this.paletteGridContainer.contains(potentialSwatch)) {
                const chosenColor = potentialSwatch.dataset.colorValue;
                this.drawingContext.setPrimaryColor(chosenColor);
                this.activeColorDisplay.style.backgroundColor = chosenColor;
                this.activeColorDisplay.dataset.colorValue = chosenColor;

                if (this.drawingContext.eventEmitter) {
                    this.drawingContext.eventEmitter.dispatch('primaryColor:modified', chosenColor);
                }

                this.paletteGridContainer.classList.add('is-hidden-element');
                eventObject.preventDefault();
            }
        });

        this.activeColorDisplay.addEventListener('click', (eventObject) => {
            this.paletteGridContainer.classList.toggle('is-hidden-element');
            eventObject.preventDefault();
        });

        document.body.addEventListener('click', (eventObject) => {
            const clickedElement = eventObject.target;
            const isClickInsideActiveDisplay = this.activeColorDisplay.contains(clickedElement) || clickedElement === this.activeColorDisplay;
            const isClickInsidePalette = this.paletteGridContainer.contains(clickedElement) || clickedElement === this.paletteGridContainer;

            if (!isClickInsideActiveDisplay && !isClickInsidePalette && !this.paletteGridContainer.classList.contains('is-hidden-element')) {
                this.paletteGridContainer.classList.add('is-hidden-element');
            }
        });
    }

    renderUserInterface() {
        const moduleInnerWrapper = document.createElement('div');
        moduleInnerWrapper.classList.add('control-module-wrapper');

        this.activeColorDisplay = document.createElement('div');
        this.activeColorDisplay.classList.add('current-active-color');
        this.activeColorDisplay.style.backgroundColor = this.drawingContext.primaryColor;
        this.activeColorDisplay.dataset.colorValue = this.drawingContext.primaryColor;
        moduleInnerWrapper.appendChild(this.activeColorDisplay);

        this.paletteGridContainer = document.createElement('div');
        this.paletteGridContainer.classList.add('color-selection-grid');
        this.paletteGridContainer.classList.add('is-hidden-element');
        moduleInnerWrapper.appendChild(this.paletteGridContainer);

        this.populateColorOptions();

        this.elementHolder.appendChild(moduleInnerWrapper);
    }

    populateColorOptions() {
        const lightnessSteps = [0.75, 0.5, 0.25];

        lightnessSteps.forEach(lightnessLevel => {
            const colorRowElement = document.createElement('div');
            colorRowElement.classList.add('color-row-segment');

            let specialColor;
            if (lightnessLevel === 0.25) specialColor = this.constructRgba(0, 0, 0, 1);
            if (lightnessLevel === 0.5) specialColor = this.constructRgba(150, 150, 150, 1);
            if (lightnessLevel === 0.75) specialColor = this.constructRgba(255, 255, 255, 1);
            colorRowElement.appendChild(this.createColorSwatchElement(specialColor.cssValue()));

            const hueValues = Array.from({ length: 12 }, (_, index) => (index * 30) - 60);

            hueValues.forEach(hueDegree => {
                const hslRepresentation = this.generateHslObject(hueDegree, 1, lightnessLevel);
                const rgbaRepresentation = this.convertHslToRgbaObject(hslRepresentation);
                colorRowElement.appendChild(this.createColorSwatchElement(rgbaRepresentation.cssValue()));
            });

            this.paletteGridContainer.appendChild(colorRowElement);
        });
    }

    createColorSwatchElement(colorString) {
        const swatchDiv = document.createElement('div');
        swatchDiv.classList.add('color-swatch-item');
        swatchDiv.dataset.colorValue = colorString;
        swatchDiv.style.backgroundColor = colorString;
        return swatchDiv;
    }

    onContextRestored(options) {
        const storedColor = this.activeColorDisplay.dataset.colorValue;
        this.drawingContext.setPrimaryColor(storedColor);
    }

    constructRgba(redVal, greenVal, blueVal, alphaVal) {
        return {
            r: redVal, g: greenVal, b: blueVal, a: alphaVal,
            cssValue: () => `rgba(${redVal}, ${greenVal}, ${blueVal}, ${alphaVal})`
        };
    }

    generateHslObject(hueDegree, saturationRatio, lightnessRatio) {
        return {
            h: hueDegree, s: saturationRatio, l: lightnessRatio,
            cssValue: () => `hsl(${hueDegree}, ${saturationRatio * 100}%, ${lightnessRatio * 100}%)`
        };
    }

    translateHexToRgba(hexInput) {
        const parsedNum = parseInt(hexInput.substring(1), 16);
        return this.constructRgba(parsedNum >> 16, (parsedNum >> 8) & 255, parsedNum & 255, 1);
    }

    convertHslToRgbaObject(hslObjectData) {
        let { h, s, l } = hslObjectData;
        h /= 360;

        let finalR, finalG, finalB;

        const hueToRgbConverter = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        if (s === 0) {
            finalR = finalG = finalB = l;
        } else {
            const qParameter = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const pParameter = 2 * l - qParameter;
            finalR = Math.floor(hueToRgbConverter(pParameter, qParameter, h + 1 / 3) * 255);
            finalG = Math.floor(hueToRgbConverter(pParameter, qParameter, h) * 255);
            finalB = Math.floor(hueToRgbConverter(pParameter, qParameter, h - 1 / 3) * 255);
        }
        return this.constructRgba(finalR, finalG, finalB, 1);
    }
}