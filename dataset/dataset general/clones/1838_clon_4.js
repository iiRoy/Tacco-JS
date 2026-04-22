(function( globalScope ) {
    'use strict';

    const initialParameters = {
        preventCaching: true,
        releaseBindingsAfterLoad: true,
        completionClass: "asset-loaded",
        progressClass: "asset-loading",
        failureClass: "asset-error",
        sizingMode: 'contain',
        alignCenter: true,
        scalingContainer: 'parent',
        propagateClassesToParent: true
    };

    let sizeDefinitions = [
        { alias: 'default', criteria: 'only screen and (min-width: 1px)' },
        { alias: 'small', criteria: 'only screen and (min-width: 480px)' },
        { alias: 'medium', criteria: 'only screen and (min-width: 768px)' },
        { alias: 'large', criteria: 'only screen and (min-width: 1280px)' },
        { alias: 'xlarge', criteria: 'only screen and (min-width: 1440px)' }
    ];

    const utilityConditions = {
        highDPI: 'only screen and (-webkit-min-device-pixel-ratio: 2), ' +
                 'only screen and (min--moz-device-pixel-ratio: 2), ' +
                 'only screen and (-o-min-device-pixel-ratio: 2/1), ' +
                 'only screen and (min-device-pixel-ratio: 2), ' +
                 'only screen and (min-resolution: 192dpi), ' +
                 'only screen and (min-resolution: 2dppx)',
        verticalOrientation: 'only screen and (orientation: portrait)'
    };

    const eventHub = (function() {
        const subscribers = {};

        return {
            publish: function(eventName, ...args) {
                if (subscribers[eventName]) {
                    subscribers[eventName].forEach(callback => {
                        try {
                            callback(...args);
                        } catch (e) {
                            console.error(`Error in event listener for ${eventName}:`, e);
                        }
                    });
                }
            },
            subscribe: function(eventName, callback) {
                if (!subscribers[eventName]) {
                    subscribers[eventName] = [];
                }
                subscribers[eventName].push(callback);
                return () => this.unsubscribe(eventName, callback);
            },
            unsubscribe: function(eventName, callback) {
                if (subscribers[eventName]) {
                    subscribers[eventName] = subscribers[eventName].filter(cb => cb !== callback);
                }
            }
        };
    })();

    const eventIdentifiers = {
        ASSET_ACQUIRED_EVENT: "assetAcquired",
        ASSET_FAILURE_EVENT: "assetFailure",
        LOAD_TRIGGER_EVENT: "loadInitiated",
        BATCH_COMPLETION_EVENT: "batchComplete",
        FULL_QUEUE_COMPLETION_EVENT: "allBatchesComplete",
        ASSET_SCALED_EVENT: "assetResized",
        VIEWPORT_CHANGE_EVENT: "viewportChange",
        CONDITION_UPDATE_EVENT: "mediaConditionUpdate"
    };

    const configurationManager = (function() {
        return {
            configureOptions: function(newOptions) {
                if (newOptions && typeof newOptions === 'object') {
                    Object.keys(initialParameters).forEach(prop => {
                        if (Object.prototype.hasOwnProperty.call(newOptions, prop)) {
                            initialParameters[prop] = newOptions[prop];
                        }
                    });
                } else {
                    return { ...initialParameters };
                }
            },
            defineSizeCriteria: function(newDefinitions) {
                if (newDefinitions && Array.isArray(newDefinitions)) {
                    sizeDefinitions = newDefinitions.map(def => ({ ...def }));
                } else {
                    return sizeDefinitions.map(def => ({ ...def }));
                }
            },
            appendSizeDefinition: function(aliasName, conditionQuery) {
                sizeDefinitions.push({ alias: aliasName, criteria: conditionQuery });
            },
            modifySizeDefinition: function(aliasName, newConditionQuery) {
                const definition = sizeDefinitions.find(def => def.alias === aliasName);
                if (definition) {
                    definition.criteria = newConditionQuery;
                }
            },
            eraseSizeDefinition: function(aliasName) {
                sizeDefinitions = sizeDefinitions.filter(def => def.alias !== aliasName);
            }
        };
    })();

    const resourceLocator = (function() {
        if (typeof globalScope.matchMedia === 'undefined') {
            throw new Error("matchMedia API is not available. Please ensure a polyfill is used.");
        }

        const activeConditions = {};
        let isHighResolution = globalScope.matchMedia(utilityConditions.highDPI).matches;
        const verticalLayoutQuery = registerCondition(utilityConditions.verticalOrientation);

        function conditionChangeObserver(mediaQueryList) {
            eventHub.publish(eventIdentifiers.CONDITION_UPDATE_EVENT, mediaQueryList);
        }

        function registerCondition(queryText) {
            if (!activeConditions[queryText]) {
                const mq = globalScope.matchMedia(queryText);
                mq.addListener(conditionChangeObserver);
                activeConditions[queryText] = mq;
            }
            return activeConditions[queryText];
        }

        function getCriteriaByAlias(aliasName) {
            return sizeDefinitions.find(def => def.alias === aliasName) || null;
        }

        function getOption(key, options) {
            return (options && Object.prototype.hasOwnProperty.call(options, key)) ? options[key] : initialParameters[key];
        }

        function processPath(rawPath, sourceCollection, options) {
            let finalPath = "";
            if (rawPath.includes(",")) {
                const pathVariants = rawPath.split(",").map(s => s.trim());
                finalPath = pathVariants.find(path =>
                    (isHighResolution && path.includes('@2x')) || (!isHighResolution && !path.includes('@2x'))
                ) || pathVariants[0];
            } else {
                finalPath = rawPath;
            }
            return finalPath;
        }

        function determineSourceURL(sourceMap, options) {
            let matchedSource = null;
            let fallbackSource = null;

            Object.entries(sourceMap).some(([alias, url]) => {
                const cleanAlias = alias.replace('Portrait', '');
                const isPortraitSpecific = alias.includes("Portrait");
                const requestedCriteriaSet = getCriteriaByAlias(cleanAlias);

                if (requestedCriteriaSet) {
                    const conditionQueryText = getOption(alias, options) || requestedCriteriaSet.criteria;
                    const activeMediaQuery = registerCondition(conditionQueryText);

                    if (isPortraitSpecific) {
                        if (activeMediaQuery.matches && verticalLayoutQuery.matches) {
                            matchedSource = url;
                            return true;
                        } else if (fallbackSource === null) {
                            fallbackSource = url;
                        }
                    } else {
                        if (activeMediaQuery.matches) {
                            matchedSource = url;
                            return true;
                        } else if (fallbackSource === null) {
                            fallbackSource = url;
                        }
                    }
                }
                return false;
            });

            const chosenSource = matchedSource !== null ? matchedSource : fallbackSource;

            if (chosenSource === null || typeof chosenSource === 'undefined') {
                console.warn("[VisualAssetManager] -> No URL found for sources:", sourceMap);
                return false;
            } else {
                return processPath(chosenSource, sourceMap, options);
            }
        }

        return {
            resolveResourcePath: function(sourceMap, options) {
                let finalURL = determineSourceURL(sourceMap, options);

                if (finalURL === false) {
                    return false;
                }

                if (getOption('preventCaching', options)) {
                    const cacheBuster = "r=" + (Math.random() * 10000000).toFixed(0);
                    finalURL += (finalURL.includes('?') ? '&' : '?') + cacheBuster;
                }
                return finalURL;
            },
            getHighResolutionStatus: () => isHighResolution,
            getVerticalLayoutQuery: () => verticalLayoutQuery
        };
    })();

    const operationInitiator = (function() {
        return {
            beginBatchLoad: function(groupIdentifier) {
                eventHub.publish(eventIdentifiers.LOAD_TRIGGER_EVENT, {
                    type: 'groupId',
                    identifier: groupIdentifier
                });
            },
            initiateAttributeLoad: function(attributeName, attributeValue) {
                eventHub.publish(eventIdentifiers.LOAD_TRIGGER_EVENT, {
                    type: 'attribute',
                    name: attributeName,
                    value: attributeValue
                });
            },
            initiateClassLoad: function(className) {
                eventHub.publish(eventIdentifiers.LOAD_TRIGGER_EVENT, {
                    type: 'class',
                    name: className
                });
            },
            initiateElementLoad: function(elementId) {
                eventHub.publish(eventIdentifiers.LOAD_TRIGGER_EVENT, {
                    type: 'id',
                    name: elementId
                });
            }
        };
    })();

    const acquisitionQueue = (function() {
        let taskGroups = new Map();
        let currentGroupIndex = -1;
        let overallProgress = 0;
        let groupProgress = 0;

        eventHub.subscribe(eventIdentifiers.ASSET_ACQUIRED_EVENT, (itemData, elementRef) => {
            dequeueItem(itemData);
        });

        eventHub.subscribe(eventIdentifiers.ASSET_FAILURE_EVENT, (itemData, elementRef) => {
            dequeueItem(itemData);
        });

        function groupExists(groupIdentifier, remove = false) {
            if (taskGroups.has(groupIdentifier)) {
                const group = taskGroups.get(groupIdentifier);
                if (remove) {
                    taskGroups.delete(groupIdentifier);
                }
                return group;
            }
            return null;
        }

        function itemInGroup(groupItems, itemDetails, remove = false) {
            if (!groupItems || groupItems.length === 0) {
                return null;
            }
            const foundIndex = groupItems.findIndex(item => item.url === itemDetails.url);
            if (foundIndex !== -1) {
                const foundItem = groupItems[foundIndex];
                if (remove) {
                    groupItems.splice(foundIndex, 1);
                }
                return foundItem;
            }
            return null;
        }

        return {
            enqueueItem: function(itemDetails) {
                const groupIdentifier = itemDetails.index;
                let group = groupExists(groupIdentifier);

                if (!group) {
                    group = { index: groupIdentifier, items: [] };
                    taskGroups.set(groupIdentifier, group);
                }

                if (itemInGroup(group.items, itemDetails)) {
                    return;
                }

                group.items.push(itemDetails);

                taskGroups = new Map([...taskGroups.entries()].sort((a, b) => a[0] - b[0]));
            },

            dequeueItem: function(itemDetails) {
                if (!itemDetails || typeof itemDetails.index === 'undefined') {
                    return;
                }

                const groupIdentifier = itemDetails.index;
                const group = groupExists(groupIdentifier);

                if (group) {
                    itemInGroup(group.items, itemDetails, true);
                    if (group.items.length === 0) {
                        taskGroups.delete(groupIdentifier);
                        eventHub.publish(eventIdentifiers.BATCH_COMPLETION_EVENT, groupIdentifier);
                        if (taskGroups.size === 0) {
                            eventHub.publish(eventIdentifiers.FULL_QUEUE_COMPLETION_EVENT);
                        }
                    }
                }
            },

            removeGroup: function(groupIdentifier) {
                return groupExists(groupIdentifier, true);
            },

            getCurrentQueueSnapshot: function() {
                return Array.from(taskGroups.values()).map(group => ({
                    index: group.index,
                    items: group.items.map(item => ({ ...item }))
                }));
            }
        };
    })();

    globalScope.AssetManager = {
        config: configurationManager,
        locator: resourceLocator,
        operations: operationInitiator,
        queue: acquisitionQueue,
        events: eventHub,
        eventNames: eventIdentifiers
    };

})(window);