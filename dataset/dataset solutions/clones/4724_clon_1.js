var obj = init()
Main()

function nextInt() {
  // Converts the next input string to an integer.
  return myconv(next(), 1)
}

function nextStrArray() {
  /*
   * Splits the next input string by half-width spaces.
   * This is for string arrays.
   */
  return myconv(next(), 2)
}

function nextIntArray() {
  // Splits by half-width spaces and converts to an array of numbers.
  return myconv(next(), 4)
}

function nextCharArray() {
  // Splits the next input string into an array of single characters.
  return myconv(next(), 6)
}

function next() {
  // Retrieves the next line of input from the initialized object.
  return obj.next()
}

function hasNext() {
  // Checks if there are more lines of input available.
  return obj.hasNext()
}

function myin() {
  /*
   * Reads the entire content of standard input,
   * removes leading/trailing whitespace, and splits it into an array of lines.
   */
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n")
}

function init() {
  // Initializes the input handler object.
  var inputFile = myin()
  var returnObj = {
    // Stores the input lines as a list.
    list: inputFile,
    // Current index for reading input.
    index: 0,
    // Total number of input lines.
    max: inputFile.length,

    // Method to check if there are more lines.
    hasNext: function () {
      return this.index < this.max
    },

    // Method to get the next line of input.
    next: function () {
      if (!this.hasNext()) {
        // Throws an error if no more input is available.
        throw "ArrayIndexOutOfBoundsException これ以上ないよ"
      } else {
        var returnInput = this.list[this.index]
        this.index++ // Increment the index for the next call.
        return returnInput
      }
    },
  }
  return returnObj // Returns the initialized input object.
}

function myout(t) {
  // Prints the given argument to standard output.
  console.log(t)
}

function myerr(t) {
  // Prints the given argument to standard error output.
  console.error(t)
}

// myconv function: Handles various type conversions and manipulations.
// [no] parameter determines the conversion type.
// 1: Convert to integer.
// 2: Split string by space.
// 4: Split string by space and convert elements to numbers.
// 6: Split string into individual characters.
// 7: Split string into individual characters and convert to numbers.
// 8: Join array elements with spaces.
// 9: Join array elements with newlines.
// 0: Join array elements without any separator.
// Default: Returns the input as is.
// If an error occurs during conversion, the original input is returned.
function myconv(i, no) {
  try {
    switch (no) {
      case 1:
        return parseInt(i) // Convert to integer.
      case 2:
        return i.split(" ") // Split by space.
      case 4:
        return i.split(" ").map((a) => Number(a)) // Split by space and map to numbers.
      case 6:
        return i.split("") // Split into characters.
      case 7:
        return i.split("").map((a) => Number(a)) // Split into characters and map to numbers.
      case 8:
        return i.join(" ") // Join with spaces.
      case 9:
        return i.join("\n") // Join with newlines.
      case 0:
        return i.join("") // Join without separator.
      default:
        return i // Return original if no specific conversion.
    }
  } catch (e) {
    // In case of conversion error, return the original input.
    return i
  }
}

function Main() {
  // Main execution logic of the program.

  var one = nextIntArray() // Reads the first line as an array of integers.
  var N = one[0] // N: Number of items.
  var MA = one[1] // MA: Target sum for property A.
  var MB = one[2] // MB: Target sum for property B.

  var list = new Array(N) // Array to store item properties.
  for (var i = 0; i < N; i++) {
    // Populate the list with item data.
    list[i] = nextIntArray()
  }

  // Initialize a 3D DP table.
  var dp = new Array(N + 1)
  var maxValue = 151 // Maximum possible sum for MA or MB, plus a margin.

  for (var i = 0; i < N + 1; i++) {
    dp[i] = new Array(maxValue) // Initialize the second dimension.
    for (var j = 0; j < maxValue; j++) {
      dp[i][j] = new Array(maxValue) // Initialize the third dimension.
    }
  }

  // Base case: 0 items, 0 MA, 0 MB, cost is 0.
  dp[0][0][0] = 0

  // dp[i][j][k] represents the minimum cost to achieve
  // a total of 'j' for property A and 'k' for property B,
  // considering the first 'i' items.

  for (var i = 1; i <= N; i++) {
    // Iterate through each item.
    for (var j = 0; j < maxValue; j++) {
      // Iterate through possible sums for property A.
      for (var k = 0; k < maxValue; k++) {
        // Iterate through possible sums for property B.
        if (dp[i - 1][j][k] != null) {
          // If a state from the previous item is reachable.
          dp[i][j][k] = dp[i - 1][j][k] // Option 1: Don't take the current item.
        }
      }
    }

    var item = list[i - 1] // Get the current item's properties: [A, B, Cost].
    for (var j = 0; j < maxValue; j++) {
      // Iterate through sums for property A.
      for (var k = 0; k < maxValue; k++) {
        // Iterate through sums for property B.
        // myerr({i,j,k}); // Debugging line, commented out.
        if (dp[i - 1][j][k] != null) {
          // If the state (j, k) was reachable with (i-1) items.
          // Option 2: Take the current item.
          if (dp[i][j + item[0]][k + item[1]] == null) {
            // If this new state hasn't been reached yet, or current cost is better.
            dp[i][j + item[0]][k + item[1]] = dp[i - 1][j][k] + item[2]
          } else {
            // If this new state has been reached, update with the minimum cost.
            dp[i][j + item[0]][k + item[1]] = Math.min(
              dp[i - 1][j][k] + item[2],
              dp[i][j + item[0]][k + item[1]]
            )
          }
        }
      }
    }
  }

  var count = 1 // Multiplier for MA and MB targets.
  var output = 10000 // Initialize output with a large value (representing infinity).

  while (true) {
    // Loop to check multiples of MA and MB.
    var getMA = MA * count // Current target for property A.
    var getMB = MB * count // Current target for property B.

    if (getMA < maxValue && getMB < maxValue) {
      // Check if targets are within DP table bounds.
      if (dp[N][getMA][getMB] != null) {
        // If this state is reachable with N items.
        output = Math.min(output, dp[N][getMA][getMB]) // Update minimum cost.
      }
    } else {
      break // Break if targets exceed bounds.
    }
    count++ // Increment multiplier.
  }

  if (output == 10000) {
    // If no combination was found.
    myout(-1) // Output -1 as per problem requirements.
  } else {
    myout(output) // Output the minimum cost found.
  }
}