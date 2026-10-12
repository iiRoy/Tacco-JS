function Main(input) {
    const lines = input.split("\n");
    const charCount = parseInt(lines[0]);
    const charSequence = lines[1].split("");

    const segmentList = [];

    // Initialize segmentList, handling the case where the sequence starts with ')'
    // This ensures an alternating pattern where '(' segments are conceptually at even indices
    // and ')' segments at odd indices, mirroring the original 'temp' array's structure.
    if (charSequence[0] === ')') {
        segmentList.push({ kind: '(', amount: 0 });
    }

    // Group consecutive identical characters into segments
    charSequence.forEach(currentSymbol => {
        const lastEntry = segmentList[segmentList.length - 1];
        if (!lastEntry || lastEntry.kind !== currentSymbol) {
            segmentList.push({ kind: currentSymbol, amount: 1 });
        } else {
            lastEntry.amount++;
        }
    });

    // Calculate the overall balance of parentheses
    // Positive value means more '(', negative means more ')'
    const overallBalance = segmentList.reduce((accumulator, entry) => {
        return accumulator + (entry.kind === '(' ? entry.amount : -entry.amount);
    }, 0);

    // Adjust segments based on the overall balance
    if (overallBalance < 0) {
        // If there's an excess of ')' characters, add equivalent '(' to the first segment.
        // The first segment is always '(', even if its initial amount was 0.
        segmentList[0].amount += Math.abs(overallBalance);
    } else if (overallBalance > 0) {
        // If there's an excess of '(' characters, add equivalent ')' to the end.
        const finalEntry = segmentList[segmentList.length - 1];
        if (finalEntry.kind === ')') {
            finalEntry.amount += overallBalance;
        } else { // The last segment is '(', so append a new ')' segment.
            segmentList.push({ kind: ')', amount: overallBalance });
        }
    } else { // overallBalance === 0
        // Special case: balance is zero, but the initial ')' segment is longer than the initial '(' segment.
        // This corresponds to `temp[0] - temp[1] < 0` in the original code.
        if (segmentList[0].kind === '(' && segmentList.length > 1 && segmentList[0].amount < segmentList[1].amount) {
            const initialClosingParenthesisSurplus = segmentList[1].amount - segmentList[0].amount;
            segmentList[0].amount = segmentList[1].amount; // Make the first '(' segment match the first ')' segment.

            const finalEntry = segmentList[segmentList.length - 1];
            if (finalEntry.kind === ')') {
                // If the last segment is ')', add the initial surplus to it.
                finalEntry.amount += initialClosingParenthesisSurplus;
            } else { // The last segment is '('.
                // As per original logic, if the last non-zero segment was '(',
                // a matching ')' segment is appended, but the initial surplus is not added here.
                segmentList.push({ kind: ')', amount: finalEntry.amount });
            }
        }
    }

    // Construct the final string by repeating characters based on segment amounts
    const finalOutput = segmentList.map(entry => entry.kind.repeat(entry.amount)).join('');

    console.log(finalOutput);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
