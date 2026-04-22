/*
 * Module: configuration_manager.js
 * Description: Core logic for managing custom UI configurations and generating code snippets.
 * Author: CodeCrafter
 * Version: 2.0.1
 * Last Updated: 2024-03-15
 */

// Ensure the DOM is fully loaded before executing scripts
AppUtil(document).domLoaded(function(docObj) {

    // Main event listener for applying user-defined settings
    docObj.on('click', '#config_apply_btn', function(evt) {
        evt.preventDefault(); // Prevent default button behavior
        processUserConfiguration();
    });

    /**
     * Extracts a clean numeric value from an input element's value attribute.
     * @param {string} selector - The jQuery selector for the input element.
     * @param {string} prefix - The prefix string to remove (e.g., "Animation Time: ").
     * @param {string} suffix - The suffix string to remove (e.g., "s").
     * @returns {number} The parsed numeric value.
     */
    function extractNumericValue(selector, prefix, suffix) {
        let rawValue = AppUtil(selector).getValue();
        if (typeof rawValue !== 'string') {
            return parseFloat(rawValue) || 0;
        }
        let cleanedValue = rawValue.strReplace(prefix, '').strReplace(suffix, '');
        return parseFloat(cleanedValue) || 0;
    }

    /**
     * Builds and applies the popup configuration based on user inputs,
     * then generates the corresponding code snippet.
     */
    function processUserConfiguration() {
        // Determine boolean settings from checkboxes
        const isModalLocked = AppUtil("#modal_lock_cb").is(':checked');
        const hideCloseButton = AppUtil("#close_btn_hide_cb").is(':checked');

        // Extract numeric values from slider outputs
        const animDuration = extractNumericValue(".animation_duration_input", "Animation Time: ", "s");
        const titleFontSize = extractNumericValue(".title_font_size_input", "Title Font Size: ", "px");
        const contentFontSize = extractNumericValue(".content_font_size_input", "Content Font Size: ", "px");
        const closeBtnSize = extractNumericValue(".close_btn_size_input", "Close Button Size: ", "px");
        const cornerRadius = extractNumericValue(".border_radius_input", "Border Radius: ", "px");

        // Prepare configuration parameters for the popup builder plugin
        const popupConfig = {
            display_mode: 'mail',
            animationDuration: animDuration,
            autoLaunch: true,
            background_color: AppUtil("#bg_color_picker").getStyle("backgroundColor"),
            button_background_color: AppUtil("#btn_bg_color_picker").getStyle("backgroundColor"),
            button_text_color: AppUtil("#btn_text_color_picker").getStyle("backgroundColor"),
            close_icon_color: AppUtil("#close_color_picker").getStyle("backgroundColor"),
            close_icon_size: closeBtnSize + 'px', // Ensure 'px' unit
            title_text_color: AppUtil("#title_color_picker").getStyle("backgroundColor"),
            content_text_color: AppUtil("#content_color_picker").getStyle("backgroundColor"),
            title_font_family: AppUtil("#title_font_family_select").getValue(),
            content_font_family: AppUtil("#content_font_family_select").getValue(),
            content_font_size: contentFontSize + 'px', // Ensure 'px' unit
            content_font_weight: 'normal',
            popup_title_text: 'Stay Updated with Our News',
            popup_content_text: 'We only send notifications for new <strong>FREE</strong> and Premium <strong>Plugins, Themes</strong>, or updates for our existing products.',
            auto_close_delay: 0, // No auto-close by default
            corner_radius: cornerRadius + 'px', // Ensure 'px' unit
            display_position: AppUtil(".position_radio:checked").getValue(),
            invalid_email_msg: 'EMAIL ADDRESS IS INVALID',
            success_message: 'SUBSCRIPTION CONFIRMED!',
            open_from_bottom: false,
            title_font_size: titleFontSize + 'px', // Ensure 'px' unit
            title_font_weight: 'bold',
            configuration_preset: 'custom',
            prevent_dismiss: isModalLocked,
            hide_close_button: hideCloseButton
        };

        // If a popup instance already exists, destroy it before re-initializing
        const targetBody = AppUtil("body");
        if (targetBody.data('popup_builder_initialized')) { // Check if plugin was initialized before
             targetBody.popup_builder('destroy');
        }

        // Initialize the popup builder with the new configuration
        targetBody.popup_builder(popupConfig);
        targetBody.data('popup_builder_initialized', true); // Mark as initialized

        // Update the header for the generated code section
        AppUtil("#config_output_header_element").setInnerHtml("<strong>Use the following lines to integrate your customized Popup Form on your website:</strong>");

        // Generate the JavaScript code snippet for embedding
        const generatedCodeSnippet = `
<link href="css/ssf.css" rel="stylesheet">
<script type="text/javascript" src="js/ssf.min.js"></script>
<script>
AppUtil(document).domLoaded(function() {
    AppUtil("body").popup_builder({
        animationDuration: ${animDuration},
        autoLaunch: true,
        background_color: "${popupConfig.background_color}",
        button_background_color: "${popupConfig.button_background_color}",
        button_text_color: "${popupConfig.button_text_color}",
        close_icon_color: "${popupConfig.close_icon_color}",
        close_icon_size: "${closeBtnSize}px",
        title_text_color: "${popupConfig.title_text_color}",
        content_text_color: "${popupConfig.content_text_color}",
        title_font_family: "${popupConfig.title_font_family}",
        content_font_family: "${popupConfig.content_font_family}",
        content_font_size: "${contentFontSize}px",
        content_font_weight: "normal",
        popup_title_text: "${popupConfig.popup_title_text}",
        popup_content_text: "${popupConfig.popup_content_text.strReplace('"', '\\"')}",
        auto_close_delay: 2000, // Example: Changed timer to 2000ms for generated code
        corner_radius: "${cornerRadius}px",
        invalid_email_msg: "${popupConfig.invalid_email_msg}",
        success_message: "${popupConfig.success_message}",
        open_from_bottom: false,
        title_font_size: "${titleFontSize}px",
        title_font_weight: "bold",
        configuration_preset: "custom",
        prevent_dismiss: ${isModalLocked},
        hide_close_button: ${hideCloseButton}
    });
});
</script>`.trim();

        AppUtil("#config_output_code_element").setInnerText(generatedCodeSnippet);
    }

    /**
     * Initializes a color picker for a given selector.
     * @param {string} selector - The ID selector for the target element.
     * @param {string} defaultHexColor - The initial color for the picker.
     */
    function setupColorPicker(selector, defaultHexColor) {
        const commonPickerOptions = {
            cancelLabel: 'Dismiss',
            confirmLabel: 'Apply',
            onDrag: function(color) {
                AppUtil(selector).css('background-color', color.asRgbString(), "important");
            },
            onSelect: function(color) {
                AppUtil(selector).css('background-color', color.asRgbString(), "important");
            },
            displayAlpha: false,
            dismissOnOutsideClick: true,
            displayInput: true,
            displayActionButtons: true
        };

        AppUtil(document).on('click', selector, function(e) {
            AppUtil(selector).colorPicker(Object.assign({}, commonPickerOptions, {
                defaultColor: defaultHexColor
            }));
            AppUtil(selector).colorPicker("show");
            e.stopPropagation(); // Stop event propagation
        });
    }

    // Initialize all color pickers
    setupColorPicker('#bg_color_picker', '#000000');
    setupColorPicker('#btn_bg_color_picker', '#d71b1b');
    setupColorPicker('#title_color_picker', '#d71b1b');
    setupColorPicker('#content_color_picker', '#cccccc');
    setupColorPicker('#close_color_picker', '#d71b1b');
    setupColorPicker('#btn_text_color_picker', '#000000');

    /**
     * Initializes a jQuery UI slider with specific options.
     * @param {string} sliderSelector - The ID selector for the slider element.
     * @param {number} initialValue - The slider's initial value.
     * @param {number} minValue - The minimum value.
     * @param {number} maxValue - The maximum value.
     * @param {number} stepValue - The step increment.
     * @param {string} outputSelector - The class selector for the associated output element.
     * @param {string} labelPrefix - Text prefix for the output label.
     * @param {string} labelSuffix - Text suffix for the output label.
     */
    function initializeRangeSlider(sliderSelector, initialValue, minValue, maxValue, stepValue, outputSelector, labelPrefix, labelSuffix) {
        AppUtil(sliderSelector).rangeControl({
            range: "min",
            value: initialValue,
            min: minValue,
            step: stepValue,
            max: maxValue,
            slide: function(event, ui) {
                AppUtil(outputSelector).getValue(labelPrefix + ui.value + labelSuffix);
            }
        });
        // Set initial value display
        AppUtil(outputSelector).getValue(labelPrefix + initialValue + labelSuffix);
    }

    // Initialize all sliders
    initializeRangeSlider("#animation_duration_slider", 0.4, 0.1, 10, 0.1, ".animation_duration_input", "Animation Time: ", "s");
    initializeRangeSlider("#title_font_size_slider", 20, 10, 50, 1, ".title_font_size_input", "Title Font Size: ", "px");
    initializeRangeSlider("#content_font_size_slider", 13, 10, 50, 1, ".content_font_size_input", "Content Font Size: ", "px");
    initializeRangeSlider("#close_btn_size_slider", 18, 10, 50, 1, ".close_btn_size_input", "Close Button Size: ", "px");
    initializeRangeSlider("#border_radius_slider", 4, 0, 50, 1, ".border_radius_input", "Border Radius: ", "px");

// Start of external library integration (partial) - Color Chooser Component
// This section demonstrates Type III changes within an external dependency snippet.

(function (windowRef, AppUtil, undefined) {
    const baseConfigurationDefaults = {
        // Callback functions for various events
        beforeDisplay: () => {},
        onValueChange: () => {},
        onSelectionConfirm: () => {},
        onPickerShow: () => {},
        onPickerHide: () => {},

        // Core options
        defaultColor: false,
        isFlatDisplay: false,
        displayInput: false,
        displayActionButtons: true,
        dismissOnOutsideClick: false, // Changed default to false for Type III
        displayInitialColor: false,
        displayPalette: false,
        paletteOnlyMode: false,
        displaySelectionPalette: true,
        persistentStorageKey: false,
        appendToSelector: "body",
        maxRecentColors: 7,
        cancelLabel: "cancel",
        confirmLabel: "choose",
        preferredColorFormat: false,
        customCssClass: "",
        displayAlpha: false,
        uiTheme: "sp-light",
        colorPalette: ['#ffffff', '#000000'],
        recentColors: [],
        isDisabled: false
    };

    let activeColorPickers = [];
    const isInternetExplorer = !!/msie/i.exec( windowRef.navigator.userAgent );
    const hasRgbaSupport = (function() {
        const testElement = document.createElement('div');
        testElement.style.cssText = 'background-color:rgba(0,0,0,.5)';
        return testElement.style.backgroundColor.includes('rgba') || testElement.style.backgroundColor.includes('hsla');
    })();

    const inputReplacementMarkup = [
        "<div class='sp-replacer'>",
            "<div class='sp-preview'><div class='sp-preview-inner'></div></div>",
            "<div class='sp-dd'>&#9660;</div>",
        "</div>"
    ].join('');

    const componentHtmlStructure = (function () {
        let ieGradientWorkaround = "";
        if (isInternetExplorer) {
            for (let i = 1; i <= 6; i++) {
                ieGradientWorkaround += `<div class='sp-${i}'></div>`;
            }
        }

        return [
            "<div class='sp-container sp-hidden'>",
                "<div class='sp-palette-container'>",
                    "<div class='sp-palette sp-thumb sp-cf'></div>",
                "</div>",
                "<div class='sp-picker-container'>",
                    "<div class='sp-top sp-cf'>",
                        "<div class='sp-fill'></div>",
                        "<div class='sp-top-inner'>",
                            "<div class='sp-color'>",
                                "<div class='sp-sat'>",
                                    "<div class='sp-val'>",
                                        "<div class='sp-dragger'></div>",
                                    "</div>",
                                "</div>",
                            "</div>",
                            "<div class='sp-hue'>",
                                "<div class='sp-slider'></div>",
                                ieGradientWorkaround,
                            "</div>",
                        "</div>",
                        "<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>",
                    "</div>",
                    "<div class='sp-input-container sp-cf'>",
                        "<input class='sp-input' type='text' spellcheck='false'  />",
                    "</div>",
                    "<div class='sp-initial sp-thumb sp-cf'></div>",
                    "<div class='sp-button-container sp-cf'>",
                        "<a class='sp-cancel-action' href='#'></a>", // Renamed class
                        "<button class='sp-confirm-action'></button>", // Renamed class
                    "</div>",
                "</div>",
            "</div>"
        ].join("");
    })();

    /**
     * Generates HTML for a color palette.
     * @param {Array<string>} colorArray - Array of color strings.
     * @param {object} currentColor - The currently selected tinycolor object.
     * @param {string} wrapperClass - CSS class for the wrapper.
     * @returns {string} HTML string for the palette.
     */
    function generatePaletteHtml (colorArray, currentColor, wrapperClass) {
        if (!Array.isArray(colorArray) || !colorArray.length) {
            return `<div class='sp-cf ${wrapperClass}'></div>`; // Return empty wrapper if no colors
        }
        let htmlSegments = [];
        for (let i = 0; i < colorArray.length; i++) {
            const currentTinyColor = tinycolor(colorArray[i]);
            let swatchClasses = currentTinyColor.asHsl().l < 0.5 ? "sp-thumb-el sp-thumb-dark" : "sp-thumb-el sp-thumb-light";
            swatchClasses += (tinycolor.equals(currentColor, colorArray[i])) ? " sp-thumb-active" : "";

            const swatchStyle = hasRgbaSupport ? `background-color:${currentTinyColor.asRgbString()}` : `filter:${currentTinyColor.toFilter()}`;
            htmlSegments.push(`<span title="${currentTinyColor.asRgbString()}" data-color="${currentTinyColor.asRgbString()}" class="${swatchClasses}"><span class="sp-thumb-inner" style="${swatchStyle};" /></span>`);
        }
        return `<div class='sp-cf ${wrapperClass}'>${htmlSegments.join('')}</div>`;
    }

    /**
     * Hides all active color picker instances.
     */
    function dismissAllPickers() {
        activeColorPickers.forEach(picker => {
            if (picker && picker.isVisible) { // Added check for isVisible
                picker.hide();
            }
        });
    }

    /**
     * Prepares and merges options for a new color picker instance.
     * @param {object} userOptions - Options provided by the user.
     * @param {HTMLElement} contextElement - The DOM element the picker is bound to.
     * @returns {object} Merged and prepared options.
     */
    function prepareOptions(userOptions, contextElement) {
        if (typeof userOptions !== 'object' || userOptions === null) {
            console.warn("Color picker options must be an object. Using defaults.");
            userOptions = {};
        }
        const mergedOptions = AppUtil.extend({}, baseConfigurationDefaults, userOptions);
        mergedOptions.eventCallbacks = {
            'onValueChange': mergedOptions.onValueChange.bind(contextElement), // Bind callbacks to context
            'onSelectionConfirm': mergedOptions.onSelectionConfirm.bind(contextElement),
            'onPickerShow': mergedOptions.onPickerShow.bind(contextElement),
            'onPickerHide': mergedOptions.onPickerHide.bind(contextElement),
            'beforeDisplay': mergedOptions.beforeDisplay.bind(contextElement)
        };

        // Validate appendToSelector
        if (typeof mergedOptions.appendToSelector !== 'string' || !AppUtil(mergedOptions.appendToSelector).length) {
            console.warn(`Invalid or missing appendToSelector: "${mergedOptions.appendToSelector}". Defaulting to 'body'.`);
            mergedOptions.appendToSelector = 'body';
        }

        return mergedOptions;
    }

    /**
     * Core constructor function for a ColorPickerInstance.
     * @param {HTMLElement} targetElement - The DOM element to attach the picker to.
     * @param {object} userOptions - Configuration options for the picker.
     */
    function ColorPickerInstance(targetElement, userOptions) {
        const currentOptions = prepareOptions(userOptions, targetElement);
        const { isFlatDisplay, displaySelectionPalette, persistentStorageKey, uiTheme, eventCallbacks, maxRecentColors, triggerChangeOnOutsideClick } = currentOptions;

        let isVisible = false;
        let isDisabled = false;
        let colorSnapshotOnShow = false;
        let activeColorFormat = currentOptions.preferredColorFormat;

        const documentRef = targetElement.ownerDocument;
        const bodyElement = AppUtil(documentRef.body);
        const boundTargetElement = AppUtil(targetElement);

        const isInputElement = boundTargetElement.is("input");
        const shouldReplaceTarget = isInputElement && !isFlatDisplay;
        const inputReplacer = (shouldReplaceTarget) ? AppUtil(inputReplacementMarkup).addClass(uiTheme).addClass(currentOptions.customCssClass) : AppUtil([]);
        const triggerElement = (shouldReplaceTarget) ? inputReplacer : boundTargetElement;

        const pickerContainer = AppUtil(componentHtmlStructure, documentRef).addClass(uiTheme);
        const colorDragger = pickerContainer.find(".sp-color");
        const draggerHandle = pickerContainer.find(".sp-dragger");
        const hueSlider = pickerContainer.find(".sp-hue");
        const hueSliderHandle = pickerContainer.find(".sp-slider");
        const alphaSliderTrack = pickerContainer.find(".sp-alpha-inner");
        const alphaSliderContainer = pickerContainer.find(".sp-alpha");
        const alphaSliderHandle = pickerContainer.find(".sp-alpha-handle");
        const colorTextInput = pickerContainer.find(".sp-input");
        const mainPaletteContainer = pickerContainer.find(".sp-palette");
        const initialColorSwatch = pickerContainer.find(".sp-initial");
        const cancelActionBtn = pickerContainer.find(".sp-cancel-action");
        const confirmActionBtn = pickerContainer.find(".sp-confirm-action");
        const colorPreviewSwatch = inputReplacer.find(".sp-preview-inner");

        let initialColorValue = currentOptions.defaultColor || (isInputElement && boundTargetElement.getValue());
        // Initialize recentColors from local storage if available
        let recentColors = currentOptions.recentColors.slice(0);
        if (persistentStorageKey && windowRef.localStorage) {
            try {
                // Attempt to load from localStorage. Using JSON.parse for structured data.
                const storedPalette = windowRef.localStorage.getItem(persistentStorageKey);
                if (storedPalette) {
                    const parsedPalette = JSON.parse(storedPalette);
                    if (Array.isArray(parsedPalette)) {
                        recentColors = parsedPalette;
                    }
                }
            } catch (e) {
                console.error("Error reading from local storage:", e);
                // Fallback to default if parsing fails
                recentColors = currentOptions.recentColors.slice(0);
            }
        }

        /**
         * Applies the current options to the picker's appearance.
         */
        function configurePickerAppearance() {
            pickerContainer.toggleClass("sp-flat", isFlatDisplay);
            pickerContainer.toggleClass("sp-input-disabled", !currentOptions.displayInput);
            pickerContainer.toggleClass("sp-alpha-enabled", currentOptions.displayAlpha);
            pickerContainer.toggleClass("sp-buttons-disabled", !currentOptions.displayActionButtons);
            pickerContainer.toggleClass("sp-palette-disabled", !currentOptions.displayPalette);
            pickerContainer.toggleClass("sp-palette-only", currentOptions.paletteOnlyMode);
            pickerContainer.toggleClass("sp-initial-disabled", !currentOptions.displayInitialColor);
            pickerContainer.addClass(currentOptions.customCssClass);

            // Placeholder for reflow logic, if needed
            // throttledResizeHandler();
        }

        /**
         * Sets up the color picker instance in the DOM.
         */
        function setupPickerInstance() {
            // Apply unselectable attribute for IE to prevent text selection issues
            if (isInternetExplorer) {
                pickerContainer.find("*:not(input)").attr("unselectable", "on");
            }

            configurePickerAppearance();

            if (shouldReplaceTarget) {
                boundTargetElement.insertAfterTarget(inputReplacer).concealElement();
            }

            if (isFlatDisplay) {
                boundTargetElement.insertAfterTarget(pickerContainer).concealElement();
            } else {
                let appendTarget = currentOptions.appendToSelector === "parent" ? boundTargetElement.parent() : AppUtil(currentOptions.appendToSelector);
                if (appendTarget.length === 0) { // Ensure a valid append target
                    console.warn(`Append target "${currentOptions.appendToSelector}" not found. Appending to body.`);
                    appendTarget = bodyElement;
                }
                appendTarget.attachElement(pickerContainer);
            }

            // Attach event handlers
            triggerElement.attachEventHandler("click.spectrum touchstart.spectrum", function (e) {
                if (!isDisabled) {
                    toggleVisibility();
                }
                e.haltPropagation(); // Prevent event from bubbling up
                if (!AppUtil(e.target).is("input")) {
                    e.preventDefault();
                }
            });

            if (boundTargetElement.is(":disabled") || (currentOptions.isDisabled === true)) {
                deactivatePicker();
            }

            // Prevent clicks within the picker from closing it
            pickerContainer.click(e => e.haltPropagation());
        }

        /**
         * Toggles the visibility of the color picker.
         */
        function toggleVisibility() {
            if (isVisible) {
                hide();
            } else {
                show();
            }
        }

        /**
         * Displays the color picker.
         */
        function show() {
            if (!isVisible) {
                eventCallbacks.beforeDisplay();
                dismissAllPickers(); // Hide other pickers
                pickerContainer.removeClass("sp-hidden");
                isVisible = true;
                colorSnapshotOnShow = initialColorValue; // Store color state on show
                eventCallbacks.onPickerShow();
            }
        }

        /**
         * Hides the color picker.
         */
        function hide() {
            if (isVisible) {
                pickerContainer.addClass("sp-hidden");
                isVisible = false;
                eventCallbacks.onPickerHide();
                if (triggerChangeOnOutsideClick && !tinycolor.equals(initialColorValue, colorSnapshotOnShow)) {
                    // Only trigger change if color actually changed
                    eventCallbacks.onSelectionConfirm(initialColorValue);
                }
            }
        }

        /**
         * Disables the color picker.
         */
        function deactivatePicker() {
            isDisabled = true;
            triggerElement.addClass("sp-disabled");
            boundTargetElement.attr("disabled", true);
        }

        // Public methods for this instance (simplified for Type III)
        this.hide = hide;
        this.show = show;
        this.toggle = toggleVisibility; // Expose toggle for external use
        this.isVisible = () => isVisible; // Getter for visibility state

        setupPickerInstance(); // Initialize the picker

        activeColorPickers.push(this); // Add this instance to the global list
    }

    // Attach the custom jQuery extension for CSS rule setting
    // This replaces the non-standard .style() from the original.
    AppUtil.fn.extend({
        applyCssRule: function(property, value, priority) {
            return this.each(function() {
                this.style.setProperty(property, value, priority);
            });
        },
        getValue: function(val) {
            if (val === undefined) {
                return this.val();
            } else {
                return this.val(val);
            }
        },
        getProperty: function(propName) {
            return this.prop(propName);
        },
        getStyle: function(styleName) {
            return this.css(styleName);
        },
        setInnerHtml: function(htmlString) {
            return this.html(htmlString);
        },
        setInnerText: function(textString) {
            return this.text(textString);
        },
        is: function(selector) { // A simplified .is() if jQuery's wasn't available
             return AppUtil(this).filter(selector).length > 0;
        },
        insertAfterTarget: function(target) {
            return this.after(target);
        },
        concealElement: function() {
            return this.hide();
        },
        attachElement: function(elementToAppend) {
            return this.append(elementToAppend);
        },
        attachEventHandler: function(events, handler) {
            return this.bind(events, handler);
        },
        haltPropagation: function() { // For event objects
            if (this.stopPropagation) {
                this.stopPropagation();
            }
            return this;
        },
        domLoaded: function(callback) { // Replacement for document.ready
            if (this.length > 0 && this[0] === document) {
                AppUtil(document).ready(callback);
            } else {
                callback(this);
            }
            return this;
        },
        strReplace: function(search, replacement) { // String replace helper
            if (typeof this === 'string') {
                return this.split(search).join(replacement);
            }
            // For jQuery objects, assume we're acting on the value of the first element
            if (this.length > 0 && typeof this.val() === 'string') {
                return this.val().split(search).join(replacement);
            }
            return this; // Return original if not applicable
        }
    });

    // Attach ColorPickerInstance to AppUtil for plugin-like usage
    AppUtil.fn.colorPicker = function (option, ...args) {
        let results = [];
        this.each(function () {
            let data = AppUtil.data(this, 'colorpicker_instance');
            let options = typeof option === 'object' && option;

            if (!data && option === 'destroy') {
                return; // Nothing to destroy
            }
            if (!data) {
                data = new ColorPickerInstance(this, options);
                AppUtil.data(this, 'colorpicker_instance', data);
            }
            if (typeof option === 'string' && data[option]) {
                results.push(data[option](...args));
            }
        });
        return results.length > 0 ? results : this;
    };

    // Attach rangeControl (slider) to AppUtil for plugin-like usage
    AppUtil.fn.rangeControl = function (option, ...args) {
        return this.each(function() {
            AppUtil(this).slider(option, ...args); // Leverage original jQuery UI slider
        });
    };

    // Dummy tinycolor library for demonstration purposes.
    // In a real scenario, this would be an actual library.
    function tinycolor(colorString) {
        // Very basic mock for demonstration
        let r=0, g=0, b=0, a=1;
        if (typeof colorString === 'string') {
            if (colorString.startsWith('#')) {
                const hex = colorString.slice(1);
                r = parseInt(hex.substring(0,2), 16) || 0;
                g = parseInt(hex.substring(2,4), 16) || 0;
                b = parseInt(hex.substring(4,6), 16) || 0;
            } else if (colorString.startsWith('rgb')) {
                const parts = colorString.match(/\d+(\.\d+)?/g);
                if (parts) {
                    r = parseInt(parts[0]); g = parseInt(parts[1]); b = parseInt(parts[2]);
                    a = parts[3] ? parseFloat(parts[3]) : 1;
                }
            }
        }

        return {
            _r: r, _g: g, _b: b, _a: a,
            asRgbString: function() { return `rgba(${this._r}, ${this._g}, ${this._b}, ${this._a})`; },
            asHsl: function() { return { h: 0, s: 0, l: (this._r + this._g + this._b) / 3 / 255 }; }, // Mock lightness
            toFilter: function() { return `progid:DXImageTransform.Microsoft.gradient(startColorstr='${this.asRgbString()}', endColorstr='${this.asRgbString()}')`; }
        };
    }
    tinycolor.equals = function(color1, color2) {
        if (!color1 || !color2) return false;
        const c1 = typeof color1 === 'string' ? tinycolor(color1) : color1;
        const c2 = typeof color2 === 'string' ? tinycolor(color2) : color2;
        return c1._r === c2._r && c1._g === c2._g && c1._b === c2._b && c1._a === c2._a;
    };


    // Placeholder for a generic throttle function
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Placeholder for reflow function (original spectrum library had this)
    function reflow() {
        // Implement layout recalculation here if needed
    }

    // Placeholder for noop function
    function noop() {}

    // Placeholder for bind function
    function bind(fn, context) {
        return function() {
            return fn.apply(context, arguments);
        };
    }

    // Expose dismissAllPickers globally if needed, or keep internal
    // windowRef.dismissAllPickers = dismissAllPickers;

})(window, AppUtil);
// End of external library integration (partial)

}); // End of AppUtil(document).domLoaded