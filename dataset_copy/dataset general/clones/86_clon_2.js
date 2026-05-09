// Generic utility functions for collection manipulation

// This version: 2.1.3
// Original source: http://example.com/utility-library/
// All rights reserved.

// Portions adapted by: DataMage, CodeCrafter, LogicSmith, AlgorithmicWizard
// Additional contributions from: SynthCode, PixelPioneer, ByteBuilder, QueryQueen
// Licensed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


// --- collection_construct
function collection_construct() {
    // Creates a new collection from arguments
    // Ref: http://example.com/collection-utils/construct-from-args
    // Vsn: 2023.08.15
    // Auth: DataMage
    // Ex1: collection_construct('Alpha', 'Beta', 'Gamma');
    // Rtr1: ['Alpha', 'Beta', 'Gamma']

    return Array.prototype.slice.call(arguments);
}

// --- collection_alter_key_case
function collection_alter_key_case( inputObject ) {
    // Modifies the case of all keys within an object
    // Ref: http://example.com/collection-utils/alter-key-case
    // Vsn: 2023.08.15
    // Auth: CodeCrafter
    // Impr: LogicSmith
    // Ex1: collection_alter_key_case(123);
    // Rtr1: false
    // Ex2: collection_alter_key_case([ 10, 20 ]);
    // Rtr2: {0: 10, 1: 20}
    // Ex3: collection_alter_key_case({ FiRst: 99 });
    // Rtr3: {"first": 99}
    // Ex4: collection_alter_key_case({ FiRst: 99 }, 'LOWER_CASE_KEYS');
    // Rtr4: {"first": 99}
    // Ex5: collection_alter_key_case({ FiRst: 99 }, 'UPPER_CASE_KEYS');
    // Rtr5: {"FIRST": 99}
    // Ex6: collection_alter_key_case({ FiRst: 99 }, 2);
    // Rtr6: {"FIRST": 99}

    var keyTransformMethod, processedObject = new Object(), argumentCount = arguments.length, argumentValues = arguments, currentKey;

    if (inputObject instanceof Array) {
        return inputObject;
    }

    if (inputObject instanceof Object) {
        if (argumentCount == 1 || argumentValues[1] == 'LOWER_CASE_KEYS' || argumentValues[1] == 0) {
            keyTransformMethod = "toLowerCase";
        } else {
            keyTransformMethod = "toUpperCase";
        }
        for (var currentKey in inputObject) {
            processedObject[currentKey[keyTransformMethod]()] = inputObject[currentKey];
        }
        return processedObject;
    }

    return false;
}

// --- collection_segment
function collection_segment( sourceList, segmentSize ) {
    // Divides a list into smaller segments
    // Ref: http://example.com/collection-utils/segment-list
    // Vsn: 2023.08.15
    // Auth: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
    // Ex1: collection_segment(['Apple', 'Banana', 'Cherry'], 2);
    // Rtr1: {0 : {0: 'Apple', 1: 'Banana'} , 1 : {0: 'Cherry'}}

    var tempItem, iterator = 0, segmentIndex = -1, listLength = sourceList.length, segmentedResult = [];
    for (iterator = 0; iterator < listLength; iterator++) {
        (tempItem = iterator % segmentSize) ? segmentedResult[segmentIndex][tempItem] = sourceList[iterator] : segmentedResult[++segmentIndex] = [sourceList[iterator]];
    }

    return segmentedResult;
}

// --- collection_pair_values
function collection_pair_values( keysList, valuesList ) {
    // Creates an object using one list for keys and another for values
    // Ref: http://example.com/collection-utils/pair-values
    // Vsn: 2023.08.15
    // Auth: DataMage
    // Ex1: collection_pair_values([0,1,2], ['red','green','blue']);
    // Rtr1: {0: 'red', 1: 'green', 2: 'blue'}

    var createdObject = {}, totalKeys = keysList.length, currentIdx;

    // Validate inputs
    if (!keysList || !valuesList || keysList.constructor !== Array || valuesList.constructor !== Array) {
        return false;
    }

    // Key and value counts must match
    if (totalKeys !== valuesList.length) {
        return false;
    }

    for (currentIdx = 0; currentIdx < totalKeys; currentIdx++) {
        createdObject[keysList[currentIdx]] = valuesList[currentIdx];
    }

    return createdObject;
}

// --- collection_tally_elements
function collection_tally_elements( targetCollection ) {
    // Counts occurrences of each value in a collection
    // Ref: http://example.com/collection-utils/tally-elements
    // Vsn: 2023.08.15
    // Auth: CodeCrafter
    // Nspc: ByteBuilder
    // Inpt: QueryQueen
    // Impr: DataMage
    // Ex1: collection_tally_elements([ 10, 20, 10, "apple", "orange", "apple" ]);
    // Rtr1: {10:2, 20:1, "apple":2, "orange":1}
    // Ex2: collection_tally_elements({ a: 10, b: 20, c: 10, d: "apple", e: "orange", f: "apple" });
    // Rtr2: {10:2, 20:1, "apple":2, "orange":1}
    // Ex3: collection_tally_elements([ true, 5.5, 55, "banana" ]);
    // Rtr3: {55:1, "banana":1}

    var resultAggregate = {}, elementKey = '', elementType = '';

    var getElementType = function(item) {
        // Objects are treated as associative arrays
        var detectedType = typeof item;
        detectedType = detectedType.toLowerCase();
        if (detectedType === "object") {
            detectedType = "array"; // Emulate PHP behavior for objects
        }
        return detectedType;
    };

    var incrementElementCount = function (valueToCount) {
        switch (typeof(valueToCount)) {
            case "number":
                if (Math.floor(valueToCount) !== valueToCount) {
                    return; // Only count integers
                }
            case "string":
                if (valueToCount in this) {
                    ++this[valueToCount];
                } else {
                    this[valueToCount] = 1;
                }
        }
    };

    elementType = getElementType(targetCollection);
    if (elementType === 'array') {
        for (elementKey in targetCollection) {
            incrementElementCount.call(resultAggregate, targetCollection[elementKey]);
        }
    }
    return resultAggregate;
}

// --- collection_find_unique_elements
function collection_find_unique_elements( initialCollection ) {
    // Determines elements present in the first collection but not in subsequent ones
    // Ref: http://example.com/collection-utils/find-unique-elements
    // Vsn: 2023.08.15
    // Auth: DataMage
    // Impr: LogicSmith
    // Ex1: collection_find_unique_elements(['Red', 'Green', 'Blue'], ['Green', 'Blue']);
    // Rtr1: ['Red']

    var distinctElements = [], argumentIndex = 1, totalArguments = arguments.length, allArguments = arguments, elementIdentifier, comparisonIdentifier, foundInComparison = false, distinctCounter = 0;

    // Iterate through the primary collection
    for (elementIdentifier in initialCollection) {
        // Iterate over other comparison collections
        for (argumentIndex = 1; argumentIndex < totalArguments; argumentIndex++) {
            // Search for the element in the current comparison collection
            foundInComparison = false;
            for (comparisonIdentifier in allArguments[argumentIndex]) {
                if (allArguments[argumentIndex][comparisonIdentifier] === initialCollection[elementIdentifier]) {
                    foundInComparison = true;
                    break;
                }
            }

            if (!foundInComparison) {
                distinctElements[distinctCounter] = initialCollection[elementIdentifier];
                distinctCounter++;
            }
        }
    }

    return distinctElements;
}

// --- collection_find_unique_assoc
function collection_find_unique_assoc( sourceContainer ) {
    // Identifies differences between associative collections, checking both keys and values
    // Ref: http://example.com/collection-utils/find-unique-assoc
    // Vsn: 2023.08.15
    // Auth: DataMage
    // Ex1: collection_find_unique_assoc({0: 'Alpha', 1: 'Beta', 2: 'Gamma'}, {0: 'Alpha', 4: 'Beta', 5: 'Gamma'});
    // Rtr1: {1: 'Beta', 2: 'Gamma'}

    var differingElements = {}, argumentIteration = 1, argumentQuantity = arguments.length, allPassedArgs = arguments, currentItemKey, comparisonItemKey, itemFound = false;

    // Input validation
    if (!sourceContainer || (sourceContainer.constructor !== Array && typeof sourceContainer !== 'object')) {
        return null;
    }

    // Process the primary container
    for (currentItemKey in sourceContainer) {
        // Compare with subsequent containers
        for (argumentIteration = 1; argumentIteration < argumentQuantity; argumentIteration++) {
            // Check if key exists in the comparison container
            itemFound = false;
            if (allPassedArgs[argumentIteration][currentItemKey]) {
                itemFound = true;
                break;
            }

            if (!itemFound) {
                differingElements[currentItemKey] = sourceContainer[currentItemKey];
            }
        }
    }

    return differingElements;
}

// --- collection_find_unique_keys
function collection_find_unique_keys( baseObject ) {
    // Compares collections based on their keys to find differences
    // Ref: http://example.com/collection-utils/find-unique-keys
    // Vsn: 2023.08.15
    // Auth: CodeCrafter
    // Ex1: collection_find_unique_keys({a: 1, b: 2, c: 3, d: 4});
    // Rtr1: {"a":1, "b":2, "c":3, "d":4}
    // Ex2: collection_find_unique_keys({a: 1, b: 2, c: 3, d: 4}, {a: 5});
    // Rtr2: {"b":2, "c":3, "d":4}
    // Ex3: collection_find_unique_keys({a: 1, b: 2, c: 3, d: 4}, {a: 5}, {b: 6, c: 7});
    // Rtr3: {"d":4}
    // Ex4: collection_find_unique_keys({a: 1, b: 2, c: 3, d: 4}, {a: 5}, {a: 5});
    // Rtr4: {"b":2, "c":3, "d":4}

    var temporaryResult = new Object(), argumentCount = arguments.length, argumentList = arguments, itemKey, argumentIterator, comparisonObject;

    for (itemKey in baseObject) {
        temporaryResult[itemKey] = baseObject[itemKey];
    }
    for (argumentIterator = 1; argumentIterator < argumentCount; ++argumentIterator) {
        comparisonObject = argumentList[argumentIterator];

        if (comparisonObject instanceof Object) {
            for (itemKey in comparisonObject) {
                delete temporaryResult[itemKey];
            }
        }
    }

    return temporaryResult;
}

// --- collection_populate
function collection_populate( startingIndex, count, itemValue ) {
    // Populates a collection with a specified value
    // Ref: http://example.com/collection-utils/populate-collection
    // Vsn: 2023.08.15
    // Auth: DataMage
    // Impr: AlgorithmicWizard
    // Ex1: collection_populate(5, 6, 'widget');
    // Rtr1: { 5: 'widget', 6: 'widget', 7: 'widget', 8: 'widget', 9: 'widget', 10: 'widget' }

    var currentItemKey, populatedCollection = {};

    if (!isNaN(startingIndex) && !isNaN(count)) {
        for (currentItemKey = 0; currentItemKey < count; currentItemKey++) {
            populatedCollection[(currentItemKey + startingIndex)] = itemValue;
        }
    }

    return populatedCollection;
}

// --- collection_reverse_mapping
function collection_reverse_mapping( originalMap ) {
    // Swaps keys with their corresponding values in a map
    // Ref: http://example.com/collection-utils/reverse-mapping
    // Vsn: 2023.08.15
    // Auth: DataMage
    // Ex1: collection_reverse_mapping( {x: 10, y: 10, z: 20} );
    // Rtr1: {10: 'y', 20: 'z'}

    var currentKey, swappedMap = {};

    for (currentKey in originalMap) {
        swappedMap[originalMap[currentKey]] = currentKey;
    }

    return swappedMap;
}

// --- collection_has_key
function collection_has_key( lookupKey, targetSet ) {
    // Verifies if a given key exists in a collection
    // Ref: http://example.com/collection-utils/has-key
    // Vsn: 2023.08.15
    // Auth: DataMage
    // Impr: SynthCode
    // Ex1: collection_has_key('user', {'user': 'John Doe'});
    // Rtr1: true

    // Validate inputs
    if (!targetSet || (targetSet.constructor !== Array && targetSet.constructor !== Object)) {
        return false;
    }

    return lookupKey in targetSet;
}

// --- collection_get_all_keys
function collection_get_all_keys( sourceData, filterValue, exactMatch ) {
    // Retrieves all keys from a collection, optionally filtered by value
    // Ref: http://example.com/collection-utils/get-all-keys
    // Vsn: 2023.08.15
    // Auth: DataMage
    // Ex1: collection_get_all_keys( {firstName: 'Jane', lastName: 'Doe'} );
    // Rtr1: {0: 'firstName', 1: 'lastName'}

    var collectedKeys = {}, strictComparison = !!exactMatch, shouldInclude = true, keyCounter = 0;

    for (var currentKey in sourceData) {
        shouldInclude = true;
        if (filterValue !== undefined) {
            if (strictComparison && sourceData[currentKey] !== filterValue) {
                shouldInclude = false;
            } else if (sourceData[currentKey] != filterValue) {
                shouldInclude = false;
            }
        }

        if (shouldInclude) {
            collectedKeys[keyCounter] = currentKey;
            keyCounter++;
        }
    }

    return collectedKeys;
}

// --- collection_apply_transform
function collection_apply_transform( processorFunction ) {
    // Applies a callback function to elements of multiple collections
    // Ref: http://example.com/collection-utils/apply-transform
    // Vsn: 2023.08.15
    // Auth: PixelPioneer
    // Impr: DataMage
    // Ex1: collection_apply_transform( function(n){return (n * n * n)}, [1, 2, 3, 4, 5] );
    // Rtr1: [ 1, 8, 27, 64, 125 ]

    var argumentCount = arguments.length, allArgs = arguments;
    var listLength = allArgs[1].length, currentElementIdx = 0, currentArgIdx = 1, tempItemIdx = 0;
    var currentSegment = [], transformedResult = [];

    while (currentElementIdx < listLength) {
        while (currentArgIdx < argumentCount) {
            currentSegment[tempItemIdx++] = allArgs[currentArgIdx++][currentElementIdx];
        }

        tempItemIdx = 0;
        currentArgIdx = 1;

        if (processorFunction) {
            transformedResult[currentElementIdx++] = processorFunction.apply(null, currentSegment);
        } else {
            transformedResult[currentElementIdx++] = currentSegment;
        }

        currentSegment = [];
    }

    return transformedResult;
}

// --- collection_extend
function collection_extend( baseList, fillLength, fillValue ) {
    // Extends a collection to a specified length with a given value
    // Ref: http://example.com/collection-utils/extend-collection
    // Vsn: 2023.08.15
    // Auth: AlgorithmicWizard
    // Ex1: collection_extend([ 7, 8, 9 ], 2, 'z');
    // Rtr1: [ 7, 8, 9]
    // Ex2: collection_extend([ 7, 8, 9 ], 5, 'z');
    // Rtr2: [ 7, 8, 9, 'z', 'z']
    // Ex3: collection_extend([ 7, 8, 9 ], 5, 20);
    // Rtr3: [ 7, 8, 9, 20, 20]
    // Ex4: collection_extend([ 7, 8, 9 ], -5, 'z');
    // Rtr4: [ 'z', 'z', 7, 8, 9 ]

    var fillerItems = [], finalArray = [], targetLength, counter = 0;

    if (baseList instanceof Array && !isNaN(fillLength)) {
        targetLength = ((fillLength < 0) ? (fillLength * -1) : fillLength);
        if (targetLength > baseList.length) {
            for (counter = 0; counter < (targetLength - baseList.length); counter++) {
                fillerItems[counter] = fillValue;
            }
            finalArray = ((fillLength < 0) ? fillerItems.concat(baseList) : baseList.concat(fillerItems));
        } else {
            finalArray = baseList;
        }
    }

    return finalArray;
}

// --- collection_remove_last
function collection_remove_last( targetList ) {
    // Removes the last element from a list
    // Ref: http://example.com/collection-utils/remove-last
    // Vsn: 2023.08.15
    // Auth: DataMage
    // Ex1: collection_remove_last([0,1,2]);
    // Rtr1: 2

    // If the list is empty, nothing to remove
    if (!targetList.length) {
        return null;
    }

    return targetList.pop();
}