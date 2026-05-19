// Global variables for input handling - kept as per Type IV rules for external APIs/behavior
var inputBuffer = '';
var inputPointer = 0;

// Helper to read a number from processed input
function retrieveNumber() {
    return +inputBuffer[inputPointer++];
}

// Helper to read a string from processed input
function retrieveString() {
    return inputBuffer[inputPointer++];
}

// Helper to print output
function displayResult(value) {
    console.log(value);
}

// Core logic to analyze a parenthesis string
// Original: simplify(s) returns [unmatched_closing, unmatched_opening]
// New: analyzeString(strVal) returns [minPrefixBalance, totalBalance]
// minPrefixBalance: The lowest balance reached during a left-to-right scan.
//                   If negative, indicates a deficit of opening parentheses.
// totalBalance: The final balance of parentheses after the scan.
function analyzeString(strVal) {
    // Using reduce for a functional style, processing character by character
    const finalState = strVal.split('').reduce((accumulator, char) => {
        let [currentBal, minBal] = accumulator;
        if (char === '(') {
            currentBal++;
        } else { // char === ')'
            currentBal--;
        }
        minBal = Math.min(minBal, currentBal);
        return [currentBal, minBal];
    }, [0, 0]); // Initial state: [currentBalance, minimumBalanceEncountered]

    return [finalState[1], finalState[0]]; // [minPrefixBalance, totalBalance]
}

// Main processing function
function processInputData() {
    const stringCount = retrieveNumber();
    const rawStrings = new Array(stringCount);

    // Populate rawStrings array using a standard loop
    for (let i = 0; i < stringCount; ++i) {
        rawStrings[i] = retrieveString();
    }

    // Transform raw strings into balance profiles using map (functional approach)
    // Each profile: [minPrefixBalance, totalBalance]
    const balanceProfiles = rawStrings.map(analyzeString);

    // Separate profiles into two categories for a specific sorting strategy
    const profilesWithoutInitialDeficit = []; // Corresponds to original p[i][0] == 0
    const profilesWithInitialDeficit = [];   // Corresponds to original p[i][0] > 0

    balanceProfiles.forEach(profile => {
        const [minPrefixBal, totalBal] = profile;
        if (minPrefixBal >= 0) { // No initial deficit (min balance never drops below zero)
            profilesWithoutInitialDeficit.push(profile);
        } else { // Has initial deficit (min balance drops below zero)
            profilesWithInitialDeficit.push(profile);
        }
    });

    // Sort profiles to optimize concatenation order
    // For profiles without initial deficit, prioritize those that add more balance
    // (to build up current balance quickly for later strings)
    profilesWithoutInitialDeficit.sort((a, b) => b[1] - a[1]); // Sort by totalBalance descending

    // For profiles with initial deficit, prioritize those that require less initial balance
    // (i.e., minPrefixBalance closer to 0, or less negative, to be satisfied sooner)
    profilesWithInitialDeficit.sort((a, b) => b[0] - a[0]); // Sort by minPrefixBalance descending

    // Combine the sorted profiles into a single processing sequence
    const orderedProfiles = [...profilesWithoutInitialDeficit, ...profilesWithInitialDeficit];

    let currentAccumulatedBalance = 0;
    let isConcatenationPossible = true;

    // Iterate through the ordered profiles to check feasibility and update balance
    for (const [minPrefixBal, totalBal] of orderedProfiles) {
        // Condition check: currentAccumulatedBalance must be sufficient to cover the deficit
        // Original condition: q >= p[i][0]
        // In new representation: currentAccumulatedBalance + minPrefixBal >= 0
        // (since p[i][0] is -minPrefixBal when minPrefixBal < 0, and 0 otherwise)
        if (currentAccumulatedBalance + minPrefixBal < 0) {
            isConcatenationPossible = false;
            break; // Exit early if an impossible sequence is detected
        }
        // Update balance by the net balance of the current string
        // Original update: q += (p[i][1] - p[i][0])
        // In new representation: currentAccumulatedBalance += totalBal
        currentAccumulatedBalance += totalBal;
    }

    // Final check: all strings must have been processable and the final balance must be zero
    displayResult(isConcatenationPossible && currentAccumulatedBalance === 0 ? 'Yes' : 'No');
}

// Standard input handling setup - kept as per Type IV rules
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    inputBuffer += chunk;
});

process.stdin.on('end', function() {
    inputBuffer = inputBuffer.trim().split(/\s+/);
    processInputData();
});
