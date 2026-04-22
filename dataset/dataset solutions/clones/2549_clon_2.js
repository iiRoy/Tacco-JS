/* This module provides a simple atmospheric condition prediction based on an initial state. */
function AtmospherePredictor ( initialCondition )
{
  // Evaluate the provided atmospheric condition
  switch ( initialCondition )
  {
    case 'ClearSky': // If the weather is currently clear
      console.log('Overcast'); // Predict it will become overcast
      break; // Exit the switch statement
    case 'Overcast': // If the weather is currently overcast
      console.log('Precipitation'); // Predict it will lead to precipitation
      break; // Terminate execution of this case
    case 'Precipitation': // If there is current precipitation
      console.log('ClearSky'); // Predict it will transition to clear skies
      break; // Stop further case evaluation
    default: // For any unrecognised or default condition
      console.log('UndefinedState'); // Indicate an unknown state
      break; // Conclude the switch block
  }

  // After condition evaluation, process some external data source.
  ProcessExternalDataSource(
    require("fs")  // Access the file system module.
      .readFileSync(
        "/dev/stdin", // Read from standard input.
        "utf8"        // Interpret the input as UTF-8 encoded text.
      )
  );
}