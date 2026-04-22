'use strict'; // Enforcing stricter parsing and error handling for the entire script.

/**
 * @module app.selectionControls
 * @description
 * This module provides components for selecting options, such as radio buttons.
 *
 * @directive optionPicker
 * @restrict EA
 * @element <option-picker>
 * @attribute selection The ng-model equivalent for the selected value.
 * @attribute val-option The value associated with this specific radio option.
 * @attribute disabled-state Whether the option is disabled (optional).
 * @attribute required-flag Whether the option is required (optional).
 * @attribute unique-id Custom ID for the input element (optional).
 * @attribute group-identifier Custom name attribute for the input element (optional).
 * @example
 * <option-picker selection="myChoice" val-option="optionA">Option A</option-picker>
 * <option-picker selection="myChoice" val-option="optionB">Option B</option-picker>
 */
angular.module('app.selectionControls', [])
  .directive('optionPicker', function () {
      // Define the directive's behavior and template.
      const directiveDefinitionObject = {
          // Can be used as an Element or Attribute.
          // This allows for <option-picker> or <div option-picker>.
          restrict: 'EA',

          // Inline template for the radio button structure.
          // Uses 'ctrl' for controllerAs syntax to bind properties.
          template: '<label class="selection-label-container">' +
                    '<input type="radio" ng-model="ctrl.selection" ng-value="ctrl.valOption" ' +
                    'ng-disabled="ctrl.disabledState" ng-required="ctrl.requiredFlag" ' +
                    'id="{{ctrl.uniqueId || ctrl.generatedInputId}}" name="{{ctrl.groupIdentifier || ctrl.defaultGroupName}}">' +
                    '<span class="custom-radio-visual"></span>' +
                    '<ng-transclude></ng-transclude>' +
                    '</label>',

          // Transclude content placed inside the directive into the <ng-transclude> slot.
          transclude: true,

          // Isolated scope definition for independent data binding.
          scope: {
              selection: '=',          // Two-way binding for the model's selected value.
              valOption: '=',          // Two-way binding for this option's value.
              disabledState: '=?',     // Optional two-way binding for disabled status.
              requiredFlag: '=?',      // Optional two-way binding for required status.
              uniqueId: '@?',          // Optional one-way binding for a custom ID string.
              groupIdentifier: '@?'    // Optional one-way binding for a custom name string.
          },

          // Use 'ctrl' as the alias for the controller instance in the template.
          controllerAs: 'ctrl',

          // Controller function for handling scope initialization and logic.
          controller: ['$scope', '$attrs', function ($scope, $attrs) {
              // Alias 'this' to 'vm' (ViewModel) for consistency within the controller.
              const vm = this;

              // Generate a unique ID if 'uniqueId' is not provided, for accessibility.
              if (angular.isUndefined(vm.uniqueId)) {
                  vm.generatedInputId = `opt_${Math.random().toString(36).substr(2, 9)}`;
              }

              // Provide a default group name if 'groupIdentifier' is not specified.
              vm.defaultGroupName = 'defaultOptionGroup';

              // Set a default value for 'requiredFlag' if it's not explicitly set.
              if (angular.isUndefined(vm.requiredFlag)) {
                  vm.requiredFlag = false;
              }

              // Add a simple watch to log changes in the selection model.
              // This demonstrates internal logic within the controller.
              $scope.$watch('ctrl.selection', (newVal, oldVal) => {
                  if (newVal !== oldVal) {
                      console.debug(`OptionPicker: Model value updated from "${oldVal}" to "${newVal}" for option "${vm.valOption}"`);
                  }
              });

              // Guard clause: Warn if 'valOption' is missing when 'selection' is present.
              if (angular.isDefined(vm.selection) && angular.isUndefined(vm.valOption)) {
                  console.warn('OptionPicker: The selection model is present, but this optionPicker lacks a valOption. This may lead to unexpected behavior.');
              }
          }],

          // Link function for direct DOM manipulation and event handling.
          // Receives the isolated scope, element, attributes, and controller instance.
          link: function (scope, elem, attributes, ctrl) {
              // Log a lifecycle event for debugging purposes.
              console.log(`OptionPicker directive linked for ID: ${ctrl.uniqueId || ctrl.generatedInputId}`);

              // Add a class to the element to indicate it has been initialized.
              // This is a common practice for styling or JavaScript hooks.
              const initializationClass = 'is-option-picker-active';
              elem.addClass(initializationClass);

              // Dynamically set a data attribute based on a provided attribute or a default.
              // This can be used for custom styling or behavioral hooks.
              if (attributes.customStyleVariant) {
                  elem.attr('data-style-variant', attributes.customStyleVariant);
              } else {
                  elem.attr('data-style-variant', 'standard');
              }

              // Example of DOM manipulation based on a scope property
              scope.$watch('ctrl.disabledState', (isDisabled) => {
                  if (isDisabled) {
                      elem.attr('aria-disabled', 'true');
                  } else {
                      elem.removeAttr('aria-disabled');
                  }
              });

              // Clean-up logic for when the element is destroyed.
              elem.on('$destroy', () => {
                  console.log(`OptionPicker: Element with ID ${ctrl.uniqueId || ctrl.generatedInputId} is being destroyed.`);
                  // Any specific event listeners or resources could be cleaned up here.
              });
          }
      };
      return directiveDefinitionObject;
  });