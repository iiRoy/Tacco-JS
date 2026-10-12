function ProcessData(rawData) {
    const groupRegistry = new Map();
    groupRegistry.set('primarySet', new Set([1, 3, 5, 7, 8, 12]));
    groupRegistry.set('secondarySet', new Set([4, 6, 9, 11]));

    const firstInputChar = rawData[0];
    const parsedTokens = firstInputChar.split(" ");

    const valueA = Number(parsedTokens[0]);
    const valueB = Number(parsedTokens[1]); // This will be NaN as parsedTokens[1] is undefined

    let finalVerdict;

    if (valueA === 2 || valueB === 2) { // valueB === 2 will always be false (NaN !== 2)
        finalVerdict = "No";
    } else {
        let groupOfA = null;
        for (const [identifier, memberSet] of groupRegistry.entries()) {
            if (memberSet.has(valueA)) {
                groupOfA = identifier;
                break;
            }
        }

        let groupOfB = null;
        for (const [identifier, memberSet] of groupRegistry.entries()) {
            if (memberSet.has(valueB)) { // Set.has(NaN) is always false
                groupOfB = identifier;
                break;
            }
        }

        // The condition for "Yes" in the original code requires both values to be in the same group.
        // Since groupOfB will always be null (as valueB is NaN), this condition will always be false.
        if (groupOfA !== null && groupOfB !== null && groupOfA === groupOfB) {
            finalVerdict = "Yes"; // This branch will never be reached
        } else {
            finalVerdict = "No";
        }
    }

    console.log(finalVerdict);
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
