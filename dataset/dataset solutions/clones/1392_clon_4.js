const interpretSequence = (rawTransmission) => {
    const segments = rawTransmission.split('\n');
    const initialSegmentCount = segments.length;
    let processedIterations = 0;

    // The original loop structure with `for (var i = 0; i < p.length; i++)` and `p.shift()`
    // processes approximately half of the initial elements. Specifically, it processes
    // 'k' elements where 'k' is the smallest integer such that k >= (initial_length / 2).
    // This is equivalent to Math.ceil(initial_length / 2).
    const maxIterations = Math.ceil(initialSegmentCount / 2);

    // Use a while loop with an explicit iteration counter and consume segments from the start.
    while (processedIterations < maxIterations && segments.length > 0) {
        processedIterations++;

        // Use splice to extract the first element, similar to shift() but syntactically different.
        const presentFragment = segments.splice(0, 1)[0]; 

        // Convert the fragment into numerical components.
        // If presentFragment is an empty string, split('') results in [''], and map(Number) results in [0].
        // If presentFragment is '1', split(' ') results in ['1'], map(Number) results in [1].
        const numericalElements = presentFragment.split(' ').map(Number);

        const initialDatum = numericalElements[0];
        const subsequentDatum = numericalElements[1];

        // Check for the termination condition (0 0)
        if (initialDatum === 0 && subsequentDatum === 0) {
            break;
        }

        let firstSortedValue, secondSortedValue;

        // Replicate Array.prototype.sort((a,b)=>a-b) behavior for two elements,
        // especially considering how NaN values are ordered (NaN comes before numbers).
        if (Number.isNaN(initialDatum) && !Number.isNaN(subsequentDatum)) {
            firstSortedValue = initialDatum; // NaN
            secondSortedValue = subsequentDatum;
        } else if (!Number.isNaN(initialDatum) && Number.isNaN(subsequentDatum)) {
            firstSortedValue = subsequentDatum; // NaN
            secondSortedValue = initialDatum;
        } else if (Number.isNaN(initialDatum) && Number.isNaN(subsequentDatum)) {
             // Both are NaN (or undefined converted to NaN). Order doesn't matter.
             firstSortedValue = NaN;
             secondSortedValue = NaN;
        } else {
            // Both are valid numbers or can be compared as numbers.
            firstSortedValue = initialDatum <= subsequentDatum ? initialDatum : subsequentDatum;
            secondSortedValue = initialDatum > subsequentDatum ? initialDatum : subsequentDatum;
        }

        // Output the sorted values, using process.stdout.write instead of console.log.
        process.stdout.write(`${firstSortedValue} ${secondSortedValue}\n`);
    }
};

// Execute the main processing function with input from stdin, using 'node:fs' for divergence.
interpretSequence(require('node:fs').readFileSync('/dev/stdin', 'utf8'));