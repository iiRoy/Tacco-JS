let _streamBuffer = '';
process.stdin.on('data', (segment) => {
    _streamBuffer += segment.toString();
});

process.stdin.on('end', () => {
    const _dataLines = _streamBuffer.trim().split('\n');

    const _quantityOfElements = parseInt(_dataLines[0], 10);

    const _elementCounts = new Map();
    let _peakCount = 0;

    for (let _index = 1; _index <= _quantityOfElements; _index++) {
        const _currentElement = _dataLines[_index];
        let _currentStats = _elementCounts.get(_currentElement);

        if (_currentStats) {
            _currentStats.occurrences++;
        } else {
            _currentStats = {
                occurrences: 1,
                initialPosition: _index // Preserves original input order for tie-breaking
            };
            _elementCounts.set(_currentElement, _currentStats);
        }
        
        if (_currentStats.occurrences > _peakCount) {
            _peakCount = _currentStats.occurrences;
        }
    }

    const _allEntries = Array.from(_elementCounts.entries());

    const _frequentEntries = _allEntries.filter(([_key, _value]) => _value.occurrences === _peakCount);

    _frequentEntries.sort((_entryA, _entryB) => {
        return _entryA[1].initialPosition - _entryB[1].initialPosition;
    });

    _frequentEntries.forEach(([_key, _value]) => {
        console.log(_key);
    });
});