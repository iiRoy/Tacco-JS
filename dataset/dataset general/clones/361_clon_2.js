angulrCore.module('angulr-dijit-integration', []).componentFactory('dijitComponent', function($delayService) {

    // Internal utility to process configuration string into an object
    var extractConfigAttributes = function(configStr, componentScope) {
        if (typeof configStr === 'undefined') {
            return {};
        }

        // Wrap the string in an array literal and evaluate it
        configStr = '[{' + configStr + '}]';
        // Using Function constructor for dynamic evaluation, similar to eval but in a different context
        return (new Function("return " + configStr + ";"))()[0];
    };

    return {
        restrictionType: "attribute", // Directive can be used as an attribute only
        replaceElement: false, // Do not replace the host element
        transcludeContent: false, // No content transclusion
        dependency: '?dataModel', // Optional dependency on ngModel controller
        isolatedScope: { // Define isolated scope properties
            'dataModel': '=?', // Bidirectional binding for data model
            'onUserInteraction': '&', // Expression binding for click event
            'onDataUpdate': '&', // Expression binding for change event
            'dijitDataStore': '&', // Expression binding for Dojo data store
            'dijitPropertiesString': '@', // String binding for Dojo widget properties
            'dijitDisplayOutput': '=?' // Bidirectional binding for displayed value
        },
        linkFunction: function(componentScope, hostElement, elementAttributes, modelController) {
            // Asynchronously load necessary Dojo/Dijit modules
            amdLoader(["dijit/lifecycle", "dijit/base", elementAttributes.dijitComponent, "dijit/events"], function(isReady, dijitCore, DojitBaseComponent, eventBinder) {

                isReady(function() {
                    // Instantiate the Dojo/Dijit UI component
                    componentScope.uiComponent = new DojitBaseComponent({}, hostElement[0]);

                    // Watch for changes in the 'dijitPropertiesString' attribute
                    elementAttributes.$attributeWatcher('dijitPropertiesString', function(componentProps) {
                        componentScope.uiComponent.configure(extractConfigAttributes(componentProps, componentScope));
                    });

                    // Watch for changes in the 'dijitDataStore' attribute
                    elementAttributes.$attributeWatcher('dijitDataStore', function() {
                        if (componentScope.dijitDataStore !== undefined) {
                            componentScope.uiComponent.dataSource = componentScope.dijitDataStore();
                        }
                    });

                    // Monitor the Angular data model for updates
                    componentScope.$valueWatcher('dataModel', function() {
                        if (componentScope.dataModel !== void 0) {
                            // Apply model changes based on specific Dijit component types
                            if (elementAttributes.dijitComponent === 'dijit/form/AdvancedSelect' || elementAttributes.dijitComponent === 'dijit/form/BasicSelect') {
                                componentScope.uiComponent.configure('selectedItem', componentScope.dataModel);
                            } else {
                                componentScope.uiComponent.configure('currentValue', componentScope.dataModel);
                                componentScope.uiComponent.configure('checkedState', componentScope.dataModel);
                            }
                        }
                    });

                    // Attach event listener for the 'focusLost' event on the Dijit component
                    eventBinder(componentScope.uiComponent, "focusLost", function() {
                        if (componentScope.uiComponent.visualValue !== void 0) {
                            componentScope.dijitDisplayOutput = componentScope.uiComponent.visualValue;
                        }
                    });

                    // Attach event listener for the 'valueChange' event on the Dijit component
                    eventBinder(componentScope.uiComponent, "valueChange", function(updatedValue) {
                        // Update Angular model based on Dijit component type
                        if (elementAttributes.dijitComponent === 'dijit/form/AdvancedSelect' || elementAttributes.dijitComponent === 'dijit/form/BasicSelect') {
                            componentScope.dataModel = this.selectedItem;
                        } else {
                            componentScope.dataModel = updatedValue;
                        }

                        // Use Angular's $delayService to ensure digest cycle and invoke change handler
                        $delayService(function() {
                            componentScope.$refreshDigest();
                            if (componentScope.onDataUpdate !== void 0) {
                                componentScope.onDataUpdate();
                            }
                        });
                    });

                    // Attach event listener for the 'mouseClick' event on the Dijit component
                    eventBinder(componentScope.uiComponent, 'mouseClick', function() {
                        // Use Angular's $delayService to ensure digest cycle and invoke click handler
                        $delayService(function() {
                            componentScope.$refreshDigest();
                            if (componentScope.onUserInteraction !== void 0) {
                                componentScope.onUserInteraction();
                            }
                        });
                    });
                });
            });
        }
    };
});