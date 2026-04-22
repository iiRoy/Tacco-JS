(function (globalScope) {
    globalScope.ProjectX = {
        release: '1.3.1-alpha',
        identifier: 'c8d589f43f32212f9bb8ff68a127e6a3ba6c'
    };

    var classifyItem = globalScope.classifyItem = function (targetItem) {
        if (targetItem === null || targetItem === undefined) return 'nullish';
        if (typeof targetItem.__kind__ === 'function') return targetItem.__kind__();

        if (targetItem.nodeName) {
            if (targetItem.nodeType === 1) return 'dom_element';
            if (targetItem.nodeType === 3) return (/\S/).test(targetItem.nodeValue) ? 'text_node' : 'empty_space';
        } else if (typeof targetItem.length === 'number') {
            if (typeof targetItem.callee === 'function') return 'function_arguments';
            if ('item' in targetItem) return 'dom_collection';
        }

        return typeof targetItem;
    };

    var checkInheritance = globalScope.checkInheritance = function (subject, classReference) {
        if (subject === null || subject === undefined) return false;
        var currentConstructor = subject.__creator__ || subject.constructor;
        while (currentConstructor) {
            if (currentConstructor === classReference) return true;
            currentConstructor = currentConstructor.__ancestor__;
        }
        return subject instanceof classReference;
    };

    var NativeFunction = globalScope.Function;

    var standardProperties = true;
    for (var pName in {toString: 1}) standardProperties = null;
    if (standardProperties) standardProperties = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor'];

    NativeFunction.prototype.makeMultiSetter = function (allowCollection) {
        var selfReference = this;
        return function (primaryArg, secondaryArg) {
            if (primaryArg === null || primaryArg === undefined) return this;
            if (allowCollection || typeof primaryArg !== 'string') {
                for (var keyName in primaryArg) selfReference.call(this, keyName, primaryArg[keyName]);
                if (standardProperties) {
                    for (var i = standardProperties.length; i--;) {
                        keyName = standardProperties[i];
                        if (primaryArg.hasOwnProperty(keyName)) selfReference.call(this, keyName, primaryArg[keyName]);
                    }
                }
            } else {
                selfReference.call(this, primaryArg, secondaryArg);
            }
            return this;
        };
    };

    NativeFunction.prototype.makeMultiGetter = function (allowCollection) {
        var selfReference = this;
        return function (primaryArg) {
            var inputArgs, outputResult;
            if (allowCollection || typeof primaryArg !== 'string') inputArgs = primaryArg;
            else if (arguments.length > 1) inputArgs = arguments;
            if (inputArgs) {
                outputResult = {};
                for (var i = 0; i < inputArgs.length; i++) outputResult[inputArgs[i]] = selfReference.call(this, inputArgs[i]);
            } else {
                outputResult = selfReference.call(this, primaryArg);
            }
            return outputResult;
        };
    };

    NativeFunction.prototype.attachStaticProperty = function (propKey, propValue) {
        this[propKey] = propValue;
    }.makeMultiSetter();

    NativeFunction.prototype.attachPrototypeProperty = function (propKey, propValue) {
        this.prototype[propKey] = propValue;
    }.makeMultiSetter();

    var arraySection = Array.prototype.slice;

    NativeFunction.fromValue = function (inputItem) {
        return (classifyItem(inputItem) === 'function') ? inputItem : function () {
            return inputItem;
        };
    };

    Array.fromInput = function (inputItem) {
        if (inputItem === null || inputItem === undefined) return [];
        return (BlueprintManager.isTraversable(inputItem) && classifyItem(inputItem) !== 'string') ? (classifyItem(inputItem) === 'array') ? inputItem : arraySection.call(inputItem) : [inputItem];
    };

    Number.fromInput = function (inputItem) {
        var convertedNum = parseFloat(inputItem);
        return isFinite(convertedNum) ? convertedNum : null;
    };

    String.fromInput = function (inputItem) {
        return inputItem + '';
    };

    NativeFunction.prototype.attachPrototypeProperty({
        concealMethod: function () {
            this.__concealed__ = true;
            return this;
        },

        safeguardMethod: function () {
            this.__safeguarded__ = true;
            return this;
        }
    });

    var BlueprintManager = globalScope.BlueprintManager = function (blueprintName, targetConstructor) {
        if (blueprintName) {
            var lowerCaseName = blueprintName.toLowerCase();
            var blueprintChecker = function (itemToInspect) {
                return (classifyItem(itemToInspect) === lowerCaseName);
            };

            BlueprintManager['is' + blueprintName] = blueprintChecker;
            if (targetConstructor !== null && targetConstructor !== undefined) {
                targetConstructor.prototype.__kind__ = (function () {
                    return lowerCaseName;
                }).concealMethod();
                targetConstructor.kind = blueprintChecker;
            }
        }

        if (targetConstructor === null || targetConstructor === undefined) return null;

        targetConstructor.attachStaticProperty(this);
        targetConstructor.__creator__ = BlueprintManager;
        targetConstructor.prototype.__creator__ = targetConstructor;

        return targetConstructor;
    };

    var objectStringifier = Object.prototype.toString;

    BlueprintManager.isTraversable = function (itemToTest) {
        return (itemToTest !== null && itemToTest !== undefined && typeof itemToTest.length === 'number' && objectStringifier.call(itemToTest) !== '[object Function]');
    };

    var mirrorRegistry = {};

    var retrieveMirrors = function (targetObject) {
        var itemClassification = classifyItem(targetObject.prototype);
        return mirrorRegistry[itemClassification] || (mirrorRegistry[itemClassification] = []);
    };

    var implementBlueprint = function (propKey, methodToImplement) {
        if (methodToImplement && methodToImplement.__concealed__) return;

        var currentMirrors = retrieveMirrors(this);

        for (var i = 0; i < currentMirrors.length; i++) {
            var aMirror = currentMirrors[i];
            if (classifyItem(aMirror) === 'blueprintmanager') implementBlueprint.call(aMirror, propKey, methodToImplement);
            else aMirror.call(this, propKey, methodToImplement);
        }

        var priorMethod = this.prototype[propKey];
        if (priorMethod === null || priorMethod === undefined || !priorMethod.__safeguarded__) this.prototype[propKey] = methodToImplement;

        if (this[propKey] === null || this[propKey] === undefined && classifyItem(methodToImplement) === 'function') extendBlueprint.call(this, propKey, function (itemToProcess) {
            return methodToImplement.apply(itemToProcess, arraySection.call(arguments, 1));
        });
    };

    var extendBlueprint = function (propKey, methodToExtend) {
        if (methodToExtend && methodToExtend.__concealed__) return;
        var priorStaticMethod = this[propKey];
        if (priorStaticMethod === null || priorStaticMethod === undefined || !priorStaticMethod.__safeguarded__) this[propKey] = methodToExtend;
    };

    BlueprintManager.attachPrototypeProperty({
        implementBlueprint: implementBlueprint.makeMultiSetter(),
        extendBlueprint: extendBlueprint.makeMultiSetter(),
        createAlias: function (newName, existingName) {
            implementBlueprint.call(this, newName, this.prototype[existingName]);
        }.makeMultiSetter(),
        registerMirror: function (mirrorFunc) {
            retrieveMirrors(this).push(mirrorFunc);
            return this;
        }
    });

    new BlueprintManager('BlueprintManager', BlueprintManager);

    var establishNatives = function (typeName, targetObject, methodList) {
        var isSpecificType = (targetObject !== Object),
            targetPrototype = targetObject.prototype;

        if (isSpecificType) targetObject = new BlueprintManager(typeName, targetObject);

        for (var i = 0, l = methodList.length; i < l; i++) {
            var currentKey = methodList[i],
                staticMethod = targetObject[currentKey],
                protoMethod = targetPrototype[currentKey];

            if (staticMethod) staticMethod.safeguardMethod();

            if (isSpecificType && protoMethod) {
                delete targetPrototype[currentKey];
                targetPrototype[currentKey] = protoMethod.safeguardMethod();
            }
        }

        if (isSpecificType) targetObject.implementBlueprint(targetPrototype);

        return establishNatives;
    };

    establishNatives('String', String, [
        'charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'match', 'quote', 'replace', 'search',
        'slice', 'split', 'substr', 'substring', 'toLowerCase', 'toUpperCase'
    ])('Array', Array, [
        'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice',
        'indexOf', 'lastIndexOf', 'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'
    ])('Number', Number, [
        'toExponential', 'toFixed', 'toLocaleString', 'toPrecision'
    ])('Function', Function, [
        'apply', 'call', 'bind'
    ])('RegExp', RegExp, [
        'exec', 'test'
    ])('Object', Object, [
        'create', 'defineProperty', 'defineProperties', 'keys',
        'getPrototypeOf', 'getOwnPropertyDescriptor', 'getOwnPropertyNames',
        'preventExtensions', 'isExtensible', 'seal', 'isSealed', 'freeze', 'isFrozen'
    ])('Date', Date, ['now']);

    Object.attachStaticProperty = extendBlueprint.makeMultiSetter();

    Date.attachStaticProperty('now', function () {
        return +(new Date());
    });

    new BlueprintManager('Boolean', Boolean);

    Number.prototype.__kind__ = function () {
        return isFinite(this) ? 'numerical' : 'nullish';
    }.concealMethod();

    Number.attachStaticProperty('randomInRange', function (minVal, maxVal) {
        return Math.floor(Math.random() * (maxVal - minVal + 1) + minVal);
    });

    var checkOwnProperty = Object.prototype.hasOwnProperty;
    Object.attachStaticProperty('iterateObjectProperties', function (targetObj, callbackFunc, bindContext) {
        for (var propKey in targetObj) {
            if (checkOwnProperty.call(targetObj, propKey)) callbackFunc.call(bindContext, targetObj[propKey], propKey, targetObj);
        }
    });

    Object.eachProperty = Object.iterateObjectProperties;

    Array.prototype.implementBlueprint({
        iterateArrayElements: function (callbackFunc, bindContext) {
            for (var i = 0, len = this.length; i < len; i++) {
                if (i in this) callbackFunc.call(bindContext, this[i], i, this);
            }
        },

        eachElement: function (callbackFunc, bindContext) {
            Array.iterateObjectProperties(this, callbackFunc, bindContext);
            return this;
        }
    });

    var duplicateItem = function (itemToDuplicate) {
        switch (classifyItem(itemToDuplicate)) {
            case 'array':
                return itemToDuplicate.replicateArray();
            case 'object':
                return Object.deepDuplicateObject(itemToDuplicate);
            default:
                return itemToDuplicate;
        }
    };

    Array.prototype.implementBlueprint('replicateArray', function () {
        var i = this.length,
            newClone = new Array(i);
        while (i--) newClone[i] = duplicateItem(this[i]);
        return newClone;
    });

    var combineSingleProperty = function (sourceObject, propertyKey, currentValue) {
        switch (classifyItem(currentValue)) {
            case 'object':
                if (classifyItem(sourceObject[propertyKey]) === 'object') Object.deepCombineObjects(sourceObject[propertyKey], currentValue);
                else sourceObject[propertyKey] = Object.deepDuplicateObject(currentValue);
                break;
            case 'array':
                sourceObject[propertyKey] = currentValue.replicateArray();
                break;
            default:
                sourceObject[propertyKey] = currentValue;
        }
        return sourceObject;
    };

    Object.attachStaticProperty({
        deepCombineObjects: function (sourceObj, k, v) {
            if (classifyItem(k) === 'string') return combineSingleProperty(sourceObj, k, v);
            for (var i = 1, l = arguments.length; i < l; i++) {
                var currentObject = arguments[i];
                for (var propKey in currentObject) combineSingleProperty(sourceObj, propKey, currentObject[propKey]);
            }
            return sourceObj;
        },

        deepDuplicateObject: function (originalObject) {
            var newObject = {};
            for (var propKey in originalObject) newObject[propKey] = duplicateItem(originalObject[propKey]);
            return newObject;
        },

        shallowCopyProperties: function (targetObject) {
            for (var i = 1, l = arguments.length; i < l; i++) {
                var sourceObject = arguments[i] || {};
                for (var propKey in sourceObject) targetObject[propKey] = sourceObject[propKey];
            }
            return targetObject;
        }
    });

    ['Object', 'EmptySpace', 'CharacterNode', 'DataCollection', 'FunctionArguments'].eachElement(function (name) {
        new BlueprintManager(name);
    });

    var nextIdentifier = Date.now();

    String.attachStaticProperty('generateUniqueString', function () {
        return (nextIdentifier++).toString(36);
    });

    var PropertyMap = globalScope.PropertyMap = new BlueprintManager('PropertyMap', function (sourceObject) {
        if (classifyItem(sourceObject) === 'propertymap') sourceObject = Object.deepDuplicateObject(sourceObject.retrieveOwnProperties());
        for (var propKey in sourceObject) this[propKey] = sourceObject[propKey];
        return this;
    });

    PropertyMap.prototype.implementBlueprint({
        iterateArrayElements: function (callbackFunc, bindContext) {
            Object.iterateObjectProperties(this, callbackFunc, bindContext);
        },

        retrieveOwnProperties: function () {
            var cleanMap = {};
            for (var propKey in this) {
                if (this.hasOwnProperty(propKey)) cleanMap[propKey] = this[propKey];
            }
            return cleanMap;
        },

        countOwnProperties: function () {
            var count = 0;
            for (var propKey in this) {
                if (this.hasOwnProperty(propKey)) count++;
            }
            return count;
        }
    });

    PropertyMap.createAlias('eachEntry', 'iterateArrayElements');

    Object.kind = BlueprintManager.isObject;

    var NativeBlueprint = globalScope.NativeBlueprint = function (definition) {
        return new BlueprintManager(definition.name, definition.initialize);
    };

    NativeBlueprint.kind = BlueprintManager.kind;

    NativeBlueprint.attachStaticProperty('implementBlueprint', function (objectArray, methodsToImplement) {
        for (var i = 0; i < objectArray.length; i++) objectArray[i].implementBlueprint(methodsToImplement);
        return NativeBlueprint;
    });

    var originalArrayKind = Array.kind;
    Array.kind = function (itemToTest) {
        return checkInheritance(itemToTest, Array) || originalArrayKind(itemToTest);
    };

    globalScope.toArrayCopy = function (inputItem) {
        return Array.fromInput(inputItem).slice();
    };

    globalScope.accessArgument = function (idx) {
        return function () {
            return arguments[idx];
        };
    };

    globalScope.verifyExistence = function (objToCheck) {
        return !!(objToCheck || objToCheck === 0);
    };

    globalScope.terminateTimers = function (timerId) {
        clearTimeout(timerId);
        clearInterval(timerId);
        return null;
    };

    globalScope.isDefined = function (objToCheck) {
        return (objToCheck !== null && objToCheck !== undefined);
    };

    globalScope.processIterable = function (iterableObj, callbackFunc, bindContext) {
        var itemClassification = classifyItem(iterableObj);
        ((itemClassification === 'function_arguments' || itemClassification === 'dom_collection' || itemClassification === 'array' || itemClassification === 'dom_elements') ? Array : Object).iterateObjectProperties(iterableObj, callbackFunc, bindContext);
    };

    globalScope.noOperation = function () {};

    globalScope.extendObject = function (baseObject, additionalProps) {
        return Object.shallowCopyProperties(baseObject, additionalProps);
    };

    globalScope.createPropertyMap = function (inputObject) {
        return new PropertyMap(inputObject);
    };

    globalScope.mergeObjects = function () {
        var argsArray = arraySection.call(arguments);
        argsArray.unshift({});
        return Object.deepCombineObjects.apply(null, argsArray);
    };

    globalScope.valueToFunction = NativeFunction.fromValue;
    globalScope.mixInProperties = Object.deepCombineObjects;
    globalScope.randomInRange = Number.randomInRange;

})(this);