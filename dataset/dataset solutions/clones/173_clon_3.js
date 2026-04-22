const fileSystemModule = require('fs');

/**
 * Reads all input lines from standard input.
 * Assumes input is UTF-8 encoded and lines are separated by newlines.
 *
 * @returns {string[]} An array of strings, where each string is a line from standard input.
 */
function acquireInputData() {
    // Determine the size of the standard input stream.
    const inputByteLength = fileSystemModule.fstatSync(process.stdin.fd).size;

    // Allocate a buffer to hold the input data.
    const rawDataBuffer = Buffer.alloc(inputByteLength);

    // Read the entire standard input into the buffer.
    const actualBytesRead = fileSystemModule.readSync(
        process.stdin.fd,
        rawDataBuffer,
        0,
        inputByteLength,
        0
    );

    // Convert the buffer to a UTF-8 string, trim whitespace, and split into lines.
    const processedLines = rawDataBuffer
        .toString('utf8', 0, actualBytesRead)
        .trim()
        .split('\n');

    return processedLines;
}

/**
 * Checks if a given set of tile counts can be fully formed into triplets (pongs) and sequences (chows).
 * This function assumes a pair has already been removed, and a candidate tile has been added.
 * It greedily removes melds.
 *
 * @param {number[]} currentTileCounts - An array representing the frequency of each tile (index 1-9 used).
 * @returns {boolean} True if all tiles can be formed into melds, false otherwise.
 */
function verifyMeldFormation(currentTileCounts) {
    // Create a mutable copy to perform removal operations.
    const workingCounts = [...currentTileCounts];

    // Step 1: Greedily remove all possible triplets (pongs).
    // Iterate through tile values from 1 to 9.
    for (let tileValue = 1; tileValue <= 9; ++tileValue) {
        // While there are 3 or more of the current tile, form a triplet.
        while (workingCounts[tileValue] >= 3) {
            workingCounts[tileValue] -= 3;
        }
    }

    // Step 2: Greedily remove all possible sequences (chows).
    // Iterate through tile values from 1 to 7 (a sequence 7,8,9 is the highest possible).
    for (let tileValue = 1; tileValue <= 7; ++tileValue) {
        // While a sequence (tileValue, tileValue+1, tileValue+2) can be formed.
        while (
            workingCounts[tileValue] >= 1 &&
            workingCounts[tileValue + 1] >= 1 &&
            workingCounts[tileValue + 2] >= 1
        ) {
            workingCounts[tileValue]--;
            workingCounts[tileValue + 1]--;
            workingCounts[tileValue + 2]--;
        }
    }

    // Step 3: Check if any tiles remain after forming all possible melds.
    // Sum the counts of all tiles from 1 to 9.
    const totalRemainingTiles = workingCounts.slice(1, 10).reduce((sum, count) => sum + count, 0);

    // If the sum is zero, all tiles were successfully formed into melds.
    return totalRemainingTiles === 0;
}

/**
 * Main function to process each hand of Mahjong tiles from the input.
 * It determines which additional tile (if any) would complete a winning hand.
 */
function evaluateTileHands() {
    const rawInputLines = acquireInputData();
    const totalHandsToProcess = rawInputLines.length;

    // Iterate through each line of input, representing a hand of tiles.
    for (let handIdx = 0; handIdx < totalHandsToProcess; ++handIdx) {
        // Convert the current hand string into an array of tile characters.
        const currentHandTileChars = rawInputLines[handIdx].split('');

        // Initialize an array to store tile frequencies.
        // Array size 11: index 0 is unused, indices 1-9 for tile values, index 10 for padding (to avoid out-of-bounds for tile+1, tile+2).
        const tileOccurrenceCounts = Array(11).fill(0);

        // Populate tile frequencies from the current hand.
        for (const tileChar of currentHandTileChars) {
            const tileValue = parseInt(tileChar, 10);
            if (!isNaN(tileValue) && tileValue >= 1 && tileValue <= 9) {
                tileOccurrenceCounts[tileValue]++;
            } else {
                // Optional: handle invalid tile input, e.g., console.error or skip.
                // For this problem, assuming valid single-digit tile inputs.
            }
        }

        // This array will store tile values that can complete a winning hand.
        const completingTileCandidates = [];

        // Outer loop: Iterate through each possible tile value (1-9) as the potential winning tile.
        // Label this loop for early termination.
        CANDIDATE_TILE_LOOP: for (let candidateTileValue = 1; candidateTileValue <= 9; ++candidateTileValue) {
            // Retrieve frequencies for the current candidate tile and its neighbors.
            const currentCandidateFreq = tileOccurrenceCounts[candidateTileValue];
            const prevCandidateFreq = tileOccurrenceCounts[candidateTileValue - 1] || 0; // Guard against index -1
            const nextCandidateFreq = tileOccurrenceCounts[candidateTileValue + 1] || 0; // Guard against index 10

            // Optimization: Skip candidate tiles that cannot possibly form a valid hand.
            // 1. If adding this tile would result in 5 of a kind (Mahjong hands cannot have 5 identical tiles).
            // 2. If this tile and its immediate numerical neighbors are all absent, it cannot form any sequences (chows) or triplets (pongs).
            if (
                currentCandidateFreq >= 4 ||
                (prevCandidateFreq === 0 && currentCandidateFreq === 0 && nextCandidateFreq === 0)
            ) {
                continue CANDIDATE_TILE_LOOP;
            }

            // Inner loop: Iterate through each possible tile value (1-9) as the "head" (pair) of the hand.
            for (let headTileValue = 1; headTileValue <= 9; ++headTileValue) {
                // If there are no tiles of this value, it cannot form a pair.
                if (tileOccurrenceCounts[headTileValue] === 0) {
                    continue;
                }

                // Create a temporary copy of tile frequencies for manipulation.
                // This ensures the original `tileOccurrenceCounts` remains unchanged for other candidate/head combinations.
                const trialTileFrequencies = [...tileOccurrenceCounts];

                // Step 1: Add the current candidate tile to the hand.
                trialTileFrequencies[candidateTileValue]++;

                // Step 2: Attempt to remove two tiles to form the "head" (pair).
                trialTileFrequencies[headTileValue] -= 2;

                // Guard clause: If removing the pair resulted in a negative count for any tile, this combination is invalid.
                if (trialTileFrequencies[headTileValue] < 0) {
                    continue;
                }

                // Step 3: Check if the remaining tiles (after adding candidate and removing pair) can form valid melds.
                if (verifyMeldFormation(trialTileFrequencies)) {
                    // If all tiles form melds, this `candidateTileValue` successfully completes a winning hand.
                    completingTileCandidates.push(candidateTileValue);
                    // Since we found a valid head for this candidate tile, no need to check other heads.
                    continue CANDIDATE_TILE_LOOP;
                }
            }
        }

        // Format and display the results for the current hand.
        // If winning tiles are found, sort them numerically and join with spaces.
        // Otherwise, print '0'.
        const formattedOutput =
            completingTileCandidates.length > 0
                ? completingTileCandidates.sort((a, b) => a - b).join(' ')
                : '0';

        console.log(formattedOutput);
    }
}

// Initiate the tile hand evaluation process.
evaluateTileHands();