function Main(input) {
  // Split the input into lines
  input = input.split("\n");

  // Get the first line and split it into characters
  str = input[0].split("");

  // Check if the third and fourth characters are the same
  if (str[2] ==str[3]) {
    // If they are, check if the fifth and sixth characters are the same
    if (str[4] ==str[5]) {
      // If both pairs are the same, print "Yes"
      console.log("Yes");
    } else {
    // If the third and fourth characters are not the same, print "No"
    console.log("No");
  }
}

// Read input from stdin and call Main
Main(require("fs").readFileSync("/dev/stdin", "utf8"));