/* This is a utility function for logging messages to the console. */
var log = console.log;

// Check if the code is running in a Node.js environment
if (typeof process != "undefined")      {
  // Initialize an empty string to accumulate input data
  var input = "";
  process.stdin.resume(); // Ensure the standard input stream stays open
  process.stdin.setEncoding('utf8'); // Set encoding for incoming data

  // Event listener for incoming data chunks
  process.stdin.on('data', function (chunk)   {
    input += chunk; /* Append the received chunk to the input string. */
  });

  // Event listener for the end of the input stream
  process.stdin.on('end', function ()   {
    // Split the accumulated input into lines
    var lines = input.split("\n");
    main(lines); // Call the main function with the parsed lines
  });
}

/**
 * A global constant representing a modulo value, often used in
 * cryptographic or large number calculations to prevent overflow.
 */
var mod = 1000000007;


function rec(m, n)  {
  // Base case for the recursion: if n is small, calculate directly
  if (n <= 3) {
    return Math.pow(m, n) % mod;
  }

  // If n is even, use the property (m^n) = (m^(n/2))^2
  if (n % 2 == 0) {
    return Math.pow(rec(m, n / 2), 2) % mod;
  } else {
    // If n is odd, use the property (m^n) = (m^((n-1)/2))^2 * m
    return (Math.pow(rec(m, (n - 1) / 2), 2) * m) % mod;
  }
}

// The primary function to execute the program logic
function main(lines) {
  var k = lines[0]; // Get the first line of input
  // Split the line by spaces and convert parts to numbers
  var j = k.split(" ").map(function (e) { return Number(e); });
  // Log the result of the recursive function with parsed inputs
  log(rec(j[0], j[1]));
}