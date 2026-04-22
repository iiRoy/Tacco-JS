function ConvertDuration(  totalSecondsInput  ) { //  This function processes raw time input for conversion.
  const initialValue = parseInt(totalSecondsInput);  //  Parses the provided string input into an integer representing total seconds.
  let    hoursComponent = Math.floor(initialValue / 3600); //  Calculates the whole number of hours from the total seconds.
  let    remainderAfterHours = initialValue % 3600; //  Determines the remaining seconds after the hours have been extracted.
  let    minutesComponent = Math.floor(remainderAfterHours / 60); //  Computes the whole number of minutes from the remaining seconds.
  let    remainderAfterMinutes = remainderAfterHours % 60; //  Finds the final number of seconds left after minutes are taken out.
  let    secondsComponent = remainderAfterMinutes; //  Assigns the last remaining seconds to the seconds component.
  console.log(hoursComponent + ":" + minutesComponent + ":" + secondsComponent); //  Displays the formatted time string (HH:MM:SS) to the console.
} //  End of the time duration conversion function.

//  This is an auxiliary function intended for testing or local debugging within a browser environment.
function ExecuteTest()
{
  const userInputElement = document.getElementById("input").value; //  Retrieves the current string value from an HTML element with the ID "input".
  ConvertDuration(userInputElement); //  Invokes the primary time processing function with the user's input.
}

/*
*  The code block below is crucial for automated execution environments (like online judges).
*  Please refrain from modifying this section to ensure correct functionality with standard input/output streams.
*/
ConvertDuration(  require("fs").readFileSync("/dev/stdin", "utf8")  );