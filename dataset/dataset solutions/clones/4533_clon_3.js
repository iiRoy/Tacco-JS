function ProcessBracketSequence(rawInputPayload) {
    // Parse the raw input string into lines
    const inputLines = rawInputPayload.split("\n");

    // Extract and validate the intended length of the bracket sequence
    const sequenceLength = parseInt(inputLines[0], 10);

    // Implement a guard clause for invalid or empty input lengths
    if (isNaN(sequenceLength) || sequenceLength <= 0) {
        // For an invalid or empty sequence, output an empty string and terminate.
        console.log("");
        return;
    }

    // Convert the second line of input into an array of individual characters
    const charSequence = inputLines[1].split("");

    // This array will store the aggregated counts of consecutive identical bracket groups.
    // `groupCounts[0]` for initial '(', `groupCounts[1]` for initial ')', `groupCounts[2]` for next '(', etc.
    // Initialize with zeros, providing extra capacity for potential additions at the end.
    let groupCounts = Array.from({ length: sequenceLength + 2 }, () => 0);

    // `currentGroupIdx` points to the active slot in `groupCounts` for the current bracket group.
    let currentGroupIdx = 0;

    // Handle the very first character of the sequence to set up initial grouping.
    // If the sequence begins with a closing bracket, its count is placed at `groupCounts[1]`.
    if (charSequence[0] === ")") {
        currentGroupIdx = 1; // Shift to the odd index for closing brackets
        groupCounts[currentGroupIdx]++;
    } else {
        // Otherwise, it starts with an opening bracket, count goes to `groupCounts[0]`.
        groupCounts[currentGroupIdx]++;
    }

    // Iterate through the rest of the character sequence to identify and count bracket groups.
    for (let charIdx = 1; charIdx < sequenceLength; charIdx++) {
        // If the current character matches the previous one, extend the current group's count.
        if (charSequence[charIdx] === charSequence[charIdx - 1]) {
            groupCounts[currentGroupIdx]++;
        } else {
            // If the character changes, a new group begins; increment `currentGroupIdx` and start counting.
            currentGroupIdx++;
            groupCounts[currentGroupIdx]++;
        }
    }

    // --- Phase 1: Calculate the overall balance deficit/surplus ---
    // `cumulativeBalanceDeficit` tracks the net difference between opening and closing brackets.
    // A positive value means a surplus of '(', negative means a surplus of ')'.
    let cumulativeBalanceDeficit = 0;
    // Iterate through `groupCounts` in pairs (open, close)
    for (let pairIdx = 0; pairIdx < groupCounts.length; pairIdx += 2) {
        // Calculate the difference for the current pair. Use 0 if a group count doesn't exist.
        const currentPairDifference = groupCounts[pairIdx] - (groupCounts[pairIdx + 1] || 0);
        cumulativeBalanceDeficit += currentPairDifference;
    }

    // --- Phase 2: Adjust `groupCounts` to achieve overall balance ---

    // Scenario A: Overall deficit of opening brackets (too many ')' globally).
    // Add the necessary number of '(' to the very first group.
    if (cumulativeBalanceDeficit < 0) {
        groupCounts[0] -= cumulativeBalanceDeficit; // Subtracting a negative value increases groupCounts[0]
    }
    // Scenario B: Overall surplus of opening brackets (too many '(' globally).
    // Add the necessary number of ')' to the end of the sequence.
    else if (cumulativeBalanceDeficit > 0) {
        // Find the last non-empty group in `groupCounts` to strategically append closing brackets.
        let appendSearchIdx = groupCounts.length - 1;
        while (appendSearchIdx >= 0) {
            if (groupCounts[appendSearchIdx] > 0) {
                // If the last active group is an 'open' group (even index), add to the *next* 'close' group slot.
                if (appendSearchIdx % 2 === 0) {
                    groupCounts[appendSearchIdx + 1] = (groupCounts[appendSearchIdx + 1] || 0) + cumulativeBalanceDeficit;
                } else {
                    // If the last active group is a 'close' group (odd index), simply add to that group.
                    groupCounts[appendSearchIdx] += cumulativeBalanceDeficit;
                }
                break; // Adjustment made, exit the search loop.
            }
            appendSearchIdx--; // Move to the previous group slot.
        }
    }
    // Scenario C: Overall balance is zero, but there's an initial imbalance (e.g., starts with `)`)
    // where the first ')' group is larger than the first '(' group.
    else if (groupCounts[0] < groupCounts[1]) {
        const initialLeadingBraceImbalance = groupCounts[1] - groupCounts[0];
        groupCounts[0] = groupCounts[1]; // Equalize the first two groups to correct initial state.

        // Now, similar to Scenario B, add balancing brackets to the end,
        // using the `initialLeadingBraceImbalance` as the quantity.
        let balanceAppendIdx = groupCounts.length - 1;
        while (balanceAppendIdx >= 0) {
            if (groupCounts[balanceAppendIdx] > 0) {
                // If the group is an 'open' group, make the next 'close' group equal to it.
                // This specific logic ensures matching pairs are created at the end.
                if (balanceAppendIdx % 2 === 0) {
                    groupCounts[balanceAppendIdx + 1] = groupCounts[balanceAppendIdx];
                } else {
                    // If it's a 'close' group, just add the imbalance amount to it.
                    groupCounts[balanceAppendIdx] += initialLeadingBraceImbalance;
                }
                break; // Adjustment made, exit the search loop.
            }
            balanceAppendIdx--; // Move to the previous group slot.
        }
    }

    // --- Phase 3: Reconstruct the final balanced bracket sequence ---
    let balancedOutputString = "";
    const OPEN_BRACE_CHAR = '(';
    const CLOSE_BRACE_CHAR = ')';

    // Helper function to efficiently append characters multiple times
    const appendRepeatedCharacters = (character, count) => {
        if (count > 0) {
            balancedOutputString += character.repeat(count);
        }
    };

    // Iterate through the adjusted `groupCounts` array and build the result string.
    // The loop extends beyond `sequenceLength` to include any groups added at the end.
    for (let finalStringBuildIdx = 0; finalStringBuildIdx < groupCounts.length; finalStringBuildIdx++) {
        const currentGroupCount = groupCounts[finalStringBuildIdx];
        if (currentGroupCount > 0) { // Only process non-empty groups
            if (finalStringBuildIdx % 2 === 0) {
                // Even indices correspond to opening bracket groups
                appendRepeatedCharacters(OPEN_BRACE_CHAR, currentGroupCount);
            } else {
                // Odd indices correspond to closing bracket groups
                appendRepeatedCharacters(CLOSE_BRACE_CHAR, currentGroupCount);
            }
        }
    }

    // Output the final, balanced bracket sequence.
    console.log(balancedOutputString);
}

// Self-executing anonymous function to handle input reading and function invocation.
(() => {
    // Read the entire content from standard input, typically '/dev/stdin' in competitive programming.
    const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
    ProcessBracketSequence(fileContents);
})();