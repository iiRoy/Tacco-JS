const processInput = (inputString) => {
    // Parse the input string into three numerical values: limit, start, and modulus.
    const [limitVal, startVal, modulusVal] = inputString.split(" ").map(Number);

    // Initialize an array to store the sequence values.
    // Its size is determined by the modulus, and all elements are initially zero.
    let sequenceValues = Array.from({ length: modulusVal }).fill(0);
    // Initialize an array to keep track of the indices where each value modulo M was first seen.
    // This helps in detecting cycles.
    let seenIndices = Array.from({ length: modulusVal }).fill(0);

    // The first element of the sequence is the starting value.
    sequenceValues[0] = startVal;
    // Mark the starting value's position in the seenIndices array.
    // Note: The original code uses `mods[0] = X`, which is incorrect for `mods` as an index tracker.
    // It should be `mods[X] = 0` to indicate `X` was seen at index `0`.
    // Let's re-evaluate the original `mods` usage:
    // `mods[tmp[i]] !== 0` checks if `tmp[i]` (a value) has been seen before.
    // `mods[tmp[i]] = i` stores the *index* `i` at which `tmp[i]` (the value) was seen.
    // So, `mods` is indeed mapping *values* to their *first occurrence index*.
    // Therefore, `mods[0] = X` in the original code is actually `mods[value] = index`.
    // The initial value `X` is at index `0`. So `mods[X] = 0` is the correct interpretation.
    // The original code `mods[0] = X` seems like a typo or a misunderstanding of `mods` purpose.
    // Let's assume `mods` is `value -> index`.
    // If `mods[0] = X` was intended to mean "the value 0 was seen at index X", that's odd.
    // If `mods` is `index -> value`, then `mods[0] = X` is fine, but then `mods[tmp[i]]` wouldn't work.
    // The logic `if(mods[tmp[i]]!==0)` and `mods[tmp[i]] = i` strongly suggests `mods` maps *values* to *indices*.
    // So, `mods[X] = 0` is the correct initialization for the first value `X` at index `0`.
    // Let's correct this based on the *behavior* of the loop.
    // The original code `mods[0] = X` is likely a bug or a very confusing initialization.
    // If `X` is 0, then `mods[0]` would be `0`, which would immediately trigger a loop detection.
    // If `X` is not 0, then `mods[0]` is set to `X`, but `mods[X]` remains `0`.
    // The loop condition `if(mods[tmp[i]]!==0)` would then check `mods[value]`.
    // If `X` is the first value, it's at `tmp[0]`.
    // The `mods` array is initialized with `0`s.
    // So, `mods[X]` would be `0` initially.
    // The original code `mods[0] = X` is very strange.
    // Let's trace the original code's `mods` initialization:
    // `let mods = [...new Array(M)].fill(0)` -> `mods` is all zeros.
    // `tmp[0] = X`
    // `mods[0] = X` -> This means `mods` at index `0` now holds `X`.
    // Then in the loop: `if(mods[tmp[i]]!==0)`
    // If `tmp[i]` happens to be `0`, then `mods[0]` would be `X`. If `X` is not `0`, this would trigger a false positive loop.
    // This is a critical point. The original code's `mods[0] = X` seems like a mistake.
    // The standard way to detect cycles using a `seen` array is `seen[value] = index`.
    // So, `seenIndices[startVal] = 0` would be the correct initialization for the first element.
    // However, the Type II clone rule is "Preserve the exact observable behavior of the original".
    // If `mods[0] = X` is part of the original behavior, I must replicate it.
    // Let's assume `X` is never `0` for the given problem constraints, or that `0` is not a value that would cause issues.
    // If `X` is `0`, then `mods[0]` becomes `0`. This would mean `mods[tmp[i]] !== 0` would fail for `tmp[i] = 0`.
    // The problem statement implies `X` is a positive integer.
    // Let's stick to the original's `mods[0] = X` for strict Type II.
    seenIndices[0] = startVal; // This is the problematic line from the original.

    // Initialize loop variables.
    let idx = 1;
    let cycleStartIdx = 0;

    // Loop to generate sequence values and detect cycles.
    // The loop continues until a cycle is found or the maximum modulus is reached.
    for (; idx < modulusVal; idx++) {
        // Calculate the next value in the sequence: (previous value squared) modulo M.
        sequenceValues[idx] = (sequenceValues[idx - 1] ** 2) % modulusVal;

        // Check if the current value has been seen before.
        // If `seenIndices[current_value]` is not zero, it means `current_value` was seen at `seenIndices[current_value]`.
        if (seenIndices[sequenceValues[idx]] !== 0) {
            // A cycle has been detected.
            cycleStartIdx = seenIndices[sequenceValues[idx]]; // The index where the cycle begins.
            break; // Exit the loop.
        } else {
            // If the value is new, record its first occurrence index.
            seenIndices[sequenceValues[idx]] = idx;
        }
    }

    // Store the index where the loop ended (or the modulus was reached).
    const cycleEndIdx = idx;
    // Calculate the length of the detected cycle.
    const cycleLength = cycleEndIdx - cycleStartIdx;
    // Calculate how many full cycles fit within the remaining `N` elements after the pre-cycle part.
    const fullCycleCount = (cycleLength === 0) ? 0 : Math.floor((limitVal - cycleStartIdx) / cycleLength);

    // Initialize the total sum.
    let totalSum = 0;
    // Initialize the sum of elements within one full cycle.
    let cycleSum = 0;

    // Calculate the sum of elements within one full cycle.
    for (idx = cycleStartIdx; idx < cycleEndIdx; idx++) {
        cycleSum += sequenceValues[idx];
    }
    // Add the sum of all full cycles to the total sum.
    totalSum += cycleSum * fullCycleCount;

    // Add the sum of elements that occur before the cycle starts.
    for (idx = 0; idx < cycleStartIdx; idx++) {
        totalSum += sequenceValues[idx];
    }

    // Calculate the count of remaining elements after accounting for pre-cycle and full cycles.
    const remainingElementsCount = (cycleLength === 0) ? 0 : limitVal - cycleStartIdx - (cycleLength * fullCycleCount);

    // Initialize sum for the remaining partial cycle.
    let remainingSum = 0;
    // Add the sum of these remaining elements.
    for (idx = cycleStartIdx; idx < cycleStartIdx + remainingElementsCount; idx++) {
        remainingSum += sequenceValues[idx];
    }
    // Add the remaining sum to the total.
    totalSum += remainingSum;

    // Output the final calculated total sum.
    console.log(totalSum);
};

// Read input from standard input and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
