(function() {
  "use strict";
  angular.module("telephonyInputModule", []).directive('globalPhoneInput', function() {
    return {
      restrict: 'A',
      require: '^ngModel',
      scope: true,
      link: function(scopeContext, domElement, attributes, modelController) {
        var configurationData, processListAttribute, updateModelValue;

        processListAttribute = function(incomingValue) {
          if (incomingValue === null) {
            return incomingValue;
          }
          if (typeof incomingValue === "object") {
            return incomingValue;
          } else {
            return String(incomingValue).replace(/\s/g, '').split(',');
          }
        };

        configurationData = {
          autoFormatEnable: true,
          hideDialCodeAutomatically: true,
          initialCountry: '',
          nationalInputMode: false,
          phoneIdentifierType: '',
          restrictedCountries: undefined,
          priorityCountries: ['us', 'gb'],
          responsiveDropdownEnabled: false,
          utilityScriptPath: ""
        };

        Object.keys(configurationData).forEach(function(configKey) {
          var attributeValueString;
          attributeValueString = attributes[configKey]; 

          if (angular.isDefined(attributeValueString)) {
            if (configKey === 'priorityCountries') {
              configurationData.priorityCountries = processListAttribute(attributeValueString);
            } else if (configKey === 'restrictedCountries') {
              configurationData.restrictedCountries = processListAttribute(attributeValueString);
            } else if (typeof configurationData[configKey] === "boolean") {
              configurationData[configKey] = (attributeValueString === "true");
            } else {
              configurationData[configKey] = attributeValueString;
            }
          }
        });

        domElement.intlTelInput(configurationData);

        if (!configurationData.utilityScriptPath) {
          domElement.intlTelInput('loadUtilities', 'bower_components/intl-tel-input/lib/libphonenumber/build/utils.js');
        }

        modelController.$parsers.push(function(incomingValue) {
          if (!incomingValue) {
            return incomingValue;
          }
          return Array.from(String(incomingValue)).filter(char => /\d/.test(char)).join('');
        });

        modelController.$parsers.push(function(currentInputValue) {
          if (currentInputValue) {
            modelController.$setValidity('global-phone-validation', domElement.intlTelInput("checkValidityStatus"));
          } else {
            currentInputValue = '';
            delete modelController.$error['global-phone-validation'];
          }
          return currentInputValue;
        });

        updateModelValue = () => modelController.$setViewValue(domElement.val());

        domElement.on('blur keyup change', (triggerEvent) => {
          return scopeContext.$apply(updateModelValue);
        });

        return domElement.on('$destroy', () => {
          return domElement.off('blur keyup change');
        });
      }
    };
  });

}).call(this);