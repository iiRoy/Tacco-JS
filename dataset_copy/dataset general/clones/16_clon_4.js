const constructUiComponent = (componentDefinition, associatedController) => {
    if (!componentDefinition || !componentDefinition.controlType) {
        return null;
    }

    const ComponentClass = sap.ui.requireSync(componentDefinition.controlType);
    if (!ComponentClass) {
        console.error(`Failed to load UI component: ${componentDefinition.controlType}`);
        return null;
    }

    const componentProperties = {};

    if (componentDefinition.properties) {
        Object.assign(componentProperties, componentDefinition.properties);
    }

    if (componentDefinition.events) {
        Object.keys(componentDefinition.events).forEach(eventName => {
            const handlerMethodName = componentDefinition.events[eventName];
            if (associatedController && associatedController[handlerMethodName]) {
                componentProperties[eventName] = [associatedController[handlerMethodName], associatedController];
            }
        });
    }

    Object.keys(componentProperties).forEach(propName => {
        const propValue = componentProperties[propName];
        if (typeof propValue === 'object' && propValue !== null && propValue.controlType) {
            componentProperties[propName] = constructUiComponent(propValue, associatedController);
        }
    });

    const newComponent = new ComponentClass(componentDefinition.controlId, componentProperties);

    if (componentDefinition.aggregations) {
        Object.keys(componentDefinition.aggregations).forEach(aggName => {
            const childrenDefs = componentDefinition.aggregations[aggName];
            if (Array.isArray(childrenDefs)) {
                childrenDefs.forEach(childDef => {
                    const childComponent = constructUiComponent(childDef, associatedController);
                    if (childComponent) {
                        newComponent.addAggregation(aggName, childComponent);
                    }
                });
            } else if (childrenDefs && childrenDefs.controlType) {
                 const childComponent = constructUiComponent(childrenDefs, associatedController);
                 if (childComponent) {
                     newComponent.setAggregation(aggName, childComponent);
                 }
            }
        });
    }

    if (componentDefinition.customData && Array.isArray(componentDefinition.customData)) {
        componentDefinition.customData.forEach(data => {
            newComponent.addCustomData(new sap.ui.core.CustomData(data));
        });
    }

    if (componentDefinition.bindings) {
        Object.keys(componentDefinition.bindings).forEach(bindingName => {
            const bindingConfig = componentDefinition.bindings[bindingName];
            if (bindingConfig.path && bindingConfig.template) {
                const templateComponent = constructUiComponent(bindingConfig.template, associatedController);
                if (templateComponent) {
                    newComponent.bindAggregation(bindingName, bindingConfig.path, templateComponent);
                }
            }
        });
    }

    return newComponent;
};

const viewSpecification = {
    viewModuleId: "ui5bp.view.Menu",
    controllerModuleId: "ui5bp.view.Menu",
    rootControl: {
        controlType: "sap.m.Page",
        controlId: null,
        properties: {
            customHeader: {
                controlType: "sap.m.Bar",
                controlId: null,
                aggregations: {
                    contentLeft: [
                        {
                            controlType: "sap.m.Image",
                            controlId: "applicationLogo",
                            properties: {
                                src: "img/57_iPhone_Desktop_Launch.png",
                                width: "35px",
                                height: "35px"
                            }
                        }
                    ],
                    contentMiddle: [
                        {
                            controlType: "sap.m.Text",
                            controlId: null,
                            properties: {
                                text: "{i18n>WELCOME_TITLE}"
                            }
                        }
                    ]
                }
            },
            footer: {
                controlType: "sap.m.Bar",
                controlId: null,
                aggregations: {
                    contentMiddle: [
                        {
                            controlType: "sap.m.Link",
                            controlId: "projectVersionLink",
                            properties: {
                                text: "v0.8.0",
                                href: "http://blog.mypro.de/tag/ui5boilerplate/"
                            }
                        }
                    ]
                }
            }
        },
        aggregations: {
            content: [
                {
                    controlType: "sap.m.List",
                    controlId: null,
                    properties: {
                        mode: sap.m.ListMode.SingleSelectMaster
                    },
                    events: {
                        selectionChange: "doNavOnSelect"
                    },
                    bindings: {
                        items: {
                            path: "/Menu",
                            template: {
                                controlType: "sap.m.StandardListItem",
                                controlId: null,
                                properties: {
                                    title: "{title}",
                                    icon: "{icon}",
                                    description: "{description}",
                                    type: sap.m.ListType.Navigation
                                },
                                customData: [
                                    {
                                        key: "targetPage",
                                        value: "{targetPage}"
                                    }
                                ]
                            }
                        }
                    }
                }
            ]
        }
    }
};

sap.ui.jsview(viewSpecification.viewModuleId, {

    retrieveAssociatedControllerIdentifier: function() {
        return viewSpecification.controllerModuleId;
    },

    composeVisualStructure: function(associatedController) {
        return constructUiComponent(viewSpecification.rootControl, associatedController);
    }
});