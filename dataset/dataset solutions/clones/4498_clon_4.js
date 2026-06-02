process.stdin.setEncoding('utf8');

process.stdin.on('readable', function() {
    let inputData = process.stdin.read();

    if (inputData !== null) {
        let lines = inputData.split('\n');

        if (lines[lines.length - 1] === '') {
            lines.pop();
        }

        const sourceArray = lines[1].split(' ').map(Number);
        const arrayLength = sourceArray.length;

        const { primaryElements, secondaryElements } = sourceArray.reduceRight((accumulator, currentElement, currentIndex) => {
            // The original loop iterates `i` from `arrayLength - 1` down to `0` with a step of `2`.
            // `s1` accumulates `ai[i]`.
            // `s2` accumulates `ai[i-1]` by prepending.

            // `currentIndex` in `reduceRight` goes from `arrayLength - 1` down to `0`.
            // If `currentIndex` corresponds to an `i` from the original loop (e.g., `arrayLength - 1`, `arrayLength - 3`, etc.),
            // then `currentElement` is `ai[i]`, and it goes to `primaryElements`.
            // This condition is true when `(arrayLength - 1 - currentIndex)` is an even number.
            if ((arrayLength - 1 - currentIndex) % 2 === 0) {
                accumulator.primaryElements.push(currentElement);
            } else {
                // Otherwise, `currentIndex` corresponds to an `i-1` from the original loop (e.g., `arrayLength - 2`, `arrayLength - 4`, etc.),
                // then `currentElement` is `ai[i-1]`, and it goes to `secondaryElements` by prepending.
                accumulator.secondaryElements.unshift(currentElement);
            }
            return accumulator;
        }, { primaryElements: [], secondaryElements: [] });

        const finalOutput = primaryElements.join(' ') + ' ' + secondaryElements.join(' ');
        process.stdout.write(finalOutput + '\n');
    }
});
