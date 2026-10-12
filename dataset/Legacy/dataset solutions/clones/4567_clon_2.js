function ProcessInput(rawData) {
    // Parse the two numerical dimensions from the provided input string.
    let [dimA, dimB] = rawData.split(" ").map(Number);

    // Initialize a variable to store the smallest difference found, setting it to the maximum possible safe integer.
    let minimumDifference = Number.MAX_SAFE_INTEGER;

    // First computational path: Consider splitting the first dimension (dimA) into one-third and two-thirds.
    {
        // Create an array to hold the areas of the three resulting sections.
        let areaParts = [0, 0, 0];
        // Calculate the area of the first section: floor(dimA / 3) * dimB.
        areaParts[0] = Math.floor(dimA / 3) * dimB;
        // Determine the remaining dimension for the other two sections.
        let intermediateDimension = Math.ceil(dimA / 3 * 2);
        // Split the remaining area by dividing the second dimension (dimB) in half.
        areaParts[1] = intermediateDimension * Math.ceil(dimB / 2);
        areaParts[2] = intermediateDimension * Math.floor(dimB / 2);
        // Update the minimum difference by comparing with the difference between the max and min areas in this configuration.
        minimumDifference = Math.min(minimumDifference, Math.max.apply(null, areaParts) - Math.min.apply(null, areaParts));
    }

    // Second computational path: Similar to the first, but with different rounding for the initial split of dimA.
    {
        let areaParts = [0, 0, 0];
        areaParts[0] = Math.ceil(dimA / 3) * dimB;
        let intermediateDimension = Math.floor(dimA / 3 * 2);
        areaParts[1] = intermediateDimension * Math.ceil(dimB / 2);
        areaParts[2] = intermediateDimension * Math.floor(dimB / 2);
        minimumDifference = Math.min(minimumDifference, Math.max.apply(null, areaParts) - Math.min.apply(null, areaParts));
    }

    // Swap the values of dimA and dimB to simulate rotating the cutting orientation.
    dimA = dimB + (dimB = dimA, 0);

    // Third computational path: Re-evaluate the first scenario with the swapped dimensions.
    {
        let areaParts = [0, 0, 0];
        areaParts[0] = Math.floor(dimA / 3) * dimB;
        let intermediateDimension = Math.ceil(dimA / 3 * 2);
        areaParts[1] = intermediateDimension * Math.ceil(dimB / 2);
        areaParts[2] = intermediateDimension * Math.floor(dimB / 2);
        minimumDifference = Math.min(minimumDifference, Math.max.apply(null, areaParts) - Math.min.apply(null, areaParts));
    }

    // Fourth computational path: Re-evaluate the second scenario with the swapped dimensions.
    {
        let areaParts = [0, 0, 0];
        areaParts[0] = Math.ceil(dimA / 3) * dimB;
        let intermediateDimension = Math.floor(dimA / 3 * 2);
        areaParts[1] = intermediateDimension * Math.ceil(dimB / 2);
        areaParts[2] = intermediateDimension * Math.floor(dimB / 2);
        minimumDifference = Math.min(minimumDifference, Math.max.apply(null, areaParts) - Math.min.apply(null, areaParts));
    }

    // Check for a special case: if dimA is perfectly divisible by 3, the difference can be zero.
    // Otherwise, consider dimB as a potential minimum difference.
    {
        if (dimA % 3 === 0) {
            minimumDifference = 0;
        } else {
            minimumDifference = Math.min(minimumDifference, dimB);
        }
    }

    // Check for another special case: if dimB is perfectly divisible by 3, the difference can be zero.
    // Otherwise, consider dimA as a potential minimum difference.
    {
        if (dimB % 3 === 0) {
            minimumDifference = 0;
        } else {
            minimumDifference = Math.min(minimumDifference, dimA);
        }
    }

    // Print the final calculated minimum difference to the console.
    console.log(minimumDifference);
}

// Read the input from standard input, remove leading/trailing whitespace, and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
