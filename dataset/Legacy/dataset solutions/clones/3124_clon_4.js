(async () => {
    const MOD_CONSTANT = 1000000007;

    const applyModulo = (value) => (value % MOD_CONSTANT + MOD_CONSTANT) % MOD_CONSTANT;

    class InputSegmentExtractor {
        constructor(sourceText) {
            this.source = sourceText;
            this.currentOffset = 0;
        }

        retrieveNextSegment() {
            // Advance past any leading whitespace or newline characters
            while (this.currentOffset < this.source.length && /\s|\n/.test(this.source[this.currentOffset])) {
                this.currentOffset++;
            }

            // If we've reached the end of the source, no more segments
            if (this.currentOffset >= this.source.length) {
                return undefined;
            }

            const segmentStart = this.currentOffset;
            // Find the end of the current segment (until whitespace/newline or end of source)
            while (this.currentOffset < this.source.length && !/\s|\n/.test(this.source[this.currentOffset])) {
                this.currentOffset++;
            }

            return this.source.substring(segmentStart, this.currentOffset);
        }
    }

    const acquireInputProcessor = async () => {
        return new Promise((resolve, reject) => {
            let collectedInput = '';
            process.stdin.setEncoding('utf8');
            process.stdin.on('data', (dataChunk) => {
                collectedInput += dataChunk;
            });
            process.stdin.on('end', () => {
                resolve(new InputSegmentExtractor(collectedInput));
            });
            process.stdin.on('error', (err) => {
                reject(err);
            });
        });
    };

    const processorInstance = await acquireInputProcessor();
    const primarySegment = processorInstance.retrieveNextSegment();

    // The original code would throw a TypeError if primarySegment is undefined
    // (e.g., if input is empty or only whitespace).
    // Array.from(undefined) will replicate this exact TypeError.
    const characterFrequencies = Array.from(primarySegment).reduce((frequencyMap, charKey) => {
        frequencyMap.set(charKey, (frequencyMap.get(charKey) || 0) + 1);
        return frequencyMap;
    }, new Map());

    const cumulativeProduct = Array.from(characterFrequencies.values()).reduce((currentResult, countValue) => {
        return applyModulo(currentResult * (1 + countValue));
    }, 1);

    console.log(applyModulo(cumulativeProduct - 1));
})();
