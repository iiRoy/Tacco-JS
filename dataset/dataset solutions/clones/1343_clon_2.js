// This function computes (baseVal ^ exponentVal) % modulusVal efficiently,
// leveraging the property that any exponent can be expressed as a sum of powers of two (binary representation).
// For example, baseVal^22 = baseVal^16 * baseVal^4 * baseVal^2, because 22 in binary is 10110.
function calculateModularExponent(baseVal, exponentVal, modulusVal)
{
    let finalProduct = 1n; // Initialize the result accumulator to 1 (BigInt).

    while (exponentVal > 0n) // Iterate as long as the exponent has bits to process.
    {
        // If the least significant bit of the current exponent is 1,
        // it means this power of baseVal contributes to the final product.
        if (exponentVal & 1n)
        {
            finalProduct = (finalProduct * baseVal) % modulusVal; // Multiply and take modulo.
        }

        // Square the baseVal and take modulo, preparing for the next bit position (baseVal becomes baseVal^(2^i)).
        baseVal = (baseVal * baseVal) % modulusVal;

        // Right-shift the exponent by 1 bit, effectively dividing it by 2.
        exponentVal >>= 1n;
    }

    return finalProduct; // Return the computed modular exponentiation result.
}


// This entry point processes the entire input data received.
function executeScript(incomingContent)
{
    // The input string is split into individual lines.
    incomingContent = incomingContent.split("\n");

    // The first line of input is further split by spaces to get numerical parameters.
    const firstLineSegments = incomingContent[0].split(" ");

    // Parse the two numbers from the first line, ensuring they are base-10 integers.
    const operandOne = parseInt(firstLineSegments[0], 10);
    const operandTwo = parseInt(firstLineSegments[1], 10);

    // Compute the modular exponentiation for the parsed numbers,
    // using a fixed modulus (1,000,000,007) and converting inputs to BigInts.
    // The final result is converted back to a string for output.
    console.log(calculateModularExponent(BigInt(operandOne), BigInt(operandTwo), 1000000007n).toString());
}


// The following line should not be altered. It handles reading from standard input
// and initiates the main processing function.
executeScript(require("fs").readFileSync("/dev/stdin", "utf8"));