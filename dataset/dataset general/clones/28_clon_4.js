(function (creationFunction) {
    if (typeof exports === "object") {
        module.exports = creationFunction(module.exports,
                                         require("underscore"),
                                         require("backbone"));
    } else {
        creationFunction(this, this._, this.Backbone);
    }
}(function (globalScope, utilToolkit, modelFramework) {
    "use strict";

    var nonPrint = "\t\n\v\f\r \xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";
    var startWhitespacePattern = new RegExp("^[" + nonPrint + "]+");
    var endWhitespacePattern = new RegExp("[" + nonPrint + "]+$");

    if (!String.prototype.trim || nonPrint.trim()) {
        String.prototype.trim = function () {
            if (this == null) {
                throw new TypeError("cannot operate on " + this);
            }
            var initialStr = String(this);
            var startIndex = initialStr.match(startWhitespacePattern);
            startIndex = startIndex ? startIndex[0].length : 0;

            var endIndex = initialStr.match(endWhitespacePattern);
            endIndex = endIndex ? initialStr.length - endIndex[0].length : initialStr.length;

            if (startIndex >= endIndex) return "";
            return initialStr.substring(startIndex, endIndex);
        };
    }

    function prefixFill(inputVal, totalLen, fillChar) {
        var stringifiedVal = String(inputVal);
        var currentLength = stringifiedVal.length;
        var neededPadding = totalLen - currentLength;
        if (neededPadding <= 0) {
            return stringifiedVal;
        }
        var paddingArr = new Array(neededPadding + 1);
        var padding = paddingArr.join(fillChar);
        return padding + stringifiedVal;
    }

    var TabularDisplay = (function() {
        var baseObject = {};
        var extensionModules = {};

        function checkIsString(val) { return typeof val === 'string'; }
        function checkIsUndefined(val) { return typeof val === 'undefined'; }
        function checkIsFunction(val) { return typeof val === 'function'; }
        function checkIsNumber(val) { return typeof val === 'number'; }
        function checkIsNaN(val) { return isNaN(val); }

        function mapSymbolToType(alias, postFix) {
            if (checkIsString(alias)) {
                var composedKey = alias.split('-').map(function(part) {
                    return part.charAt(0).toUpperCase() + part.slice(1);
                }).join('') + postFix;
                var foundType = baseObject[composedKey] || extensionModules[composedKey];
                if (checkIsUndefined(foundType)) {
                    throw new ReferenceError("Component '" + composedKey + "' not located");
                }
                return foundType;
            }
            return alias;
        }

        function executeIfFunction() {
            var target = arguments[0];
            if (!checkIsFunction(target)) return target;

            var contextRef = arguments[1];
            var argsList = Array.prototype.slice.call(arguments, 2);
            return target.apply(contextRef, argsList.length > 0 ? argsList : undefined);
        }

        baseObject.LIB_VERSION = "0.3.0";
        baseObject.EXTENSIONS = extensionModules;
        baseObject.findTypeByName = mapSymbolToType;
        baseObject.invokeDynamic = executeIfFunction;

        var eventMethods = ['on', 'off', 'trigger', 'listenTo', 'stopListening', 'once', 'listenToOnce'];
        eventMethods.forEach(function(methodName) {
            if (modelFramework.Events[methodName]) {
                baseObject[methodName] = modelFramework.Events[methodName];
            }
        });

        return baseObject;
    })();

    var $display = modelFramework.$;
    globalScope.TabularDisplay = TabularDisplay;

    function InputInterpreter(eventPayload) {
        this.isAltPressed = !!eventPayload.altKey;
        this.inputChar = eventPayload["char"];
        this.charId = eventPayload.charCode;
        this.isControlPressed = !!eventPayload.ctrlKey;
        this.keyName = eventPayload.key;
        this.triggerCode = eventPayload.keyCode;
        this.localeId = eventPayload.locale;
        this.position = eventPayload.location;
        this.isMetaPressed = !!eventPayload.metaKey;
        this.isRepeated = !!eventPayload.repeat;
        this.isShiftPressed = !!eventPayload.shiftKey;
        this.actionId = eventPayload.which;
    }

    InputInterpreter.prototype = {
        constructor: InputInterpreter,
        upArrowPressed: function() { return this.triggerCode === 38; },
        downArrowPressed: function() { return this.triggerCode === 40; },
        leftShiftTab: function() { return this.isShiftPressed && this.triggerCode === 9; },
        rightTab: function() { return !this.isShiftPressed && this.triggerCode === 9; },
        confirmAction: function() { return this.triggerCode === 13; },
        abortAction: function() { return this.triggerCode === 27; },
        noSpecificAction: function() {
            return !(this.upArrowPressed() || this.downArrowPressed() || this.leftShiftTab() ||
                     this.rightTab() || this.confirmAction() || this.abortAction());
        }
    };
    TabularDisplay.KeyAction = InputInterpreter;

    function ValueTranslator() { /* Empty constructor */ }

    ValueTranslator.prototype = {
        constructor: ValueTranslator,
        displayValue: function(sourceData, dataModel) {
            return sourceData;
        },
        modelValue: function(formattedInput, dataModel) {
            return formattedInput;
        }
    };
    TabularDisplay.ValueTranslator = ValueTranslator;

    function NumericPresenter(settings) {
        this.config = Object.assign({}, NumericPresenter.prototype.defaultSettings, settings || {});

        if (this.config.precisionDigits < 0 || this.config.precisionDigits > 20) {
            throw new RangeError("precisionDigits must be between 0 and 20");
        }
    }

    NumericPresenter.prototype = Object.create(ValueTranslator.prototype);
    NumericPresenter.prototype.constructor = NumericPresenter;

    Object.assign(NumericPresenter.prototype, {
        defaultSettings: {
            precisionDigits: 2,
            pointMark: '.',
            groupMark: ','
        },

        displayValue: function(numValue, dataModel) {
            if (numValue == null) return '';

            var roundedNum = numValue;
            var factor = Math.pow(10, this.config.precisionDigits);
            roundedNum = Math.round(numValue * factor) / factor;

            var stringNum = String(roundedNum);
            var parts = stringNum.split('.');
            var integerSegment = parts[0];
            var fractionalSegment = parts[1] || '';

            if (this.config.precisionDigits > 0) {
                if (fractionalSegment.length < this.config.precisionDigits) {
                    fractionalSegment = fractionalSegment + (new Array(this.config.precisionDigits - fractionalSegment.length + 1)).join('0');
                } else if (fractionalSegment.length > this.config.precisionDigits) {
                    fractionalSegment = fractionalSegment.substring(0, this.config.precisionDigits);
                }
            } else {
                 fractionalSegment = '';
            }

            var fullFraction = fractionalSegment ? (this.config.pointMark || '.') + fractionalSegment : '';

            var groupedInteger = '';
            var firstGroupLength = integerSegment.length % 3;
            if (firstGroupLength === 0 && integerSegment.length > 0) firstGroupLength = 3;

            if (firstGroupLength > 0) {
                groupedInteger += integerSegment.substring(0, firstGroupLength);
            }
            for (var i = firstGroupLength; i < integerSegment.length; i += 3) {
                groupedInteger += this.config.groupMark + integerSegment.substring(i, i + 3);
            }

            return groupedInteger + fullFraction;
        },

        modelValue: function(inputString, dataModel) {
            inputString = inputString.trim();

            if (inputString === '') return null;

            var cleanedString = '';
            var groupSegments = inputString.split(this.config.groupMark);
            for (var i = 0; i < groupSegments.length; i++) {
                cleanedString += groupSegments[i];
            }

            var decimalSegments = cleanedString.split(this.config.pointMark);
            if (decimalSegments.length > 2) return undefined;

            var finalRawString = decimalSegments[0];
            if (decimalSegments.length === 2) {
                finalRawString += '.' + decimalSegments[1];
            }

            var numericResult = parseFloat(finalRawString);
            if (!checkIsNumber(numericResult) || checkIsNaN(numericResult)) return undefined;

            var factor = Math.pow(10, this.config.precisionDigits);
            numericResult = Math.round(numericResult * factor) / factor;

            return numericResult;
        }
    });
    TabularDisplay.NumericPresenter = NumericPresenter;

    function PercentageProcessor() {
        NumericPresenter.apply(this, arguments);
    }

    PercentageProcessor.prototype = Object.create(NumericPresenter.prototype);
    PercentageProcessor.prototype.constructor = PercentageProcessor;

    Object.assign(PercentageProcessor.prototype, {
        defaultSettings: Object.assign({}, NumericPresenter.prototype.defaultSettings, {
            conversionFactor: 1,
            unitSign: "%"
        }),

        displayValue: function(initialValue, dataModel) {
            var modifiedValue = initialValue * this.config.conversionFactor;
            var argsForParent = [modifiedValue, dataModel];
            var formattedString = NumericPresenter.prototype.displayValue.apply(this, argsForParent);
            if (formattedString == null || formattedString === '') formattedString = "0";

            return formattedString + this.config.unitSign;
        },

        modelValue: function(inputStringWithSign, dataModel) {
            var signSplit = inputStringWithSign.split(this.config.unitSign);
            if (signSplit.length === 2 && (signSplit[1] === "" || signSplit[1] == null)) {
                var rawNumeric = NumericPresenter.prototype.modelValue.call(this, signSplit[0], dataModel);
                if (rawNumeric === undefined) return rawNumeric;
                return rawNumeric / this.config.conversionFactor;
            }
            return undefined;
        }
    });
    TabularDisplay.PercentageProcessor = PercentageProcessor;

    function TemporalConverter(params) {
        this.settings = Object.assign({}, TemporalConverter.prototype.defaultSettings, params || {});

        if (!this.settings.showDate && !this.settings.showTime) {
            throw new Error("Either showDate or showTime must be true");
        }
    }

    TemporalConverter.prototype = Object.create(ValueTranslator.prototype);
    TemporalConverter.prototype.constructor = TemporalConverter;

    Object.assign(TemporalConverter.prototype, {
        defaultSettings: {
            showDate: true,
            showTime: true,
            showMilliseconds: false
        },

        dateExtractionPattern: /^([+\-]?\d{4})-(\d{2})-(\d{2})$/,
        timeExtractionPattern: /^(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?$/,
        isoSeparatorPattern: /[T Z]+/,

        processTimestamp: function(sourceValue, validateOnly) {
            if ((sourceValue + '').trim() === '') return null;

            var parsedDateStr, parsedTimeStr = null;
            if (checkIsNumber(sourceValue)) {
                var dtObj = new Date(sourceValue);
                parsedDateStr = prefixFill(dtObj.getUTCFullYear(), 4, '0') + '-' +
                                prefixFill(dtObj.getUTCMonth() + 1, 2, '0') + '-' +
                                prefixFill(dtObj.getUTCDate(), 2, '0');
                parsedTimeStr = prefixFill(dtObj.getUTCHours(), 2, '0') + ':' +
                                prefixFill(dtObj.getUTCMinutes(), 2, '0') + ':' +
                                prefixFill(dtObj.getUTCSeconds(), 2, '0');
                if (this.settings.showMilliseconds) {
                    parsedTimeStr += '.' + prefixFill(dtObj.getUTCMilliseconds(), 3, '0');
                }
            } else {
                var cleanedInput = String(sourceValue).trim();
                var segments = cleanedInput.split(this.isoSeparatorPattern) || [];
                parsedDateStr = this.dateExtractionPattern.test(segments[0]) ? segments[0] : '';
                parsedTimeStr = parsedDateStr && segments[1] ? segments[1] : this.timeExtractionPattern.test(segments[0]) ? segments[0] : '';
            }

            var dateMatches = this.dateExtractionPattern.exec(parsedDateStr) || [];
            var timeMatches = this.timeExtractionPattern.exec(parsedTimeStr) || [];

            if (validateOnly) {
                if (this.settings.showDate && dateMatches.length === 0) return undefined;
                if (this.settings.showTime && timeMatches.length === 0) return undefined;
                if (!this.settings.showDate && parsedDateStr) return undefined;
                if (!this.settings.showTime && parsedTimeStr) return undefined;
            }

            var year = parseInt(dateMatches[1] || '0', 10);
            var month = parseInt(dateMatches[2] || '1', 10) - 1;
            var day = parseInt(dateMatches[3] || '0', 10);
            var hour = parseInt(timeMatches[1] || '0', 10);
            var minute = parseInt(timeMatches[2] || '0', 10);
            var second = parseInt(timeMatches[3] || '0', 10);
            var millisecond = parseInt(timeMatches[4] || '0', 10);

            if (!this.settings.showDate) {
                year = 0; month = 0; day = 0;
            }
            if (!this.settings.showTime) {
                hour = 0; minute = 0; second = 0; millisecond = 0;
            }

            var utcDateObj = new Date(Date.UTC(year, month, day, hour, minute, second, millisecond));

            var finalOutput = '';

            if (this.settings.showDate) {
                finalOutput = prefixFill(utcDateObj.getUTCFullYear(), 4, '0') + '-' +
                              prefixFill(utcDateObj.getUTCMonth() + 1, 2, '0') + '-' +
                              prefixFill(utcDateObj.getUTCDate(), 2, '0');
            }

            if (this.settings.showTime) {
                finalOutput = finalOutput + (this.settings.showDate ? 'T' : '') +
                              prefixFill(utcDateObj.getUTCHours(), 2, '0') + ':' +
                              prefixFill(utcDateObj.getUTCMinutes(), 2, '0') + ':' +
                              prefixFill(utcDateObj.getUTCSeconds(), 2, '0');

                if (this.settings.showMilliseconds) {
                    finalOutput = finalOutput + '.' + prefixFill(utcDateObj.getUTCMilliseconds(), 3, '0');
                }
            }

            if (this.settings.showDate && this.settings.showTime) {
                finalOutput += "Z";
            }

            return finalOutput;
        },

        displayValue: function(initialData, dataModel) {
            return this.processTimestamp(initialData, false);
        },

        modelValue: function(inputString, dataModel) {
            var processed = this.processTimestamp(inputString, true);
            if (processed === undefined) return undefined;
            if (processed === null) return null;

            return processed;
        }
    });
    TabularDisplay.TemporalConverter = TemporalConverter;
}));