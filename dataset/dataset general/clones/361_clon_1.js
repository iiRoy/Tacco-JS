angular.module ( 'angular-dojo', [] ) .directive ( 'dojoWidget', function ( $timeout ) {
    // This private helper function is responsible for parsing properties from a string.
    // It expects a string that can be evaluated into a JavaScript object literal.
    var parseProps = function ( props, scope ) {
        // If no properties are provided, return an empty object to avoid errors.
        if ( typeof props === 'undefined' ) {
            return {};
        }

        // Wrap the properties string in an array literal to facilitate evaluation.
        // This allows parsing a single object directly.
        props = '[{' + props + '}]';

        // Evaluate the string to create a JavaScript object.
        // We take the first element of the resulting array, which should be our object.
        return eval(props)[0];
    };

    // The directive definition object.
    return {
        // Restrict this directive to attribute usage only.
        restrict: "A",

        // Do not replace the original element.
        replace: false,

        // Do not transclude content.
        transclude: false,

        // Optionally require ngModel controller if present.
        require: '?ngModel',

        // Define the isolated scope for this directive.
        scope: {
            'ngModel'          : '=?',     // Bidirectional binding for ngModel.
            'ngClick'          : '&',      // Expression binding for click event.
            'ngChange'         : '&',      // Expression binding for change event.
            'dojoStore'        : '&',      // Expression binding for a Dojo store provider.
            'dojoProps'        : '@',      // String binding for Dojo widget properties.
            'dojoDisplayValue' : '=?'      // Bidirectional binding for the widget's displayed value.
        },

        // The link function handles DOM manipulation and event listeners.
        link: function ( scope, element, attrs, model ) {
            // Asynchronously load necessary Dojo modules.
            require ( [ "dojo/ready", "dijit/dijit", attrs.dojoWidget, "dojo/on" ], function ( ready, dijit, DojoWidget, on ) {

                // Ensure Dojo widgets are initialized after the DOM is ready.
                ready ( function () {
                    // Instantiate the Dojo widget, attaching it to the current element.
                    scope.widget = new DojoWidget ( {}, element[0] );

                    // Observe changes to the 'dojoProps' attribute.
                    // This allows dynamic updates to the widget's properties.
                    attrs.$observe ( 'dojoProps', function ( dojoProps ) {
                        // Set widget properties based on the parsed string.
                        scope.widget.set ( parseProps ( dojoProps, scope ) );
                    } );

                    // Observe changes to the 'dojoStore' attribute.
                    attrs.$observe ( 'dojoStore', function () {
                        // If a dojoStore function is provided, execute it and assign its result to the widget's store.
                        if ( scope.dojoStore != undefined ) {
                            scope.widget.store = scope.dojoStore ();
                        }
                    } );

                    // Watch for changes in the 'ngModel' scope property.
                    scope.$watch ( 'ngModel', function () {
                        // Only update the widget if ngModel has a defined value.
                        if ( scope.ngModel != undefined ) {
                            // Special handling for FilteringSelect and Select widgets.
                            if ( attrs.dojoWidget == 'dijit/form/FilteringSelect' || attrs.dojoWidget == 'dijit/form/Select' ) {
                                scope.widget.set ( 'item', scope.ngModel );
                            }
                            // General handling for other Dojo form widgets.
                            else {
                                scope.widget.set ( 'value', scope.ngModel );
                                // Also set 'checked' for checkbox-like widgets.
                                scope.widget.set ( 'checked', scope.ngModel );
                            }
                        }
                    } );

                    // Attach a 'blur' event listener to the Dojo widget.
                    on ( scope.widget, "blur", function () {
                        // If the widget has a displayed value, update the ngModel.
                        if ( scope.widget.displayedValue != undefined ) {
                            scope.dojoDisplayValue = scope.widget.displayedValue;
                        }
                    } );

                    // Attach a 'change' event listener to the Dojo widget.
                    on ( scope.widget, "change", function ( newValue ) {
                        // Different logic for FilteringSelect/Select vs. other widgets.
                        if ( attrs.dojoWidget == 'dijit/form/FilteringSelect' || attrs.dojoWidget == 'dijit/form/Select' ) {
                            scope.ngModel = this.item; // For selects, the item is the model.
                        }
                        else {
                            scope.ngModel = newValue;   // For others, the new value is the model.
                        }

                        // Use $timeout to ensure Angular's digest cycle runs after the change.
                        $timeout ( function () {
                            scope.$apply (); // Manually trigger a digest cycle.
                            // Execute the ngChange expression if it's defined.
                            if ( scope.ngChange != undefined ) {
                                scope.ngChange ();
                            }
                        } );
                    } );

                    // Attach a 'click' event listener to the Dojo widget.
                    on ( scope.widget, 'click', function () {
                        // Use $timeout for consistency with other event handlers.
                        $timeout ( function () {
                            scope.$apply (); // Manually trigger a digest cycle.
                            // Execute the ngClick expression if it's defined.
                            if ( scope.ngClick != undefined ) {
                                scope.ngClick ();
                            }
                        } );
                    } );
                } ); // End of ready callback.
            } ); // End of require callback.
        } // End of link function.
    }; // End of return object.
} ); // End of directive definition.