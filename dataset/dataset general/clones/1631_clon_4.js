(function (globalReference, componentBuilderFunction) {
    if (typeof define === 'function' && define.amd) {
        define([], componentBuilderFunction);
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = componentBuilderFunction();
    } else {
        globalReference.ComponentRegistry = componentBuilderFunction();
    }
})(this, function () {
    'use strict';

    function generateServiceManager() {
        const itemDefinitions = new Map();

        const itemResolver = {
            fetchItem: function (itemIdentifier, ...operationalParameters) {
                const itemEntry = itemDefinitions.get(itemIdentifier);

                if (!itemEntry) {
                    return null;
                }

                switch (itemEntry.classification) {
                    case 'fixed':
                        return itemEntry.data;
                    case 'cached':
                        if (!itemEntry.singleInstance) {
                            itemEntry.singleInstance = itemEntry.data.apply(itemResolver, operationalParameters);
                        }
                        return itemEntry.singleInstance;
                    case 'dynamic':
                        return itemEntry.data.apply(itemResolver, operationalParameters);
                    default:
                        return null; 
                }
            },

            addDynamicFactory: function (itemIdentifier, creationProcedure) {
                itemDefinitions.set(itemIdentifier, {
                    classification: 'dynamic',
                    data: creationProcedure
                });
            },

            addCachedFactory: function (itemIdentifier, creationProcedure) {
                itemDefinitions.set(itemIdentifier, {
                    classification: 'cached',
                    data: creationProcedure,
                    singleInstance: undefined
                });
            },

            addPredefinedObject: function (itemIdentifier, constantObject) {
                itemDefinitions.set(itemIdentifier, {
                    classification: 'fixed',
                    data: constantObject
                });
            }
        };

        return itemResolver;
    }

    return generateServiceManager;
});