// This function serves as the primary entry point for processing the provided input data.
function ProcessInput(rawData) {
  // A dynamic array to store the initial character (type) found at each grid position.
  let initialChars = [];

  // The input string is first split into individual lines, then each line is processed.
  let parsedLines = rawData.split('\n').map((itemValue, lineIndex) => {
    // The very first line of input contains two crucial numeric configuration values.
    if (lineIndex === 0) {
      // Split the line by spaces and convert each part into an integer (base 10).
      return itemValue.split(' ').map(valStr => parseInt(valStr, 10));
    }
    // The second line describes the initial setup of entities across the grid.
    else if (lineIndex === 1) {
      // Break this line into individual characters.
      return itemValue.split('').map(charVal => {
        // Store each character in our 'initialChars' array for later reference.
        initialChars.push(charVal);
        // For each character, create an object representing the state of that grid position.
        // The object will have a property named after the character (e.g., 'A': true)
        // and a 'num' property indicating the count of entities at this spot, initially one.
        return { [charVal]: true, num: 1 };
      });
    }
    // All subsequent lines represent individual movement queries.
    else {
      // These lines are simply split by space, keeping their string format.
      return itemValue.split(' ');
    }
  });

  // Extract the grid size (N) and the total number of queries (Q) from the first parsed line.
  let configValues = parsedLines[0];
  let gridSize = configValues[0]; // N: Represents the total number of available positions on the grid.
  let queryCount = configValues[1]; // Q: The total count of movement operations to perform.

  // Initialize a counter for entities that are currently within the grid boundaries.
  let remainingEntities = gridSize;

  // The 'entityStates' array holds the detailed state objects for each grid position.
  // This array was populated during the parsing of the second input line.
  let entityStates = parsedLines[1];

  // Begin processing each movement query.
  // Queries are located from the third line (index 2) up to (Q + 1)th line.
  for (let queryIdx = 0x2; queryIdx < queryCount + 0x2; queryIdx++) {
    let currentQuery = parsedLines[queryIdx];
    let targetType = currentQuery[0]; // The specific type of entity to be moved (e.g., 'A', 'B').
    let moveDirection = currentQuery[1]; // The direction of movement: 'L' for left, 'R' for right.

    // Iterate through all possible grid positions to identify entities matching the target type.
    // Note: Using 'for...in' for array iteration is generally not recommended for numerical indices,
    // but it mirrors the original code's structure.
    for (let currentPosIdx in initialChars) {
      // Check if an entity of the 'targetType' is present at the 'currentPosIdx'.
      if (entityStates[currentPosIdx][targetType]) {
        // If found, mark this specific type of entity as no longer present at this position.
        entityStates[currentPosIdx][targetType] = false;

        // Calculate the new position after the movement.
        // 'currentPosIdx' is a string from 'for...in', so it needs parsing to an integer.
        let nextPosition = parseInt(currentPosIdx, 10) + (moveDirection === 'L' ? -1 : 1);

        // Determine if the entity has moved beyond the grid boundaries.
        if (nextPosition < 0 || nextPosition >= gridSize) {
          // If the entity moves out of bounds, decrement the total count of remaining entities
          // by the number of entities that were at the original position.
          remainingEntities -= entityStates[currentPosIdx].num;
        } else {
          // If the entity remains within the grid, update its state at the new position.
          // The arriving entity is considered to take on the type associated with its new destination's
          // initial character.
          entityStates[nextPosition][initialChars[nextPosition]] = true;
          // Accumulate the count of entities from the old position to the new one.
          entityStates[nextPosition].num += entityStates[currentPosIdx].num;
        }
        // After movement, the original position is now empty of these entities.
        entityStates[currentPosIdx].num = 0;
      }
    }
  }
  // Finally, print the total number of entities that are still within the grid.
  console.log(remainingEntities);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
