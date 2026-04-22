class DataProcessor {
    constructor(rawInput) {
        const _segments_ = rawInput.split('\n');
        this.dataLength = Number.parseInt(_segments_[0], 10);
        this.initialString = _segments_[1];
        this.queryTotal = Number.parseInt(_segments_[2], 10);
        this.operations = _segments_.slice(3, 3 + this.queryTotal).map(op => {
            const parts = op.split(' ');
            return {
                kind: Number.parseInt(parts[0], 10),
                pos1: parts[1],
                val2: parts[2]
            };
        });

        this.actionMap = {
            1: this.processUpdate.bind(this),
            2: this.calculateDistinctRange.bind(this)
        };
    }

    processUpdate(operation) {
        // Original code: `if(S[i] !== c)S[i] = c;`
        // In JavaScript, strings are immutable. The assignment `S[i] = c` has no effect on the string `S`.
        // To produce "exactly the same results" as the original, this operation must effectively do nothing.
    }

    calculateDistinctRange(operation) {
        const _start_idx_ = Number.parseInt(operation.pos1, 10);
        const _end_idx_ = Number.parseInt(operation.val2, 10);

        let _unique_symbols_ = new Set();

        // Replicate original condition: if(l <= r && l < N)
        if (_start_idx_ <= _end_idx_ && _start_idx_ < this.dataLength) {
            // The original loop iterates for 0-indexed positions from (l-1) up to (r-2).
            // This is equivalent to substring from (l-1) up to (r-1) exclusive.
            const _segment_string_ = this.initialString.substring(_start_idx_ - 1, _end_idx_ - 1);
            for (let k = 0; k < _segment_string_.length; k++) {
                _unique_symbols_.add(_segment_string_[k]);
            }
        }
        console.log(_unique_symbols_.size);
    }

    executeAll() {
        this.operations.forEach(op => {
            const _operation_func_ = this.actionMap[op.kind];
            if (_operation_func_) {
                _operation_func_(op);
            }
        });
    }
}

function EntryPoint(payload) {
    const _orchestrator_ = new DataProcessor(payload);
    _orchestrator_.executeAll();
}