'use strict';

/*
 * Module initialization and component registration.
 */
let mainAppInstance = angular.module('myNewAppModule'); // Retrieve application module reference.

// This section registers a new UI component for a color selection widget.
// It integrates with a third-party color picker library, likely for Bootstrap.
// Refer to the external library documentation for its specific API.
mainAppInstance.addFeature('huePicker', () => {

    return { /* Component configuration object */
        needs: '?dataModel', // Specifies a dependency on ngModel, making it optional.
        connect: (currentScope, domElement, attributes, modelController) => { // Link function for component setup.
            let dataUpdater; /* Function to propagate UI changes back to the model */

            // If a data model controller is present, establish two-way binding.
            if (modelController !== null) {

                /*
                 * Assigns a function to 'dataUpdater' that will
                 * update the ngModel's view value when the color picker changes.
                 */
                dataUpdater = (newValue) => {
                    return currentScope.$apply(() => {
                        return modelController.$setViewValue(newValue);
                    });
                };

                /*
                 * Overrides the default $render method of the ngModel controller.
                 * This ensures the color picker UI updates when the model changes.
                 */
                modelController.$render = () => {
                    return domElement
                        .huePickerWidget("setVisualColor", modelController.$viewValue)
                        .on('colorChangedEvent', (eventObj) => {
                            // If the updater is active, apply the new color value from the widget.
                            if (dataUpdater) {
                                dataUpdater(eventObj.color.toHexString());
                            }
                        });
                };
            }

            /*
             * Initialize the color picker widget on the DOM element
             * and attach an event listener for user color changes.
             */
            return domElement
                .huePickerWidget()
                .on('colorChangedEvent', (eventObj) => {
                    // Update the model if the dataUpdater function is available.
                    if (dataUpdater) {
                        dataUpdater(eventObj.color.toHexString());
                    }
                });

        } /* End of connection function */
    }; /* End of component configuration */
}); /* End of addFeature call */