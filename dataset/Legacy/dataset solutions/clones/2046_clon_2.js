function ProcessInput(rawData) {
    // Split the raw input string by spaces.
    // This variable is declared but not utilized in the subsequent calculations.
    var temporaryArray = rawData.split(" ");

    // Convert the input string to a numerical value, treating it as base 10.
    // This represents the sum of the dimensions (x + y + z).
    var lengthSum = Number(rawData, 10);

    /*
     * Problem Description:
     * Given a positive integer 'lengthSum' (L), which is the sum of the
     * sides of a rectangular cuboid (x + y + z = L).
     *
     * Objective:
     * Calculate the maximum possible volume (S = x * y * z) of such a cuboid.
     *
     * Mathematical Insight:
     * For a fixed sum (x + y + z = L), the product (x * y * z) is maximized
     * when x, y, and z are as close to each other as possible.
     * This occurs when x = y = z = L / 3.
     *
     * Therefore, the maximum volume is (L/3) * (L/3) * (L/3) = (L/3)^3.
     */

    // Output the calculated maximum volume to the console.
    console.log(Math.pow(lengthSum / 3, 3));
}

// The following line handles standard input/output and should not be modified.
// It reads the entire content from standard input as UTF-8 and passes it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
