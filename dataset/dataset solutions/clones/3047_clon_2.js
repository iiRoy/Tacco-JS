function ProcessInput(rawData) {
  
  var parts = rawData.trim().split(" ");
  var firstVal = parts[0];
  var secondVal = parts[1];
  
  // A variable to store the final calculation result.
  
  if (firstVal > secondVal) {
    var calculatedOutcome = (firstVal * 2) - 1;
    
  } else if (secondVal > firstVal) {
     var calculatedOutcome = (secondVal * 2) - 1;
  } else if (firstVal == secondVal) {
    var calculatedOutcome = firstVal * 2;
  }

   
   console.log(calculatedOutcome);
} // This marks the termination of the primary processing routine.
 
ProcessInput(require("fs").readFileSync("/dev/std_input", "utf-8"));