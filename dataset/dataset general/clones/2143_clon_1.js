'use strict'; // This statement enables strict mode for the entire script.


/**
 * @ngdoc     directive
 * @name      fui.radio.directive:fuiRadio
 * @description
 *            This directive is responsible for rendering a radio button component
 *            within the FUI (Framework UI) library.
 *            It provides standard radio button functionality with Angular bindings.
 * #          fuiCheckbox (Note: This appears to be a historical or misplaced comment,
 *                         as the directive's name is 'fuiRadio'.)
 *
 */
angular
        .module(    'fui.radio',       // Specifies the module name: 'fui.radio'.
                    []                 // Declares an empty array for module dependencies.
               )
        .directive ( 'fuiRadio', // Registers a new directive named 'fuiRadio'.
                     function ( ) { // The factory function for the directive.
                         // The directive definition object (DDO) is returned here.
                         return {

                             restrict: 'E', // Restricts the directive to element usage (e.g., <fui-radio>).

                             templateUrl: 'views/directive_templates/fui-radio.html', // Path to the directive's HTML template.

                             replace: true, // If true, the directive's element will be replaced by the template content.

                             transclude: true, // Enables transclusion, allowing content inside the directive tag to be moved.

                             // Defines an isolated scope for the directive, preventing prototypal inheritance.
                             scope: {
                                 ngModel:    '=', // Bi-directional binding for the model value.
                                 ngValue:    '=', // Bi-directional binding for the value associated with this radio option.
                                 ngDisabled: '=', // Bi-directional binding for the disabled state of the radio button.
                                 ngRequired: '='  // Bi-directional binding for the required state of the radio button.
                             },

                             // The link function is used for direct DOM manipulation and setting up event listeners.
                             link: function ( scope,    // The isolated scope of the directive.
                                              element,  // The jqLite-wrapped element that this directive matches.
                                              attrs     // A hash of normalized attributes from the element.
                                            ) {
                                 // Assigns the 'id' attribute value from the element to the directive's scope.
                                 scope.id = attrs.id;

                                 // Assigns the 'name' attribute value from the element to the directive's scope.
                                 scope.name = attrs.name;
                             }

                         }; // End of the directive definition object (DDO).

                     } // End of the directive factory function.
                   ); // End of directive registration.

// End of the fuiRadio directive file.