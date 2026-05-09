(function() {

    var globalReference = this;
    var formerGlobalNamespace = globalReference.FrameworkX;

    var FrameworkX;
    if (typeof module !== 'undefined' && module.exports) {
        FrameworkX = module.exports;
    } else {
        FrameworkX = globalReference.FrameworkX = {};
    }

    FrameworkX.LIB_VERSION = '0.5.3-reimagined';

    var internalTools = (function() {
        var toolset = {};
        var uniqueIdCounter = 0;

        toolset.assignProperties = function(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
            return target;
        };

        toolset.isFunction = function(obj) {
            return typeof obj === 'function';
        };

        toolset.createUniqueId = function(prefix) {
            return prefix + uniqueIdCounter++;
        };

        toolset.shallowCopy = function(obj) {
            if (obj === null || typeof obj !== 'object') return obj;
            if (Array.isArray(obj)) return obj.slice();
            var copy = {};
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    copy[key] = obj[key];
                }
            }
            return copy;
        };

        toolset.deepEquality = function(valA, valB) {
            if (valA === valB) return true;
            if (valA == null || typeof valA != 'object' || valB == null || typeof valB != 'object') {
                return valA === valB;
            }

            if (Array.isArray(valA) && Array.isArray(valB)) {
                if (valA.length !== valB.length) return false;
                for (var i = 0; i < valA.length; i++) {
                    if (!toolset.deepEquality(valA[i], valB[i])) return false;
                }
                return true;
            }

            if (Array.isArray(valA) !== Array.isArray(valB)) return false;

            var keysA = Object.keys(valA);
            var keysB = Object.keys(valB);
            if (keysA.length !== keysB.length) return false;

            for (var k of keysA) {
                if (!Object.prototype.hasOwnProperty.call(valB, k) || !toolset.deepEquality(valA[k], valB[k])) {
                    return false;
                }
            }
            return true;
        };

        toolset.bindAllToInstance = function(instance) {
            var methodNames = Array.prototype.slice.call(arguments, 1);
            for (var i = 0; i < methodNames.length; i++) {
                var name = methodNames[i];
                instance[name] = instance[name].bind(instance);
            }
        };

        toolset.isArray = Array.isArray;

        toolset.mapArray = function(arr, iterator) {
            return arr.map(iterator);
        };

        return toolset;
    })();

    var sanitizeHtml = (function() {
        var charToEntity = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '`': '&#x60;'
        };
        var charRegex = /[&<>"'`]/g;
        return function(text) {
            if (text == null) return '';
            return String(text).replace(charRegex, function(s) {
                return charToEntity[s];
            });
        };
    })();

    var externalDomLib = globalReference.jQuery || globalReference.Zepto;

    FrameworkX.revertNamespace = function() {
        globalReference.FrameworkX = formerGlobalNamespace;
        return this;
    };

    FrameworkX.enableHttpMethodOverride = false;
    FrameworkX.enableJsonPayloadEncoding = false;

    var EventBusModule = {

        subscribe: function(signal, handler, scope) {
            var listenerMap = this._signalListeners || (this._signalListeners = new Map());
            var listenerList = listenerMap.get(signal) || [];
            listenerList.push({
                handler: handler,
                scope: scope
            });
            listenerMap.set(signal, listenerList);
            return this;
        },

        unsubscribe: function(signal, handler) {
            var listenerMap = this._signalListeners;
            if (!listenerMap) return this;

            if (!signal) {
                this._signalListeners = undefined;
            } else {
                var listenerList = listenerMap.get(signal);
                if (!listenerList) return this;

                if (!handler) {
                    listenerMap.delete(signal);
                } else {
                    var newList = listenerList.filter(function(item) {
                        return item.handler !== handler;
                    });
                    listenerMap.set(signal, newList);
                }
            }
            return this;
        },

        dispatch: function(signalName) {
            var listenerMap = this._signalListeners;
            if (!listenerMap) return this;

            var args = Array.prototype.slice.call(arguments, 1);
            var allArgs = Array.prototype.slice.call(arguments);

            var specificListeners = listenerMap.get(signalName);
            if (specificListeners) {
                specificListeners.slice().forEach(function(listener) {
                    listener.handler.apply(listener.scope || this, args);
                }, this);
            }

            var allListeners = listenerMap.get('all');
            if (allListeners) {
                allListeners.slice().forEach(function(listener) {
                    listener.handler.apply(listener.scope || this, allArgs);
                }, this);
            }

            return this;
        }
    };

    FrameworkX.DataUnit = function(initialProps, options) {
        var defaultProps;
        initialProps = initialProps || {};
        if (defaultProps = this.baseProperties) {
            if (internalTools.isFunction(defaultProps)) defaultProps = defaultProps.call(this);
            initialProps = internalTools.assignProperties({}, defaultProps, initialProps);
        }
        this.currentProperties = {};
        this._htmlSafeCache = {};
        this.entityId = internalTools.createUniqueId('du');
        this.updateProperties(initialProps, {
            quiet: true
        });
        this._hasChangedSinceLastEvent = false;
        this._previousPropertyValues = internalTools.shallowCopy(this.currentProperties);
        if (options && options.collection) this.collection = options.collection;
        this.init(initialProps, options);
    };

    internalTools.assignProperties(FrameworkX.DataUnit.prototype, EventBusModule, {

        _previousPropertyValues: null,
        _hasChangedSinceLastEvent: false,
        keyForIdentifier: 'id',

        init: function() {},

        exportProperties: function() {
            return internalTools.shallowCopy(this.currentProperties);
        },

        getProperty: function(propName) {
            return this.currentProperties[propName];
        },

        getHtmlSafeProperty: function(propName) {
            var cachedHtml;
            if (cachedHtml = this._htmlSafeCache[propName]) return cachedHtml;
            var val = this.currentProperties[propName];
            return this._htmlSafeCache[propName] = sanitizeHtml(val == null ? '' : '' + val);
        },

        hasProperty: function(propName) {
            return this.currentProperties[propName] != null;
        },

        updateProperties: function(propsToSet, options) {
            options = options || {};
            if (!propsToSet) return this;
            if (propsToSet.currentProperties) propsToSet = propsToSet.currentProperties;
            var current = this.currentProperties,
                cache = this._htmlSafeCache;

            if (!options.quiet && this.validate && !this._executeValidation(propsToSet, options)) return false;

            if (this.keyForIdentifier in propsToSet) this.id = propsToSet[this.keyForIdentifier];

            var inUpdateProcess = this._isUpdating;
            this._isUpdating = true;

            for (var prop in propsToSet) {
                var value = propsToSet[prop];
                if (!internalTools.deepEquality(current[prop], value)) {
                    current[prop] = value;
                    delete cache[prop];
                    this._hasChangedSinceLastEvent = true;
                    if (!options.quiet) this.dispatch('property:changed:' + prop, this, value, options);
                }
            }

            if (!inUpdateProcess && !options.quiet && this._hasChangedSinceLastEvent) this.notifyChange(options);
            this._isUpdating = false;
            return this;
        },

        removeProperty: function(propName, options) {
            if (!(propName in this.currentProperties)) return this;
            options = options || {};
            var currentValue = this.currentProperties[propName];

            var validationTarget = {};
            validationTarget[propName] = undefined;
            if (!options.quiet && this.validate && !this._executeValidation(validationTarget, options)) return false;

            delete this.currentProperties[propName];
            delete this._htmlSafeCache[propName];
            if (propName == this.keyForIdentifier) delete this.id;
            this._hasChangedSinceLastEvent = true;
            if (!options.quiet) {
                this.dispatch('property:changed:' + propName, this, undefined, options);
                this.notifyChange(options);
            }
            return this;
        },

        clearProperties: function(options) {
            options = options || {};
            var prop;
            var oldProperties = this.currentProperties;

            var validationTarget = {};
            for (prop in oldProperties) validationTarget[prop] = undefined;
            if (!options.quiet && this.validate && !this._executeValidation(validationTarget, options)) return false;

            this.currentProperties = {};
            this._htmlSafeCache = {};
            this._hasChangedSinceLastEvent = true;
            if (!options.quiet) {
                for (prop in oldProperties) {
                    this.dispatch('property:changed:' + prop, this, undefined, options);
                }
                this.notifyChange(options);
            }
            return this;
        },

        pullFromServer: function(options) {
            options = options || {};
            var unitRef = this;
            var successCallback = options.success;
            options.success = function(response, status, xhr) {
                if (!unitRef.updateProperties(unitRef.interpretResponse(response, xhr), options)) return false;
                if (successCallback) successCallback(unitRef, response);
            };
            options.error = manageError(options.error, unitRef, options);
            return (this.remoteSync || FrameworkX.dataSync).call(this, 'read', this, options);
        },

        pushToServer: function(props, options) {
            options = options || {};
            if (props && !this.updateProperties(props, options)) return false;
            var unitRef = this;
            var successCallback = options.success;
            options.success = function(response, status, xhr) {
                if (!unitRef.updateProperties(unitRef.interpretResponse(response, xhr), options)) return false;
                if (successCallback) successCallback(unitRef, response, xhr);
            };
            options.error = manageError(options.error, unitRef, options);
            var operation = this.isNewRecord() ? 'create' : 'update';
            return (this.remoteSync || FrameworkX.dataSync).call(this, operation, this, options);
        },

        deleteFromServer: function(options) {
            options = options || {};
            if (this.isNewRecord()) return this.dispatch('record:destroyed', this, this.collection, options);
            var unitRef = this;
            var successCallback = options.success;
            options.success = function(response) {
                unitRef.dispatch('record:destroyed', unitRef, unitRef.collection, options);
                if (successCallback) successCallback(unitRef, response);
            };
            options.error = manageError(options.error, unitRef, options);
            return (this.remoteSync || FrameworkX.dataSync).call(this, 'delete', this, options);
        },

        getResourceURL: function() {
            var base = resolveResourcePath(this.collection) || this.urlRoot || resourcePathError();
            if (this.isNewRecord()) return base;
            return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
        },

        interpretResponse: function(response, xhr) {
            return response;
        },

        duplicate: function() {
            return new this.constructor(this);
        },

        isNewRecord: function() {
            return this.id == null;
        },

        notifyChange: function(options) {
            this.dispatch('unit:changed', this, options);
            this._previousPropertyValues = internalTools.shallowCopy(this.currentProperties);
            this._hasChangedSinceLastEvent = false;
        },

        didPropertyChange: function(propName) {
            if (propName) return !internalTools.deepEquality(this._previousPropertyValues[propName], this.currentProperties[propName]);
            return this._hasChangedSinceLastEvent;
        },

        getChangedProperties: function(current) {
            current = current || this.currentProperties;
            var old = this._previousPropertyValues;
            var changed = false;
            for (var prop in current) {
                if (!internalTools.deepEquality(old[prop], current[prop])) {
                    changed = changed || {};
                    changed[prop] = current[prop];
                }
            }
            return changed;
        },

        getPreviousPropertyValue: function(propName) {
            if (!propName || !this._previousPropertyValues) return null;
            return this._previousPropertyValues[propName];
        },

        getAllPreviousProperties: function() {
            return internalTools.shallowCopy(this._previousPropertyValues);
        },

        _executeValidation: function(properties, options) {
            var validationError = this.validate(properties);
            if (validationError) {
                if (options.error) {
                    options.error(this, validationError, options);
                } else {
                    this.dispatch('validation:error', this, validationError, options);
                }
                return false;
            }
            return true;
        }
    });

    FrameworkX.DataGroup = function(initialUnits, options) {
        options = options || {};
        if (options.sorter) this.unitSorter = options.sorter;
        internalTools.bindAllToInstance(this, '_onUnitEvent', '_releaseUnitReference');
        this._resetState();
        if (initialUnits) this.resetUnits(initialUnits, {
            quiet: true
        });
        this.init.apply(this, arguments);
    };

    internalTools.assignProperties(FrameworkX.DataGroup.prototype, EventBusModule, {

        unitType: FrameworkX.DataUnit,

        init: function() {},

        exportAllUnits: function() {
            return internalTools.mapArray(this.allUnits, function(unit) {
                return unit.exportProperties();
            });
        },

        addUnits: function(unitsToAdd, options) {
            if (internalTools.isArray(unitsToAdd)) {
                for (var i = 0, l = unitsToAdd.length; i < l; i++) {
                    this._addSingleUnit(unitsToAdd[i], options);
                }
            } else {
                this._addSingleUnit(unitsToAdd, options);
            }
            return this;
        },

        removeUnits: function(unitsToRemove, options) {
            if (internalTools.isArray(unitsToRemove)) {
                for (var i = 0, l = unitsToRemove.length; i < l; i++) {
                    this._removeSingleUnit(unitsToRemove[i], options);
                }
            } else {
                this._removeSingleUnit(unitsToRemove, options);
            }
            return this;
        },

        getUnitById: function(idValue) {
            if (idValue == null) return null;
            return this._unitsById[idValue.id != null ? idValue.id : idValue];
        },

        getUnitByClientId: function(clientIdValue) {
            return clientIdValue && this._unitsByClientId[clientIdValue.entityId || clientIdValue];
        },

        unitAt: function(index) {
            return this.allUnits[index];
        },

        reorder: function(options) {
            options = options || {};
            if (!this.unitSorter) throw new Error('Cannot sort a group without a "unitSorter" function.');
            this.allUnits = this.sortByCustom(this.unitSorter);
            if (!options.quiet) this.dispatch('group:reset', this, options);
            return this;
        },

        extractPropertyFromUnits: function(propName) {
            return internalTools.mapArray(this.allUnits, function(unit) {
                return unit.getProperty(propName);
            });
        },

        _resetState: function() {
            this.allUnits = [];
            this._unitsById = {};
            this._unitsByClientId = {};
        },

        _addSingleUnit: function(unit, options) {
            options = options || {};
            if (unit instanceof FrameworkX.DataUnit) {
                unit.collection = this;
            } else {
                unit = new this.unitType(unit, {
                    collection: this
                });
            }

            this.allUnits.push(unit);
            this._unitsById[unit.id] = unit;
            this._unitsByClientId[unit.entityId] = unit;

            unit.subscribe('all', this._onUnitEvent);
            unit.subscribe('record:destroyed', this._releaseUnitReference);

            if (this.unitSorter) this.reorder({
                quiet: true
            });
            if (!options.quiet) this.dispatch('unit:added', unit, this, options);
            return unit;
        },

        _removeSingleUnit: function(unit, options) {
            options = options || {};
            var index = -1;
            for (var i = 0, l = this.allUnits.length; i < l; i++) {
                if (this.allUnits[i] === unit) {
                    index = i;
                    break;
                }
            }
            if (index === -1) return this;

            this.allUnits.splice(index, 1);
            delete this._unitsById[unit.id];
            delete this._unitsByClientId[unit.entityId];

            unit.unsubscribe('all', this._onUnitEvent);
            unit.unsubscribe('record:destroyed', this._releaseUnitReference);

            if (!options.quiet) this.dispatch('unit:removed', unit, this, options);
            return this;
        },

        _onUnitEvent: function(eventName, unit, collection, options) {
            if (collection === this) return;
            this.dispatch.apply(this, arguments);
        },

        _releaseUnitReference: function(unit, collection, options) {
            this.removeUnits(unit, options);
        }

    });

    FrameworkX.DataGroup.prototype.sortByCustom = function(iterator, context) {
        var units = this.allUnits;
        var getSortValue = internalTools.isFunction(iterator) ? iterator : function(unit) {
            return unit.getProperty(iterator);
        };

        var sorted = units.map(function(unit, index) {
            return {
                unit: unit,
                index: index,
                criteria: getSortValue.call(context, unit, index)
            };
        }).sort(function(left, right) {
            var a = left.criteria;
            var b = right.criteria;
            if (a !== b) {
                if (a > b || a === undefined) return 1;
                if (b > a || b === undefined) return -1;
            }
            return left.index - right.index;
        });

        return internalTools.mapArray(sorted, function(item) {
            return item.unit;
        });
    };

    FrameworkX.dataSync = function(method, unit, options) {
        if (options.success) options.success({}, 'success', {});
        return null;
    };

    var manageError = function(originalErrorHandler, unit, options) {
        return function(xhr, status, error) {
            if (originalErrorHandler) originalErrorHandler(unit, xhr, options);
            unit.dispatch('request:error', unit, xhr, options);
        };
    };

    var resolveResourcePath = function(collectionInstance) {
        if (collectionInstance && collectionInstance.url) {
            return internalTools.isFunction(collectionInstance.url) ? collectionInstance.url() : collectionInstance.url;
        }
        return null;
    };

    var resourcePathError = function() {
        throw new Error('A "url" property or function must be specified for the data unit or its group.');
    };

}).call(this);