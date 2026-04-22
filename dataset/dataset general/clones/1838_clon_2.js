/*
 * vision-angular-component
 * https://github.com/your-new-repo/vision-angular-component
 *
 * Copyright (c) 2023 Visionary Solutions
 * Permitted under the Apache 2.0 license.
 */

/*global WinObj */
/*global JQueryLib */
/*global DebugLog */
/*global ViewportQuery */
/*global PictureObj */
/*global $Dom */
(function(ngCore, undef) {

    'use strict';

    // @private
    // initial configuration values
    var standard_configs = {
        // Add a random string to the resource link to prevent caching
        force_refresh: true,
        // Detach event listeners from attributes once images are loaded for improved performance
        release_bindings_on_load: true,
        // The CSS class applied to the image element upon successful loading
        loaded_css_class: "vision-asset-loaded",
        // The CSS class applied to the image element while it is actively loading
        loading_css_class: "vision-asset-loading",
        // The CSS class applied to the image element if an error occurs during loading
        error_css_class: "vision-asset-error",
        // automatic sizing adjustments
        // Sizing mode for the image within its container
        scaling_strategy: 'fitWithin', // [fitWithin | fillArea]
        // Center the image within its designated container
        center_image: true, // position centrally inside the containing element
        // The type of container used for image scaling and/or centering
        container_type: 'ancestor', // ["ancestor" | "viewport"]
        // apply loading/loaded/error classes to the parent element as well (if present)
        ancestor_classes_enabled: true
    };

    var preset_dimensions = [

        {
            prop: 'standard',
            condition: 'only screen and (min-width: 1px)'
        }, {
            prop: 'petite',
            condition: 'only screen and (min-width: 480px)'
        }, {
            prop: 'average',
            condition: 'only screen and (min-width: 768px)'
        }, {
            prop: 'grand',
            condition: 'only screen and (min-width: 1280px)'
        }, {
            prop: 'extraLarge',
            condition: 'only screen and (min-width: 1440px)'
        }
    ];

    var helperConditions = {
        'highDPI': 'only screen and (-webkit-min-device-pixel-ratio: 2), ' +
            'only screen and (min--moz-device-pixel-ratio: 2), ' +
            'only screen and (-o-min-device-pixel-ratio: 2/1), ' +
            'only screen and (min-device-pixel-ratio: 2), ' +
            'only screen and (min-resolution: 192dpi), ' +
            'only screen and (min-resolution: 2dppx)',
        'vertical': 'only screen and (orientation: portrait)'
    };

    var scaling_activated = false;

    if (ngCore.isUndefined(ViewportQuery)) {
        throw "ViewportQuery (matchMedia) is missing. A polyfill is required.";
    }

    // Custom Events
    var EVT_GRAPHIC_LOADED = "$visionAssetLoaded",
        EVT_GRAPHIC_FAIL = "$visionAssetFailed",
        EVT_GRAPHIC_REQ = "$visionLoadRequest",
        EVT_BATCH_IDX_DONE = "$visionBatchIndexComplete",
        EVT_BATCH_ALL_DONE = "$visionBatchComplete",
        EVT_GRAPHIC_RESCALE = "$visionAssetRescale",
        EVT_VIEWPORT_RESCALE = "$visionViewportRescale",
        EVT_MEDIA_COND_ALTERED = "$visionMediaConditionChanged";

    var visualsModule = ngCore.module('visualsModule', []);

    visualsModule.provider('visualsProvider', [

        function() {

            this.defaultConfigurations = function(val) {

                if (!ngCore.isUndefined(val)) {
                    if (val !== '') {
                        for (var settingKey in standard_configs) {
                            if (!ngCore.isUndefined(val[settingKey])) {
                                standard_configs[settingKey] = val[settingKey];
                            }
                        }
                    }
                } else {
                    return standard_configs;
                }

            };

            this.defaultDimensions = function(val) {

                if (!ngCore.isUndefined(val)) {
                    if (val !== '') {
                        for (var dimensionKey in preset_dimensions) {
                            if (!ngCore.isUndefined(val[dimensionKey])) {
                                preset_dimensions[dimensionKey] = val[dimensionKey];
                            }
                        }
                    }
                } else {
                    return preset_dimensions;
                }

            };

            this.appendDimensionPreset = function(propName, queryCondition) {

                preset_dimensions.push({
                    "prop": propName,
                    "condition": queryCondition
                });

            };

            this.modifyDimensionPreset = function(propName, newQueryCondition) {
                for (var i = preset_dimensions.length - 1; i >= 0; i--) {
                    if (preset_dimensions[i].prop === propName) {
                        preset_dimensions[i].prop = newQueryCondition;
                    }
                }
            };

            this.eraseDimensionPreset = function(propName) {
                for (var i = preset_dimensions.length - 1; i >= 0; i--) {
                    if (preset_dimensions[i].prop === propName) {
                        preset_dimensions.splice(i, 1);
                        break;
                    }
                }
            };

            this.$get = ngCore.noop; // No operation for $get in provider

        }
    ]);

    visualsModule.service('visualAttrParser', ["$window", "$log", "$rootScope",

        function($window, $log, $rootScope) {

            var visualAttrProcessor = {};

            visualAttrProcessor.mediaConditionList = [];

            visualAttrProcessor.computeResourceLink = function(sourceCollection, opts) {


                var resourceEntry = visualAttrProcessor.getLinkForSources(sourceCollection, opts);

                if (resourceEntry === "") {
                    $log.warn("[visualsModule] -> missing-image-source", sourceCollection);
                    return false;
                }

                if (getSetting('force_refresh', opts) === true) {

                    if (resourceEntry.indexOf('?') > -1) {
                        resourceEntry += "&c=" + (Math.random() * 100000).toString();
                    } else {
                        resourceEntry += "?c=" + (Math.random() * 100000).toString();
                    }

                }

                return resourceEntry;
            };

            visualAttrProcessor.getLinkForSources = function(sourceCollection, opts) {

                var matchingProperty = null,
                    fallbackProperty = null;

                for (var propKey in sourceCollection) {

                    if (!ngCore.isUndefined(sourceCollection[propKey])) {


                        var cleanProp = propKey.replace('Portrait', '');
                        var checkPortrait = propKey.indexOf("Portrait") > -1;

                        var requestedConditionSet = _getConditionSetByAttr(cleanProp);

                        // DebugLog("sources", sourceCollection, "prop", propKey, "requestedConditionSet", requestedConditionSet);

                        if (requestedConditionSet != null) {
                            var queryStr = "";

                            if (!ngCore.isUndefined(opts[propKey])) {
                                queryStr = opts[propKey];

                            } else {
                                queryStr = requestedConditionSet.condition;
                            }

                            var mediaConditionRequested = _mediaConditionPresent(queryStr);

                            if (mediaConditionRequested === false) {
                                mediaConditionRequested = _registerMediaQuery(queryStr);

                            }

                            // DebugLog("prop", mediaConditionRequested.media, mediaConditionRequested.matches);

                            if (checkPortrait) {

                                if (mediaConditionRequested.matches && visualAttrProcessor.portraitCondition.matches) {
                                    matchingProperty = sourceCollection[propKey];
                                } else if (matchingProperty == null) {
                                    fallbackProperty = sourceCollection[propKey];
                                }
                            } else {

                                if (mediaConditionRequested.matches) {
                                    matchingProperty = sourceCollection[propKey];
                                } else if (matchingProperty == null) {
                                    fallbackProperty = sourceCollection[propKey];
                                }
                            }

                        }
                    }

                }

                // attempt to retrieve at least one source...
                if (matchingProperty === null && fallbackProperty !== null) {
                    matchingProperty = fallbackProperty;
                }

                if (matchingProperty === null || ngCore.isUndefined(matchingProperty)) {
                    return "";
                } else {
                    return visualAttrProcessor.processAttribute(matchingProperty, sourceCollection, opts);
                }

            };

            visualAttrProcessor.conditionChangeHandler = function(mqObj) {
                $rootScope.$broadcast(EVT_MEDIA_COND_ALTERED, mqObj);
            };

            var _registerMediaQuery = function(queryStr) {
                var mediaQ = ViewportQuery(queryStr);
                mediaQ.addListener(visualAttrProcessor.conditionChangeHandler);
                visualAttrProcessor.mediaConditionList[queryStr] = mediaQ;
                return visualAttrProcessor.mediaConditionList[queryStr];
            };

            var _deregisterMediaQuery = function(queryStr) {
                // TODO: Implement logic to remove unused media queries
            };

            var _mediaConditionPresent = function(queryStr) {
                if (ngCore.isUndefined(visualAttrProcessor.mediaConditionList[queryStr])) {
                    return false;
                } else {
                    return visualAttrProcessor.mediaConditionList[queryStr];
                }
            };

            var _getConditionSetByAttr = function(prop) {
                for (var i = 0; i < preset_dimensions.length; i++) {
                    if (preset_dimensions[i].prop === prop) {
                        return preset_dimensions[i];
                    }
                }
                return null;
            };

            var _getConditionSetByQuery = function(queryStr) {
                for (var i = 0; i < preset_dimensions.length; i++) {
                    if (preset_dimensions[i].condition === queryStr) {
                        return preset_dimensions[i];
                    }
                }
                return null;
            };


            visualAttrProcessor.processAttribute = function(imageLink, sourceCollection, opts) {
                var outputLink = "";

                if (imageLink.indexOf(",") > -1) {
                    var imageListSplit = imageLink.split(",");
                    ngCore.forEach(imageListSplit, function(imgSrc) {
                        if (visualAttrProcessor.isHighRes === true && imgSrc.indexOf('@2x') > -1) {
                            outputLink = imgSrc;
                        } else if (visualAttrProcessor.isHighRes === false && imgSrc.indexOf('@2x') === -1) {
                            outputLink = imgSrc;
                        }
                    });
                    // Safely default to the first image if no @2x or non-@2x match
                    if (outputLink === '') {
                        outputLink = imageListSplit[0];
                    }
                } else {
                    outputLink = imageLink;
                }

                return outputLink;
            };
            // configure utility properties
            visualAttrProcessor.isHighRes = ViewportQuery(helperConditions.highDPI).matches;
            visualAttrProcessor.portraitCondition = _registerMediaQuery(helperConditions.vertical);

            return visualAttrProcessor;
        }
    ]);

    visualsModule.service('visualsCoreService', ['$rootScope',

        function($rootScope) {

            var visualsService = {};

            visualsService.loadBatchIndex = function(idx) {

                $rootScope.$broadcast(EVT_GRAPHIC_REQ, {
                    kind: 'batchIndex',
                    idx: idx
                });
            };

            visualsService.loadByProperty = function(propertyName, propertyValue) {

                $rootScope.$broadcast(EVT_GRAPHIC_REQ, {
                    kind: 'property',
                    name: propertyName,
                    value: propertyValue,
                    idx: 0
                });
            };

            visualsService.loadByStyleClass = function(className) {

                $rootScope.$broadcast(EVT_GRAPHIC_REQ, {
                    kind: 'styleClass',
                    cssClass: className,
                    idx: 0
                });
            };

            visualsService.loadGraphicById = function(elementId) {

                $rootScope.$broadcast(EVT_GRAPHIC_REQ, {
                    kind: 'uniqueId',
                    id: elementId,
                    idx: 0
                });
            };

            return visualsService;

        }
    ]);

    visualsModule.service('visualsQueueService', ['$rootScope',

        function($rootScope) {

            var visualsBatch = {};

            visualsBatch.itemBatch = [];
            visualsBatch.currentPosition = -1;
            visualsBatch.progressPercentage = 0;
            visualsBatch.itemProgressPercentage = 0;

            $rootScope.$on(EVT_GRAPHIC_LOADED, function(evt, dataObject, domElement) {
                visualsBatch.dequeueItem(dataObject, domElement);
            });

            $rootScope.$on(EVT_GRAPHIC_FAIL, function(evt, dataObject, domElement) {
                visualsBatch.dequeueItem(dataObject);
            });

            visualsBatch.enqueueItem = function(itemObj) {

                var indexGroup = visualsBatch.batchIndexExists(itemObj.idx);
                if (!indexGroup) {
                    indexGroup = {
                        idx: itemObj.idx,
                        items: []
                    };
                    visualsBatch.itemBatch.push(indexGroup);
                }

                if (visualsBatch.batchItemExists(indexGroup.items, itemObj)) {
                    return;
                }

                indexGroup.items.push(itemObj);

                visualsBatch.itemBatch.sort(function(a, b) {
                    return a.idx - b.idx;
                });

            };

            visualsBatch.batchIndexExists = function(idx, andRemoveFlag) {

                if (!visualsBatch.itemBatch || visualsBatch.itemBatch.length === 0) {
                    return false;
                }

                for (var i = visualsBatch.itemBatch.length - 1; i >= 0; i--) {
                    if (visualsBatch.itemBatch[i].idx === idx) {
                        if (andRemoveFlag === true) {
                            return visualsBatch.itemBatch.splice(i, 1);
                        } else {
                            return visualsBatch.itemBatch[i];
                        }
                    }
                }

                return false;
            };

            visualsBatch.batchItemExists = function(dictionary, itemObj, andRemoveFlag) {

                if (dictionary === null) {
                    var indexGroup = visualsBatch.batchIndexExists(itemObj.idx);
                    if (indexGroup && indexGroup.items && indexGroup.items.length > 0) {
                        dictionary = indexGroup.items;
                    }
                }

                if (!dictionary || dictionary.length === 0) {
                    return false;
                }

                for (var i = dictionary.length - 1; i >= 0; i--) {
                    if (dictionary[i].url === itemObj.url) {
                        if (andRemoveFlag === true) {
                            return dictionary.splice(i, 1);
                        } else {
                            return dictionary[i];
                        }
                    }
                }

                return false;
            };

            visualsBatch.dequeueBatchIndex = function(idx) {

                if (!visualsBatch.itemBatch || visualsBatch.itemBatch.length === 0) {
                    return false;
                }

                for (var i = visualsBatch.itemBatch.length - 1; i >= 0; i--) {
                    if (visualsBatch.itemBatch[i].idx === idx) {
                        return visualsBatch.itemBatch.splice(i, 1);
                    }
                }

                return false;
            };

            visualsBatch.dequeueItem = function(itemObj, domElement) {


                if (ngCore.isUndefined(itemObj)) {
                    return;
                }

                var currentItemIndex = itemObj.idx;

                var indexGroup = visualsBatch.batchIndexExists(itemObj.idx);

                var itemEntry = visualsBatch.batchItemExists(indexGroup.items, itemObj, true);