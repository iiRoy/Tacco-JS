/*
 * Form Control Component - Single Text Input module.
 *
 * This module defines the behavior and configuration for a basic single-line text entry field
 * within a dynamic form builder application. It manages rendering, user interaction,
 * and persistence of its properties.
 *
 * Authored by: [Developer Name Redacted]
 * Date: [Date Redacted]
 * License: [Custom License Placeholder] - All rights reserved.
 *
 * This file is a derivative work, extensively modified from its original form
 * to demonstrate Type III code cloning principles, including identifier renaming,
 * structural alterations, and functional enhancements/simplifications while
 * retaining core capabilities.
 */

// Define a new component module by extending the base form element prototype.
const TextEntryComponentModule = Object.assign({}, $.fb.fbWidget.prototype, {
    // Component's default configuration and property schema.
    configDefaults: {
        displayName: 'Text Input Field', // User-facing name for this component.
        parentPanelId: $.fb.formbuilder.prototype.options._standardFieldsPanel, // Where this component appears in the builder.
        componentTypeTag: 'TextInput', // Internal identifier for this component type.
        // HTML template for rendering the component in the form.
        markupTemplate: `
            <div class="form-item-wrapper">
                <label>
                    <em class="required-indicator"></em>
                    <span class="field-label-text"></span>
                </label>
                <input type="text" class="input-element-field" />
                <p class="field-hint-description"></p>
            </div>
        `,
        namingBaseField: 'fieldLabelText', // Key for auto-generating unique names.
        supportedLocales: ['en_US', 'de_DE'], // List of supported language codes.

        // Detailed component settings, including localized and general properties.
        componentSettings: {
            // English (US) specific configurations.
            locale_en_US: {
                fieldLabelText: 'Single Line Text',
                initialValue: '',
                hintDescription: 'Please enter your text here.',
                visualStyles: {
                    fontFamilySetting: 'default', // Inherit from builder defaults.
                    fontSizeSetting: 'default',
                    fontActiveState: { // Semantic flags for font styles.
                        bold: false,
                        italic: false,
                        underline: false
                    }
                }
            },
            // German (Germany) specific configurations.
            locale_de_DE: {
                fieldLabelText: 'Einzeiliger Text',
                initialValue: '',
                hintDescription: 'Bitte geben Sie hier Ihren Text ein.',
                visualStyles: {
                    fontFamilySetting: 'default',
                    fontSizeSetting: 'default',
                    fontActiveState: {
                        bold: false,
                        italic: false,
                        underline: false
                    }
                }
            },
            // General, non-localized settings.
            isMandatory: true, // Whether this field is required.
            inputValidationRule: 'none', // Type of input restriction (e.g., 'numeric', 'email').
            globalElementStyles: { // Styles applicable to different parts of the component.
                labelElement: {
                    textColor: 'default',
                    bgColor: 'default'
                },
                valueElement: {
                    textColor: 'default',
                    bgColor: 'default'
                },
                descriptionElement: {
                    textColor: '777777', // Default grey for hints.
                    bgColor: 'default'
                }
            }
        }
    },

    // Internal debug logging flag.
    _debugLogEnabled: true,

    /**
     * Helper for conditional console logging.
     * @param {string} message - The message to log.
     */
    _logDebug: function(message) {
        if (this._debugLogEnabled) {
            console.log(`[TextInputComponent] ${message}`);
        }
    },

    /**
     * Initializes the component instance.
     * This method is called upon component creation.
     */
    _initializeComponent: function() {
        this._logDebug('_initializeComponent started.');
        // Call the parent widget's initialization method first.
        $.fb.fbWidget.prototype._init.call(this);

        // Merge base widget options with this component's specific defaults.
        // Ensure that our configDefaults are layered over the base options.
        this.configDefaults = Object.assign({}, $.fb.fbWidget.prototype.options, this.configDefaults);
        this._logDebug('_initializeComponent finished.');
    },

    /**
     * Constructs and returns the jQuery object representing the rendered component.
     * @param {object} evt - The event object (usually unused here).
     * @param {object} formBuilderInstance - The form builder instance containing current settings.
     * @returns {jQuery} The rendered component's jQuery object.
     */
    _buildRenderedComponent: function(evt, formBuilderInstance) {
        if (!formBuilderInstance || !formBuilderInstance.componentSettings) {
            this._logDebug('Error: formBuilderInstance or its settings are undefined during _buildRenderedComponent.');
            return $(); // Return an empty jQuery object.
        }

        const currentSettings = formBuilderInstance.componentSettings;
        const targetHost = formBuilderInstance.target;
        this._logDebug('_buildRenderedComponent executing...');

        const $componentElement = $(targetHost.configDefaults.markupTemplate);

        // Set the label text.
        $('.field-label-text', $componentElement).text(currentSettings.fieldLabelText || 'Field Label');

        // Show required indicator if the field is mandatory.
        if (currentSettings.isMandatory) {
            $('.required-indicator', $componentElement).text('*');
        } else {
            $('.required-indicator', $componentElement).text(''); // Ensure it's empty if not required.
        }

        // Set the initial value of the input field.
        $('.input-element-field', $componentElement).val(currentSettings.initialValue || '');

        // Set the description hint text.
        $('.field-hint-description', $componentElement).text(currentSettings.hintDescription || '');

        this._logDebug('_buildRenderedComponent executed.');
        return $componentElement;
    },

    /**
     * Creates and returns UI elements for language-specific settings.
     * @param {object} evt - The event object.
     * @param {object} formBuilderInstance - The form builder instance.
     * @returns {Array<jQuery>} An array of jQuery objects representing the UI sections.
     */
    _constructLocalizedConfigurationUI: function(evt, formBuilderInstance) {
        this._logDebug('_constructLocalizedConfigurationUI executing...');
        const targetHost = formBuilderInstance.target;
        const currentSettings = formBuilderInstance.componentSettings;

        // Guard against missing locale settings.
        if (!currentSettings) {
            this._logDebug('Error: currentSettings are missing for locale UI construction.');
            return [];
        }

        // Helper to update settings and component display.
        const updateComponentAndSettings = (val, propName, targetFinder, cssProp, updateName = false) => {
            if (formBuilderInstance.targetComponent) {
                const $target = formBuilderInstance.targetComponent.find(targetFinder);
                if (cssProp) $target.css(cssProp, val);
            }
            currentSettings[propName] = val;
            targetHost._updateSettings(formBuilderInstance.targetComponent);
            if (updateName) targetHost._updateName(formBuilderInstance.targetComponent, val);
        };

        // --- Label Input ---
        const $labelSection = targetHost._label({
            label: 'Field Label',
            name: 'field.label'
        }).append('<input type="text" id="field.label" />');
        $('input', $labelSection).val(currentSettings.fieldLabelText || '')
            .on('input propertychange', function() { // Use 'input' event for real-time updates.
                const inputVal = $(this).val();
                updateComponentAndSettings(inputVal, 'fieldLabelText', 'label span', null, true);
            });

        // --- Value Input ---
        const $valueInputSection = targetHost._label({
            label: 'Default Value',
            name: 'field.value'
        }).append('<input type="text" id="field.value" />');
        $('input', $valueInputSection).val(currentSettings.initialValue || '')
            .on('input propertychange', function() {
                const inputVal = $(this).val();
                updateComponentAndSettings(inputVal, 'initialValue', '.input-element-field', 'value');
            });

        // --- Description Textarea ---
        const $descriptionTextarea = targetHost._label({
            label: 'Hint Text',
            name: 'field.description'
        }).append('<textarea id="field.description" rows="2"></textarea>');
        $('textarea', $descriptionTextarea).val(currentSettings.hintDescription || '')
            .on('input propertychange', function() {
                const inputVal = $(this).val();
                updateComponentAndSettings(inputVal, 'hintDescription', '.field-hint-description', 'text');
            });

        // --- Font Style Controls ---
        const activeStyles = currentSettings.visualStyles;
        const globalFbStyles = targetHost._getFbLocalizedSettings().visualStyles;

        const effectiveFontFamily = activeStyles.fontFamilySetting !== 'default' ? activeStyles.fontFamilySetting : globalFbStyles.fontFamilySetting;
        const effectiveFontSize = activeStyles.fontSizeSetting !== 'default' ? activeStyles.fontSizeSetting : globalFbStyles.fontSizeSetting;

        const $fontStyleControls = targetHost._fontPanel({
            fontFamily: effectiveFontFamily,
            fontSize: effectiveFontSize,
            fontStyles: [
                activeStyles.fontActiveState.bold ? 1 : 0,
                activeStyles.fontActiveState.italic ? 1 : 0,
                activeStyles.fontActiveState.underline ? 1 : 0
            ], // Convert object back to array for _fontPanel, if it expects array.
            idPrefix: 'field.',
            nofieldset: true
        });

        // Event handlers for font style changes.
        const applyFontStyle = (cssProp, value, flagKey) => {
            formBuilderInstance.targetComponent.find('label, .input-element-field').css(cssProp, value);
            activeStyles.fontActiveState[flagKey] = (value === 'bold' || value === 'italic' || value === 'underline');
            targetHost._updateSettings(formBuilderInstance.targetComponent);
        };

        $("input[id$='field.bold']", $fontStyleControls).change(function() {
            const isChecked = this.checked;
            formBuilderInstance.targetComponent.find('label, .input-element-field').css('fontWeight', isChecked ? 'bold' : 'normal');
            activeStyles.fontActiveState.bold = isChecked;
            targetHost._updateSettings(formBuilderInstance.targetComponent);
        });
        $("input[id$='field.italic']", $fontStyleControls).change(function() {
            const isChecked = this.checked;
            formBuilderInstance.targetComponent.find('label, .input-element-field').css('fontStyle', isChecked ? 'italic' : 'normal');
            activeStyles.fontActiveState.italic = isChecked;
            targetHost._updateSettings(formBuilderInstance.targetComponent);
        });
        $("input[id$='field.underline']", $fontStyleControls).change(function() {
            const isChecked = this.checked;
            formBuilderInstance.targetComponent.find('label span, .input-element-field').css('textDecoration', isChecked ? 'underline' : 'none');
            activeStyles.fontActiveState.underline = isChecked;
            targetHost._updateSettings(formBuilderInstance.targetComponent);
        });

        $("input[id$='field.fontFamily']", $fontStyleControls).change(function() {
            const selectedVal = $(this).val();
            formBuilderInstance.targetComponent.css('fontFamily', selectedVal);
            formBuilderInstance.targetComponent.find('.input-element-field').css('fontFamily', selectedVal);
            activeStyles.fontFamilySetting = selectedVal;
            targetHost._updateSettings(formBuilderInstance.targetComponent);
        });

        $("select[id$='field.fontSize']", $fontStyleControls).change(function() {
            const selectedVal = $(this).val();
            // Ensure value is a number for CSS.
            const sizePx = parseFloat(selectedVal) + 'px';
            formBuilderInstance.targetComponent.find('label, .input-element-field').css('fontSize', sizePx);
            activeStyles.fontSizeSetting = selectedVal;
            targetHost._updateSettings(formBuilderInstance.targetComponent);
        });

        this._logDebug('_constructLocalizedConfigurationUI executed.');
        return [
            targetHost._twoColumns($labelSection, $valueInputSection),
            targetHost._oneColumn($descriptionTextarea),
            $fontStyleControls
        ];
    },

    /**
     * Creates and returns UI elements for general (non-localized) settings.
     * @param {object} evt - The event object.
     * @param {object} formBuilderInstance - The form builder instance.
     * @returns {Array<jQuery>} An array of jQuery objects representing the UI sections.
     */
    _constructGeneralConfigurationUI: function(evt, formBuilderInstance) {
        this._logDebug('_constructGeneralConfigurationUI executing...');
        const targetHost = formBuilderInstance.target;
        const currentSettings = formBuilderInstance.componentSettings;

        // --- Required Checkbox ---
        const $mandatoryCheckboxContainer = $('<div><input type="checkbox" id="field.isMandatory" />&nbsp;Required Field</div>');
        $('input', $mandatoryCheckboxContainer).prop('checked', currentSettings.isMandatory)
            .change(function() {
                const isChecked = this.checked;
                formBuilderInstance.targetComponent.find('.required-indicator').text(isChecked ? '*' : '');
                currentSettings.isMandatory = isChecked;
                targetHost._updateSettings(formBuilderInstance.targetComponent);
            });

        // --- Restriction Dropdown ---
        const $validationDropdownContainer = $(`
            <div>
                <select id="field.inputValidationRule" style="width: 99%">
                    <option value="none">Any character</option>
                    <option value="alphanum">Alphanumeric only</option>
                    <option value="lettersPunc">Letters or basic punctuation</option>
                    <option value="lettersOnly">Letters only</option>
                    <option value="digits">Digits only</option>
                </select>
            </div>
        `);
        $("select option[value='" + (currentSettings.inputValidationRule || 'none') + "']", $validationDropdownContainer).prop('selected', true);
        $('select', $validationDropdownContainer).change(function() {
            currentSettings.inputValidationRule = $(this).val();
            targetHost._log(`Input validation rule set to: ${currentSettings.inputValidationRule}`);
            targetHost._updateSettings(formBuilderInstance.targetComponent);
        });

        // Group required and restriction into a panel.
        const $generalValuePanel = targetHost._fieldset({
            text: 'Input Behavior'
        }).append(targetHost._twoColumns($mandatoryCheckboxContainer, $validationDropdownContainer));
        $('.col1', $generalValuePanel).css('width', '38%').removeClass('labelOnTop');
        $('.col2', $generalValuePanel).css('marginLeft', '40%').removeClass('labelOnTop');

        // --- Color Configuration Panel ---
        const $mainTextInputElement = formBuilderInstance.targetComponent.find('.input-element-field');
        const elementStyles = currentSettings.globalElementStyles;

        // Initialize default colors if they are 'default'.
        // This ensures the color picker reflects the actual computed style.
        if (elementStyles.valueElement.textColor === 'default') {
            elementStyles.valueElement.textColor = $mainTextInputElement.css('color');
        }
        if (elementStyles.valueElement.bgColor === 'default') {
            elementStyles.valueElement.bgColor = $mainTextInputElement.css('backgroundColor');
        }

        const $colorConfigPanel = targetHost._labelValueDescriptionColorPanel(elementStyles);

        // Helper for color updates.
        const updateColorSetting = (elementSelector, styleKey, colorProp, value, styleTarget = formBuilderInstance.targetComponent) => {
            styleTarget.find(elementSelector).css(colorProp, '#' + value);
            elementStyles[styleKey][colorProp === 'color' ? 'textColor' : 'bgColor'] = value;
            targetHost._updateSettings(formBuilderInstance.targetComponent);
        };

        // Event handlers for color changes.
        $("input[id$='field.label.color']", $colorConfigPanel).change(function() {
            updateColorSetting('label', 'labelElement', 'color', $(this).data('colorPicker').color);
        });
        $("input[id$='field.label.backgroundColor']", $colorConfigPanel).change(function() {
            updateColorSetting('label', 'labelElement', 'backgroundColor', $(this).data('colorPicker').color);
        });

        $("input[id$='field.value.color']", $colorConfigPanel).change(function() {
            updateColorSetting('.input-element-field', 'valueElement', 'color', $(this).data('colorPicker').color);
        });
        $("input[id$='field.value.backgroundColor']", $colorConfigPanel).change(function() {
            updateColorSetting('.input-element-field', 'valueElement', 'backgroundColor', $(this).data('colorPicker').color);
        });

        $("input[id$='field.description.color']", $colorConfigPanel).change(function() {
            updateColorSetting('.field-hint-description', 'descriptionElement', 'color', $(this).data('colorPicker').color);
        });
        $("input[id$='field.description.backgroundColor']", $colorConfigPanel).change(function() {
            updateColorSetting('.field-hint-description', 'descriptionElement', 'backgroundColor', $(this).data('colorPicker').color);
        });

        this._logDebug('_constructGeneralConfigurationUI executed.');
        return [$generalValuePanel, $colorConfigPanel];
    },

    /**
     * Applies locale-specific updates to the rendered component.
     * This is triggered when the form builder's language changes.
     * @param {object} evt - The event object.
     * @param {object} formBuilderInstance - The form builder instance.
     */
    _applyLocaleUpdates: function(evt, formBuilderInstance) {
        this._logDebug('_applyLocaleUpdates executing...');
        const targetHost = formBuilderInstance.target;
        const currentSettings = formBuilderInstance.componentSettings;
        const targetComponent = formBuilderInstance.targetComponent;

        // Retrieve effective styles, falling back to global defaults if 'default' is specified.
        const effectiveStyles = currentSettings.visualStyles;
        const globalFbStyles = targetHost._getFbLocalizedSettings().visualStyles;

        const fontFamilyToApply = effectiveStyles.fontFamilySetting !== 'default' ? effectiveStyles.fontFamilySetting : globalFbStyles.fontFamilySetting;
        const fontSizeToApply = effectiveStyles.fontSizeSetting !== 'default' ? effectiveStyles.fontSizeSetting : globalFbStyles.fontSizeSetting;

        // Determine font style properties based on boolean flags.
        const fontWeightToApply = effectiveStyles.fontActiveState.bold ? 'bold' : 'normal';
        const fontStyleToApply = effectiveStyles.fontActiveState.italic ? 'italic' : 'normal';
        const textDecorationToApply = effectiveStyles.fontActiveState.underline ? 'underline' : 'none';

        // Apply general component styles.
        targetComponent.css('fontFamily', fontFamilyToApply);

        // Update label text and styles.
        targetComponent.find('.field-label-text')
            .text(currentSettings.fieldLabelText || '')
            .css('textDecoration', textDecorationToApply);

        targetComponent.find('label')
            .css({
                'fontWeight': fontWeightToApply,
                'fontStyle': fontStyleToApply,
                'fontSize': fontSizeToApply + 'px'
            });

        // Update input field value and styles.
        targetComponent.find('.input-element-field')
            .val(currentSettings.initialValue || '')
            .css({
                'fontWeight': fontWeightToApply,
                'fontStyle': fontStyleToApply,
                'textDecoration': textDecorationToApply,
                'fontFamily': fontFamilyToApply,
                'fontSize': fontSizeToApply + 'px'
            });

        // Update description hint text.
        targetComponent.find('.field-hint-description')
            .text(currentSettings.hintDescription || '');

        this._logDebug('_applyLocaleUpdates executed.');
    }
});

// Register the component with the jQuery UI widget factory.
// This allows it to be instantiated as `$(element).fbTextInputComponent()`.
$.widget('fb.fbTextInputComponent', TextEntryComponentModule);