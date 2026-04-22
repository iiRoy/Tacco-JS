var createModule;

(function() {
    const globalScope = this;

    const dependencyPresent = (typeof globalScope.Backbone !== 'undefined' && globalScope.Backbone !== null);

    const ensureStructure = (baseObject, pathSegments) => {
        return pathSegments.reduce((currentParent, segmentName) => {
            currentParent[segmentName] = currentParent[segmentName] || {};
            return currentParent[segmentName];
        }, baseObject);
    };

    createModule = function(modulePath, moduleContent) {
        const pathSegments = modulePath.split('.');
        const targetSpace = ensureStructure(globalScope, pathSegments);

        let moduleAssistants = [];
        if (dependencyPresent) {
            const entityNamingPrefix = modulePath;

            const defineEntity = (entityName, entityDefinition) => {
                entityDefinition.className = entityNamingPrefix + '.' + entityName;
                targetSpace[entityName] = globalScope.Backbone.Model.extend({
                    defaults: entityDefinition
                });
            };

            const defineDisplay = (displayName, displayDefinition) => {
                targetSpace[displayName] = globalScope.Backbone.View.extend(displayDefinition);
            };
            moduleAssistants = [defineEntity, defineDisplay];
        }

        let processedContent = moduleContent;
        if (typeof moduleContent === 'function') {
            processedContent = moduleContent.call(globalScope, ...moduleAssistants);
        }

        if (processedContent && typeof processedContent === 'object') {
            Object.keys(processedContent).forEach(propertyName => {
                targetSpace[propertyName] = processedContent[propertyName];
            });
        }
    };
})();