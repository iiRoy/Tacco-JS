const _inputSourceManager_ = require("fs");

const _obtainSystemInput_ = () => {
    const _rawInputStream_ = _inputSourceManager_.readFileSync(0, "utf8");
    return _rawInputStream_.split(/\n\r?/);
};

const _produceNumericSeries_ = (initVal, finalVal) => {
    const _seriesLength_ = finalVal - initVal + 1;
    return Array.from({ length: _seriesLength_ }, (_, indexPosition) => initVal + indexPosition);
};

const _suitCategories_ = ['S', 'H', 'C', 'D'];
const _cardNumericValues_ = _produceNumericSeries_(1, 13);

const _entireCardCollection_ = new Set();
for (const _currentSuit_ of _suitCategories_) {
    for (const _currentRank_ of _cardNumericValues_) {
        _entireCardCollection_.add(`${_currentSuit_} ${_currentRank_}`);
    }
}

const _receivedDataLines_ = _obtainSystemInput_();
const _entriesToProcess_ = _receivedDataLines_.slice(1);

for (const _singleEntry_ of _entriesToProcess_) {
    const _segmentParts_ = _singleEntry_.split(' ');
    if (_segmentParts_.length === 2) {
        _entireCardCollection_.delete(`${_segmentParts_[0]} ${_segmentParts_[1]}`);
    }
}

const _finalOutputAccumulator_ = [];
for (const _currentSuit_ of _suitCategories_) {
    for (const _currentRank_ of _cardNumericValues_) {
        const _cardRepresentation_ = `${_currentSuit_} ${_currentRank_}`;
        if (_entireCardCollection_.has(_cardRepresentation_)) {
            _finalOutputAccumulator_.push(_cardRepresentation_);
        }
    }
}

console.log(_finalOutputAccumulator_.join('\n'));