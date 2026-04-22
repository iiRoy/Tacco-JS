// This JavaScript script processes a series of poker hands,
// read line by line from standard input, and determines the
// type of each hand based on card values and their frequencies.

// Utilize the Node.js 'fs' module to read from the file system.
require("fs")
  // Read the entire content of standard input synchronously.
  .readFileSync(
    // Specify the path to standard input.
    "/dev/stdin",
    // Define the character encoding for the input.
    "utf8"
  )
  // Remove any leading or trailing whitespace from the input string.
  .trim()
  // Split the input string into an array of individual lines,
  // where each line represents a single poker hand.
  .split('\n')
  // Iterate over each line (hand) in the array.
  // The 'map' function processes each hand 'i' independently.
  .map(function(i) {
    // Define a helper function 'f' for sorting arrays in descending order.
    // This will be used for both card values and frequency counts.
    f = function(a, b) {
      // Returns a positive value if 'b' is greater than 'a',
      // causing 'b' to come before 'a' in a sort.
      return b - a;
    };

    // Initialize an empty array 'a'. This array will be used as
    // a frequency map (or hash table) to store counts of each card value.
    a = [];

    // Split the current hand string 'i' by commas to get individual card values.
    // Then, sort these card values in descending order using the 'f' comparator.
    // The result is stored in 'c'.
    c = i.split(",").sort(f);

    // Iterate through the sorted card values 'c' to populate the frequency map 'a'.
    c.map(function(j) {
      // If the card value 'j' already exists as a key in 'a',
      // increment its corresponding count.
      // Otherwise, initialize its count to 1.
      a[j] ? a[j]++ : a[j] = 1;
    });

    // Sort the frequency counts stored in 'a' in descending order.
    // This arranges the frequencies from highest to lowest.
    a.sort(f);

    // 'l' stores the highest frequency count found in the hand (e.g., 4 for four of a kind).
    l = a[0];
    // 'n' stores the second highest frequency count (e.g., 2 for a full house).
    n = a[1];

    // Determine the type of poker hand using a series of nested ternary operators
    // and print the result to the console.
    console.log(
      // Check for "four card" (four of a kind).
      l == 4 ? "four card" :
      // If not four of a kind, check for "three card" or "full house".
      l == 3 ? (
        // If highest frequency is 3, check if the second highest frequency is 2.
        // This indicates a "full house" (e.g., KKKQQ).
        n == 2 ? "full house" :
        // Otherwise, it's just "three card" (three of a kind, e.g., KKK52).
        "three card"
      ) :
      // If not three of a kind or full house, check for "one pair" or "two pair".
      l == 2 ? (
        // If highest frequency is 2, check if the second highest frequency is also 2.
        // This indicates "two pair" (e.g., KKQQJ).
        n == 2 ? "two pair" :
        // Otherwise, it's "one pair" (e.g., KKQJ9).
        "one pair"
      ) :
      // If no pairs or sets, check for a "straight".
      // A straight is five consecutive cards.
      // Condition 1: The difference between the highest and lowest card is 4
      // (e.g., 5,4,3,2,1 where c[0]=5, c[4]=1).
      // Condition 2: Special case for A,5,4,3,2 (Ace as 1).
      // Here, c[0]-c[3] would be 3 (e.g., 5-2=3) and c[4] would be 1 (Ace).
      4 == c[0] - c[4] || (c[0] - c[3] == 3 && +c[4] == 1) ? "straight" :
      // If none of the above conditions are met, the hand is classified as "null".
      "null"
    );
  });