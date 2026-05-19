// This function processes the entire raw input string.
function ProcessInput(rawData) {
  // Split the incoming string by spaces to get individual components.
  let parsedData = rawData.split(" "); 
  
  // Parse the first component as an integer, base 10.
  let firstVal = parseInt(parsedData[0], 10);
  
  // Parse the second component as an integer, base 10.
  let secondVal = parseInt(parsedData[1], 10);
  
  // Initialize a variable, then assign the floor of secondVal divided by 2.
  let halfP = 0; // Initial declaration, will be overwritten.
  halfP = Math.floor(secondVal / 2);
  
  // Calculate the remainder when secondVal is divided by 2.
  let remainderP = secondVal % 2;
  
  // Calculate a complex intermediate value, then take its floor when divided by 2.
  let halfSum = Math.floor((firstVal * 3 + remainderP) / 2);
  
  // Calculate the remainder of the same complex intermediate value.
  let remainderSum = (firstVal * 3 + remainderP) % 2;
  
  // The original code had a commented-out debug line. We keep it commented.
  // console.log(halfP, remainderP, halfSum, remainderSum);
  
  // Output the sum of the two calculated 'half' values.
  console.log(halfP + halfSum);
}

// Do not modify the following lines. They handle reading from standard input and calling the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
