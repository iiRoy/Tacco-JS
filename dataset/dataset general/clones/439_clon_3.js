/*
 * Core Application Setup and Global Configuration
 * This section handles foundational checks and variable initializations
 * required for the texture generation utility to operate.
 */

// Define string constants for common UI element selectors.
// This centralizes selectors for easier maintenance and refactoring.
const InterfaceElements = {
    CANVAS_WIDTH_INPUT: '.x_size_input',
    CANVAS_HEIGHT_INPUT: '.y_size_input',
    BASE_COLOR_INPUT: '.color_input',
    NOISE_DISPLAY_AREA: '.final_noise',
    DOWNLOAD_ACTION_BUTTON: '.download_button',
    ALPHA_SLIDER_CONTROL: '#slider',
    DENSITY_SLIDER_CONTROL: '#slider-dens',
    TRANSPARENCY_MODE_TOGGLE: '#transparent-noise',
    ALL_CHECKBOX_INPUTS: 'input[type=checkbox]'
};

// Establish canvas rendering context.
// `renderCanvas` will hold the main canvas element, `drawingSurface` its 2D context.
let renderCanvas = null;
let drawingSurface = null;

// Check for Modernizr.canvas support. If not available, log a warning.
if (typeof Modernizr !== 'undefined' && Modernizr.canvas) {
    renderCanvas = document.createElement('canvas');
    drawingSurface = renderCanvas.getContext('2d');
} else {
    console.error("Canvas rendering API is not detected. Application will operate in a degraded mode.");
    // A production application might display a user-friendly message here.
}

// Verify if the HTML5 'download' attribute is supported by the browser.
// This determines if direct file downloads are possible.
const supportsDirectDownload = 'download' in document.createElement('a');

// Determine the availability of local storage for persisting user preferences.
let storageIsAccessible = false;
let userPreferencesStore = null;

if (typeof Modernizr !== 'undefined' && Modernizr.localstorage) {
    storageIsAccessible = true;
    userPreferencesStore = window.localStorage;
} else {
    console.info("Client-side storage is not available. User settings will not be saved across sessions.");
}

/*
 * Dynamic Texture Generation Function
 * Creates a randomized grayscale pattern on the canvas with specified parameters.
 * @param {number} transparencyLevel - The alpha value for each pixel (0.0 to 1.0).
 * @param {number} pixelStepSize - The interval at which pixels are drawn (e.g., 1 for every pixel, 2 for every other).
 * @returns {boolean} Returns `false` if canvas context is missing, `true` otherwise.
 */
const generateRandomTexture = function(transparencyLevel, pixelStepSize) {
    if (!drawingSurface) {
        console.error("Cannot generate texture: Canvas drawing context is unavailable.");
        return false;
    }

    // Sanitize input values: ensure transparency is within [0,1] and density is a positive integer.
    const effectiveTransparency = Math.max(0, Math.min(1, parseFloat(transparencyLevel) || 0.05));
    const effectiveStep = Math.max(1, Math.floor(parseFloat(pixelStepSize) || 1));

    // Fetch and set the canvas dimensions from the UI input fields.
    const currentCanvasWidth = Number($(InterfaceElements.CANVAS_WIDTH_INPUT).val());
    const currentCanvasHeight = Number($(InterfaceElements.CANVAS_HEIGHT_INPUT).val());

    renderCanvas.width = currentCanvasWidth;
    renderCanvas.height = currentCanvasHeight;

    // Clear the entire canvas to prepare for new drawing.
    drawingSurface.clearRect(0, 0, renderCanvas.width, renderCanvas.height);

    // Iterate through canvas pixels and draw random grayscale dots.
    for (let col = 0; col < renderCanvas.width; col += effectiveStep) {
        for (let row = 0; row < renderCanvas.height; row += effectiveStep) {
            const grayscaleValue = Math.floor(Math.random() * 256); // A random value between 0 and 255
            drawingSurface.fillStyle = `rgba(${grayscaleValue}, ${grayscaleValue}, ${grayscaleValue}, ${effectiveTransparency})`;
            drawingSurface.fillRect(col, row, 1, 1); // Draw a single pixel at (col, row)
        }
    }

    // Update the visual output area's background with the newly generated texture.
    const currentColorValue = $(InterfaceElements.BASE_COLOR_INPUT).val();
    $(InterfaceElements.NOISE_DISPLAY_AREA).css(
        'background',
        `url(${renderCanvas.toDataURL('image/png')}) center center repeat #${currentColorValue}`
    );

    // Trigger the final export and download preparation routine.
    prepareTextureForExport();
    return true; // Indicate successful operation.
};

/*
 * jQuery Extension for Custom Checkbox UI
 * This plugin converts standard checkbox elements into custom-styled toggles.
 * It ensures accessibility while providing a custom visual appearance.
 */
$.fn.applyCustomToggleStyle = function() {
    // Process each matched checkbox element.
    this.each(function() {
        const $originalInput = $(this); // Reference to the native checkbox.

        // Wrap the checkbox with a new `<span>` element which will serve as the visual custom checkbox.
        $originalInput.wrap('<span class="custom-toggle-container">');

        const $visualWrapper = $originalInput.parent('.custom-toggle-container'); // Reference to the new wrapper.

        // Apply base CSS classes and inline styles to the wrapper.
        $visualWrapper.addClass('custom-checkbox-styled')
            .css({
                'position': 'relative',
                'overflow': 'hidden',
                'display': 'inline-block', // Make the wrapper behave like an inline block for layout.
                'vertical-align': 'middle' // Align with text if necessary.
            });

        // Visually hide the original checkbox, but keep it functionally present and accessible.
        $originalInput.css({
            'position': 'absolute',
            'top': 0,
            'right': 0,
            'bottom': 0,
            'left': 0,
            'opacity': 0, // Make it transparent.
            'cursor': 'pointer', // Retain cursor feedback for user interaction.
            'width': '100%', // Ensure it completely covers the visual wrapper.
            'height': '100%'
        });

        // Synchronize initial visual state with the checkbox's `checked` property.
        if ($originalInput.is(':checked')) {
            $visualWrapper.addClass('is-active-state');
        }

        // Attach an event listener to update the wrapper's class when the checkbox's state changes.
        $originalInput.on('change', function() {
            $visualWrapper.toggleClass('is-active-state', $originalInput.is(':checked'));
        });
    });

    return this; // Enable jQuery method chaining.
};

/*
 * Application Settings and Persistence Module
 * Manages default settings, loading from local storage, and handling schema updates.
 */

// Current schema version for the application's persistent settings.
const applicationSchemaVersion = '3.0b';

// Define the default configuration object for the application.
let applicationSettings = {
    alphaValue: 0.05,
    pixelStepSize: 1,
    baseColor: 'f34379',
    outputWidth: 200, // Adjusted default width
    outputHeight: 200, // Adjusted default height
    enableTransparency: false,
    downloadFileNameBase: 'custom-noise-pattern',
    forceStreamDownload: false, // Option to force download as octet-stream for data URIs
    schemaVersion: applicationSchemaVersion,
};

// Helper function to safely parse and validate numeric input values from UI fields.
const getValidatedNumericInput = (selector, defaultVal, minBound = 0, maxBound = Infinity) => {
    const rawInput = $(selector).val();
    let numericValue = Number(rawInput);

    // If parsing fails or value is out of bounds, use default and correct the input field.
    if (isNaN(numericValue) || numericValue < minBound || numericValue > maxBound) {
        numericValue = defaultVal;
        $(selector).val(defaultVal); // Correct the UI input
    } else {
        // Ensure integer if needed, or just clamp.
        numericValue = Math.round(numericValue * 100) / 100; // Round to 2 decimal places for consistency
        if (numericValue !== Number(rawInput)) { // Only update if value was clamped/rounded
             $(selector).val(numericValue);
        }
    }
    return numericValue;
};


// Logic for loading and migrating application settings from local storage.
if (storageIsAccessible) {
    const storedConfigJSON = userPreferencesStore.getItem('applicationSettings');
    if (storedConfigJSON) {
        let loadedConfig = {};
        try {
            loadedConfig = JSON.parse(storedConfigJSON);
        } catch (error) {
            console.error("Error parsing stored application settings:", error);
            // On parse error, fall back to default settings.
            loadedConfig = {};
        }

        // Perform schema migration if the stored version is outdated or missing.
        if (!loadedConfig.schemaVersion || loadedConfig.schemaVersion !== applicationSchemaVersion) {
            console.log("Migrating application settings to the current schema (v" + applicationSchemaVersion + ").");
            // Add any new properties from the default settings to the loaded (old) configuration.
            for (const propName in applicationSettings) {
                if (Object.prototype.hasOwnProperty.call(applicationSettings, propName) && !Object.prototype.hasOwnProperty.call(loadedConfig, propName)) {
                    loadedConfig[propName] = applicationSettings[propName];
                }
            }
            // Update the schema version and save the migrated settings.
            loadedConfig.schemaVersion = applicationSchemaVersion;
            userPreferencesStore.setItem('applicationSettings', JSON.stringify(loadedConfig));
        }
        // Merge loaded settings over the defaults.
        applicationSettings = { ...applicationSettings, ...loadedConfig };
    } else {
        // If no settings are found in storage, save the current default settings.
        userPreferencesStore.setItem('applicationSettings', JSON.stringify(applicationSettings));
    }
} else {
    console.warn("Local storage unavailable; application will use default settings.");
}

/*
 * Cached UI Element References
 * Store jQuery objects for frequently accessed interface components to optimize performance.
 */
const cachedUI = {
    opacitySlider: $(InterfaceElements.ALPHA_SLIDER_CONTROL),
    densitySlider: $(InterfaceElements.DENSITY_SLIDER_CONTROL),
    colorInput: $(InterfaceElements.BASE_COLOR_INPUT),
    widthInput: $(InterfaceElements.CANVAS_WIDTH_INPUT),
    heightInput: $(InterfaceElements.CANVAS_HEIGHT_INPUT),
    transparentToggle: $(InterfaceElements.TRANSPARENCY_MODE_TOGGLE),
    downloadButton: $(InterfaceElements.DOWNLOAD_ACTION_BUTTON)
};

/*
 * Initialize Sliders (jQuery UI)
 * Configure the opacity and density sliders with their respective properties and event handlers.
 */
cachedUI.opacitySlider.slider({
    range: "min",
    value: applicationSettings.alphaValue,
    min: 0,
    max: 1,
    step: 0.01,
    slide: function(event, ui) {
        // Update stored setting and regenerate texture on slider interaction.
        saveSetting('alphaValue', ui.value);
        generateRandomTexture(ui.value, cachedUI.densitySlider.slider('value'));
    }
});

cachedUI.densitySlider.slider({
    range: "min",
    value: applicationSettings.pixelStepSize,
    min: 1,
    max: 10,
    step: 0.1, // Allow fractional steps for density for finer control
    slide: function(event, ui) {
        // Update stored setting and regenerate texture on slider interaction.
        saveSetting('pixelStepSize', ui.value);
        generateRandomTexture(cachedUI.opacitySlider.slider('value'), ui.value);
    }
});

/*
 * Initial UI Population
 * Set the initial values of input fields and checkboxes based on `applicationSettings`.
 */
cachedUI.colorInput.val(applicationSettings.baseColor);
cachedUI.widthInput.val(applicationSettings.outputWidth);
cachedUI.heightInput.val(applicationSettings.outputHeight);
cachedUI.transparentToggle.prop('checked', applicationSettings.enableTransparency);

/*
 * Color Picker Integration
 * Set up the ColorPicker plugin for the base color input field.
 */
cachedUI.colorInput.ColorPicker({
    color: '#' + applicationSettings.baseColor,
    onShow: function(colorPickerElem) {
        $(colorPickerElem).fadeIn(500);
        return false;
    },
    onHide: function(colorPickerElem) {
        $(colorPickerElem).fadeOut(500);
        return false;
    },
    onChange: function(hsb, hex, rgb) {
        cachedUI.colorInput.val(hex); // Update the input field with the chosen hex color.
        saveSetting('baseColor', hex); // Persist the new color.
        // Regenerate the texture using current slider values and the new base color.
        generateRandomTexture(cachedUI.opacitySlider.slider('value'), cachedUI.densitySlider.slider('value'));
    }
});

/*
 * Event Handlers for UI Interactions
 * Bind events for color input, canvas dimension inputs, and transparency toggle.
 */

// Consolidated handler for color input changes (typing or picker).
const handleColorInputEvent = function() {
    const inputHexColor = $(this).val();
    // Simple validation: ensure it's a 6-character hexadecimal string.
    if (!/^[0-9A-Fa-f]{6}$/.test(inputHexColor)) {
        console.warn("Invalid hexadecimal color format detected. Reverting to last valid color.");
        $(this).val(applicationSettings.baseColor); // Revert to the last valid color.
        return;
    }
    saveSetting('baseColor', inputHexColor);
    generateRandomTexture(cachedUI.opacitySlider.slider('value'), cachedUI.densitySlider.slider('value'));
};

cachedUI.colorInput.on('change', handleColorInputEvent);
cachedUI.colorInput.on('keyup', handleColorInputEvent); // Provide immediate feedback while typing.

// Unified handler for canvas dimension (width/height) input fields.
const processDimensionInput = function(inputElement, settingKey, minLimit, maxLimit) {
    const adjustedValue = getValidatedNumericInput(inputElement, applicationSettings[settingKey], minLimit, maxLimit);
    saveSetting(settingKey, adjustedValue);
    // Regenerate texture to reflect the new dimensions.
    generateRandomTexture(cachedUI.opacitySlider.slider('value'), cachedUI.densitySlider.slider('value'));
};

// Attach event listeners for width and height input fields.
cachedUI.widthInput.on('keyup change', function() {
    processDimensionInput(this, 'outputWidth', 30, 300); // Min 30, Max 300
});
cachedUI.heightInput.on('keyup change', function() {
    processDimensionInput(this, 'outputHeight', 30, 300); // Min 30, Max 300
});

/*
 * Custom Checkbox Application and Transparency Toggle Logic
 */
$(InterfaceElements.ALL_CHECKBOX_INPUTS).applyCustomToggleStyle(); // Apply custom styling to all checkboxes.

cachedUI.transparentToggle.on('change', function() {
    const transparencyEnabled = $(this).is(':checked');
    saveSetting('enableTransparency', transparencyEnabled);
    // Re-process the texture for export to apply or remove the transparent background.
    prepareTextureForExport();
});

/*
 * Configuration Management Helper Function
 * Updates a specific setting and persists it to local storage if available.
 * @param {string} settingKey - The key of the setting to modify.
 * @param {*} settingValue - The new value for the specified setting.
 */
const saveSetting = function(settingKey, settingValue) {
    applicationSettings[settingKey] = settingValue;
    if (storageIsAccessible) {
        try {
            userPreferencesStore.setItem('applicationSettings', JSON.stringify(applicationSettings));
        } catch (error) {
            console.error("Failed to save application settings to local storage:", error);
        }
    }
};

/*
 * Final Texture Image Processing and Download Preparation
 * This function takes the current canvas content, applies final adjustments (like background color),
 * and sets up the download link.
 * @param {HTMLElement} [triggeringElement=null] - Optional: the UI element that initiated this process (e.g., download button).
 */
const prepareTextureForExport = function(triggeringElement = null) {
    if (!renderCanvas || !drawingSurface) {
        console.error("Cannot prepare texture for export: Canvas or context is not initialized.");
        return;
    }

    const sourceImage = new Image();
    sourceImage.src = renderCanvas.toDataURL('image/png');

    sourceImage.onload = function() {
        // Create a temporary canvas for final image composition (e.g., adding a solid background).
        const exportCanvas = document.createElement('canvas');
        const exportContext = exportCanvas.getContext('2d');

        exportCanvas.width = renderCanvas.width;
        exportCanvas.height = renderCanvas.height;

        // If transparency is not enabled, fill the export canvas with the chosen base color.
        if (!applicationSettings.enableTransparency) {
            exportContext.fillStyle = '#' + applicationSettings.baseColor;
            exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        }
        // Draw the generated noise pattern onto the export canvas.
        exportContext.drawImage(sourceImage, 0, 0);

        const finalImageDataURI = exportCanvas.toDataURL('image/png');

        // Store the data URI on the download button's data attribute.
        cachedUI.downloadButton.data('href', finalImageDataURI);

        if (supportsDirectDownload) {
            // If the 'download' attribute is supported, set the href and a dynamic filename.
            cachedUI.downloadButton
                .attr('href', finalImageDataURI)
                .attr('download', generateDynamicFilename());
        } else if (triggeringElement && applicationSettings.forceStreamDownload) {
            // Fallback for non-'download' supporting browsers, if forced binary download is enabled.
            // This attempts to trigger a download by navigating to a data URI treated as an octet-stream.
            const binaryDownloadURI = finalImageDataURI.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
            window.location.href = binaryDownloadURI;
        } else if (triggeringElement) {
            // Default fallback: open the image in a new browser tab for manual saving.
            window.open(finalImageDataURI, '_blank');
        }
    };
};

/*
 * Utility Function: Generate a Descriptive Download Filename
 * Constructs a filename based on current texture parameters.
 * @returns {string} The generated filename, e.g., "custom-noise-W200xH200-O5-D10-C123456-T0.png".
 */
const generateDynamicFilename = function() {
    const currentWidth = cachedUI.widthInput.val();
    const currentHeight = cachedUI.heightInput.val();
    const currentOpacity = (cachedUI.opacitySlider.slider('value') * 100).toFixed(0); // Convert 0.05 to 5
    const currentDensity = (cachedUI.densitySlider.slider('value') * 10).toFixed(0); // Convert 1.0 to 10
    const currentColor = cachedUI.colorInput.val();
    const transparencyIndicator = applicationSettings.enableTransparency ? 'T1' : 'T0';

    return `${applicationSettings.downloadFileNameBase}-W${currentWidth}xH${currentHeight}-O${currentOpacity}-D${currentDensity}-C${currentColor}-${transparencyIndicator}.png`;
};

/*
 * Application Bootstrap Function
 * Orchestrates the initial setup and rendering when the DOM is ready.
 */
const initializeAppOnReady = function() {
    // Ensure UI elements reflect the loaded or default settings.
    cachedUI.widthInput.val(applicationSettings.outputWidth);
    cachedUI.heightInput.val(applicationSettings.outputHeight);
    cachedUI.colorInput.val(applicationSettings.baseColor);
    cachedUI.transparentToggle.prop('checked', applicationSettings.enableTransparency);

    // Perform the initial texture generation and display.
    generateRandomTexture(cachedUI.opacitySlider.slider('value'), cachedUI.densitySlider.slider('value'));

    // If direct download is not supported, add a specific click handler to the download button.
    // This provides a fallback action for browsers that lack the 'download' attribute.
    if (!supportsDirectDownload) {
        cachedUI.downloadButton.on('click', function(event) {
            prepareTextureForExport(this); // Pass the button as the triggering element.
            event.preventDefault(); // Prevent the default anchor link behavior.
        });
    }
};

// Execute the main initialization function once the entire DOM is loaded.
$(document).ready(initializeAppOnReady);