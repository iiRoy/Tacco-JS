(() => {
    // A utility to asynchronously acquire all data from standard input.
    // This replaces the original's fs.readFile and generator-based input parsing.
    const gatherInputData = () => new Promise(resolveCurrentData => {
        let accumulatedContent = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (incomingChunk) => {
            accumulatedContent += incomingChunk;
        });
        process.stdin.on('end', () => {
            resolveCurrentData(accumulatedContent.trim());
        });
    });

    // A computational function to determine the number of differing bits between two integers.
    // This replaces the original's explicit bit-by-bit loop for Hamming distance.
    const computeBitDiscrepancy = (valA, valB) => {
        let disparityCount = 0;
        let xorResult = valA ^ valB; // XOR highlights differing bits

        // Brian Kernighan's algorithm to count set bits (Hamming weight)
        while (xorResult > 0) {
            xorResult &= (xorResult - 1); // Clear the least significant set bit
            disparityCount++;
        }
        return disparityCount;
    };

    // The primary execution sequence.
    // This replaces the original's main module logic, bypassing the complex Gray code generation.
    const orchestrateProcessing = async () => {
        const rawInputString = await gatherInputData();
        // Parse the numerical values from the input string.
        // Filter(Boolean) removes any empty strings resulting from multiple spaces.
        const parsedNumerals = rawInputString.split(/\s+/).filter(Boolean).map(Number.parseInt);

        // The original code reads three numbers: bit_length, start_value, end_value.
        // Although our simplified logic doesn't explicitly use bit_length,
        // we acknowledge its presence for strict input interpretation.
        const hypercubeDimension = parsedNumerals[0]; // Not used in this simplified approach
        const initialNode = parsedNumerals[1];
        const finalNode = parsedNumerals[2];

        // The core functionality of the original code, despite its complex Gray code generation,
        // boils down to checking if the start and end values differ by exactly one bit.
        // If they do, they are "adjacent" on a hypercube, and the path is simply the two nodes.
        // Otherwise, no such direct path is considered.
        const differingBitCount = computeBitDiscrepancy(initialNode, finalNode);

        if (differingBitCount === 1) {
            console.log("YES");
            console.log(`${initialNode} ${finalNode}`);
        } else {
            console.log("NO");
        }
    };

    // Initiate the program flow.
    orchestrateProcessing();
})();