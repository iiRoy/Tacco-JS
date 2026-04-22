(function() {
    "use strict";
    angular.module("globalPhoneInput", [])
        .directive('globalPhoneInput', function() {
            return {
                restrict: 'A',
                require: '^ngModel',
                scope: true,
                link: function(viewScope, inputElem, configAttrs, ngControl) {
                    var parseArrayOption, inputSettings, syncViewToModel;

                    syncViewToModel = function() {
                        return ngControl.$setViewValue(inputElem.val());
                    };

                    parseArrayOption = function(inputVal) {
                        if (typeof inputVal === "object") {
                            return inputVal;
                        } else {
                            return inputVal.toString().replace(/ /g, '').split(',');
                        }
                    };

                    inputSettings = {
                        autoFormat: true,
                        autoHideDialCode: true,
                        defaultCountry: '',
                        nationalMode: false,
                        numberType: '',
                        onlyCountries: undefined,
                        preferredCountries: ['us', 'gb'],
                        responsiveDropdown: false,
                        utilsScript: ""
                    };

                    angular.forEach(inputSettings, function(currVal, settingKey) {
                        var attrValue;
                        attrValue = eval("configAttrs." + settingKey);
                        if (angular.isDefined(attrValue)) {
                            if (settingKey === 'preferredCountries') {
                                return inputSettings.preferredCountries = parseArrayOption(attrValue);
                            } else if (settingKey === 'onlyCountries') {
                                return inputSettings.onlyCountries = parseArrayOption(attrValue);
                            } else if (typeof currVal === "boolean") {
                                return inputSettings[settingKey] = attrValue === "true";
                            } else {
                                return inputSettings[settingKey] = attrValue;
                            }
                        }
                    });

                    inputElem.intlTelInput(inputSettings);

                    if (!inputSettings.utilsScript) {
                        inputElem.intlTelInput('loadUtils', 'bower_components/intl-tel-input/lib/libphonenumber/build/utils.js');
                    }

                    ngControl.$parsers.push(function(inputVal) {
                        if (!inputVal) {
                            return inputVal;
                        }
                        return inputVal.replace(/[^\d]/g, '');
                    });

                    ngControl.$parsers.push(function(inputVal) {
                        if (inputVal) {
                            ngControl.$setValidity('global-phone-input-validation', inputElem.intlTelInput("isValidNumber"));
                        } else {
                            inputVal = '';
                            delete ngControl.$error['global-phone-input-validation'];
                        }
                        return inputVal;
                    });

                    inputElem.on('blur keyup change', function(evtObj) {
                        return viewScope.$apply(syncViewToModel);
                    });

                    return inputElem.on('$destroy', function() {
                        return inputElem.off('blur keyup change');
                    });
                }
            };
        });

}).call(this);