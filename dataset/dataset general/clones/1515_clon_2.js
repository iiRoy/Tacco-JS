/*
 * Application Builder - Basic Text Input Element.
 *
 * Revision ID: @REVISION_NUM
 * Component Version: @VERSION_TAG
 * Copyright (c) 2023 Acme Solutions Inc. (info@acmesolutions.com)
 *
 * Licensed under MIT License (https://opensource.org/licenses/MIT)
 *
 * Creation Date: 15-Mar-2023
 */
var AppTextEntry = $.extend( { }, $.app.appComponent.prototype, {

    config: { /* default configuration settings. values stored in component's prototype */
        name: 'Simple Text Input',
        belongsTo: $.app.formCreator.prototype.config._basicControlsPanel,
        _type: 'BasicTextInput',
        _html : '<div> <label> <em></em> <span></span> </label> \
                <input type="text" class="inputField" /> \
                <p class="assistNote"></p> </div>',
        _mainLabelField: 'mainCaption',
        _supportedLocales: [ 'eng', 'chn' ],
        preferences: {
            eng: {
                label: 'Simple Text Input',
                content: '',
                description: '',
                visuals: {
                    fontFamilyOption: 'standard', /* form builder standard */
                    fontSizeOption: 'standard',
                    fontStylesSetting: [ false, false, false ] /* bold, italic, underline */
                }
            },
            chn : {
                label: '单行文本框',
                content: '',
                description: '',
                visuals: {
                    fontFamilyOption: 'standard', /* form builder standard */
                    fontSizeOption: 'standard',
                    fontStylesSetting: [ false, false, false ] /* bold, italic, underline */
                }
            },
            _isPersistable: true,
            required: true,
            validationRule: 'none',
            visuals : {
                caption: {
                    color : 'standard',
                    backgroundColor : 'standard'
                },
                content: {
                    color : 'standard',
                    backgroundColor : 'standard'
                },
                hintText: {
                    color : '666666',
                    backgroundColor : 'standard'
                }
            }
        }
    },

    _initialize : function() {
        // calling base component initialization routine
        $.app.appComponent.prototype._initialize.call(this);
        // merge base component's configuration
        this.config = $.extend({}, $.app.appComponent.prototype.config, this.config);
    },

    _obtainControlElement : function(evt, formBld) {
        var $targetElement = $(formBld.target.config._html);
        formBld.target._writeLog('basicTextInput._obtainControlElement beginning...');
        $('label span', $targetElement).text(formBld.preferences.label);
        if (formBld._preferences.required) {
            $('label em', $targetElement).text('*');
        }
        $('input', $targetElement).val(formBld.preferences.content);
        $('.assistNote', $targetElement).text(formBld.preferences.description);
        formBld.target._writeLog('basicTextInput._obtainControlElement completed.');
        return $targetElement;
    },

    _retrieveLocalizedConfigurationSection : function(evt, formBld) {
        formBld.target._writeLog('basicTextInput._retrieveLocalizedConfigurationSection beginning...');
        var $captionControl = formBld.target._captionField({ caption: 'Caption', ref: 'element.caption' })
                                         .append('<input type="text" id="element.caption" />');
        $('input', $captionControl).val(formBld.preferences.label)
            .keyup(function(evt) {
                var newValue = $(this).val();
                formBld.item.find('label span').text(newValue);
                formBld.preferences.label = newValue;
                formBld.target._refreshSettings(formBld.item);
                formBld.target._updateElementName(formBld.item, newValue);
            });
        var $valueControl = formBld.target._captionField({ caption: 'Value', ref: 'element.value' })
                                        .append('<input type="text" id="element.value" />');
        $('input', $valueControl).val(formBld.preferences.content)
            .keyup(function(evt) {
                var newValue = $(this).val();
                formBld.item.find('.inputField').val(newValue);
                formBld.preferences.content = newValue;
                formBld.target._refreshSettings(formBld.item);
            });

        var $descriptionControl = formBld.target._captionField({ caption: 'Description', ref: 'element.description' })
                                            .append('<textarea id="element.description" rows="2"></textarea>');
        $('textarea', $descriptionControl).val(formBld.preferences.description)
            .keyup(function(evt) {
                var newValue = $(this).val();
                formBld.item.find('.assistNote').text(newValue);
                formBld.preferences.description = newValue;
                formBld.target._refreshSettings(formBld.item);
            });

        var elementVisuals = formBld.preferences.visuals;
        var bldrVisuals = formBld.target._getBuilderLocalizedConfig().visuals;
        var fontFamilySetting = elementVisuals.fontFamilyOption != 'standard' ? elementVisuals.fontFamilyOption : bldrVisuals.fontFamilyOption ;
        var fontSizeSetting = elementVisuals.fontSizeOption != 'standard' ? elementVisuals.fontSizeOption : bldrVisuals.fontSizeOption;
        var $fontStylePanel = formBld.target._fontStylePanel({ fontFamilyOption: fontFamilySetting, fontSizeOption: fontSizeSetting,
                                                               fontStylesSetting: elementVisuals.fontStylesSetting, idPrefix: 'element.', noFieldset: true });

        $("input[id$='element.bold']", $fontStylePanel).change(function(evt) {
            if ($(this).prop('checked')) {
                formBld.item.find('label').css('fontWeight', 'bold');
                formBld.item.find('.inputField').css('fontWeight', 'bold');
                elementVisuals.fontStylesSetting[0] = true;
            } else {
                formBld.item.find('label').css('fontWeight', 'normal');
                formBld.item.find('.inputField').css('fontWeight', 'normal');
                elementVisuals.fontStylesSetting[0] = false;
            }
            formBld.target._refreshSettings(formBld.item);
        });
        $("input[id$='element.italic']", $fontStylePanel).change(function(evt) {
            if ($(this).prop('checked')) {
                formBld.item.find('label').css('fontStyle', 'italic');
                formBld.item.find('.inputField').css('fontStyle', 'italic');
                elementVisuals.fontStylesSetting[1] = true;
            } else {
                formBld.item.find('label').css('fontStyle', 'normal');
                formBld.item.find('.inputField').css('fontStyle', 'normal');
                elementVisuals.fontStylesSetting[1] = false;
            }
            formBld.target._refreshSettings(formBld.item);
        });
        $("input[id$='element.underline']", $fontStylePanel).change(function(evt) {
            if ($(this).prop('checked')) {
                formBld.item.find('label span').css('textDecoration', 'underline');
                formBld.item.find('.inputField').css('textDecoration', 'underline');
                elementVisuals.fontStylesSetting[2] = true;
            } else {
                formBld.item.find('label span').css('textDecoration', 'none');
                formBld.item.find('.inputField').css('textDecoration', 'none');
                elementVisuals.fontStylesSetting[2] = false;
            }
            formBld.target._refreshSettings(formBld.item);
        });

        $("input[id$='element.fontFamily']", $fontStylePanel).change(function(evt) {
            var newValue = $(this).val();
            formBld.item.css('fontFamily', newValue);
            formBld.item.find('.inputField').css('fontFamily', newValue);
            elementVisuals.fontFamilyOption = newValue;
            formBld.target._refreshSettings(formBld.item);
        });

        $("select[id$='element.fontSize']", $fontStylePanel).change(function(evt) {
            var newValue = $(this).val();
            formBld.item.find('label').css('fontSize', newValue + 'px');
            formBld.item.find('.inputField').css('fontSize', newValue + 'px');
            elementVisuals.fontSizeOption = newValue;
            formBld.target._refreshSettings(formBld.item);
        });
        formBld.target._writeLog('basicTextInput._retrieveLocalizedConfigurationSection completed.');
        return [formBld.target._splitTwoColumns($captionControl, $valueControl), formBld.target._splitOneColumn($descriptionControl), $fontStylePanel];
    },

    _retrieveGeneralConfigurationSection : function(evt, formBld) {
        formBld.target._writeLog('basicTextInput._retrieveGeneralConfigurationSection beginning...');
        var $mandatoryOption = $('<div><input type="checkbox" id="element.mandatory" />&nbsp;Required Field</div>');
        var $validationRule = $('<div><select id="element.validation" style="width: 99%"> \
                                <option value="none">any character</option> \
                                <option value="alphaNumeric">alphanumeric only</option> \
                                <option value="lettersWithPunctuation">letters or punctuation only</option> \
                                <option value="lettersOnly">letters only</option> \
                                </select></div>');
        var $fieldControlsPanel = formBld.target._groupFields({ heading: 'Control Options'})
                                            .append(formBld.target._splitTwoColumns($mandatoryOption, $validationRule));
        $('.col1', $fieldControlsPanel).css('width', '32%').removeClass('labelOnTop');
        $('.col2', $fieldControlsPanel).css('marginLeft', '34%').removeClass('labelOnTop');

        $('input', $mandatoryOption).prop('checked', formBld.preferences.required)
            .change(function(evt) {
                if ($(this).prop('checked')) {
                    formBld.item.find('em').text('*');
                    formBld.preferences.required = true;
                } else {
                    formBld.item.find('em').text('');
                    formBld.preferences.required = false;
                }
                formBld.target._refreshSettings(formBld.item);
            });

        $("select option[value='" + formBld.preferences.validationRule + "']", $validationRule).prop('selected', true);
        $('select', $validationRule).change(function(evt) {
            formBld.preferences.validationRule = $(this).val();
            formBld.target._writeLog('formBld.preferences.validationRule = ' + formBld.preferences.validationRule);
            formBld.target._refreshSettings(formBld.item);
        });

        var $textEntryElement = formBld.item.find('.inputField');
        var elementVisuals = formBld.preferences.visuals;
        if (elementVisuals.content.color == 'standard') {
            elementVisuals.content.color = $textEntryElement.css('color');
        }
        if (elementVisuals.content.backgroundColor == 'standard') {
            elementVisuals.content.backgroundColor = $textEntryElement.css('backgroundColor');
        }
        var $visualsPanel = formBld.target._captionValueHintColorPanel(elementVisuals);

        $("input[id$='element.caption.color']", $visualsPanel).change(function(evt) {
            var chosenColor = $(this).data('colorPicker').color;
            formBld.item.css('color','#' + chosenColor);
            elementVisuals.caption.color = chosenColor;
            formBld.target._refreshSettings(formBld.item);
        });

        $("input[id$='element.caption.backgroundColor']", $visualsPanel).change(function(evt) {
            var chosenColor = $(this).data('colorPicker').color;
            formBld.item.css('backgroundColor','#' + chosenColor);
            elementVisuals.caption.backgroundColor = chosenColor;
            formBld.target._refreshSettings(formBld.item);
        });

        $("input[id$='element.value.color']", $visualsPanel).change(function(evt) {
            var chosenColor = $(this).data('colorPicker').color;
            $textEntryElement.css('color','#' + chosenColor);
            elementVisuals.content.color = chosenColor;
            formBld.target._refreshSettings(formBld.item);
        });

        $("input[id$='element.value.backgroundColor']", $visualsPanel).change(function(evt) {
            var chosenColor = $(this).data('colorPicker').color;
            $textEntryElement.css('backgroundColor','#' + chosenColor);
            elementVisuals.content.backgroundColor = chosenColor;
            formBld.target._refreshSettings(formBld.item);
        });

        $("input[id$='element.description.color']", $visualsPanel).change(function(evt) {
            var chosenColor = $(this).data('colorPicker').color;
            formBld.item.find('.assistNote').css('color','#' + chosenColor);
            elementVisuals.hintText.color = chosenColor;
            formBld.target._refreshSettings(formBld.item);
        });

        $("input[id$='element.description.backgroundColor']", $visualsPanel).change(function(evt) {
            var chosenColor = $(this).data('colorPicker').color;
            formBld.item.find('.assistNote').css('backgroundColor','#' + chosenColor);
            elementVisuals.hintText.backgroundColor = chosenColor;
            formBld.target._refreshSettings(formBld.item);
        });
        formBld.target._writeLog('basicTextInput._retrieveGeneralConfigurationSection completed.');
        return [$fieldControlsPanel, $visualsPanel];
    },

    _onLanguageSwitch : function(evt, formBld) {
        formBld.target._writeLog('basicTextInput._onLanguageSwitch beginning...');
        var elementVisuals = formBld.preferences.visuals;
        var bldrVisuals = formBld.target._getBuilderLocalizedConfig().visuals;
        var currentFontFamily = elementVisuals.fontFamilyOption != 'standard' ? elementVisuals.fontFamilyOption : bldrVisuals.fontFamilyOption;
        var currentFontSize = elementVisuals.fontSizeOption != 'standard' ? elementVisuals.fontSizeOption : bldrVisuals.fontSizeOption;
        var currentFontWeight = elementVisuals.fontStylesSetting[0] ? 'bold' : 'normal';
        var currentFontStyle = elementVisuals.fontStylesSetting[1] ? 'italic' : 'normal';
        var currentTextDecoration = elementVisuals.fontStylesSetting[2] ? 'underline' : 'none';

        formBld.item.css('fontFamily', currentFontFamily);
        formBld.item.find('label span').text(formBld.preferences.label)
            .css('textDecoration', currentTextDecoration);

        formBld.item.find('label').css('fontWeight', currentFontWeight)
            .css('fontStyle', currentFontStyle)
            .css('fontSize', currentFontSize + 'px');

        formBld.item.find('.inputField').val(formBld.preferences.content)
            .css('fontWeight', currentFontWeight)
            .css('fontStyle', currentFontStyle)
            .css('textDecoration', currentTextDecoration)
            .css('fontFamily', currentFontFamily)
            .css('fontSize', currentFontSize + 'px');

        formBld.item.find('.assistNote').text(formBld.preferences.description);

        formBld.target._writeLog('basicTextInput._onLanguageSwitch completed.');
    }
});

$.widget('app.appBasicTextInput', AppTextEntry);