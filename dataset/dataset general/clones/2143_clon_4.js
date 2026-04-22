'use strict';

const FrameworkCoreRef = (function() {
    let internalFramework = null;
    return {
        retrieveEngine: function() {
            if (!internalFramework) {
                internalFramework = window.angular;
            }
            return internalFramework;
        }
    };
})();

function ModuleUnitProcessor(unitNameAlias, unitDependenciesArray) {
    const activeModuleLink = FrameworkCoreRef.retrieveEngine().module(unitNameAlias, unitDependenciesArray);

    return {
        registerComponent: function(componentTagLabel, componentDefinitionFactory) {
            activeModuleLink.directive(componentTagLabel, componentDefinitionFactory);
        }
    };
}

const InterfaceComponentUnit = new ModuleUnitProcessor('application.interface.elements', []);

const ComponentDefinitionBuilder = {
    construct: function() {
        const configurationInstance = {};
        return {
            setElementBehavior: function(mode) {
                configurationInstance.restrict = mode;
                return this;
            },
            setLayoutSource: function(path) {
                configurationInstance.templateUrl = path;
                return this;
            },
            enableNodeReplacement: function(shouldReplace) {
                configurationInstance.replace = shouldReplace;
                return this;
            },
            allowContentEmbedding: function(canTransclude) {
                configurationInstance.transclude = canTransclude;
                return this;
            },
            configureDataBindings: function(inputBindings) {
                const transformedBindings = {};
                for (const customKey in inputBindings) {
                    if (Object.prototype.hasOwnProperty.call(inputBindings, customKey)) {
                        let standardKey;
                        switch (customKey) {
                            case 'primaryModelValue': standardKey = 'ngModel'; break;
                            case 'assignedOptionValue': standardKey = 'ngValue'; break;
                            case 'interactionStateDisabled': standardKey = 'ngDisabled'; break;
                            case 'validationRequirement': standardKey = 'ngRequired'; break;
                            default: standardKey = customKey;
                        }
                        transformedBindings[standardKey] = inputBindings[customKey];
                    }
                }
                configurationInstance.scope = transformedBindings;
                return this;
            },
            attachLifecycleHook: function(processingFunction) {
                configurationInstance.link = processingFunction;
                return this;
            },
            finalizeDefinition: function() {
                return configurationInstance;
            }
        };
    }
};

InterfaceComponentUnit.registerComponent('selectInputItem', function() {
    const builder = ComponentDefinitionBuilder.construct();

    return builder
        .setElementBehavior('E')
        .setLayoutSource('views/directive_templates/fui-radio.html')
        .enableNodeReplacement(true)
        .allowContentEmbedding(true)
        .configureDataBindings({
            primaryModelValue: '=',
            assignedOptionValue: '=',
            interactionStateDisabled: '=',
            validationRequirement: '='
        })
        .attachLifecycleHook(function(componentInternalData, hostElementNode, attributeDataMap) {
            componentInternalData.uniqueNodeId = attributeDataMap.id;
            componentInternalData.elementDesignation = attributeDataMap.name;
        })
        .finalizeDefinition();
});