let DisplayEngines = DisplayEngines || {};

DisplayEngines.PolyGridRenderer = _.extend({
    // Store references to the dynamic grid units
    gridElements: [],
    // Total number of grid units to render
    elementCount: 18, // Slightly increased count
    // Base CSS transform for grid units, initially just identity
    baseElementTransform: 'rotateY(0deg) translateZ(0px)', // More complex initial transform
    // Tracks the current background mode (e.g., 'solid' or 'gradient')
    activeBackgroundMode: 'initial', // Changed initial state
    // Frequency at which rendering updates might occur (not directly used in this snippet, but kept for context)
    renderSpeedHz: 65, // Slightly changed frequency

    // Internal identifier for the palette refresh timer
    _paletteRefreshIntervalID: null,

    // Default configuration for the module
    _defaultSettings: {
        paletteRefreshRate: 15000, // Refresh colors every 15 seconds
        baseShadingColor: 'rgba(220,220,220,0.06)', // Slightly different shading color
        minScaleFactor: 1.05, // Minimum scale for elements
        amplitudeMultiplier: 110 // Multiplier for audio amplitude to scale
    },

    /**
     * Initializes the grid renderer, setting up DOM elements, styling, and background updates.
     * This method orchestrates the initial setup process.
     */
    initialize: function() {
        // Ensure the visualizer target is available before proceeding
        if (!this.visualizer) {
            console.error("PolyGridRenderer: Visualizer target element is not defined.");
            return;
        }

        this.constructDOMComponents();
        this.applyElementStyling();
        this.updateBackgroundPalette();

        // Set up a recurring timer to cycle through background palettes
        this._paletteRefreshIntervalID = setInterval(_.bind(this.updateBackgroundPalette, this), this._defaultSettings.paletteRefreshRate);

        console.log("PolyGridRenderer initialized with " + this.elementCount + " elements.");
    },

    /**
     * Creates and appends all necessary DOM elements for the grid and its overlays.
     * This method structures the visual components within the main visualizer container.
     */
    constructDOMComponents: function() {
        // Helper to create a div element
        const createDiv = (id, classNames = []) => {
            const el = document.createElement('div');
            el.id = id;
            if (classNames.length > 0) {
                el.classList.add(...classNames);
            }
            return el;
        };

        // Create core containers for the grid and overlays
        const mainGridContainer = createDiv('grid-root-container');
        const backgroundLayerContainer = createDiv('background-layers');
        const solidColorLayer = createDiv('solid-bg-layer', ['bg-overlay']);
        const gradientLayer = createDiv('gradient-bg-layer', ['bg-overlay']);

        // Append layers to their container
        backgroundLayerContainer.appendChild(gradientLayer);
        backgroundLayerContainer.appendChild(solidColorLayer);

        // Append main containers to the visualizer target
        this.visualizer.appendChild(backgroundLayerContainer);
        this.visualizer.appendChild(mainGridContainer);

        // Generate individual grid units
        for (let idx = 0; idx < this.elementCount; idx++) {
            const unitWrapper = createDiv('grid-unit-wrapper-' + idx, ['grid-unit-wrapper']);
            const gridUnit = createDiv('grid-unit-' + idx, ['grid-unit']); // Give each unit a unique ID and class

            unitWrapper.appendChild(gridUnit);
            // Apply a base transform for initial positioning/styling
            gridUnit.style[prefix.css + 'transform'] = this.baseElementTransform;
            
            mainGridContainer.appendChild(unitWrapper);
        }
        
        // Store references to the created DOM elements for later manipulation
        this.mainGridContainer = mainGridContainer;
        this.backgroundLayerContainer = backgroundLayerContainer;
        this.solidColorLayer = solidColorLayer;
        this.gradientLayer = gradientLayer;
        
        // Collect all grid units using a class selector
        this.gridElements = Array.from(document.querySelectorAll('.grid-unit'));
        console.info("Constructed " + this.gridElements.length + " grid units.");
    },

    /**
     * Applies initial shading and border styles to each grid element using dynamic CSS rules.
     * This method ensures a consistent visual appearance for the grid.
     */
    applyElementStyling: function() {
        const shadingColor = this._defaultSettings.baseShadingColor;
        const styleSheet = document.styleSheets[0]; // Assuming the first stylesheet is available

        // Ensure a stylesheet exists
        if (!styleSheet) {
            console.warn("PolyGridRenderer: No stylesheet found to insert rules.");
            return;
        }

        for (let unitIndex = 0; unitIndex < this.elementCount; unitIndex++) {
            const currentUnit = this.gridElements[unitIndex];
            if (!currentUnit) {
                console.warn(`PolyGridRenderer: Grid unit at index ${unitIndex} not found for styling.`);
                continue;
            }

            // Assign a unique ID if not already set (from constructDOMComponents)
            currentUnit.id = `grid-unit-${unitIndex}`;
            // Set the background color directly
            currentUnit.style.setProperty('background-color', shadingColor);

            // Construct CSS rules for pseudo-elements to create the hexagon shape
            const beforeRule = `#grid-unit-${unitIndex}::before { border-bottom-color: ${shadingColor}; }`;
            const afterRule = `#grid-unit-${unitIndex}::after { border-top-color: ${shadingColor}; }`;

            // Insert rules at the beginning of the stylesheet
            try {
                styleSheet.insertRule(beforeRule, 0);
                styleSheet.insertRule(afterRule, 0);
            } catch (e) {
                console.error("PolyGridRenderer: Failed to insert CSS rule for grid unit " + unitIndex + ":", e);
            }
        }
        console.log("Applied element styling to all grid units.");
    },

    /**
     * Updates the background palette by cycling between solid colors and dynamic gradients.
     * This method provides visual dynamism to the background layers.
     */
    updateBackgroundPalette: function() {
        // Define common opacity values for clarity
        const fullOpacity = 1;
        const zeroOpacity = 0;

        // Generate random colors for the gradient
        const startColor = randomColor();
        const midColor = randomColor();
        const endColor = randomColor();

        // Construct a dynamic gradient string
        const dynamicGradientStyle = `${prefix.css}linear-gradient(-45deg, ${startColor} 0%, ${midColor} 55%, ${endColor} 100%)`; // Changed angle and mid-point percentage

        // Toggle between solid color and gradient display
        switch (this.activeBackgroundMode) {
            case 'gradient':
                // Transition to solid color mode
                this.solidColorLayer.style.setProperty('background', randomColor());
                this.solidColorLayer.style.setProperty('opacity', fullOpacity.toString());
                this.gradientLayer.style.setProperty('opacity', zeroOpacity.toString());
                this.activeBackgroundMode = 'solid';
                console.log("Background mode switched to: Solid Color");
                break;
            case 'solid':
                // Transition to gradient mode
                this.gradientLayer.style.setProperty('background', dynamicGradientStyle);
                this.solidColorLayer.style.setProperty('opacity', zeroOpacity.toString());
                this.gradientLayer.style.setProperty('opacity', fullOpacity.toString());
                this.activeBackgroundMode = 'gradient';
                console.log("Background mode switched to: Gradient");
                break;
            default:
                // Initial state: start with gradient
                this.solidColorLayer.style.setProperty('opacity', zeroOpacity.toString());
                this.gradientLayer.style.setProperty('background', dynamicGradientStyle);
                this.gradientLayer.style.setProperty('opacity', fullOpacity.toString());
                this.activeBackgroundMode = 'gradient';
                console.log("Initial background mode set to: Gradient");
                break;
        }
    },

    /**
     * Processes an incoming audio spectrum array to visually animate the grid elements.
     * Each element's scale is adjusted based on the sampled amplitude from the spectrum.
     * @param {Array<number>} audioSignalArray - An array representing the audio frequency spectrum.
     */
    processAudioData: function(audioSignalArray) {
        // Validate input array
        if (!audioSignalArray || audioSignalArray.length === 0) {
            // console.warn("PolyGridRenderer: Received empty or invalid audio signal array.");
            return; // Exit if no data
        }

        // Sample the audio array to get averages corresponding to the number of grid elements
        const normalizedAmplitudeSamples = sampleArray(audioSignalArray, this.elementCount);
        
        for (let k = 0; k < this.elementCount; k++) {
            const currentWrapper = this.gridElements[k] ? this.gridElements[k].parentNode : null;
            if (!currentWrapper) {
                continue; // Skip if wrapper doesn't exist
            }

            // Calculate scale factor: base scale + amplitude-driven scale
            const scaleValue = (normalizedAmplitudeSamples[k] * this._defaultSettings.amplitudeMultiplier / 100) + this._defaultSettings.minScaleFactor;
            
            // Apply the transform to the wrapper element
            currentWrapper.style[prefix.css + 'transform'] = `${this.baseElementTransform} scale(${scaleValue})`;
        }
    },

    /**
     * Cleans up resources when the renderer is destroyed, specifically stopping the color timer.
     * This prevents memory leaks and ensures proper shutdown.
     */
    cleanupResources: function() {
        if (this._paletteRefreshIntervalID) {
            clearInterval(this._paletteRefreshIntervalID);
            this._paletteRefreshIntervalID = null;
            console.log("PolyGridRenderer: Background palette refresh interval cleared.");
        }
        // Optionally, remove DOM elements or nullify references for garbage collection
        // For simplicity, not fully implemented here, but good practice for larger applications.
        this.gridElements = [];
        this.mainGridContainer = null;
        this.backgroundLayerContainer = null;
        this.solidColorLayer = null;
        this.gradientLayer = null;
        console.log("PolyGridRenderer resources cleaned up.");
    }
    
}, DisplayEngines.CoreModule); // Assuming DisplayEngines.CoreModule is the base object