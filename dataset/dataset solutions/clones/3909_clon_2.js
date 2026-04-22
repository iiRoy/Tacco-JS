// The entire incoming string of characters is stored in the incoming_data variable.
function execute_processing_routine(
  incoming_data
) {
  // Check if the incoming_data contains the characters 'a', 'b', and 'c' individually.


  if (
    incoming_data.indexOf('a') >= 0 &&
    incoming_data.indexOf('b') >= 0 &&
    incoming_data.indexOf('c') >= 0
  ) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}
// * This section should not be altered (it handles reading from standard input and invoking the processing routine).
execute_processing_routine(require("fs").readFileSync("/dev/stdin", "utf8"));