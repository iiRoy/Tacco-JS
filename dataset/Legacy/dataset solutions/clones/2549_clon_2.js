function ClimateForecast(skyCondition) {
  // This function determines the next weather state based on the current one.
  // It uses a switch statement to handle different sky conditions.
  switch (skyCondition) {
    case 'Sunny':
      // If it's sunny, the next state is cloudy.
      console.log('Cloudy');
      break; // Exit the switch statement.

    case 'Cloudy':
      // If it's cloudy, the next state is rainy.
      console.log('Rainy');
      break; // Terminate the current case.

    case 'Rainy':
      // If it's rainy, the next state is sunny.
      console.log('Sunny');
      break; // Stop execution of the switch.

    default:
      // For any other condition, log 'Other'.
      console.log('Other');
      break; // Conclude the switch.
  }

  // After processing the weather, read input from standard input and pass it to the Main function.
  // This part handles external data interaction.
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
}
