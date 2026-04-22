/*
Circle.js

Copyright (c) 2013, Nicolas Vanhoren

Distributed under the MIT license

Permission is granted, free of charge, to any individual obtaining a copy of
this software and associated files (the "Software"), to utilize it without
restriction, including but not limited to the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software, and to permit persons to whom the Software is furnished to do so,
subject to the following terms:

The above copyright notice and this permission notice must be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT ANY WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE HELD LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function() {
    /* jshint es3: true, proto: true */
    "use strict";

    if (typeof(exports) !== "undefined") { // CommonJS environment
        var utility = require("underscore");
        utility.extend(exports, defineModule(utility));
    } else if (typeof(define) !== "undefined") { // AMD environment
        define(["underscore"], defineModule);
    } else { // Global variable definition
        window.circle = defineModule(_);
    }


    function defineModule(util) {
        var geometricShapes = {};

        function BaseShape() {}
        /**
         * geometricShapes.ShapeBase
         *
         * This is the fundamental class from which all other classes inherit. Its primary utility
         * is to serve as a reference point for checking if an object is part of the geometricShapes
         * class hierarchy, e.g., using geometricShapes.isInstanceOf(x, geometricShapes.ShapeBase).
         */
        geometricShapes.ShapeBase = BaseShape;
        util.extend(geometricShapes.ShapeBase, {
            _methodResolutionOrder: [geometricShapes.ShapeBase],
            _instanceProperties: {_creationMethod: function() {}},
            _typeID: 1,
            _parentTypes: [],
            _typeMap: {"1": geometricShapes.ShapeBase}
        });
        util.extend(geometricShapes.ShapeBase.prototype, {
            _creationMethod: geometricShapes.ShapeBase._instanceProperties._creationMethod
        });

        // Helper function for creating objects with specified prototypes across different browsers
        var createInstanceFromPrototype = function(prototypeObject) {
            function GeneratedObject(){}
            GeneratedObject.prototype = prototypeObject;
            var tempInstance = new GeneratedObject();
            tempInstance.__proto__ = prototypeObject;
            return tempInstance;
        };
        geometricShapes._createPrototype = createInstanceFromPrototype;

        var typeIdentifierCounter = 3;
        var superCallPattern = /xyz/.test(function(){xyz();}) ? /\$super\b/ : /.*/;

        /**
         * geometricShapes.establish([ancestorClasses,] definitionAttributes)
         *
         * Constructs a new class type and returns it.
         *
         * `definitionAttributes` is an object containing methods and properties
         * that should be incorporated into the prototype of the new class.
         *
         * `ancestorClasses` is an optional array of classes from which this
         * new class should derive. If omitted or an empty array is provided,
         * the new class will default to inheriting solely from geometricShapes.ShapeBase.
         */
        geometricShapes.establish = function() {
            // Processing input arguments
            var argumentList = util.toArray(arguments);
            argumentList.reverse();
            var definitionAttributes = argumentList[0];
            var ancestorClasses = argumentList.length >= 2 ? argumentList[1] : [];
            if (! (ancestorClasses instanceof Array))
                ancestorClasses = [ancestorClasses];
            util.each(ancestorClasses, function(elementItem) {
                adaptNativeClass(elementItem);
            });
            if (ancestorClasses.length === 0)
                ancestorClasses = [geometricShapes.ShapeBase];
            // Constructor method management
            var constructorFunc = definitionAttributes.constructor !== Object ? definitionAttributes.constructor : undefined;
            definitionAttributes = util.clone(definitionAttributes);
            delete definitionAttributes.constructor;
            if (constructorFunc)
                definitionAttributes._creationMethod = constructorFunc;
            else { // Backward compatibility for 'init'
                constructorFunc = definitionAttributes.init;
                delete definitionAttributes.init;
                if (constructorFunc)
                    definitionAttributes._creationMethod = constructorFunc;
            }
            // Actual class type generation
            var newClassType = function ConcreteInstance() {
                this._inherited = null;
                this._creationMethod.apply(this, arguments);
            };
            newClassType._instanceProperties = definitionAttributes;
            // Method Resolution Order (MRO) construction
            var mroParts = util.pluck(ancestorClasses, "_methodResolutionOrder");
            mroParts = mroParts.concat([ancestorClasses]);
            var _methodResolutionOrder = [newClassType].concat(combineResolutionOrder(mroParts));
            // Prototype generation
            var protoObject = Object.prototype;
            util.each(util.clone(_methodResolutionOrder).reverse(), function(currentType) {
                var currentProtoSegment = createInstanceFromPrototype(protoObject);
                util.extend(currentProtoSegment, currentType._instanceProperties);
                util.each(util.keys(currentProtoSegment), function(propKey) {
                    var propertyValue = currentProtoSegment[propKey];
                    if (typeof propertyValue !== "function" || ! superCallPattern.test(propertyValue) || propertyValue._typeID ||
                        (propKey !== "_creationMethod" && currentType._convertedFromNative))
                        return;
                    currentProtoSegment[propKey] = (function(methodName, methodImpl, superProtoRef) {
                        return function() {
                            var oldSuperRef = this._inherited;
                            this._inherited = superProtoRef[methodName];
                            try {
                                return methodImpl.apply(this, arguments);
                            } finally {
                                this._inherited = oldSuperRef;
                            }
                        };
                    })(propKey, propertyValue, protoObject);
                });
                currentProtoSegment.constructor = newClassType;
                protoObject = currentProtoSegment;
            });
            // Finalizing class properties
            var classIdentifier = typeIdentifierCounter++;
            newClassType._methodResolutionOrder = _methodResolutionOrder;
            newClassType._parentTypes = ancestorClasses;
            newClassType.prototype = protoObject;
            newClassType._typeID = classIdentifier;
            // Building class type index
            newClassType._typeMap = {};
            util.each(newClassType._methodResolutionOrder, function(currentClass) {
                newClassType._typeMap[currentClass._typeID] = currentClass;
            });
            // Class initialization hook
            if (newClassType.prototype.classInit) {
                newClassType._initializerHook = newClassType.prototype.classInit;
                delete newClassType.prototype.classInit;
            }
            util.each(util.chain(newClassType._methodResolutionOrder).clone().reverse().value(), function(currentClass) {
                if (currentClass._initializerHook) {
                    var returnValue = currentClass._initializerHook(newClassType.prototype);
                    if (returnValue !== undefined)
                        newClassType.prototype = returnValue;
                }
            });

            return newClassType;
        };

        var combineResolutionOrder = function(inputLists) {
            /* jshint loopfunc:true */
            // C3 linearization algorithm implementation
            var resultMRO = [];
            var workingLists = util.clone(inputLists);
            while (true) {
                var entryFound = false;
                for (var listIndex=0; listIndex < workingLists.length; listIndex++) {
                    if (workingLists[listIndex].length === 0)
                        continue;
                    var candidateClass = workingLists[listIndex][0];
                    var foundInTail = util.find(workingLists, function(currentList) {
                        return util.contains(util.rest(currentList), candidateClass);
                    });
                    if (! foundInTail) {
                        entryFound = true;
                        resultMRO.push(candidateClass);
                        workingLists = util.map(workingLists, function(currentList) {
                            if (util.head(currentList) === candidateClass)
                                return util.rest(currentList);
                            else
                                return currentList;
                        });
                        break;
                    }
                }
                if (entryFound)
                    continue;
                if (util.all(workingLists, function(i) { return i.length === 0; }))
                    return resultMRO;
                throw new geometricShapes.ValueIssue("Failed to compute a consistent method resolution order (MRO)");
            }
        };

        /**
         * Converts an existing native JavaScript class or constructor function
         * to integrate it with the geometricShapes class system.
         */
        var adaptNativeClass = function(targetClass) {
            if (targetClass._typeID)
                return;
            var prototypeSnapshot = ! Object.getOwnPropertyNames ? targetClass.prototype : (function() {
                var propertyKeys = {};
                (function traversePrototypeChain(currentProto) {
                    if (currentProto === Object.prototype)
                        return;
                    util.extend(propertyKeys, util.chain(Object.getOwnPropertyNames(currentProto))
                        .map(function(propName) {return [propName, true];})
                        .object().value());
                    traversePrototypeChain(Object.getPrototypeOf(currentProto));
                })(targetClass.prototype);
                return util.object(util.map(util.keys(propertyKeys), function(keyItem) {return [keyItem, targetClass.prototype[keyItem]];}));
            })();
            prototypeSnapshot = util.chain(prototypeSnapshot).map(function(valueItem, keyItem) { return [keyItem, valueItem]; })
                .filter(function(element) {return element[0] !== "constructor" && element[0] !== "__proto__";})
                .object().value();
            var convertedClassID = typeIdentifierCounter++;
            util.extend(targetClass, {
                _methodResolutionOrder: [targetClass, geometricShapes.ShapeBase],
                _instanceProperties: util.extend({}, prototypeSnapshot, {
                    _creationMethod: function() {
                        this._inherited.apply(this, arguments);
                        var oldSuperRef = this._inherited;
                        this._inherited = null;
                        try {
                            targetClass.apply(this, arguments);
                        } finally {
                            this._inherited = oldSuperRef;
                        }
                    }
                }),
                _typeID: convertedClassID,
                _parentTypes: [geometricShapes.ShapeBase],
                _typeMap: {"1": geometricShapes.ShapeBase},
                _convertedFromNative: true
            });
            targetClass._typeMap[convertedClassID] = targetClass;
        };

        /**
         * geometricShapes.isInstanceOf(targetObject, targetType)
         *
         * Determines if `targetObject` is an instance of `targetType` or a derived type.
         *
         * This method should be used in place of the standard `instanceof` operator
         * when working within the geometricShapes class system, as `instanceof`
         * cannot correctly identify relationships within this hierarchy.
         *
         * If either `targetObject` or `targetType` are not part of the geometricShapes system,
         * this method gracefully falls back to using the native `instanceof` operator.
         * This ensures that `geometricShapes.isInstanceOf()` can safely replace all
         * `instanceof` checks in any program, regardless of its reliance on geometricShapes.
         *
         * Additionally, this function supports type checking for primitive JavaScript types.
         * To use this feature, provide a string representing the type as the second argument.
         * Examples:
         *
         *     geometricShapes.isInstanceOf("", "string") // yields true
         *     geometricShapes.isInstanceOf(function() {}, "function") // yields true
         *     geometricShapes.isInstanceOf({}, "object") // yields true
         *     geometricShapes.isInstanceOf(1, "number") // yields true
         */
        geometricShapes.isInstanceOf = function(targetObject, targetType) {
            if (targetObject !== null && typeof(targetObject) === "object" && targetObject.constructor && targetObject.constructor._typeMap &&
                typeof(targetType) === "function" && typeof(targetType._typeID) === "number") {
                return targetObject.constructor._typeMap[targetType._typeID] !== undefined;
            }
            if (typeof(targetType) === "string")
                return typeof(targetObject) === targetType;
            return targetObject instanceof targetType;
        };

        /**
         * A specialized class designed to simplify the creation of new exception types.
         * This class is unique because it extends the standard JavaScript `Error` class.
         * For instance:
         *
         * geometricShapes.isInstanceOf(e, Error)
         *
         * e instanceof Error
         *
         * Both of these expressions will consistently evaluate to `true` if `e` is an
         * instance of geometricShapes.IssueBase or any class derived from it.
         */
        geometricShapes.IssueBase = geometricShapes.establish({
            /**
             * The `errorName` property is utilized in the default `toString()`
             * implementation of the standard JavaScript `Error` class.
             * According to specifications, all derived `Error` classes should
             * define a unique name.
             */
            errorName: "geometricShapes.IssueBase",
            /**
             * A default descriptive text to be used for instances of this class
             * if no specific message is provided during construction.
             */
            presetMessage: "",
            /**
             * Constructor parameters:
             *
             * `errorMessage`: The specific message to embed within the instance.
             * If this parameter is not supplied, `this.presetMessage` will be used.
             */
            constructor: function(errorMessage) {
                this.message = errorMessage || this.presetMessage;
            },
            typeInitializer: function(classPrototype) {
                // Intricate logic to reconstruct a complete prototype chain
                // ensuring `Error` is at the very end of the hierarchy.
                var prototypeChainSegments = [];
                var collectPrototypes = function(currentSegment) {
                    if (! currentSegment)
                        return;
                    prototypeChainSegments.push(currentSegment);
                    collectPrototypes(currentSegment.__proto__);
                };
                collectPrototypes(classPrototype);
                var errorInstance = new Error();
                util.each(util.clone(prototypeChainSegments).reverse(), function(currentProto) {
                    var tempPrototype = createInstanceFromPrototype(errorInstance);
                    // Using util.each to avoid unintended prototype traversal
                    util.each(currentProto, function(valueItem, keyItem) {
                        if (keyItem !== "__proto__")
                            tempPrototype[keyItem] = valueItem;
                    });
                    errorInstance = tempPrototype;
                });
                return errorInstance;
            }
        });

        /**
         * A specific exception type indicating that a method received an
         * argument with an invalid or incorrect value.
         */
        geometricShapes.ValueIssue = geometricShapes.establish([geometricShapes.IssueBase], {
            errorName: "geometricShapes.ValueIssue"
        });

        /**
         * This function enables finding the implementation of a method from a parent class
         * when that method has been overridden in a child class.
         *
         * Unlike `this._inherited()`, this function allows retrieving a parent method
         * from a different method than the one doing the overriding. Example:
         *
         * var FirstType = geometricShapes.establish({
         *     methodA: function() {...};
         * });
         *
         * var SecondType = geometricShapes.establish([FirstType], {
         *     methodA: function() {...};
         *     methodB: function() {
         *         geometricShapes.retrieveParentMethod(SecondType, this, "methodA")(); // Here, we invoke the original methodA()
         *         // as it was defined in the FirstType class.
         *     };
         * });
         *
         * This method generally operates slower than `this._inherited()`; therefore,
         * `this._inherited()` should always be preferred when its usage is feasible.
         *
         * Parameters:
         *
         * * `callingClass`: The current class from which the call originates.
         *   This is essential for the function's correct operation.
         * * `instanceObject`: The current object (typically `this` in most contexts).
         * * `methodAttributeName`: The name of the desired attribute as it was defined
         *   in the base class.
         *
         * Returns the attribute as it was defined in the base class. If the attribute
         * is a function, it will be bound to `instanceObject`.
         */
        geometricShapes.retrieveParentMethod = function(callingClass, instanceObject, methodAttributeName) {
            var positionIndex;
            var _methodResolutionOrder = instanceObject.constructor._methodResolutionOrder;
            for (var mroIndex = 0; mroIndex < _methodResolutionOrder.length; mroIndex++) {
                if (_methodResolutionOrder[mroIndex] === callingClass) {
                    positionIndex = mroIndex;
                    break;
                }
            }
            if (positionIndex === undefined)
                throw new geometricShapes.ValueIssue("Class type not found within the instance's method resolution order.");
            var locatePrototype = function(targetPrototype, depthCount) {
                if (depthCount === 0)
                    return targetPrototype;
                return locatePrototype(targetPrototype.__proto__, depthCount - 1);
            };
            var targetPrototype = locatePrototype(instanceObject.constructor.prototype, positionIndex + 1);
            var foundAttribute;
            if (methodAttributeName !== "constructor" && methodAttributeName !== "init") // Retro-compatibility
                foundAttribute = targetPrototype[methodAttributeName];
            else
                foundAttribute = targetPrototype._creationMethod;
            if (geometricShapes.isInstanceOf(foundAttribute, "function"))
                return util.bind(foundAttribute, instanceObject);
            else
                return foundAttribute;
        };

        return geometricShapes;
    }
})();