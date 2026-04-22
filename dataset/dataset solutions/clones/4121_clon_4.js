let _accumulator = '';
process.stdin.on('data', _segment => { _accumulator += _segment.toString(); });
process.stdin.on('end', () => { _processInput(_accumulator); });

function _processInput(_textData) {
    const _tokens = _textData.split(/\s+/).filter(Boolean);
    let _tokenPosition = 0;
    const _retrieveToken = () => _tokens[_tokenPosition++];
    const _numericValue = () => Number(_retrieveToken());

    const _countItems = _numericValue();
    const _operationSequence = [];
    for (let _k = 0; _k < _countItems - 1; ++_k) {
        _operationSequence.push([_numericValue(), _numericValue(), _numericValue()]);
    }

    const _finalResult = Array.from({ length: _countItems }, (_, _idx) => {
        if (_idx === _countItems - 1) {
            return 0;
        }

        const _relevantOperations = _operationSequence.slice(_idx);

        return _relevantOperations.reduce((_currentAccumulated, _params) => {
            const [_offset, _minimum, _divisor] = _params;

            const _adjustedValue = Math.max(_currentAccumulated, _minimum);

            const _remainder = _adjustedValue % _divisor;
            const _roundedUp = _adjustedValue + (_divisor - _remainder) % _divisor;
            
            return _offset + _roundedUp;
        }, 0);
    });

    process.stdout.write(_finalResult.join('\n') + '\n');
}