function ProcessInput(inputString) {
    // Check if the first character is 'A'
    if (inputString[0x0] !== 'A') {
        console.log('WA'); // Output "WA" if not
        return; // Exit the function
    }

    // Extract a segment of the string, excluding the first two and last characters
    var middleSegment = inputString.slice(0x2, ~0); // ~0 is equivalent to -1

    // Verify the presence and count of 'C' in the middle segment
    if (middleSegment.indexOf('C') === ~0 || middleSegment.split('C').length !== 0x2) {
        console.log('WA'); // Output "WA" if 'C' is missing or appears more/less than once
        return; // Exit the function
    }

    // Construct a new string by rearranging parts of the original
    var processedString = inputString[0x1] +
                          middleSegment.slice(0x0, middleSegment.indexOf('C')) +
                          middleSegment.slice(middleSegment.indexOf('C') + 0x1) +
                          inputString.slice(~0); // ~0 is equivalent to -1

    // Check if the constructed string consists only of lowercase English letters
    if (processedString.match(/^[a-z]+$/)) {
        console.log('AC'); // Output "AC" if it matches
        return; // Exit the function
    }

    // If none of the above conditions for "AC" were met, output "WA"
    console.log('WA');
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
