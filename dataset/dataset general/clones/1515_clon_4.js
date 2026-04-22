const generalWidgetUtilities = {
    logActivity: (message) => console.log(`Component Log: ${message}`),
    createInputLabelDiv: (config) => {
        const wrapperElement = document.createElement('div');
        const labelElement = document.createElement('label');
        labelElement.textContent = config.displayLabel;
        labelElement.setAttribute('for', config.inputIdentifier);
        wrapperElement.appendChild(labelElement);
        return wrapperElement;
    },
    layoutTwoColumns: (elementOne, elementTwo) => {
        const containerDiv = document.createElement('div');
        containerDiv.classList.add('column-division');
        const firstColumn = document.createElement('div');
        firstColumn.classList.add('column-primary');
        firstColumn.appendChild(elementOne);
        const secondColumn = document.createElement('div');
        secondColumn.classList.add('column-secondary');
        secondColumn.appendChild(elementTwo);
        containerDiv.appendChild(firstColumn);
        containerDiv.appendChild(secondColumn);
        return containerDiv;
    },
    layoutOneColumn: (element) => {
        const containerDiv = document.createElement('div');
        containerDiv.classList.add('column-division');
        const singleColumn = document.createElement('div');
        singleColumn.classList.add('column-full');
        singleColumn.appendChild(element);
        containerDiv.appendChild(singleColumn);
        return containerDiv;
    },
    createSectionPanel: (config) => {
        const fieldsetElement = document.createElement('fieldset');
        const legendElement = document.createElement('legend');
        legendElement.textContent = config.text;
        fieldsetElement.appendChild(legendElement);
        return fieldsetElement;
    },
    generateTextStylingControls: (config) => {
        const controlPanel = document.createElement('div');
        controlPanel.classList.add('text-style-controls');

        const createCheckboxControl = (idSuffix, labelText, initialCheckedState) => {
            const div = document.createElement('div');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = `${config.prefix || ''}${idSuffix}`;
            input.checked = initialCheckedState;
            const label = document.createElement('label');
            label.setAttribute('for', input.id);
            label.textContent = labelText;
            div.appendChild(input);
            div.appendChild(label);
            return div;
        };

        controlPanel.appendChild(createCheckboxControl('boldToggle', 'Bold', config.textDecorations[0] === 1));
        controlPanel.appendChild(createCheckboxControl('italicToggle', 'Italic', config.textDecorations[1] === 1));
        controlPanel.appendChild(createCheckboxControl('underlineToggle', 'Underline', config.textDecorations[2] === 1));

        const createTextInputControl = (idSuffix, labelText, initialValue) => {
            const div = document.createElement('div');
            const label = document.createElement('label');
            label.textContent = labelText;
            label.setAttribute('for', `${config.prefix || ''}${idSuffix}`);
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `${config.prefix || ''}${idSuffix}`;
            input.value = initialValue;
            div.appendChild(label);
            div.appendChild(input);
            return div;
        };
        controlPanel.appendChild(createTextInputControl('typeface', 'Font Family', config.typeface));

        const createSelectControl = (idSuffix, labelText, optionsArray, initialValue) => {
            const div = document.createElement('div');
            const label = document.createElement('label');
            label.textContent = labelText;
            label.setAttribute('for', `${config.prefix || ''}${idSuffix}`);
            const select = document.createElement('select');
            select.id = `${config.prefix || ''}${idSuffix}`;
            optionsArray.forEach(optVal => {
                const option = document.createElement('option');
                option.value = optVal;
                option.textContent = optVal + 'px';
                if (String(optVal) === String(initialValue)) option.selected = true;
                select.appendChild(option);
            });
            div.appendChild(label);
            div.appendChild(select);
            return div;
        };
        controlPanel.appendChild(createSelectControl('textDimension', 'Font Size', ['12', '14', '16', '18', '20'], config.textDimension));

        return controlPanel;
    },
    generateColorStylingControls: (settingsData) => {
        const controlPanel = document.createElement('div');
        controlPanel.classList.add('color-style-controls');

        const createColorInputControl = (idSuffix, labelText, initialColor) => {
            const div = document.createElement('div');
            const label = document.createElement('label');
            label.textContent = labelText;
            label.setAttribute('for', `field.${idSuffix}`);
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `field.${idSuffix}`;
            input.value = initialColor === 'default' ? '' : initialColor;
            input.dataset.colorPicker = JSON.stringify({ color: initialColor === 'default' ? '000000' : initialColor }); // Simulate color picker data
            div.appendChild(label);
            div.appendChild(input);
            return div;
        };

        controlPanel.appendChild(createColorInputControl('displayLabel.color', 'Label Text Color', settingsData.displayLabel.color));
        controlPanel.appendChild(createColorInputControl('displayLabel.backgroundColor', 'Label Background Color', settingsData.displayLabel.backgroundColor));
        controlPanel.appendChild(createColorInputControl('currentValue.color', 'Input Text Color', settingsData.currentValue.color));
        controlPanel.appendChild(createColorInputControl('currentValue.backgroundColor', 'Input Background Color', settingsData.currentValue.backgroundColor));
        controlPanel.appendChild(createColorInputControl('hintText.color', 'Description Text Color', settingsData.hintText.color));
        controlPanel.appendChild(createColorInputControl('hintText.backgroundColor', 'Description Background Color', settingsData.hintText.backgroundColor));

        return controlPanel;
    },
    rgbToHex: (rgbString) => {
        if (!rgbString || rgbString === 'default') return 'FFFFFF';
        const match = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match) return 'FFFFFF';
        const toHex = (c) => ('0' + parseInt(c).toString(16)).slice(-2);
        return toHex(match[1]) + toHex(match[2]) + toHex(match[3]);
    }
};

function deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, {
                    [key]: {}
                });
                deepMerge(target[key], source[key]);
            } else if (Array.isArray(source[key])) { // Handle arrays specifically for cloning
                Object.assign(target, {
                    [key]: [...source[key]]
                });
            } else {
                Object.assign(target, {
                    [key]: source[key]
                });
            }
        }
    }
    return deepMerge(target, ...sources);
}

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

const TextInputComponent = (function() {

    const componentSpecificDefaults = {
        componentName: 'Single Line Input',
        panelAssignment: 'standardFieldsSection',
        componentType: 'LineInput',
        displayTemplateHTML: '<div><label><em></em><span></span></label><input type="text" class="textEntryField" /><p class="guidanceText"></p></div>',
        focusField: 'displayLabel',
        supportedLocales: ['en', 'zh_CN'],
        localeSettings: {
            english: {
                displayLabel: 'Single Line Text',
                currentValue: '',
                hintText: '',
                visualStyles: {
                    typeface: 'default',
                    textDimension: 'default',
                    textDecorations: [0, 0, 0]
                }
            },
            chineseSimplified: {
                displayLabel: '单行文字输入',
                currentValue: '',
                hintText: '',
                visualStyles: {
                    typeface: 'default',
                    textDimension: 'default',
                    textDecorations: [0, 0, 0]
                }
            },
            isPersistable: true,
            isRequired: true,
            inputConstraint: 'no',
            visualStyles: {
                displayLabel: {
                    color: 'default',
                    backgroundColor: 'default'
                },
                currentValue: {
                    color: 'default',
                    backgroundColor: 'default'
                },
                hintText: {
                    color: '777777',
                    backgroundColor: 'default'
                }
            }
        }
    };

    function createInstance(baseWidgetInterface, builderHostServices) {
        const instance = {};

        instance.widgetConfig = deepMerge({}, baseWidgetInterface.baseOptions || {}, componentSpecificDefaults);

        instance.initializeComponent = function() {
            baseWidgetInterface.logActivity('Initializing TextInputComponent...');
        };

        instance.buildDisplayElement = function(context) {
            const rootContainer = document.createElement('div');
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = instance.widgetConfig.displayTemplateHTML;
            const content = tempDiv.firstChild;
            rootContainer.appendChild(content);

            baseWidgetInterface.logActivity('TextInputComponent.buildDisplayElement executing...');

            const labelSpan = rootContainer.querySelector('label span');
            if (labelSpan) labelSpan.textContent = context.currentSettings.displayLabel;

            const labelEm = rootContainer.querySelector('label em');
            if (labelEm && context.currentSettings.isRequired) {
                labelEm.textContent = '*';
            }

            const textEntryField = rootContainer.querySelector('.textEntryField');
            if (textEntryField) textEntryField.value = context.currentSettings.currentValue;

            const guidanceText = rootContainer.querySelector('.guidanceText');
            if (guidanceText) guidanceText.textContent = context.currentSettings.hintText;

            baseWidgetInterface.logActivity('TextInputComponent.buildDisplayElement executed.');
            return rootContainer;
        };

        instance.constructLocaleSettingsView = function(context) {
            baseWidgetInterface.logActivity('TextInputComponent.constructLocaleSettingsView executing...');
            const currentComponentSettings = context.currentSettings;

            const labelControl = generalWidgetUtilities.createInputLabelDiv({
                displayLabel: 'Label',
                inputIdentifier: 'field.displayLabel'
            });
            const labelInput = document.createElement('input');
            labelInput.type = 'text';
            labelInput.id = 'field.displayLabel';
            labelInput.value = currentComponentSettings.displayLabel;
            labelControl.appendChild(labelInput);
            labelInput.addEventListener('keyup', (evt) => {
                const updatedValue = evt.target.value;
                const targetLabelSpan = context.activeElement.querySelector('label span');
                if (targetLabelSpan) targetLabelSpan.textContent = updatedValue;
                currentComponentSettings.displayLabel = updatedValue;
                builderHostServices.notifyDataUpdate(context.activeElement);
                builderHostServices.notifyNameUpdate(context.activeElement, updatedValue);
            });

            const valueControl = generalWidgetUtilities.createInputLabelDiv({
                displayLabel: 'Value',
                inputIdentifier: 'field.currentValue'
            });
            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.id = 'field.currentValue';
            valueInput.value = currentComponentSettings.currentValue;
            valueControl.appendChild(valueInput);
            valueInput.addEventListener('keyup', (evt) => {
                const updatedValue = evt.target.value;
                const targetTextInput = context.activeElement.querySelector('.textEntryField');
                if (targetTextInput) targetTextInput.value = updatedValue;
                currentComponentSettings.currentValue = updatedValue;
                builderHostServices.notifyDataUpdate(context.activeElement);
            });

            const descriptionControl = generalWidgetUtilities.createInputLabelDiv({
                displayLabel: 'Description',
                inputIdentifier: 'field.hintText'
            });
            const descriptionTextarea = document.createElement('textarea');
            descriptionTextarea.id = 'field.hintText';
            descriptionTextarea.rows = 2;
            descriptionTextarea.value = currentComponentSettings.hintText;
            descriptionControl.appendChild(descriptionTextarea);
            descriptionTextarea.addEventListener('keyup', (evt) => {
                const updatedValue = evt.target.value;
                const targetHint = context.activeElement.querySelector('.guidanceText');
                if (targetHint) targetHint.textContent = updatedValue;
                currentComponentSettings.hintText = updatedValue;
                builderHostServices.notifyDataUpdate(context.activeElement);
            });

            const currentStyles = currentComponentSettings.visualStyles;
            const builderStyles = builderHostServices.getMasterLocalizedSettings().visualStyles;
            const effectiveTypeface = currentStyles.typeface !== 'default' ? currentStyles.typeface : builderStyles.typeface;
            const effectiveTextDimension = currentStyles.textDimension !== 'default' ? currentStyles.textDimension : builderStyles.textDimension;

            const fontControlPanel = generalWidgetUtilities.generateTextStylingControls({
                typeface: effectiveTypeface,
                textDimension: effectiveTextDimension,
                textDecorations: currentStyles.textDecorations,
                prefix: 'field.'
            });

            const boldToggle = fontControlPanel.querySelector("input[id$='field.boldToggle']");
            if (boldToggle) boldToggle.addEventListener('change', (evt) => {
                const isChecked = evt.target.checked;
                const labelElement = context.activeElement.querySelector('label');
                const textInput = context.activeElement.querySelector('.textEntryField');
                if (labelElement) labelElement.style.fontWeight = isChecked ? 'bold' : 'normal';
                if (textInput) textInput.style.fontWeight = isChecked ? 'bold' : 'normal';
                currentStyles.textDecorations[0] = isChecked ? 1 : 0;
                builderHostServices.notifyDataUpdate(context.activeElement);
            });

            const italicToggle = fontControlPanel.querySelector("input[id$='field.italicToggle']");
            if (italicToggle) italicToggle.addEventListener('change', (evt) => {
                const isChecked = evt.target.checked;
                const labelElement = context.activeElement.querySelector('label');
                const textInput = context.activeElement.querySelector('.textEntryField');
                if (labelElement) labelElement.style.fontStyle = isChecked ? 'italic' : 'normal';
                if (textInput) textInput.style.fontStyle = isChecked ? 'italic' : 'normal';
                currentStyles.textDecorations[1] = isChecked ? 1 : 0;
                builderHostServices.notifyDataUpdate(context.activeElement);
            });

            const underlineToggle = fontControlPanel.querySelector("input[id$='field.underlineToggle']");
            if (underlineToggle) underlineToggle.addEventListener('change', (evt) => {
                const isChecked = evt.target.checked;
                const labelSpan = context.activeElement.querySelector('label span');
                const textInput = context.activeElement.querySelector('.textEntryField');
                if (labelSpan) labelSpan.style.textDecoration = isChecked ? 'underline' : 'none';
                if (textInput) textInput.style.textDecoration = isChecked ? 'underline' : 'none';
                currentStyles.textDecorations[2] = isChecked ? 1 : 0;
                builderHostServices.notifyDataUpdate(context.activeElement);
            });

            const fontFamilyInput = fontControlPanel.querySelector("input[id$='field.typeface']");
            if (fontFamilyInput) fontFamilyInput.addEventListener('change', (evt) => {
                const updatedValue = evt.target.value;
                context.activeElement.style.fontFamily = updatedValue;
                const textInput = context.activeElement.querySelector('.textEntryField');
                if (textInput) textInput.style.fontFamily = updatedValue;
                currentStyles.typeface = updatedValue;
                builderHostServices.notifyDataUpdate(context.activeElement);
            });

            const fontSizeSelect = fontControlPanel.querySelector("select[id$='field.textDimension']");
            if (fontSizeSelect) fontSizeSelect.addEventListener('change', (evt) => {
                const updatedValue = evt.target.value;
                const labelElement = context.activeElement.querySelector('label');
                const textInput = context.activeElement.querySelector('.textEntryField');
                if (labelElement) labelElement.style.fontSize = updatedValue + 'px';
                if (textInput) textInput.style.fontSize = updatedValue + 'px';
                currentStyles.textDimension = updatedValue;
                builderHostServices.notifyDataUpdate(context.activeElement);
            });

            baseWidgetInterface.logActivity('TextInputComponent.constructLocaleSettingsView executed.');
            return [
                generalWidgetUtilities.layoutTwoColumns(labelControl, valueControl),
                generalWidgetUtilities.layoutOneColumn(descriptionControl),
                fontControlPanel
            ];
        };

        instance.constructGeneralSettingsView = function(context) {
            baseWidgetInterface.logActivity('TextInputComponent.constructGeneralSettingsView executing...');
            const currentComponentSettings = context.currentSettings;

            const requiredCheckboxDiv = document.createElement('div');
            const requiredInput = document.createElement('input');
            requiredInput.type = 'checkbox';
            requiredInput.id = 'field.isRequired';
            requiredCheckboxDiv.appendChild(requiredInput);
            requiredCheckboxDiv.appendChild(document.createTextNode(' Required'));

            const restrictionSelectDiv = document.createElement('div');
            const restrictionSelect = document.createElement('select');
            restrictionSelect.id = 'field.inputConstraint';
            restrictionSelect.style.width = '99%';
            const options = [{
                value: 'no',
                text: 'any character'
            }, {
                value: 'alphanumeric',
                text: 'alphanumeric only'
            }, {
                value: 'letterswithbasicpunc',
                text: 'letters or punctuation only'
            }, {
                value: 'lettersonly',
                text: 'letters only'
            }];
            options.forEach(opt => {
                const optionElem = document.createElement('option');
                optionElem.value = opt.value;
                optionElem.textContent = opt.text;
                restrictionSelect.appendChild(optionElem);
            });
            restrictionSelectDiv.appendChild(restrictionSelect);

            const valueSettingsPanel = generalWidgetUtilities.createSectionPanel({
                text: 'Value'
            });
            const twoCols = generalWidgetUtilities.layoutTwoColumns(requiredCheckboxDiv, restrictionSelectDiv);
            valueSettingsPanel.appendChild(twoCols);

            requiredInput.checked = currentComponentSettings.isRequired;
            requiredInput.addEventListener('change', (evt) => {
                const isChecked = evt.target.checked;
                const emphasisElement = context.activeElement.querySelector('em');
                if (emphasisElement) emphasisElement.textContent = isChecked ? '*' : '';
                currentComponentSettings.isRequired = isChecked;
                builderHostServices.notifyDataUpdate(context.activeElement);
            });

            const selectedRestrictionOption = restrictionSelect.querySelector(`option[value='${currentComponentSettings.inputConstraint}']`);
            if (selectedRestrictionOption) selectedRestrictionOption.selected = true;
            restrictionSelect.addEventListener('change', (evt) => {
                currentComponentSettings.inputConstraint = evt.target.value;
                baseWidgetInterface.logActivity('currentComponentSettings.inputConstraint = ' + currentComponentSettings.inputConstraint);
                builderHostServices.notifyDataUpdate(context.activeElement);
            });

            const textInputElement = context.activeElement.querySelector('.textEntryField');
            const visualStyles = currentComponentSettings.visualStyles;
            if (visualStyles.currentValue.color === 'default') {
                visualStyles.currentValue.color = textInputElement ? generalWidgetUtilities.rgbToHex(getComputedStyle(textInputElement).color) : '000000';
            }
            if (visualStyles.currentValue.backgroundColor === 'default') {
                visualStyles.currentValue.backgroundColor = textInputElement ? generalWidgetUtilities.rgbToHex(getComputedStyle(textInputElement).backgroundColor) : 'FFFFFF';
            }

            const colorSettingsPanel = generalWidgetUtilities.generateColorStylingControls(visualStyles);

            const attachColorChangeListener = (idSuffix, targetElementGetter, styleProp, settingPath) => {
                const inputElement = colorSettingsPanel.querySelector(`input[id$='field.${idSuffix}']`);
                if (inputElement) {
                    inputElement.addEventListener('change', (evt) => {
                        const colorValue = JSON.parse(evt.target.dataset.colorPicker || '{}').color || evt.target.value;
                        const elementToStyle = targetElementGetter(context.activeElement);
                        if (elementToStyle) elementToStyle.style[styleProp] = '#' + colorValue;

                        const pathParts = settingPath.split('.');
                        let currentSetting = visualStyles;
                        for (let i = 0; i < pathParts.length - 1; i++) {
                            currentSetting = currentSetting[pathParts[i]];
                        }
                        currentSetting[pathParts[pathParts.length - 1]] = colorValue;

                        builderHostServices.notifyDataUpdate(context.activeElement);
                    });
                }
            };

            attachColorChangeListener('displayLabel.color', (el) => el, 'color', 'displayLabel.color');
            attachColorChangeListener('displayLabel.backgroundColor', (el) => el, 'backgroundColor', 'displayLabel.backgroundColor');
            attachColorChangeListener('currentValue.color', (el) => el.querySelector('.textEntryField'), 'color', 'currentValue.color');
            attachColorChangeListener('currentValue.backgroundColor', (el) => el.querySelector('.textEntryField'), 'backgroundColor', 'currentValue.backgroundColor');
            attachColorChangeListener('hintText.color', (el) => el.querySelector('.guidanceText'), 'color', 'hintText.color');
            attachColorChangeListener('hintText.backgroundColor', (el) => el.querySelector('.guidanceText'), 'backgroundColor', 'hintText.backgroundColor');

            baseWidgetInterface.logActivity('TextInputComponent.constructGeneralSettingsView executed.');
            return [valueSettingsPanel, colorSettingsPanel];
        };

        instance.updateForLocaleChange = function(context) {
            baseWidgetInterface.logActivity('TextInputComponent.updateForLocaleChange executing...');
            const currentStyles = context.currentSettings.visualStyles;
            const builderStyles = builderHostServices.getMasterLocalizedSettings().visualStyles;

            const effectiveTypeface = currentStyles.typeface !== 'default' ? currentStyles.typeface : builderStyles.typeface;
            const effectiveTextDimension = currentStyles.textDimension !== 'default' ? currentStyles.textDimension : builderStyles.textDimension;
            const fontWeight = currentStyles.textDecorations[0] === 1 ? 'bold' : 'normal';
            const fontStyle = currentStyles.textDecorations[1] === 1 ? 'italic' : 'normal';
            const textDecoration = currentStyles.textDecorations[2] === 1 ? 'underline' : 'none';

            context.activeElement.style.fontFamily = effectiveTypeface;

            const labelSpan = context.activeElement.querySelector('label span');
            if (labelSpan) {
                labelSpan.textContent = context.currentSettings.displayLabel;
                labelSpan.style.textDecoration = textDecoration;
            }

            const labelElement = context.activeElement.querySelector('label');
            if (labelElement) {
                labelElement.style.fontWeight = fontWeight;
                labelElement.style.fontStyle = fontStyle;
                labelElement.style.fontSize = effectiveTextDimension + 'px';
            }

            const textEntryField = context.activeElement.querySelector('.textEntryField');
            if (textEntryField) {
                textEntryField.value = context.currentSettings.currentValue;
                textEntryField.style.fontWeight = fontWeight;
                textEntryField.style.fontStyle = fontStyle;
                textEntryField.style.textDecoration = textDecoration;
                textEntryField.style.fontFamily = effectiveTypeface;
                textEntryField.style.fontSize = effectiveTextDimension + 'px';
            }

            const guidanceText = context.activeElement.querySelector('.guidanceText');
            if (guidanceText) guidanceText.textContent = context.currentSettings.hintText;

            baseWidgetInterface.logActivity('TextInputComponent.updateForLocaleChange executed.');
        };

        return instance;
    }

    return createInstance;

})();