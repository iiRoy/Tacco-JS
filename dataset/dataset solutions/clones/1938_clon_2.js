// This module processes some incoming data to determine a status.

function  ProcessInputData  (   rawData   )
{
  // Split the raw input string by space to get two distinct values.
  var   thresholdValue   =   rawData.split(" ")[0]   ;
  var   currentReading   =   rawData.split(" ")[1]   ;

  // Compare the second value against the first.
  if   (   currentReading   >   thresholdValue   )
  {
  	console.log("safe")   ; // Output "safe" if the condition is met.
  }
  else
  {
  	console.log("unsafe")   ; // Otherwise, output "unsafe".
  }
}

// Execute the main processing function with data read from standard input.
ProcessInputData (   require("fs").readFileSync("/dev/stdin", "utf8")   )   ;