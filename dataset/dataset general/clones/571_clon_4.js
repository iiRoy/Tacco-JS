(function (mainContext, definitionCallback) {
    if (typeof exports === 'object') {
        module.exports = definitionCallback();
    } else if (typeof define === 'function' && define.amd) {
        define([], definitionCallback);
    } else {
        mainContext.kind = definitionCallback();
    }
}(window || this, function () {

    var CURRENT_REV = '0.3';

    var void0;
    var doNothing = function () { };
    var outputMessage = (mainContext && mainContext.console && mainContext.console.log) ? mainContext.console.log : doNothing;

    var coreUtilities = {
        assignProperties: function (target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                if (source) {
                    for (var key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            target[key] = source[key];
                        }
                    }
                }
            }
            return target;
        },
        forEachElement: function (collection, iterator, context) {
            if (Array.isArray(collection)) {
                for (var i = 0, length = collection.length; i < length; i++) {
                    iterator.call(context, collection[i], i, collection);
                }
            } else if (typeof collection === 'object' && collection !== null) {
                var keys = Object.keys(collection);
                for (var i = 0, length = keys.length; i < length; i++) {
                    iterator.call(context, collection[keys[i]], keys[i], collection);
                }
            }
        },
        mapElements: function (collection, iterator, context) {
            var results = [];
            coreUtilities.forEachElement(collection, function (value, index, list) {
                results.push(iterator.call(context, value, index, list));
            });
            return results;
        },
        reduceElements: function (collection, iterator, accumulator, context) {
            var initial = arguments.length > 2;
            coreUtilities.forEachElement(collection, function (value, index, list) {
                if (!initial) {
                    accumulator = value;
                    initial = true;
                } else {
                    accumulator = iterator.call(context, accumulator, value, index, list);
                }
            });
            return accumulator;
        },
        filterElements: function (collection, predicate, context) {
            var results = [];
            coreUtilities.forEachElement(collection, function (value, index, list) {
                if (predicate.call(context, value, index, list)) results.push(value);
            });
            return results;
        },
        includesElement: function (collection, value) {
            if (Array.isArray(collection)) {
                return collection.indexOf(value) >= 0;
            }
            for (var key in collection) {
                if (Object.prototype.hasOwnProperty.call(collection, key) && collection[key] === value) {
                    return true;
                }
            }
            return false;
        },
        getSize: function (collection) {
            if (collection == null) return 0;
            if (typeof collection.length === 'number') return collection.length;
            return Object.keys(collection).length;
        },
        convertToArray: function (list) {
            if (!list) return [];
            if (Array.isArray(list)) return Array.prototype.slice.call(list);
            if (typeof list.length === 'number') return Array.prototype.slice.call(list);
            return coreUtilities.mapElements(list, function (val) { return val; });
        },
        findIndexOf: function (array, value) {
            if (Array.prototype.indexOf && array.indexOf === Array.prototype.indexOf) {
                return array.indexOf(value);
            }
            for (var i = 0, length = array.length; i < length; i++) {
                if (array[i] === value) return i;
            }
            return -1;
        },
        generateUniqueId: (function () {
            var idCounter = 0;
            return function (prefix) {
                var id = ++idCounter + '';
                return prefix ? prefix + id : id;
            };
        })(),
        createRange: function (start, stop, step) {
            if (arguments.length <= 1) {
                stop = start || 0;
                start = 0;
            }
            step = step || 1;
            var length = Math.max(Math.ceil((stop - start) / step), 0);
            var range = Array(length);
            for (var idx = 0; idx < length; idx++, start += step) {
                range[idx] = start;
            }
            return range;
        },
        randomInt: function (min, max) {
            if (max == null) {
                max = min;
                min = 0;
            }
            return min + Math.floor(Math.random() * (max - min + 1));
        },
        escapeHtml: function (string) {
            var entityMap = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '`': '&#x60;'
            };
            return String(string).replace(/[&<>"'`]/g, function (s) {
                return entityMap[s];
            });
        },
        unescapeHtml: function (string) {
            var entityMap = {
                '&amp;': '&',
                '&lt;': '<',
                '&gt;': '>',
                '&quot;': '"',
                '&#x27;': "'",
                '&#x60;': '`'
            };
            var entityRegex = /&(?:amp|lt|gt|quot|#x27|#x60);/g;
            return String(string).replace(entityRegex, function (s) {
                return entityMap[s];
            });
        },
        createObjectFromPairs: function (list, values) {
            var obj = {};
            for (var i = 0, length = coreUtilities.getSize(list); i < length; i++) {
                if (values) {
                    obj[list[i]] = values[i];
                } else {
                    obj[list[i][0]] = list[i][1];
                }
            }
            return obj;
        },
        isValNull: function (value) { return value === null; },
        isValUndefined: function (value) { return value === void0; },
        isValNaN: function (value) { return typeof value === 'number' && isNaN(value); },
        isValBoolean: function (value) { return value === true || value === false || Object.prototype.toString.call(value) === '[object Boolean]'; },
        isValNumber: function (value) { return typeof value === 'number' || Object.prototype.toString.call(value) === '[object Number]'; },
        isValString: function (value) { return typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]'; },
        isValObject: function (value) {
            var type = typeof value;
            return type === 'function' || type === 'object' && !!value;
        },
        isValArray: Array.isArray || function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }
    };

    if (!mainContext.Math) { outputMessage("Classifier requires Math"); return false; }
    if (!mainContext.JSON) { outputMessage("Classifier requires JSON"); return false; }

    var constantSupplier = function (val) { return function () { return val; }; };
    var equalityChecker = function (val1) { return function (val2) { return val1 === val2; }; };

    var Classifier = function (val) {
        if (Classifier.registry.arr && Classifier.registry.arr.isInstance(val)) return 'array';
        if (Classifier.registry.nan && Classifier.registry.nan.isInstance(val)) return 'nan';
        if (Classifier.registry.nul && Classifier.registry.nul.isInstance(val)) return 'null';
        if (Classifier.registry.args && Classifier.registry.args.isInstance(val)) return 'arguments';
        return typeof val;
    };

    Classifier.CURRENT_REV = CURRENT_REV;
    Classifier.registry = {};

    var convertibilityTestFactory = function (kindLabel) {
        return function (val) {
            var kindDef = Classifier.registry[kindLabel];
            if (!kindDef) return false;
            return val === kindDef.archetype() || (val !== kindDef.archetype() && kindDef.transformTo(val) === kindDef.archetype());
        };
    };

    Classifier.registerKind = function (definitionEntry) {
        var currentKind = Classifier.registry[definitionEntry.label] = Classifier.registry[definitionEntry.label] || {};

        if (definitionEntry.derivesFrom) {
            var parents = coreUtilities.isValArray(definitionEntry.derivesFrom) ? definitionEntry.derivesFrom : [definitionEntry.derivesFrom];
            coreUtilities.forEachElement(parents, function (parentLabel) {
                var parentDef = Classifier.registry[parentLabel];
                if (parentDef) {
                    coreUtilities.assignProperties(currentKind, parentDef);
                }
            });
        }

        if (definitionEntry.utilityFunctions) {
            coreUtilities.assignProperties(currentKind, definitionEntry.utilityFunctions);
        }

        currentKind.archetype = constantSupplier(definitionEntry.archetype);
        currentKind.isInstance = definitionEntry.isInstance;
        currentKind.transformTo = definitionEntry.transformTo;
        currentKind.canTransform = definitionEntry.canTransform || convertibilityTestFactory(definitionEntry.label);
    };

    // Base Kinds
    Classifier.registerKind({
        label: "nul",
        archetype: null,
        isInstance: coreUtilities.isValNull,
        transformTo: constantSupplier(null),
        canTransform: constantSupplier(true)
    });

    Classifier.registerKind({
        label: "undef",
        archetype: void0,
        isInstance: coreUtilities.isValUndefined,
        transformTo: constantSupplier(void0),
        canTransform: constantSupplier(true)
    });

    Classifier.registerKind({
        label: "nan",
        archetype: NaN,
        isInstance: coreUtilities.isValNaN,
        transformTo: constantSupplier(NaN),
        canTransform: constantSupplier(true)
    });

    Classifier.registerKind({
        label: 'def',
        archetype: true,
        isInstance: function (val) {
            return !(Classifier.registry.nan.isInstance(val) || Classifier.registry.undef.isInstance(val) || Classifier.registry.nul.isInstance(val));
        },
        transformTo: function (val) {
            return (Classifier.registry.def.isInstance(val)) ? val : Classifier.registry.def.archetype();
        },
        canTransform: function (val) {
            return (Classifier.registry.def.isInstance(val));
        }
    });

    // Core Function Kind
    Classifier.registerKind({
        label: 'fn',
        archetype: function () { },
        isInstance: function (val) { return typeof val === 'function'; },
        transformTo: function (val) {
            if (Classifier.registry.fn.isInstance(val)) return val;
            return constantSupplier(val);
        },
        canTransform: constantSupplier(true),
        utilityFunctions: {}
    });

    // Boolean Kinds
    Classifier.registerKind({
        label: 'bool',
        archetype: true,
        isInstance: coreUtilities.isValBoolean,
        transformTo: function (val) {
            return /^true$/i.test(val);
        },
        utilityFunctions: {
            negate: function (val) { return !val; }
        }
    });

    Classifier.registerKind({
        label: 'tru',
        derivesFrom: 'bool',
        archetype: true,
        isInstance: equalityChecker(true),
        transformTo: Classifier.registry.bool.archetype,
        canTransform: constantSupplier(true)
    });
    Classifier.registerKind({
        label: 'fal',
        derivesFrom: 'bool',
        archetype: false,
        isInstance: equalityChecker(false),
        transformTo: constantSupplier(false),
        canTransform: constantSupplier(false)
    });
    Classifier.registerKind({
        label: 'truy',
        derivesFrom: 'bool',
        archetype: true,
        isInstance: function (val) { return val == true; },
        transformTo: function (val) { return (val) ? val : true; },
        canTransform: constantSupplier(true)
    });
    Classifier.registerKind({
        label: 'faly',
        derivesFrom: 'bool',
        archetype: false,
        isInstance: function (val) { return val !== true; },
        transformTo: function (val) { return (!val) ? val : false; },
        canTransform: constantSupplier(false)
    });

    // Numeric Kinds
    Classifier.registerKind({
        label: 'num',
        archetype: 0,
        isInstance: function (val) {
            return coreUtilities.isValNumber(val) && !Classifier.registry.nan.isInstance(parseFloat(val));
        },
        transformTo: function (val) {
            if (Classifier.registry.num.isInstance(val)) { return val; };
            if (Classifier.registry.bool.isInstance(val)) { return val ? 1 : 0; };
            if (Classifier.registry.fn.isInstance(val)) {
                var resolvedVal = val();
                if (Classifier.registry.num.isInstance(resolvedVal)) { return resolvedVal; };
            };
            if (Classifier.registry.obj && Classifier.registry.obj.isInstance(val) && Classifier.registry.fn.isInstance(val.archetype)) {
                if (Classifier.registry.num.isInstance(val.archetype())) return val.archetype();
            }
            if (Classifier.registry.arr && Classifier.registry.arr.isInstance(val)) { return val.length; };
            if (Classifier.registry.str && Classifier.registry.str.isInstance(val)) {
                var convertedNum = val * 1 || 0;
                return (convertedNum === 0 && !String(val).match(/^0+$/)) ? Classifier.registry.num.archetype() : convertedNum;
            }
            return Classifier.registry.num.archetype();
        },
        utilityFunctions: {
            generateRandom: coreUtilities.randomInt,
            createRange: coreUtilities.createRange,

            absolute: Math.abs, arcCosine: Math.acos, arcSine: Math.asin, arcTangent: Math.atan,
            ceiling: Math.ceil, cosine: Math.cos, exponent: Math.exp, floor: Math.floor,
            logarithm: Math.log, maximum: Math.max, minimum: Math.min, power: Math.pow,
            roundValue: Math.round, sine: Math.sin, squareRoot: Math.sqrt, tangent: Math.tan,

            add: function (a, b) { return a + b; }, subtract: function (a, b) { return a - b; },
            modulo: function (a, b) { return a % b; }, multiply: function (a, b) { return a * b; },
            divide: function (a, b) { return a / b; },

            signOf: function (n) { return n == 0 ? 0 : n / Math.abs(n); },
            isBetween: function (val, low, high) { return (val >= low && val <= high); },
            isEqual: function (a, b) { return a === b; }, isNotEqual: function (a, b) { return a !== b; },
            isLessThan: function (a, b) { return a < b; }, isLessThanOrEqual: function (a, b) { return a <= b; },
            isGreaterThan: function (a, b) { return a > b; }, isGreaterThanOrEqual: function (a, b) { return a >= b; },

            fixedDecimal: function (a, b) { return parseFloat(a.toFixed(Classifier.registry.int.isInstance(b) ? b : 2), 10); },
            toHex: function (a) { return a.toString(16); },
            toBinary: function (a) { return a.toString(2); }
        }
    });

    Classifier.registerKind({
        label: 'int',
        archetype: 1,
        derivesFrom: "num",
        isInstance: function (val) { return (Math.floor(val) === val); },
        transformTo: function (val) {
            var parsedVal = parseInt(val, 10);
            if (!isNaN(parsedVal)) return parsedVal;
            return Classifier.registry.num.archetype();
        },
        utilityFunctions: {
            decrement: function (val) { return --val; },
            increment: function (val) { return ++val; }
        }
    });

    Classifier.registerKind({
        label: 'flt',
        archetype: 0.1,
        derivesFrom: "num",
        isInstance: function (val, precision) {
            return val === Classifier.registry.num.fixedDecimal(val, precision);
        },
        transformTo: function (val, precision) {
            return Classifier.registry.num.fixedDecimal(Classifier.registry.num.transformTo(val), precision);
        },
        utilityFunctions: {
            isEqual: function (a, b, precision) {
                return Classifier.registry.num.fixedDecimal(a, precision) === Classifier.registry.num.fixedDecimal(b, precision);
            },
            getDecimalPart: function (a) { return a % 1; }
        }
    });

    // String Kinds
    Classifier.registerKind({
        label: 'str',
        archetype: '',
        isInstance: coreUtilities.isValString,
        transformTo: function (val) {
            if (Classifier.registry.def.isInstance(val)) return String(val); return Classifier.registry.str.archetype();
        },
        utilityFunctions: {
            fromCharacterCodes: String.fromCharCode,
            getChar: function (str, index) { return str.charAt(index); },
            getCharCode: function (str, index) { return str.charCodeAt(index); },
            toLower: function (str) { return str.toLowerCase(); },
            toUpper: function (str) { return str.toUpperCase(); },

            escapeHtml: coreUtilities.escapeHtml,
            unescapeHtml: coreUtilities.unescapeHtml,
            containsText: coreUtilities.includesElement,
            toArray: coreUtilities.convertToArray,
            getLength: coreUtilities.getSize,

            trimWhitespace: function (str) { return Classifier.registry.str.trimLeft(Classifier.registry.str.trimRight(str)); },
            trimLeft: function (str) { return str.replace(/^\s+/, ''); },
            trimRight: function (str) { return str.replace(/\s+$/, ''); },

            ellipsize: function (text, lengthLimit, noEllipsis) {
                if (text.length > lengthLimit) {
                    if (lengthLimit && !Classifier.registry.nan.isInstance(lengthLimit)) {
                        if (Classifier.registry.faly.isInstance(noEllipsis)) {
                            return text.substr(0, lengthLimit);
                        }
                        return text.substr(0, lengthLimit) + '&hellip;';
                    }
                } return text;
            }
        }
    });

    Classifier.registerKind({
        label: 'plain',
        archetype: "",
        derivesFrom: "str",
        isInstance: function (val) { return Classifier.registry.plain.transformTo(val).length === String(val).length; },
        transformTo: function (val) {
            if (Classifier.registry.str.isInstance(val)) return String(val).replace(/^[^a-zA-Z0-9@!#\$\^%&*()+=\-\[\]\\\';,\.\/\{\}\|\":<>\? ]+$/, ''); return Classifier.registry.plain.archetype();
        },
        canTransform: function (val) {
            return Classifier.registry.str.canTransform(val);
        }
    });

    Classifier.registerKind({
        label: 'email',
        archetype: 'test@test.com',
        derivesFrom: "str",
        isInstance: function (val) {
            var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return emailRegex.test(val);
        },
        transformTo: function (val, middle, end) {
            if (Classifier.registry.email.isInstance(val)) return val;
            if (Classifier.registry.def.isInstance(val) && Classifier.registry.def.isInstance(middle) && Classifier.registry.def.isInstance(end)) return val + '@' + middle + '.' + end;
            if (Classifier.registry.def.isInstance(val) && Classifier.registry.def.isInstance(middle)) return val + '@' + middle;
            return Classifier.registry.email.archetype();
        }
    });

    Classifier.registerKind({
        label: 'unique',
        archetype: "0",
        isInstance: function (val) {
            val = Classifier.registry.str.transformTo(val);
            if (val) return coreUtilities.findIndexOf(Classifier.registry.unique.identifiers, val) !== -1;
            return false;
        },
        canTransform: function (val) {
            val = Classifier.registry.str.transformTo(val);
            if (val) return coreUtilities.findIndexOf(Classifier.registry.unique.identifiers, val) === -1;
            return false;
        },
        transformTo: function (val) {
            val = Classifier.registry.str.transformTo(val);
            while (coreUtilities.findIndexOf(Classifier.registry.unique.identifiers, val) !== -1) {
                val = coreUtilities.generateUniqueId();
            }
            Classifier.registry.unique.identifiers.push(val);
            return val;
        },
        utilityFunctions: {
            identifiers: ["0"]
        }
    });

    // Collection Kinds
    Classifier.registerKind({
        label: 'col',
        archetype: [],
        isInstance: function (val) { return coreUtilities.isValObject(val) || coreUtilities.isValArray(val); },
        canTransform: function (val) { return Classifier.registry.col.isInstance(val); },
        transformTo: function (val) {
            if (Classifier.registry.col.isInstance(val)) { return val; }
            return Classifier.registry.arr.transformTo(val);
        },
        utilityFunctions: {
            forEachElement: coreUtilities.forEachElement,
            mapElements: coreUtilities.mapElements,
            foldElements: coreUtilities.reduceElements,
            filterElements: coreUtilities.filterElements,
            includesElement: coreUtilities.includesElement,
            convertToArray: coreUtilities.convertToArray,
            getLength: coreUtilities.getSize,

            mapValues: function (collection, transformationFn) {
                return coreUtilities.reduceElements(collection, function (accumulator, val, key, list) {
                    accumulator[key] = transformationFn(val, key, list); return accumulator;
                }, {});
            }
        }
    });

    Classifier.registerKind({
        label: 'arr',
        archetype: [],
        derivesFrom: "col",
        isInstance: coreUtilities.isValArray,
        transformTo: function (val) {
            if (Classifier.registry.args && Classifier.registry.args.isInstance(val)) return coreUtilities.convertToArray(val);
            if (Classifier.registry.arr.isInstance(val)) return val;
            if (Classifier.registry.obj && Classifier.registry.obj.isInstance(val)) return coreUtilities.mapElements(val, function (v) { return v; });
            if (Classifier.registry.fn.isInstance(val)) {
                if (Classifier.registry.arr.isInstance(val())) return val();
            };
            if (Classifier.registry.def.isInstance(val)) return coreUtilities.convertToArray(arguments);
            return false;
        },
        utilityFunctions: {
            pushElement: function (arr, element) { return arr.push(element); },
            popElement: function (arr) { return arr.pop(); },
            unshiftElement: function (arr, element) { return arr.unshift(element); },
            shiftElement: function (arr) { return arr.shift(); },
            sliceArray: function (arr, start, end) { return arr.slice(start, end); },
            spliceArray: function (arr) { return arr.splice.apply(arr, arguments); },
            sortArray: function (arr, comparator) { return arr.sort(comparator); },

            createRange: coreUtilities.createRange,
            findIndexOf: coreUtilities.findIndexOf,

            calculateAverage: function (arr) {
                return coreUtilities.reduceElements(arr, function (memo, num) {
                    return memo + num;
                }, 0) / arr.length;
            }
        }
    });

    Classifier.registerKind({
        label: 'args',
        archetype: (function () { return arguments; })(),
        derivesFrom: 'arr',
        isInstance: function (val) {
            return (val != null)
                && ((Object.prototype.toString.call(val) == '[object Arguments]')
                    || (!!val.callee));
        },
        canTransform: function (val) { return Classifier.registry.args.isInstance(val) || Classifier.registry.arr.isInstance(val); },
        transformTo: function () { return arguments; },
        utilityFunctions: {
            convertToArray: function (args) { return Array.prototype.slice.call(args); },
            getSubArguments: function (args, startIndex) { return coreUtilities.convertToArray(args).slice((startIndex || 1), args.length); },
            prependArgument: function (args, element) { return coreUtilities.convertToArray(args).unshift(element); }
        }
    });

    Classifier.registerKind({
        label: 'obj',
        archetype: {},
        derivesFrom: "col",
        isInstance: function (val) { return coreUtilities.isValObject(val) && !coreUtilities.isValArray(val); },
        transformTo: function (val, keys) {
            if (Classifier.registry.obj.isInstance(val)) return val;
            if (Classifier.registry.arr.isInstance(val)) { return (Classifier.registry.arr.isInstance(keys)) ? coreUtilities.createObjectFromPairs(val, keys) : coreUtilities.assignProperties({}, val); };
            if (Classifier.registry.fn.isInstance(val)) { if (Classifier.registry.obj.isInstance(val())) { return val(); }; };
            if (Classifier.registry.def.isInstance(val)) { return { objProp: constantSupplier(val) }; };
            return false;
        },
        utilityFunctions: {
            assignProperties: coreUtilities.assignProperties,
            cloneObject: function (obj) { return coreUtilities.assignProperties({}, obj); }
        }
    });

    return Classifier;
}));