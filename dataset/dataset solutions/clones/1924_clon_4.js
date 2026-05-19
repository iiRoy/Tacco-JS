class InputProcessor {
    #tokens;
    #currentIndex = 0;

    constructor(sourceText) {
        // The original Scanner's splitedStrs creation:
        // 1. Replaces multiple newlines, spaces, tabs with a single space.
        //    `var target = target.replace(/[\n \t]+/g, " ");`
        // 2. Splits the resulting string by single spaces.
        //    `var strs = target.split(" ");`
        // 3. Pushes each resulting string into an array.
        //    `for (var i = 0, len = strs.length; i < len; i++) { result.push(strs[i]); }`
        // This means empty strings resulting from `split(" ")` (e.g., from "  " or leading/trailing spaces)
        // are preserved in the `splitedStrs` array.
        const processedText = sourceText.replace(/[\n \t]+/g, " ");
        this.#tokens = processedText.split(" ");
    }

    fetchNext() {
        const currentToken = this.#tokens[this.#currentIndex];
        this.#currentIndex++;
        // Original: (result != null) ? result : null;
        // `undefined` from out-of-bounds array access is not `null`, so `undefined != null` is true.
        // However, the original code explicitly returns `null` if `result` is `null`.
        // For array access, `this.#tokens[this.#currentIndex]` will be `undefined` if out of bounds.
        // `undefined != null` is true, so it would return `undefined`.
        // To match `null` return for non-existent items, we check for `undefined`.
        return (currentToken !== undefined) ? currentToken : null;
    }

    fetchInt() {
        const currentToken = this.#tokens[this.#currentIndex];
        this.#currentIndex++;
        return (currentToken !== undefined) ? parseInt(currentToken, 10) : null;
    }

    fetchDecimal() {
        const currentToken = this.#tokens[this.#currentIndex];
        this.#currentIndex++;
        return (currentToken !== undefined) ? parseFloat(currentToken) : null;
    }

    fetchByte() {
        const currentToken = this.#tokens[this.#currentIndex];
        this.#currentIndex++;
        // The original `new Int8Array(result)` where `result` is a string
        // creates an Int8Array of length `result.length` filled with zeros.
        // E.g., `new Int8Array("123")` results in `Int8Array(3) [0, 0, 0]`.
        // If `result` is `null`, it returns `null`.
        return (currentToken !== undefined) ? new Int8Array(currentToken.length) : null;
    }
}

// A generator function to produce all non-decreasing sequences
// of a specified length, with elements within a given range.
// This replaces the imperative nested loop structure from the original.
function* generateNonDecreasingSequences(
    currentSequenceLength, // Current length of the sequence being built
    targetSequenceLength,  // Desired final length of the sequence (N)
    maxElementValue,       // Maximum allowed value for elements (M)
    lastElementValue = 1,  // The value of the last element added, ensuring non-decreasing order
    currentSequence = []   // The sequence built so far
) {
    // Base case: If the sequence has reached the target length, yield it.
    if (currentSequenceLength === targetSequenceLength) {
        yield currentSequence;
        return;
    }

    // Recursive step: Iterate through possible values for the next element.
    // The next element must be greater than or equal to the last element (lastElementValue)
    // and less than or equal to the maximum allowed value (maxElementValue).
    for (let nextValue = lastElementValue; nextValue <= maxElementValue; nextValue++) {
        // Recursively call the generator, extending the current sequence with 'nextValue'.
        // The 'nextValue' becomes the new 'lastElementValue' for the subsequent calls
        // to maintain the non-decreasing property.
        yield* generateNonDecreasingSequences(
            currentSequenceLength + 1,
            targetSequenceLength,
            maxElementValue,
            nextValue,
            [...currentSequence, nextValue] // Create a new array to avoid mutation
        );
    }
}

function ProcessData(inputSource) {
    const sequenceLength = inputSource.fetchInt(); // N
    const maxElementValue = inputSource.fetchInt(); // M
    const numQueries = inputSource.fetchInt();      // Q

    // Read all query conditions into an array of objects.
    // Using Array.from with a callback for declarative array creation.
    const queryDetails = Array.from({ length: numQueries }, () => ({
        idxA: inputSource.fetchInt(),
        idxB: inputSource.fetchInt(),
        requiredDiff: inputSource.fetchInt(),
        scoreToAdd: inputSource.fetchInt(),
    }));

    let overallHighestScore = 0;

    // Iterate over each non-decreasing sequence generated.
    // This replaces the outer `for (var a = 0; a < Math.pow(M, N); a++)` loop
    // and the internal carry-propagation logic.
    for (const currentArraySequence of generateNonDecreasingSequences(0, sequenceLength, maxElementValue)) {
        // Calculate the score for the current sequence using a functional `reduce` method.
        // This replaces the `for (var i = 0; i < abcds.length; i++)` loop.
        const currentSequenceScore = queryDetails.reduce((accumulator, query) => {
            // Original condition: abcds[i].c == array[abcds[i].b - 1] - array[abcds[i].a - 1]
            // Translated to new variable names and 0-based array indexing.
            if (query.requiredDiff === currentArraySequence[query.idxB - 1] - currentArraySequence[query.idxA - 1]) {
                return accumulator + query.scoreToAdd;
            }
            return accumulator;
        }, 0); // Initial score is 0

        // Update the overall highest score found so far.
        if (currentSequenceScore > overallHighestScore) {
            overallHighestScore = currentSequenceScore;
        }
    }

    console.log(overallHighestScore);
}

// Entry point: Read input from stdin and pass it to the main processing function.
ProcessData(new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8")));
