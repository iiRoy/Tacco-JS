"use strict";

function _collectAllItems(collection) { return _copyArrayElements(collection) || _makeArrayFromIterable(collection) || _noSpreadPossible(); }

function _noSpreadPossible() { throw new TypeError("Cannot spread non-iterable instance"); }

function _makeArrayFromIterable(source) { if (Symbol.iterator in Object(source) || Object.prototype.toString.call(source) === "[object Arguments]") return Array.from(source); }

function _copyArrayElements(inputArray) { if (Array.isArray(inputArray)) { for (var idx = 0, newArray = new Array(inputArray.length); idx < inputArray.length; idx++) { newArray[idx] = inputArray[idx]; } return newArray; } }

function _divideIntoParts(data, count) { return _ensureArray(data) || _extractLimitedIterable(data, count) || _remainingNotIterable(); }

function _remainingNotIterable() { throw new TypeError("Failed to destructure non-iterable value"); }

function _extractLimitedIterable(source, limit) { var _segment = []; var _active = true; var _errorOccurred = false; var _errorObject = undefined; try { for (var _iter = source[Symbol.iterator](), _stepResult; !(_active = (_stepResult = _iter.next()).done); _active = true) { _segment.push(_stepResult.value); if (limit && _segment.length === limit) break; } } catch (err) { _errorOccurred = true; _errorObject = err; } finally { try { if (!_active && _iter["return"] != null) { _iter["return"](); } } finally { if (_errorOccurred) throw _errorObject; } } return _segment; }

function _ensureArray(inputArray) { if (Array.isArray(inputArray)) return inputArray; }

function processData(rawData) {
    // Split the raw input string into an array of lines.
    var dataLines = rawData.split('\n');

    // Parse the first line to get the total item count and selection limit.
    var _parsedValues = parseNumbers(dataLines[0]),
        _dividedPair = _divideIntoParts(_parsedValues, 2),
        itemCount = _dividedPair[0],
        selectionLimit = _dividedPair[1];

    // Process subsequent lines to create an array of menu item objects.
    var menuItems = dataLines.slice(1, itemCount + 1).map(function (entry, index) {
        var _parsedEntry = parseNumbers(entry),
            _dividedEntry = _divideIntoParts(_parsedEntry, 2),
            kind = _dividedEntry[0],
            flavor = _dividedEntry[1];
        return {
            kind,
            flavor,
            index
        };
    });

    // Sort menu items primarily by kind, then by flavor in descending order.
    menuItems.sort(function (itemA, itemB) {
        if (itemA.kind < itemB.kind) return -1;
        if (itemA.kind > itemB.kind) return 1;
        return itemB.flavor - itemA.flavor;
    });

    // Create a separate array of menu items sorted only by flavor (descending).
    var flavorSortedItems = menuItems.slice(0).sort(function (itemA, itemB) {
        return itemB.flavor - itemA.flavor;
    });

    // Group menu items by their kind, storing the best flavor for each kind.
    var currentKind = -1;
    var kindGroup = null;
    var kindGroupsMap = new Map();
    var _isIterating = true;
    var _encounteredIterError = false;
    var _iterErrorObject = undefined;

    try {
        for (var _itemIterator = menuItems[Symbol.iterator](), _itemStep; !(_isIterating = (_itemStep = _itemIterator.next()).done); _isIterating = true) {
            var currentItem = _itemStep.value;

            if (currentItem.kind !== currentKind) {
                if (kindGroup) {
                    kindGroupsMap.set(currentKind, kindGroup);
                }
                currentKind = currentItem.kind;
                kindGroup = [];
            }
            kindGroup.push(currentItem);
        }
    } catch (err) {
        _encounteredIterError = true;
        _iterErrorObject = err;
    } finally {
        try {
            if (!_isIterating && _itemIterator.return != null) {
                _itemIterator.return();
            }
        } finally {
            if (_encounteredIterError) {
                throw _iterErrorObject;
            }
        }
    }

    // Ensure the last group is added to the map.
    if (kindGroup) {
        kindGroupsMap.set(currentKind, kindGroup);
    }

    // Extract all unique kinds from the map.
    var uniqueKinds = Array.from(kindGroupsMap.keys());
    // Keep track of which items have been selected.
    var itemSelected = new Array(itemCount).fill(false);

    // Initialize selection state.
    var initialSelection,
        additionalItems = [],
        totalFlavorScore = 0,
        kindCount = 0;
    var pickIndex = 0;

    // Determine initial selection based on the number of unique kinds.
    if (uniqueKinds.length >= selectionLimit) {
        // If enough unique kinds, select one of each unique kind (the best one).
        initialSelection = uniqueKinds.map(function (kindType) {
            var itemObj = kindGroupsMap.get(kindType)[0];
            return itemObj;
        });
        var _isIteratingInitial = true;
        var _encounteredInitialError = false;
        var _initialErrorObject = undefined;

        try {
            for (var _initialItemIterator = initialSelection[Symbol.iterator](), _initialItemStep; !(_isIteratingInitial = (_initialItemStep = _initialItemIterator.next()).done); _isIteratingInitial = true) {
                var itemObj = _initialItemStep.value;
                itemSelected[itemObj.index] = true;
                totalFlavorScore += itemObj.flavor;
            }
        } catch (err) {
            _encounteredInitialError = true;
            _initialErrorObject = err;
        } finally {
            try {
                if (!_isIteratingInitial && _initialItemIterator.return != null) {
                    _initialItemIterator.return();
                }
            } finally {
                if (_encounteredInitialError) {
                    throw _initialErrorObject;
                }
            }
        }

        kindCount = selectionLimit;
    } else {
        // If fewer unique kinds than selection limit, take all unique kinds first.
        initialSelection = uniqueKinds.map(function (kindType) {
            var itemObj = kindGroupsMap.get(kindType)[0];
            itemSelected[itemObj.index] = true;
            totalFlavorScore += itemObj.flavor;
            return itemObj;
        });

        // Fill remaining slots with items (from any kind) that have the highest flavor.
        while (additionalItems.length < selectionLimit - initialSelection.length) {
            for (; pickIndex < itemCount; pickIndex++) {
                var currentSushi = flavorSortedItems[pickIndex];
                if (itemSelected[currentSushi.index]) continue;
                itemSelected[currentSushi.index] = true;
                totalFlavorScore += currentSushi.flavor;
                additionalItems.push(currentSushi);
            }
        }
        kindCount = uniqueKinds.length;
    }

    // Sort the initially selected unique items by flavor in ascending order.
    initialSelection.sort(function (itemA, itemB) {
        return itemA.flavor - itemB.flavor;
    });

    // Attempt to improve the total score by replacing less flavorful unique items
    // with more flavorful non-unique items, if it increases the overall score.
    var _isIteratingReplacement = true;
    var _encounteredReplacementError = false;
    var _replacementErrorObject = undefined;

    try {
        for (var _replacementIterator = sequence(0, initialSelection.length)[Symbol.iterator](), _replacementStep; !(_isIteratingReplacement = (_replacementStep = _replacementIterator.next()).done); _isIteratingReplacement = true) {
            var idx = _replacementStep.value;
            var itemToReplace = initialSelection[idx];

            for (; pickIndex < itemCount; pickIndex++) {
                var replacementCandidate = flavorSortedItems[pickIndex];

                if (itemSelected[replacementCandidate.index]) continue;

                var previousScore = totalFlavorScore + Math.pow(kindCount, 2);
                var potentialNewScore = totalFlavorScore + replacementCandidate.flavor - itemToReplace.flavor + Math.pow(kindCount - 1, 2);

                if (previousScore < potentialNewScore) {
                    totalFlavorScore += replacementCandidate.flavor - itemToReplace.flavor;
                    kindCount--;
                    itemSelected[replacementCandidate.index] = true;
                    itemSelected[itemToReplace.index] = false;
                    break;
                } else {
                    // If no improvement, stop trying to replace with this item.
                    console.log(previousScore);
                    return;
                }
            }
        }
    } catch (err) {
        _encounteredReplacementError = true;
        _replacementErrorObject = err;
    } finally {
        try {
            if (!_isIteratingReplacement && _replacementIterator.return != null) {
                _replacementIterator.return();
            }
        } finally {
            if (_encounteredReplacementError) {
                throw _replacementErrorObject;
            }
        }
    }

    // Calculate the final score including the squared kind bonus.
    var finalScore = totalFlavorScore + Math.pow(kindCount, 2);
    console.log(finalScore);
}

// A large prime number, though not used in the provided main logic.
var MOD_VALUE = 1e9 + 7;
// Execute the main processing function with data from standard input.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));

/**
 * Parses a line of text into an array of integers.
 * Handles both pre-split arrays and space-separated strings.
 */
function parseNumbers(textLine) {
    return (Array.isArray(textLine) ? textLine : textLine.split(/\s+/)).map(function (numStr) {
        return parseInt(numStr);
    });
}
/**
 * Generates a sequence of integers starting from 'begin' up to (but not including) 'finish'.
 */
function* sequence(begin, finish) {
    for (var idx = begin; idx < finish; idx++) {
        yield idx;
    }
}
/**
 * Generates a sequence of integers in reverse order,
 * starting from 'begin - 1' down to (and including) 'finish'.
 */
function* reverseSequence(begin, finish) {
    for (var idx = begin - 1; idx >= finish; idx--) {
        yield idx;
    }
}
/**
 * Executes a recursive function implemented as a generator.
 * This pattern helps manage deep recursion without hitting stack limits.
 */
function executeGenerator(generatorFunc) {
    // Object to hold the final result from the top-level call.
    var mainInvoker = {
        lastResult: null
    };
    // Custom call stack for iterative execution.
    var executionStack = [];

    // Collect arguments for the initial generator function call.
    for (var argLength = arguments.length, invocationArgs = new Array(argLength > 1 ? argLength - 1 : 0), argIndex = 1; argIndex < argLength; argIndex++) {
        invocationArgs[argIndex - 1] = arguments[argIndex];
    }

    // Push the first function call onto the stack.
    executionStack.push({
        frameIterator: generatorFunc.apply(void 0, invocationArgs),
        lastResult: null,
        parentInvoker: mainInvoker
    });

    // Process the execution stack until it's empty.
    while (executionStack.length > 0) {
        var currentFrame = executionStack[executionStack.length - 1];
        var frameIterator = currentFrame.frameIterator,
            lastResult = currentFrame.lastResult,
            parentInvoker = currentFrame.parentInvoker;

        // Resume or advance the generator execution.
        var _iteratorResult = frameIterator.next(lastResult),
            yieldedValue = _iteratorResult.value,
            isDone = _iteratorResult.done;

        if (isDone) {
            // If the generator is done, record its return value in the parent frame
            // and pop the current frame from the stack.
            parentInvoker.lastResult = yieldedValue;
            executionStack.pop();
        } else {
            // If the generator yielded (indicating a recursive call),
            // push a new frame for the yielded function call onto the stack.
            executionStack.push({
                frameIterator: generatorFunc.apply(void 0, _collectAllItems(yieldedValue)),
                lastResult: null,
                parentInvoker: currentFrame
            });
        }
    }
    // Return the final result from the initial generator call.
    return mainInvoker.lastResult;
}