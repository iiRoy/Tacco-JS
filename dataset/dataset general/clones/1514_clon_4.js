const vendorPrefixForStyles = '-webkit-';

class ColorWaveDisplay {
    static #dynamicStyleSheet = null;

    static #ensureDynamicStyleSheet() {
        if (!ColorWaveDisplay.#dynamicStyleSheet) {
            const styleElement = document.createElement('style');
            styleElement.id = 'dynamic-visual-rules';
            document.head.appendChild(styleElement);
            ColorWaveDisplay.#dynamicStyleSheet = styleElement.sheet;
        }
        return ColorWaveDisplay.#dynamicStyleSheet;
    }

    static addRuleToSheet(ruleContent) {
        const sheet = ColorWaveDisplay.#ensureDynamicStyleSheet();
        try {
            sheet.insertRule(ruleContent, sheet.cssRules.length);
        } catch (e) {
            // Suppress errors for duplicate or invalid rules, as original doesn't handle.
        }
    }

    constructor(displayTargetElement, configuration = {}) {
        if (!(displayTargetElement instanceof HTMLElement)) {
            throw new Error("Display target must be an HTML element.");
        }

        this.displayHostElement = displayTargetElement;
        this.shapeCollection = [];
        this.shapeCount = configuration.shapeCount || 15;
        this.baseShapeTransform = 'rotate(0deg)';
        this.activeLayerIdentifier = '';
        this.colorCycleHandle = null;

        this.containerForShapes = null;
        this.containerForLayers = null;
        this.solidColorLayer = null;
        this.gradientColorLayer = null;
    }

    activate() {
        this.prepareVisualStructure();
        this.applyInitialStyling();
        this.updateColorScheme();
        this.colorCycleHandle = setInterval(this.updateColorScheme.bind(this), 10000);
    }

    prepareVisualStructure() {
        const mainWrapper = document.createElement('div'),
            layerWrapper = document.createElement('div'),
            solidLayer = document.createElement('div'),
            gradientLayer = document.createElement('div');

        mainWrapper.id = 'visual-shapes-area';
        layerWrapper.id = 'visual-layers-area';
        solidLayer.id = 'visual-solid-layer';
        gradientLayer.id = 'visual-gradient-layer';
        solidLayer.className = 'visual-layer';
        gradientLayer.className = 'visual-layer';

        layerWrapper.appendChild(gradientLayer);
        layerWrapper.appendChild(solidLayer);

        this.displayHostElement.appendChild(layerWrapper);
        this.displayHostElement.appendChild(mainWrapper);

        for (let j = 0; j < this.shapeCount; j++) {
            const shapeWrapper = document.createElement('div'),
                innerShape = document.createElement('div');

            shapeWrapper.appendChild(innerShape);
            innerShape.style[vendorPrefixForStyles + 'transform'] = this.baseShapeTransform;

            shapeWrapper.className += ' shape-wrapper-element';
            innerShape.className += ' individual-shape-element';

            mainWrapper.appendChild(shapeWrapper);
        }

        this.containerForShapes = mainWrapper;
        this.containerForLayers = layerWrapper;
        this.solidColorLayer = solidLayer;
        this.gradientColorLayer = gradientLayer;

        this.shapeCollection = document.getElementsByClassName('individual-shape-element');
    }

    applyInitialStyling() {
        const shadeTint = 'rgba(255,255,255,0.08)';

        for (let k = 0; k < this.shapeCount; k++) {
            const beforeRule = `#shape${k}:before { border-bottom-color : ${shadeTint}}`;
            const afterRule = `#shape${k}:after { border-top-color : ${shadeTint}}`;

            this.shapeCollection[k].id = 'shape' + k;
            this.shapeCollection[k].style['background-color'] = shadeTint;
            ColorWaveDisplay.addRuleToSheet(beforeRule);
            ColorWaveDisplay.addRuleToSheet(afterRule);
        }
    }

    updateColorScheme() {
        const gradientEffect = vendorPrefixForStyles + "linear-gradient(-30deg, " + randomColor() + " 0%," + randomColor() + " 50%," + randomColor() + " 100%)";

        if (this.activeLayerIdentifier === 'gradient') {
            this.solidColorLayer.style['background'] = randomColor();
            this.solidColorLayer.style.opacity = 1;
            this.gradientColorLayer.style.opacity = 0;
            this.activeLayerIdentifier = 'solid';
        } else if (this.activeLayerIdentifier === 'solid') {
            this.gradientColorLayer.style['background'] = gradientEffect;
            this.solidColorLayer.style.opacity = 0;
            this.gradientColorLayer.style.opacity = 1;
            this.activeLayerIdentifier = 'gradient';
        } else {
            this.solidColorLayer.style.opacity = 0;
            this.gradientColorLayer.style['background'] = gradientEffect;
            this.activeLayerIdentifier = 'gradient';
        }
    }

    processInputData(inputData) {
        const averagedSamples = sampleArray(inputData, this.shapeCount);

        for (let l = 0; l < this.shapeCount; l++) {
            const scaleFactor = (averagedSamples[l] * 100 + 1);
            this.shapeCollection[l].parentNode.style[vendorPrefixForStyles + 'transform'] = this.baseShapeTransform + ' scale(' + scaleFactor + ')';
        }
    }

    deactivate() {
        clearInterval(this.colorCycleHandle);
    }
}