function myin () {
  /* This function is responsible for reading input from standard input.
     It uses Node.js's 'fs' module to synchronously read the file
     located at '/dev/stdin'. The content is then decoded as UTF-8
     and any leading/trailing whitespace is removed. */
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function myout (t) {
  // Prints the given argument 't' to standard output.
  console.log(t);
}

function myerr (t) {
  /* Sends the provided argument 't' to standard error.
     Useful for debugging messages or errors that shouldn't
     be part of the regular program output. */
  console.error(t);
}

/**
 * @param {string} i - The input string to convert.
 * @param {number} no - The conversion mode identifier.
 *
 * This utility function handles various input string transformations.
 * It acts as a dispatcher based on the 'no' parameter.
 *
 * Conversion Modes:
 * 0: No operation (returns input as is).
 * 1: Converts input to an integer using parseInt.
 * 2: Splits the input string by single space characters.
 * 3: Splits the input string by newline characters.
 * 4: Splits by space and converts each part to a number.
 * 5: Splits by newline and converts each part to a number.
 * 6: Splits the input string into an array of individual characters.
 * 7: Splits into characters and converts each character to a number.
 */
function myconv (i, no) {
  switch (no) {
    case 0:
      return i; // No conversion, return original input
    case 1:
      return parseInt(i); // Convert to integer
    case 2:
      return i.split(" "); // Split by space
    case 3:
      return i.split("\n"); // Split by newline
    case 4:
      return i.split(" ").map((a) => Number(a)); // Split by space, map to numbers
    case 5:
      return i.split("\n").map((a) => Number(a)); // Split by newline, map to numbers
    case 6:
      return i.split(""); // Split into individual characters
    case 7:
      return i.split("").map((a) => Number(a)); // Split into characters, map to numbers
  }
}

function Main (input) {
  /* The primary entry point for the application logic.
     It processes the input string according to specific rules. */

  // Convert the input string into an array of characters (mode 6).
  input = myconv(input, 6);

  // Initialize an object to store the indices of specific characters.
  var list = {
    "K": input.indexOf("K"),
    "I": input.indexOf("I"),
    "H": input.indexOf("H"),
    "B": input.indexOf("B"),
    "R": input.indexOf("R"),
  };

  // --- Initial validation checks ---

  // Check if all required characters (K, I, H, B, R) are present in the input.
  if (list["K"] == -1 || list["I"] == -1 || list["H"] == -1 || list["B"] == -1 || list["R"] == -1) {
    myout("NO"); // If any character is missing, output "NO".
    return;      // Terminate execution.
  }

  // Validate the required character order (K < I < H < B < R).
  if (
    list["K"] > list["I"] ||
    list["I"] > list["H"] ||
    list["H"] > list["B"] ||
    list["B"] > list["R"]
  ) {
    myout("NO"); // If the order is incorrect, output "NO".
    return;      // Terminate execution.
  }

  // Check if the total length of the input string exceeds 9 characters.
  if (input.length > 9) {
    myout("NO"); // If too long, output "NO".
    return;      // Terminate execution.
  }

  // --- Positional and spacing checks ---

  // Ensure 'I' immediately follows 'K' (K and I must be adjacent).
  if (list["K"] != list["I"] - 1) {
    myout("NO"); // If not adjacent, output "NO".
    return;      // Terminate execution.
  }

  // Check the distance between 'B' and 'H'.
  if (list["B"] - list["H"] > 2) {
    myout("NO"); // If distance is greater than 2, output "NO".
    return;      // Terminate execution.
  }

  // If the distance between 'B' and 'H' is exactly 2,
  // the character between them must be 'A'.
  if (list["B"] - list["H"] == 2) {
    var tmp = input[list["B"] - 1]; // Get the character at the position between H and B.
    if (tmp != "A") {
      myout("NO"); // If it's not 'A', output "NO".
      return;      // Terminate execution.
    }
  }

  // Check the distance between 'R' and 'B'.
  if (list["R"] - list["B"] > 2) {
    myout("NO"); // If distance is greater than 2, output "NO".
    return;      // Terminate execution.
  }

  // If the distance between 'R' and 'B' is exactly 2,
  // the character between them must be 'A'.
  if (list["R"] - list["B"] == 2) {
    var tmp = input[list["R"] - 1]; // Get the character at the position between B and R.
    if (tmp != "A") {
      myout("NO"); // If it's not 'A', output "NO".
      return;      // Terminate execution.
    }
  }

  // --- 'A' character count checks ---

  // Count consecutive 'A's from the beginning of the string.
  var maeAcount = 0; // Counter for 'A's at the front.
  for (var i = 0; i < input.length; i++) {
    if (input[i] == "A") {
      maeAcount++; // Increment if 'A' is found.
    } else {
      break; // Stop counting once a non-'A' character is encountered.
    }
  }

  // If more than one 'A' is found at the beginning, it's invalid.
  if (maeAcount > 1) {
    myout("NO"); // Output "NO".
    return;      // Terminate.
  }

  // Count consecutive 'A's from the end of the string.
  var atoAcount = 0; // Counter for 'A's at the back.
  for (var i = input.length - 1; i >= 0; i--) {
    if (input[i] == "A") {
      atoAcount++; // Increment if 'A' is found.
    } else {
      break; // Stop counting once a non-'A' character is encountered.
    }
  }

  // If more than one 'A' is found at the end, it's invalid.
  if (atoAcount > 1) {
    myout("NO"); // Output "NO".
    return;      // Terminate.
  }

  // If all checks pass, the input string is valid.
  myout("YES");
}

// Call the Main function with the input obtained from myin().
Main(myin());