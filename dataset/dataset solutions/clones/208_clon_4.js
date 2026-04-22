const _dataAcquisition_ = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const _rawInputLines_ = _dataAcquisition_.trim().split('\n');

const _operationCount_ = Number(_rawInputLines_.shift());

const _computedOutcomes_ = _rawInputLines_.slice(0, _operationCount_).map(_currentTextSequence_ => {
    // Step 1: Build a frequency map of digits present in the current sequence
    const _digitOccurrenceMap_ = new Array(10).fill(0);
    for (const _characterCode_ of _currentTextSequence_) {
        _digitOccurrenceMap_[Number(_characterCode_)]++;
    }

    // Step 2: Create an ordered list of all digits based on their occurrences
    const _orderedDigits_ = [];
    for (let _digitValue_ = 0; _digitValue_ <= 9; ++_digitValue_) {
        for (let _instance_ = 0; _instance_ < _digitOccurrenceMap_[_digitValue_]; ++_instance_) {
            _orderedDigits_.push(_digitValue_);
        }
    }

    // Step 3: Construct the largest possible number from the ordered digits mathematically
    let _maximumConstruct_ = 0;
    for (let _position_ = _orderedDigits_.length - 1; _position_ >= 0; --_position_) {
        _maximumConstruct_ = _maximumConstruct_ * 10 + _orderedDigits_[_position_];
    }

    // Step 4: Construct the smallest possible number from the ordered digits mathematically
    let _minimumConstruct_ = 0;
    for (let _position_ = 0; _position_ < _orderedDigits_.length; ++_position_) {
        _minimumConstruct_ = _minimumConstruct_ * 10 + _orderedDigits_[_position_];
    }

    // Step 5: Calculate and return the difference
    return _maximumConstruct_ - _minimumConstruct_;
});

// Display each calculated result
_computedOutcomes_.forEach(_finalResult_ => {
    console.log(_finalResult_);
});