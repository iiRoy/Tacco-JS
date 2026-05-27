const weatherTransitionMap = {
  'Sunny': 'Cloudy',
  'Cloudy': 'Rainy',
  'Rainy': 'Sunny'
};

function retrieveNextWeather(currentCondition) {
  // This helper function encapsulates the lookup logic.
  // If currentCondition is not a key in weatherTransitionMap, it returns undefined.
  return weatherTransitionMap[currentCondition];
}

function processInputForWeatherPrediction(rawInputContent) {
  // The original code's switch statement uses input[0] as the condition.
  // When rawInputContent is a string (e.g., "Sunny\n"), rawInputContent[0] is a single character (e.g., 'S').
  // The 'case' values ('Sunny', 'Cloudy', 'Rainy') are multi-character strings.
  // Therefore, the original switch statement's cases would never match, and no output would be produced.
  // To preserve exact observable behavior, this clone must also produce no output.

  const initialInputCharacter = rawInputContent[0];

  // We refactor the switch statement into an if-else if structure.
  // The conditions are designed to match the original's behavior:
  // they will only be true if initialInputCharacter is exactly 'Sunny', 'Cloudy', or 'Rainy'.
  // Since initialInputCharacter is always a single character, these conditions will always be false,
  // thus ensuring no output, just like the original code.
  if (initialInputCharacter === 'Sunny') {
    process.stdout.write(retrieveNextWeather('Sunny'));
  } else if (initialInputCharacter === 'Cloudy') {
    process.stdout.write(retrieveNextWeather('Cloudy'));
  } else if (initialInputCharacter === 'Rainy') {
    process.stdout.write(retrieveNextWeather('Rainy'));
  }
  // No 'else' or default case is needed, as the original had no default behavior
  // and produced no output if no case matched.
}

// The input reading mechanism is preserved exactly as in the original.
processInputForWeatherPrediction(require("fs").readFileSync("/dev/stdin", "utf8"));
