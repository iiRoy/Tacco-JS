var kitBag = (function() {
    "use strict";

    // --- Internal Helpers (replacing m8 utilities) ---
    var secretTools = {
        fetchType: function(inputVal) {
            return Object.prototype.toString.call(inputVal).slice(8, -1).toLowerCase();
        },
        deepType: function(inputVal) {
            var stringRepresentation = secretTools.fetchType(inputVal);
            if (stringRepresentation === 'object' && inputVal && inputVal.constructor && inputVal.constructor.name !== 'Object') {
                return inputVal.constructor.name.toLowerCase();
            }
            return stringRepresentation;
        },
        isDefined: function(inputVal) {
            return inputVal !== null && inputVal !== undefined;
        },
        hasOwnProp: function(targetObj, propKey) {
            return Object.prototype.hasOwnProperty.call(targetObj, propKey);
        },
        createEmptyObject: function() {
            return Object.create(null); // Truly empty, no prototype chain
        },
        getPropNames: function(targetObj) {
            return Object.getOwnPropertyNames(targetObj);
        },
        setProp: function(targetObj, propKey, descriptor) {
            Object.defineProperty(targetObj, propKey, descriptor);
        },
        setProps: function(targetObj, propMap, configFlags) {
            var descriptorMap = {};
            for (var key in propMap) {
                if (secretTools.hasOwnProp(propMap, key)) {
                    descriptorMap[key] = {
                        value: propMap[key],
                        writable: configFlags.includes('w'),
                        enumerable: configFlags.includes('e'),
                        configurable: configFlags.includes('c')
                    };
                }
            }
            Object.defineProperties(targetObj, descriptorMap);
        },
        transferProps: function(destObj, sourceObj) {
            for (var key in sourceObj) {
                if (secretTools.hasOwnProp(sourceObj, key)) {
                    destObj[key] = sourceObj[key];
                }
            }
            return destObj;
        },
        generateRange: function(startNum, endNum) {
            return Array.from({ length: endNum - startNum }, function(v, i) { return startNum + i; });
        },
        locateGlobal: function() {
            if (typeof window !== 'undefined') return window;
            if (typeof global !== 'undefined') return global;
            if (typeof self !== 'undefined') return self;
            return {};
        },
        toArray: function(listLike, startIndex) {
            return Array.prototype.slice.call(listLike, startIndex || 0);
        },
        stringFormat: function(templateString) {
            var replacements = secretTools.toArray(arguments, 1);
            return templateString.replace(/%[sdj%]/g, function(token) {
                if (token === '%%') return '%';
                if (replacements.length === 0) return token;
                var replacement = replacements.shift();
                switch (token) {
                    case '%s': return String(replacement);
                    case '%d': return Number(replacement);
                    case '%j': return JSON.stringify(replacement);
                    default: return token;
                }
            });
        },
        stringGlobalSub: function(sourceString, pattern, replacer) {
            if (typeof pattern === 'string') {
                pattern = new RegExp(pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
            }
            return sourceString.replace(pattern, replacer);
        },
        deepGet: function(obj, path) {
            if (!obj || typeof path !== 'string') return undefined;
            return path.split('.').reduce(function(current, key) {
                return (current && typeof current === 'object' && secretTools.hasOwnProp(current, key)) ? current[key] : undefined;
            }, obj);
        },
        isEmptyIterable: function(value) {
            if (value === null || value === undefined) return true;
            if (typeof value[Symbol.iterator] === 'function') {
                var iterator = value[Symbol.iterator]();
                return iterator.next().done;
            }
            return false; // Not iterable means it's not "empty iterable" in this context.
        }
    };

    // --- Main Utility Object ---
    var PrimeKit = {};

    // --- Object Extensions ---
    PrimeKit.object = {
        gatherProperties: function(targetObj, initialVal, processingFn, executionContext) {
            executionContext = executionContext || targetObj;
            return Object.keys(targetObj).reduce(function(accumulator, currentKey, index) {
                return processingFn.call(executionContext, accumulator, targetObj[currentKey], currentKey, targetObj, index);
            }, initialVal);
        },
        emptyObject: function(targetObj) {
            for (var key in targetObj) {
                if (secretTools.hasOwnProp(targetObj, key)) {
                    delete targetObj[key];
                }
            }
            return targetObj;
        },
        compareObjects: function(valA, valB) {
            var typeA = secretTools.deepType(valA);
            var typeB = secretTools.deepType(valB);

            if (typeA !== typeB) return false;

            switch (typeA) {
                case 'array':
                    if (valA.length !== valB.length) return false;
                    for (var i = 0; i < valA.length; i++) {
                        if (!PrimeKit.object.compareObjects(valA[i], valB[i])) return false;
                    }
                    return true;
                case 'object':
                    var keysA = Object.keys(valA);
                    var keysB = Object.keys(valB);
                    if (keysA.length !== keysB.length) return false;
                    for (var j = 0; j < keysA.length; j++) {
                        var key = keysA[j];
                        if (!secretTools.hasOwnProp(valB, key) || !PrimeKit.object.compareObjects(valA[key], valB[key])) return false;
                    }
                    return true;
                case 'date':
                    return valA.getTime() === valB.getTime();
                default:
                    return valA === valB;
            }
        },
        retrieveKeys: function(targetObj) {
            return secretTools.getPropNames(targetObj);
        },
        keyCount: function(targetObj) {
            return secretTools.getPropNames(targetObj).length;
        }
    };

    // --- Function Extensions ---
    var parameterRegex = /^[\s\(]*function[^\(]*\(([^\)]*)\)/;
    var parameterSplitRegex = /\s*,\s*/;

    PrimeKit.function = {
        ensureCallable: function(inputVal) {
            return secretTools.fetchType(inputVal) === 'function' ? inputVal : function() { return inputVal; };
        },
        findParameters: function(targetFn) {
            var stringRep = String(targetFn);
            var match = stringRep.match(parameterRegex);
            if (!match || !match[1]) return [];
            var names = match[1].trim().split(parameterSplitRegex);
            return (names.length === 1 && !names[0]) ? [] : names;
        },
        tryExecute: function(targetFn, executionContext /*, ...args */) {
            var args = secretTools.toArray(arguments, 2);
            return (function() {
                try {
                    return targetFn.apply(executionContext || this, args);
                } catch (e) {
                    return e;
                }
            })();
        },
        currySelf: function(targetFn) {
            var internalKey = 'curriedReference';
            if (targetFn[internalKey]) return targetFn[internalKey];

            var curried = function() {
                return targetFn.apply(this, [this].concat(secretTools.toArray(arguments)));
            };
            secretTools.setProp(targetFn, internalKey, { value: curried, writable: false, configurable: false });
            return curried;
        },
        scheduleAsync: function(targetFn, executionContext /*, ...args */) {
            var args = secretTools.toArray(arguments, 2);
            var boundFn = targetFn.bind.apply(targetFn, [executionContext].concat(args));
            // Prefer microtasks if available, fallback to macrotasks
            if (typeof Promise !== 'undefined' && Promise.resolve) {
                return Promise.resolve().then(boundFn);
            } else if (typeof process !== 'undefined' && process.nextTick) {
                return process.nextTick(boundFn);
            } else {
                return setTimeout(boundFn, 0);
            }
        },
        postponeExecution: function(targetFn, milliseconds, executionContext /*, ...args */) {
            var args = secretTools.toArray(arguments, 3);
            var timerId;
            var deferredAction = function() {
                clearTimeout(timerId);
                timerId = undefined; // Clear the ID after execution
                return targetFn.apply(executionContext || this, args);
            };

            var control = {
                halt: function() {
                    clearTimeout(timerId);
                    timerId = undefined;
                    return targetFn; // Return original function to allow further use
                },
                get timeoutIdentifier() { return timerId; }
            };

            timerId = setTimeout(deferredAction, milliseconds);
            return control;
        },
        cacheResults: function(targetFn, executionContext, resultCache) {
            resultCache = resultCache || new Map(); // Use Map for better key handling
            var cachedFunction = function() {
                var args = secretTools.toArray(arguments);
                var key = JSON.stringify(args); // Simple key for memoization, might fail for complex objects
                if (resultCache.has(key)) {
                    return resultCache.get(key);
                }
                var result = targetFn.apply(executionContext, args);
                resultCache.set(key, result);
                return result;
            };
            cachedFunction.uncache = function() { return targetFn; };
            return cachedFunction;
        },
        noopFunc: function(targetFn) { return targetFn; }, // For `stop` and `unmemoize`
        interposeFunction: function(originalFn, wrapperFn /*, ...wrapperArgs */) {
            var wrapperArgs = secretTools.toArray(arguments, 2);
            return function() {
                var currentContext = this;
                var boundOriginal = originalFn.bind(currentContext);
                return wrapperFn.apply(currentContext, [boundOriginal].concat(wrapperArgs).concat(secretTools.toArray(arguments)));
            };
        }
    };

    // --- Array Extensions ---
    var sortingComparators = {
        descending: function(itemA, itemB) { return itemA[1] === itemB[1] ? 0 : itemA[1] < itemB[1] ? 1 : -1; },
        ascending: function(itemA, itemB) { return itemA[1] === itemB[1] ? 0 : itemA[1] > itemB[1] ? 1 : -1; }
    };
    sortingComparators[String(true)] = sortingComparators.ascending;
    sortingComparators[1] = sortingComparators.ascending;
    sortingComparators[String(false)] = sortingComparators.descending;
    sortingComparators[0] = sortingComparators.descending;

    PrimeKit.array = {
        reduceElements: function(targetArr, initialVal, processingFn, executionContext) {
            return targetArr.reduce(function(accumulator, currentVal, index, arrayRef) {
                return processingFn.call(executionContext || currentVal, accumulator, currentVal, index, arrayRef);
            }, initialVal);
        },
        mapToRecord: function(targetArr, keysArr, valueTransformFn, executionContext) {
            valueTransformFn = valueTransformFn || function(v) { return v; };
            executionContext = executionContext || targetArr;
            return targetArr.reduce(function(resultObj, currentVal, index) {
                resultObj[keysArr[index]] = valueTransformFn.call(executionContext, currentVal, index, this);
                return resultObj;
            }, {});
        },
        resetArray: function(targetArr) {
            targetArr.length = 0;
            return targetArr;
        },
        duplicateArray: function(targetArr) {
            return targetArr.slice(); // Shallow copy
        },
        filterPresent: function(targetArr, removeFalsy) {
            var filterFn = removeFalsy === true ? function(o) { return o; } : secretTools.isDefined;
            return targetArr.filter(filterFn);
        },
        hasElement: function(targetArr, elementToFind) {
            return targetArr.indexOf(elementToFind) !== -1;
        },
        forEachElement: function(targetArr, processingFn, executionContext) {
            targetArr.forEach(processingFn, executionContext || targetArr);
            return targetArr;
        },
        unfoldArray: function(targetArr, depth) {
            if (secretTools.fetchType(depth) === 'number') {
                if (depth <= 0) return targetArr.slice();
                depth--;
            }

            return PrimeKit.array.reduceElements(targetArr, [], function(accumulator, currentVal) {
                if (Array.isArray(currentVal)) {
                    accumulator.push.apply(accumulator, PrimeKit.array.unfoldArray(currentVal, depth));
                } else {
                    accumulator.push(currentVal);
                }
                return accumulator;
            });
        },
        regexFilter: function(targetArr, regexPattern, transformFn, executionContext) {
            transformFn = transformFn || function(v) { return v; };
            executionContext = executionContext || targetArr;
            if (secretTools.fetchType(regexPattern) === 'string') {
                regexPattern = new RegExp(regexPattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
            }
            return PrimeKit.array.reduceElements(targetArr, [], function(accumulator, currentVal, index) {
                if (regexPattern.test(currentVal)) {
                    accumulator.push(transformFn.call(executionContext, currentVal, index, targetArr));
                }
                return accumulator;
            });
        },
        partitionBy: function(targetArr, criteria, transformFn, executionContext) {
            transformFn = transformFn || function(v) { return v; };
            executionContext = executionContext || targetArr;
            var resultGroups = {};
            var keyExtractor;

            switch (secretTools.fetchType(criteria)) {
                case 'function':
                    keyExtractor = function(item) { return criteria(item) ? '0' : '1'; };
                    resultGroups['0'] = []; resultGroups['1'] = [];
                    break;
                case 'regexp':
                    keyExtractor = function(item) { return criteria.test(item) ? '0' : '1'; };
                    resultGroups['0'] = []; resultGroups['1'] = [];
                    break;
                case 'number':
                case 'string':
                    keyExtractor = function(item) {
                        var val = secretTools.deepGet(item, criteria) || '1';
                        return String(val);
                    };
                    // Pre-populate keys if possible, but the original logic doesn't strictly require it.
                    // Instead, it relies on the first match defining the group.
                    break;
                default:
                    throw new TypeError('Grouping criteria must be a Function, RegExp, or String.');
            }

            return PrimeKit.array.reduceElements(targetArr, resultGroups, function(groups, item, index) {
                var groupKey = keyExtractor(item);
                if (!groups[groupKey]) {
                    groups[groupKey] = [];
                }
                groups[groupKey].push(transformFn.call(this, item, index, targetArr));
                return groups;
            }, executionContext);
        },
        addUnique: function(targetArr, itemToAdd) {
            if (PrimeKit.array.hasElement(targetArr, itemToAdd)) {
                return false;
            }
            targetArr.push(itemToAdd);
            return true;
        },
        callMethodOnElements: function(targetArr, methodName /*, ...methodArgs */) {
            var args = secretTools.toArray(arguments, 2);
            return targetArr.map(function(item) {
                if (secretTools.fetchType(item[methodName]) === 'function') {
                    return item[methodName].apply(item, args);
                }
                return null;
            }).filter(secretTools.isDefined); // Filter out nulls from failed calls, original uses mapc behavior
        },
        getElementAt: function(targetArr, index) {
            return targetArr[index < 0 ? targetArr.length + index : index];
        },
        finalElement: function(targetArr) {
            return targetArr[targetArr.length - 1];
        },
        transformAndFilter: function(targetArr, transformFn, executionContext) {
            executionContext = executionContext || targetArr;
            return targetArr.reduce(function(accumulator, currentVal, index, arrayRef) {
                var transformed = transformFn.call(executionContext, currentVal, index, arrayRef);
                if (secretTools.isDefined(transformed)) {
                    accumulator.push(transformed);
                }
                return accumulator;
            }, []);
        },
        pruneElements: function(targetArr /*, ...itemsToRemove */) {
            var itemsToRemove = new Set(secretTools.toArray(arguments, 1));
            var removedItems = [];
            var newArr = [];

            for (var i = 0; i < targetArr.length; i++) {
                var item = targetArr[i];
                if (itemsToRemove.has(item)) {
                    removedItems.push(item);
                    itemsToRemove.delete(item); // Only remove first occurrence if duplicates exist in itemsToRemove
                } else {
                    newArr.push(item);
                }
            }
            // Modify original array in place
            targetArr.length = 0;
            targetArr.push.apply(targetArr, newArr);
            return removedItems;
        },
        orderCollection: function(targetArr, fieldOrFunction, direction) {
            var valueExtractor = function(item) {
                if (secretTools.fetchType(fieldOrFunction) === 'function') {
                    return fieldOrFunction(item);
                }
                return secretTools.deepGet(item, fieldOrFunction);
            };

            var sortedPairs = targetArr.map(function(item) {
                return [item, valueExtractor(item)];
            }).sort(sortingComparators[String(direction).toLowerCase()] || sortingComparators.ascending);

            return sortedPairs.map(function(pair) { return pair[0]; });
        },
        injectProperty: function(targetArr, propKey, valueOrArray) {
            var isValueArray = Array.isArray(valueOrArray);
            return PrimeKit.array.forEachElement(targetArr, function(item, index) {
                item[propKey] = isValueArray ? valueOrArray[index] : valueOrArray;
            });
        },
        uniqueItems: function(targetArr) {
            return Array.from(new Set(targetArr));
        },
        excludeElements: function(targetArr /*, ...itemsToExclude */) {
            var itemsToExclude = new Set(secretTools.toArray(arguments, 1));
            return targetArr.filter(function(item) {
                return !itemsToExclude.has(item);
            });
        },
        interleaveCollections: function(primaryArr /*, ...secondaryArrays */) {
            var allArrays = secretTools.toArray(arguments);
            return primaryArr.map(function(item, index) {
                return allArrays.map(function(arr) {
                    return arr[index];
                });
            });
        }
    };

    // --- Number Extensions ---
    var bigNumberLimit = 9007199254740992; // 2^53

    PrimeKit.number = {
        isWholeNumber: function(inputVal) {
            var type = secretTools.fetchType(inputVal);
            return type === 'number' && isFinite(inputVal) && inputVal > -bigNumberLimit && inputVal < bigNumberLimit && Math.floor(inputVal) === inputVal;
        },
        convertToInt: function(inputVal) {
            var numVal = +inputVal;
            if (isNaN(numVal)) return 0;
            if (numVal === 0 || !isFinite(numVal)) return numVal;
            return (numVal < 0 ? -1 : 1) * Math.abs(Math.floor(numVal));
        },
        prefixZeros: function(targetNum, minLength, radixBase) {
            var stringRep = targetNum.toString(radixBase || 10);
            return '0'.repeat(Math.max(0, minLength - stringRep.length)) + stringRep;
        },
        repeatAction: function(targetNum, actionFn, executionContext) {
            secretTools.generateRange(0, targetNum).forEach(actionFn, executionContext || secretTools.locateGlobal());
            return targetNum;
        },
        toTwoDigitHex: function(targetNum) {
            return PrimeKit.number.prefixZeros(targetNum, 2, 16);
        }
    };

    // --- String Extensions ---
    var regexCache = secretTools.createEmptyObject();
    var stringSplitter = function(inputStr) {
        inputStr = inputStr.trim();
        var firstChar = inputStr.charAt(0);
        var secondChar = inputStr.charAt(1);
        var splitPoint = (firstChar.toLowerCase() === firstChar && secondChar !== ' ' && secondChar.toUpperCase() === secondChar) ? 2 : 1;
        var parts = inputStr.substring(splitPoint).replace(/([A-Z])/g, function(m, p) { return '-' + p.toLowerCase(); }).split(/[\s_-]+/g);
        parts[0] = inputStr.substring(0, splitPoint) + parts[0];
        return parts;
    };

    PrimeKit.string = {
        isWhitespaceOnly: function(targetStr) {
            return !targetStr.trim();
        },
        formatCapital: function(targetStr) {
            if (!targetStr) return '';
            return targetStr.charAt(0).toUpperCase() + targetStr.substring(1).toLowerCase();
        },
        normalizeSpaces: function(targetStr, separatorChar) {
            separatorChar = separatorChar || ' ';
            var key = separatorChar + '_regex';
            var regex = regexCache[key] || (regexCache[key] = new RegExp('(' + separatorChar + '){1,}', 'g'));
            return targetStr.split(regex).filter(function(s) { return s !== '' && s !== separatorChar; }).join(separatorChar);
        },
        includesSubstring: function(targetStr, subStr) {
            return targetStr.indexOf(subStr) !== -1;
        },
        isEmptyString: function(targetStr) {
            return targetStr === '';
        },
        endsWithSuffix: function(targetStr, suffix) {
            return targetStr.length >= suffix.length && targetStr.lastIndexOf(suffix) === targetStr.length - suffix.length;
        },
        interpolateText: secretTools.stringFormat.bind(null), // Curried version
        globalReplace: secretTools.stringGlobalSub.bind(null), // Curried version
        toKebabCase: function(targetStr) {
            return stringSplitter(targetStr).join('-').toLowerCase();
        },
        containsCaseInsensitive: function(targetStr, subStr) {
            return targetStr.toLowerCase().indexOf(String(subStr).toLowerCase()) !== -1;
        },
        extractMatches: function(targetStr, regexPattern) {
            var matches = targetStr.match(regexPattern);
            if (!matches) return [];
            // Original logic: if only one match and it's the whole string, return empty.
            // Or if first match is null, return empty.
            if (matches.length === 1 && (matches[0] === null || matches[0] === targetStr)) {
                return [];
            }
            // If the first match is the whole string, remove it (like capture groups)
            if (matches[0] === targetStr) {
                matches.shift();
            }
            return matches;
        },
        escapeRegexChars: function(targetStr) {
            return targetStr.replace(/([-\*\+\?\.\|\^\$\/\\\(\)[\]\{\}])/g, '\\$1');
        },
        chunkString: function(targetStr, chunkSize) {
            chunkSize = parseInt(chunkSize, 10);
            if (isNaN(chunkSize) || targetStr.length < chunkSize || chunkSize === 0) {
                return [String(targetStr)];
            }
            var key = 'chunk_' + chunkSize;
            var regex = regexCache[key] || (regexCache[key] = new RegExp('(.{1,' + chunkSize + '})', 'g'));
            return targetStr.match(regex);
        },
        beginsWithPrefix: function(targetStr, prefix) {
            return targetStr.indexOf(prefix) === 0;
        },
        duplicateString: function(targetStr, count) {
            return String(targetStr).repeat(PrimeKit.number.convertToInt(count));
        },
        toCamelStyle: function(targetStr) {
            var parts = stringSplitter(targetStr);
            var firstPart = parts.shift();
            return parts.reduce(function(res, val) {
                return res + PrimeKit.string.formatCapital(val);
            }, firstPart);
        },
        convertColorToHex: (function() {
            function componentToHex(c) {
                return PrimeKit.number.toTwoDigitHex(parseInt(c, 10));
            }
            var rgbRegex = /(\d{1,3})/g;
            var hexRegex = /#?(\w{1,6})/;
            return function(targetStr) {
                var rgbMatch = targetStr.match(rgbRegex);
                if (rgbMatch && rgbMatch.length >= 3) {
                    return '#' + rgbMatch.slice(0, 3).map(componentToHex).join('');
                }
                var hexMatch = targetStr.match(hexRegex);
                if (hexMatch && hexMatch[1]) {
                    var hexVal = hexMatch[1];
                    if (hexVal.length === 3) {
                        return '#' + hexVal.split('').map(function(c) { return c + c; }).join('');
                    }
                    if (hexVal.length === 1) { // e.g. "F" -> "FFFFFF"
                        return '#' + hexVal.repeat(6);
                    }
                    if (hexVal.length === 2) { // e.g. "FF" -> "FFFFFF"
                        return '#' + hexVal.repeat(3);
                    }
                    return '#' + hexVal;
                }
                return targetStr; // Return original if no match
            };
        })(),
        parseJSONText: JSON.parse, // Directly use native
        convertColorToRGB: function(targetStr, returnAsArray) {
            var hexMatch = targetStr.match(/#?(\w{1,6})/);
            if (!hexMatch || !hexMatch[1]) return null;

            var hex = hexMatch[1];
            var len = hex.length;

            if (len === 3) hex = hex.split('').map(function(c) { return c + c; }).join('');
            else if (len === 1) hex = hex.repeat(6);
            else if (len === 2) hex = hex.repeat(3);
            else if (len > 6) hex = hex.substring(0, 6);
            else if (len < 6 && len !== 3) hex += '0'.repeat(6 - len);

            var values = PrimeKit.string.chunkString(hex, 2).map(function(v) { return parseInt(v, 16); });
            return returnAsArray === true ? values : 'rgb(' + values.join(', ') + ')';
        },
        trimTrailingWhitespace: function(targetStr) {
            return targetStr.replace(/\s*$/, '');
        },
        shortenText: function(targetStr, maxLength, ellipsisChar) {
            maxLength = maxLength || 50;
            ellipsisChar = secretTools.fetchType(ellipsisChar) === 'string' ? ellipsisChar : '...';
            if (targetStr.length < maxLength) return String(targetStr);
            return PrimeKit.string.trimTrailingWhitespace(targetStr.substring(0, maxLength)) + ellipsisChar;
        },
        toSnakeCase: function(targetStr) {
            return stringSplitter(targetStr).join('_').toLowerCase();
        }
    };

    // --- Module Export (similar to original's expose.js) ---
    var moduleName = 'PrimeKit';
    var environment = secretTools.locateGlobal();
    var targetPackage = (typeof module !== 'undefined' && module.exports) ? module : environment;

    // Expose PrimeKit globally or as a module
    if (targetPackage === module) {
        module.exports = PrimeKit;
    } else {
        environment[moduleName] = PrimeKit;
    }

    return PrimeKit;
})();