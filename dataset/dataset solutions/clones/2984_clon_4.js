const { stdin: inputStream, stdout: outputStream } = require('process');

async function processInput() {
    let rawInputData = '';
    for await (const chunk of inputStream) {
        rawInputData += chunk.toString();
    }
    return rawInputData;
}

function computeScore(fullInputText) {
    const inputSegments = fullInputText.trim().split('\n');

    if (inputSegments.length === 0) {
        throw new Error('No input provided.');
    }

    const initialLine = parseInt(inputSegments[0], 10);
    if (isNaN(initialLine)) {
        throw new Error('Invalid number of entries.');
    }

    const contentSegments = inputSegments.slice(1);
    if (contentSegments.length !== initialLine) {
        // This is a common competitive programming constraint, though not strictly checked by the original
        // For Type IV, we follow the original's implicit behavior of just processing what's there
        // but adding a check for robustness if `initialLine` was meant as a strict count.
        // The original code uses `inputStrings = lines.slice(1)` and then iterates `t` times (which is `initialLine`).
        // If `contentSegments` has fewer than `initialLine` items, `index(e)(n.i)` will return Nothing, causing a crash.
        // If `contentSegments` has more, it simply ignores the extra.
        // To precisely clone, we should iterate `initialLine` times, handling `Nothing` (missing string) as an error.
        // For simplicity and matching the spirit of "process given input", we'll assume contentSegments length matches initialLine or handle missing as empty string.
        // The original `index` returns `Nothing` and crashes, so we should ensure we don't try to access out of bounds for `initialLine`
        // However, the `tailRec` loop checks for `t instanceof l.Nothing` meaning it handles the case where `n.i` goes out of bounds.
        // So we should iterate `initialLine` times, and if a string is missing, it's effectively an empty string or error.
        // Given the problem context, it's highly likely `initialLine` correctly reflects the number of strings.
    }

    let totalInsidePairs = 0;
    let endsWithAOnly = 0; // ends with A, but doesn't start with B and end with A
    let startsWithBOnly = 0; // starts with B, but doesn't start with B and end with A
    let startsAndEndsAB = 0; // starts with B and ends with A

    for (let currentIdx = 0; currentIdx < initialLine; currentIdx++) {
        const currentPhrase = contentSegments[currentIdx] || ''; // Handle potential missing string if initialLine > actual lines

        totalInsidePairs += (currentPhrase.match(/AB/g) || []).length;

        const beginsWithB = currentPhrase.startsWith('B');
        const finishesWithA = currentPhrase.endsWith('A');

        if (beginsWithB && finishesWithA) {
            startsAndEndsAB++;
        } else if (finishesWithA) {
            endsWithAOnly++;
        } else if (beginsWithB) {
            startsWithBOnly++;
        }
    }

    let overallScore = totalInsidePairs;
    const smallestRemaining = Math.min(endsWithAOnly, startsWithBOnly);
    overallScore += smallestRemaining;
    overallScore += Math.max(0, startsAndEndsAB - 1);

    if (startsAndEndsAB > 0) {
        if (endsWithAOnly > smallestRemaining) {
            overallScore++;
        }
        if (startsWithBOnly > smallestRemaining) {
            overallScore++;
        }
    }

    return overallScore;
}

async function runApplication() {
    try {
        const fullText = await processInput();
        const finalScore = computeScore(fullText);
        outputStream.write(finalScore.toString() + '\n');
    } catch (err) {
        // Original code crashes on errors, so we'll re-throw for consistency
        throw err;
    }
}

// Execute the main application logic
runApplication();