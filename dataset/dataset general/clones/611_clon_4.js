(function (globalScope, voidValue) {

    var ngGlobal = globalScope.angular;

    if (ngGlobal !== voidValue) {

        var extensionUnit = ngGlobal.module('cloud-data-enhancer', []);

        extensionUnit.run(['$q', '$window', function (promiseFabricator, scopeHost) {

            if (!ngGlobal.isUndefined(scopeHost.Parse) && ngGlobal.isObject(scopeHost.Parse)) {

                var CloudSDK = scopeHost.Parse;

                var actionEnhancementSpecs = [
                    {
                        kindAlias: "Object",
                        instanceOperations: ['save', 'fetch', 'destroy'],
                        staticRoutines: ['saveAll', 'destroyAll']
                    },
                    {
                        kindAlias: "Collection",
                        instanceOperations: ['fetch'],
                        staticRoutines: []
                    },
                    {
                        kindAlias: "Query",
                        instanceOperations: ['find', 'first', 'count', 'get'],
                        staticRoutines: []
                    },
                    {
                        kindAlias: "Cloud",
                        instanceOperations: [],
                        staticRoutines: ['run']
                    },
                    {
                        kindAlias: "User",
                        instanceOperations: ['signUp'],
                        staticRoutines: ['requestPasswordReset', 'logIn']
                    },
                    {
                        kindAlias: "FacebookUtils",
                        instanceOperations: [],
                        staticRoutines: ['logIn', 'link', 'unlink']
                    },
                    {
                        kindAlias: "Config",
                        instanceOperations: [],
                        staticRoutines: ['get']
                    }
                ];

                var convertToNgPromise = function (incomingPromise, promiseService) {
                    return promiseService(function (resolveCallback, rejectCallback) {
                        incomingPromise.then(resolveCallback, rejectCallback);
                    });
                };

                actionEnhancementSpecs.forEach(function (kindDefinition) {
                    var targetKindName = kindDefinition.kindAlias;
                    var targetKindRef = CloudSDK[targetKindName];

                    if (!targetKindRef) return; // Skip if the Parse class doesn't exist

                    kindDefinition.instanceOperations.forEach(function (routineIdentifier) {
                        var originalRoutine = targetKindRef.prototype[routineIdentifier];

                        if (originalRoutine) {
                            targetKindRef.prototype[routineIdentifier] = function () {
                                var routineResult = originalRoutine.apply(this, arguments);
                                return convertToNgPromise(routineResult, promiseFabricator);
                            };
                        }
                    });

                    kindDefinition.staticRoutines.forEach(function (routineIdentifier) {
                        var originalRoutine = targetKindRef[routineIdentifier];

                        if (originalRoutine) {
                            targetKindRef[routineIdentifier] = function () {
                                var routineResult = originalRoutine.apply(this, arguments);
                                return convertToNgPromise(routineResult, promiseFabricator);
                            };
                        }
                    });
                });

            }

        }]);

        ngGlobal.module('cloud-data-advanced-tools', ['cloud-data-enhancer'])
        .run(['$q', '$window', function (promiseFabricator, scopeHost) {

            if (!ngGlobal.isUndefined(scopeHost.Parse) && ngGlobal.isObject(scopeHost.Parse)) {

                var CloudSDK = scopeHost.Parse;

                CloudSDK.Object._kindRegistry = CloudSDK.Object._kindRegistry || {};
                CloudSDK.Object.retrieveKind = function (typeAlias) {
                    return CloudSDK.Object._kindRegistry[typeAlias];
                };

                function capitalizeFirstCharacter(inputString) {
                    return inputString.charAt(0).toUpperCase() + inputString.slice(1);
                }

                var initialObjectExtender = CloudSDK.Object.extend;

                CloudSDK.Object.extend = function (prototypeProperties) {

                    var derivedClass = initialObjectExtender.apply(this, arguments);

                    if (CloudSDK._.isObject(prototypeProperties) && CloudSDK._.isArray(prototypeProperties.attributeDesignations)) {
                        var attributeList = prototypeProperties.attributeDesignations;

                        CloudSDK._.each(attributeList, function (currentAttribute) {

                            var propertyHandle = capitalizeFirstCharacter(currentAttribute);

                            if (!derivedClass.prototype['get' + propertyHandle]) {
                                derivedClass.prototype['get' + propertyHandle] = function () {
                                    return this.get(currentAttribute);
                                };
                            }
                            if (!derivedClass.prototype['set' + propertyHandle]) {
                                derivedClass.prototype['set' + propertyHandle] = function (valueDatum) {
                                    this.set(currentAttribute, valueDatum);
                                    return this;
                                };
                            }
                        });
                    }
                    return derivedClass;
                };

                CloudSDK.Collection._typeRegistry = {};

                var baseCollectionExtender = CloudSDK.Collection.extend;

                CloudSDK.Collection.extend = function (optionsBundle) {

                    var extendedType = baseCollectionExtender.apply(this, arguments);

                    if (optionsBundle && optionsBundle.typeAlias) {
                        CloudSDK.Collection._typeRegistry[optionsBundle.typeAlias] = extendedType;
                    }

                    return extendedType;
                };

                CloudSDK.Collection.retrieveKind = function (typeAlias) {
                    return CloudSDK.Collection._typeRegistry[typeAlias];
                };

                Object.assign(CloudSDK.Collection.prototype, {
                    fetchAdditional: function (optionsBundle) {

                        if (!ngGlobal.isUndefined(this.query)) {

                            var currentBoundary = this.query._limit === -1 ? 100 : this.query._limit;
                            var currentOffset = this.query._skip || 0;

                            currentOffset += currentBoundary;

                            this.query.skip(currentOffset);

                            var selfReference = this;

                            var convertToNgPromise = function (incomingPromise, promiseService) {
                                return promiseService(function (resolveCallback, rejectCallback) {
                                    incomingPromise.then(resolveCallback, rejectCallback);
                                });
                            };

                            return convertToNgPromise(this.query.find(), promiseFabricator)
                                .then(function (freshRecords) {
                                    if (!optionsBundle || optionsBundle.appendResults !== false) {
                                        selfReference.add(freshRecords);
                                    }
                                    if (freshRecords.length < currentBoundary) {
                                        selfReference.furtherItemsAvailable = false;
                                    }
                                    return freshRecords;
                                });
                        }
                        return promiseFabricator.when([]);
                    }
                });

            }

        }]);

    }

})(this, undefined);