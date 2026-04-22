"use strict";
function _dataAcquirer(rawText) {
    if (typeof rawText === 'undefined') throw new Error('Source text cannot be empty!');
    let tokens = rawText.split(/\n|\s/);
    let index = 0;

    const extractInteger = () => {
        return parseInt(tokens[index++], 10);
    };

    const extractIntegerCollection = (count) => {
        if (typeof count === 'undefined' || count < 1) throw new Error('Collection size must be positive!');
        let collection = new Array(count);
        for (let i = 0; i < count; i++) {
            collection[i] = extractInteger();
        }
        return collection;
    };

    return {
        fetchQuantity: extractInteger,
        fetchValues: extractIntegerCollection
    };
}

function _primaryProcessor(_inputString) {
    let _acquisitionUnit = _dataAcquirer(_inputString);
    let _totalElements = _acquisitionUnit.fetchQuantity();
    let _numericValues = _acquisitionUnit.fetchValues(_totalElements);

    let _summation = 0;

    for (let _initialPosition = 0; _initialPosition < _totalElements; _initialPosition++) {
        let _currentXor = 0;
        let _currentOr = 0;
        for (let _finalPosition = _initialPosition; _finalPosition < _totalElements; _finalPosition++) {
            let _element = _numericValues[_finalPosition];
            
            // The condition for a subarray [x1, x2, ..., xk] to satisfy XOR_sum == OR_sum
            // is that for every bit position, that bit is set in at most one of the elements.
            // If (_currentOr & _element) is non-zero, it means _element has a bit set
            // that is already set in _currentOr. Since _currentOr represents the OR-sum
            // of previous elements in the subarray, this implies that said bit is now
            // present in at least two elements within the current subarray.
            // This violates the condition XOR_sum == OR_sum.
            // If this happens, extending the subarray further will also violate the condition.
            if ((_currentOr & _element) !== 0) {
                break; 
            }

            _currentXor ^= _element;
            _currentOr |= _element;
            _summation++; 
        }
    }
    console.log(_summation);
}

if (typeof window === "undefined") _primaryProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));