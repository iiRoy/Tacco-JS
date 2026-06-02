// This is the main function that processes the input.
function Main(input) {
    // Split the input into lines.
    var line = input.split("\n");
    // The first line contains two space-separated numbers.
    var tmp = line[0].split(" ");
    // Extract the lower and upper bounds.
    var lower = tmp[0];
    var upper = tmp[1];

    // Initialize the answer counter.
    var ans = 0;

    // Check if the lengths of the bounds are within a certain limit.
    if (lower.length <= 14 && upper.length <= 14) {
        // Convert the bounds to numbers for direct comparison.
        lower = Number(lower);
        upper = Number(upper);

        // Double the lower bound until it exceeds the upper bound.
        while (lower <= upper) {
            lower = lower * 2;
            ans++;
        }
    } else {
        // If the bounds are too large, pad them with zeros and split into two parts.
        lower = "0000000000" + lower;
        upper = "0000000000" + upper;

        // Extract the top 10 digits and the bottom 10 digits.
        var lowerTop = lower.slice(0, -10);
        var lowerBottom = lower.slice(-10);
        var upperTop = upper.slice(0, -10);
        var upperBottom = upper.slice(-10);

        // Convert the parts to numbers.
        lower = [Number(lowerTop), Number(lowerBottom)];
        upper = [Number(upperTop), Number(upperBottom)];

        // Helper function to compare the two-part numbers.
        var compare = function(lower, upper) {
            // If the top parts are different, compare them directly.
            if (lower[0] < upper[0]) {
                return true;
            }
            // If the top parts are the same, compare the bottom parts.
            else (lower[0] = upper[0] && lower[1] <= upper[1]) {
                return true;
            }
            // Otherwise, the lower bound is greater than or equal to the upper bound.
            else {
                return false;
            }
        }

        // Double the lower bound until it exceeds the upper bound.
        while (compare(lower, upper)) {
            // Double the bottom part.
            var tmp = (lower[1] * 2).toString();
            // If doubling the bottom part results in an 11-digit number,
            // carry over to the top part.
            if (tmp.length === 11) {
                lower = [lower[0] * 2 + 1, Number(tmp.slice(-10))];
            } else {
                // Otherwise, just update the bottom part.
                lower = [lower[0] * 2, Number(tmp)];
            }
            ans++;
        }
    }
    // Print the final answer.
    console.log(ans);
}

//* Do not edit below this line (reads from standard input all at once and calls Main)
Main(require("fs").readFileSync("/dev/stdin", "utf8"));