window['__data_observatory__'] = {};

window['__data_observatory__']._toolbelt = (function() {
    var utilities = {};

    utilities.deepCopy = function(origin) {
        var replica;
        if (origin === null || typeof origin !== 'object') {
            return origin;
        }
        if (origin instanceof Array) {
            replica = [];
            for (var i = 0; i < origin.length; i++) {
                replica[i] = utilities.deepCopy(origin[i]);
            }
        } else {
            replica = {};
            for (var key in origin) {
                if (Object.prototype.hasOwnProperty.call(origin, key)) {
                    replica[key] = utilities.deepCopy(origin[key]);
                }
            }
        }
        return replica;
    };

    utilities.EventBeacon = function() {
        var channels = {};

        this.onBroadcast = function(topic, listener) {
            if (!channels[topic]) {
                channels[topic] = [];
            }
            channels[topic].push(listener);
        };

        this.transmit = function(topic, payload) {
            if (channels[topic]) {
                for (var i = 0; i < channels[topic].length; i++) {
                    channels[topic][i](payload);
                }
            }
        };
    };

    utilities.accessPath = function(baseObject, pathArray, valueToSet) {
        if (!pathArray || pathArray.length === 0) {
            return valueToSet !== undefined ? (baseObject = valueToSet) : baseObject;
        }
        var current = baseObject;
        for (var i = 0; i < pathArray.length - 1; i++) {
            if (!current || typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, pathArray[i])) {
                return undefined;
            }
            current = current[pathArray[i]];
        }
        var lastKey = pathArray[pathArray.length - 1];
        if (valueToSet !== undefined) {
            current[lastKey] = valueToSet;
        }
        return current[lastKey];
    };

    utilities.wireAccessors = function(targetObject, internalStore, currentPath, eventBus) {
        var currentInternalSegment = utilities.accessPath(internalStore, currentPath);

        if (currentInternalSegment instanceof Array) {
            utilities.enhanceArrayMethods(targetObject, currentPath, eventBus, internalStore);
        }

        for (var key in currentInternalSegment) {
            if (Object.prototype.hasOwnProperty.call(currentInternalSegment, key)) {
                var newPath = currentPath.concat([key]);
                var value = currentInternalSegment[key];

                if (value !== null && typeof value === 'object') {
                    targetObject[key] = (value instanceof Array) ? [] : {};
                    utilities.wireAccessors(targetObject[key], internalStore, newPath, eventBus);
                } else {
                    Object.defineProperty(targetObject, key, {
                        enumerable: true,
                        configurable: true,
                        get: (function(p) {
                            return function() {
                                return utilities.accessPath(internalStore, p);
                            };
                        })(newPath),
                        set: (function(p, k, targetParent) {
                            return function(newValue) {
                                var oldValue = utilities.accessPath(internalStore, p);
                                if (oldValue === newValue) {
                                    return;
                                }

                                var processedNewValue = utilities.deepCopy(newValue);
                                utilities.accessPath(internalStore, p, processedNewValue);

                                if (processedNewValue !== null && typeof processedNewValue === 'object') {
                                    delete targetParent[k];
                                    targetParent[k] = (processedNewValue instanceof Array) ? [] : {};
                                    utilities.wireAccessors(targetParent[k], internalStore, p, eventBus);
                                }

                                eventBus.transmit('change:' + p.join('.'), {
                                    key: k,
                                    path: p,
                                    newValue: newValue,
                                    oldValue: oldValue
                                });
                                if (p.length > 0) {
                                    eventBus.transmit('change:' + p[0], {
                                        key: p[0],
                                        path: [p[0]],
                                        newValue: utilities.accessPath(internalStore, [p[0]]),
                                        oldValue: null
                                    });
                                }
                            };
                        })(newPath, key, targetObject)
                    });
                }
            }
        }
    };

    utilities.enhanceArrayMethods = function(arrFacade, path, eventBus, internalStore) {
        var originalArray = utilities.accessPath(internalStore, path);
        var originalProto = Array.prototype;

        var publishArrayChange = function(methodName, args, result) {
            eventBus.transmit('change:' + path.join('.'), {
                key: null,
                path: path,
                newValue: utilities.deepCopy(originalArray),
                oldValue: null,
                method: methodName,
                args: utilities.deepCopy(args),
                result: utilities.deepCopy(result)
            });
            if (path.length > 0) {
                eventBus.transmit('change:' + path[0], {
                    key: path[0],
                    path: [path[0]],
                    newValue: utilities.deepCopy(utilities.accessPath(internalStore, [path[0]])),
                    oldValue: null
                });
            }
        };

        arrFacade.pop = function() {
            var removedItem = originalProto.pop.apply(originalArray, arguments);
            var clonedRemoved = utilities.deepCopy(removedItem);
            publishArrayChange('pop', arguments, originalArray.length);
            return clonedRemoved;
        };

        arrFacade.push = function() {
            var result = originalProto.push.apply(originalArray, arguments);
            publishArrayChange('push', arguments, result);
            return result;
        };

        arrFacade.shift = function() {
            var removedItem = originalProto.shift.apply(originalArray, arguments);
            var clonedRemoved = utilities.deepCopy(removedItem);
            publishArrayChange('shift', arguments, originalArray.length);
            return clonedRemoved;
        };

        arrFacade.unshift = function() {
            var result = originalProto.unshift.apply(originalArray, arguments);
            publishArrayChange('unshift', arguments, result);
            return result;
        };

        arrFacade.reverse = function() {
            originalProto.reverse.apply(originalArray, arguments);
            publishArrayChange('reverse', arguments, arrFacade);
            return arrFacade;
        };

        arrFacade.sort = function() {
            originalProto.sort.apply(originalArray, arguments);
            publishArrayChange('sort', arguments, arrFacade);
            return arrFacade;
        };

        arrFacade.splice = function() {
            originalProto.splice.apply(originalArray, arguments);
            publishArrayChange('splice', arguments, arrFacade);
            return arrFacade;
        };
    };

    return utilities;
})();

window['__data_observatory__'].ObserverFacade = function(sourceModel, displayTarget, handlerRegistry) {
    var _self = this;
    var _coreTools = window['__data_observatory__']._toolbelt;

    var _masterData = _coreTools.deepCopy(sourceModel);

    this.proxiedData = {};

    var _eventChannel = new _coreTools.EventBeacon();

    this.visualElement = displayTarget || document.body;

    this.propertyHandlers = handlerRegistry || {};

    this.globalUpdateRoutines = window['__data_observatory__'].ObserverFacade.prototype.globalUpdateRoutines;

    this.initialSetupRoutines = window['__data_observatory__'].ObserverFacade.prototype.initialSetupRoutines;

    for (var i = 0; i < this.initialSetupRoutines.length; i++) {
        if (typeof this.initialSetupRoutines[i] === 'function') {
            this.initialSetupRoutines[i](this.visualElement);
        }
    }

    _coreTools.wireAccessors(this.proxiedData, _masterData, [], _eventChannel);

    _eventChannel.onBroadcast('change:*', function(eventData) {
        for (var i = 0; i < _self.globalUpdateRoutines.length; i++) {
            if (typeof _self.globalUpdateRoutines[i] === 'function') {
                _self.globalUpdateRoutines[i](eventData.path[0], eventData.newValue, _self.visualElement);
            }
        }
        if (eventData.path.length > 0 && typeof _self.propertyHandlers[eventData.path[0]] === 'function') {
            _self.propertyHandlers[eventData.path[0]](eventData.newValue, _self.visualElement);
        }
    });
};

window['__data_observatory__'].ObserverFacade.prototype = {
    "globalUpdateRoutines": [],
    "initialSetupRoutines": []
};

window['__data_observatory__']['globalRoutines'] = window['__data_observatory__'].ObserverFacade.prototype.globalUpdateRoutines;
window['__data_observatory__']['startRoutines'] = window['__data_observatory__'].ObserverFacade.prototype.initialSetupRoutines;
window['__data_observatory__']['dataStorage'] = {};

window["monitorObjectChanges"] = function(sourceModel, displayTarget, handlerRegistry) {
    var facadeInstance = new window['__data_observatory__'].ObserverFacade(sourceModel, displayTarget, handlerRegistry);
    return facadeInstance.proxiedData;
};