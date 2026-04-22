var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Reads the full input content from the standard input stream.

var lineFragments = (rawData.trim()).split("\n");
// Cleans up whitespace from the raw input and separates it into an array of individual lines.

while(true) {
   // Main processing loop: continues indefinitely until a specific exit condition is met.
   var currentLine = lineFragments.shift();
   // Extracts the first line from the array for current processing.

   if (currentLine === "0 0 0") break;
   // Terminates the loop if the special "0 0 0" sentinel line is encountered.

   currentLine = currentLine.split(" ").map(Number);
   // Splits the current line by spaces and converts each segment into a numeric value.

   var totalEntities = currentLine[0];
   // N: Represents the total number of entities involved in the process.
   var skipInterval = currentLine[1];
   // M: Defines the step or interval for selection/elimination.
   var initialPoint = currentLine[2];
   // START: Specifies the starting index or position.

   var entityStates = [];
   // Initializes an array to track the state (e.g., active/inactive) of each entity.

   for (var currentPosition = 0; currentPosition <= totalEntities; currentPosition++)
      entityStates[currentPosition] = true;
   // Populates the entity states array, setting all entities from 1 to N as active initially.

   var currentPosition = initialPoint;
   // Sets the initial pointer for iteration to the specified starting point.
   var intervalCounter = 0;
   // Resets a counter used for tracking intervals.
   entityStates[initialPoint] = false;
   // Marks the entity at the initial point as inactive immediately.
   var removedCount = 1;
   // Initializes a count for entities that have been marked inactive.

   while (true) {
      // Inner loop for the main selection/elimination mechanism.
      if (removedCount === entityStates.length - 2) break;
      // Exits the inner loop when N-1 entities have been marked inactive (total N entities, 0-indexed array includes an unused 0th element).

      if (entityStates[currentPosition]) {
         // Checks if the entity at the current position is still active.
         intervalCounter++;
         // Increments the interval counter.
         if (intervalCounter === skipInterval) {
            // If the interval counter matches the defined skip interval.
            entityStates[currentPosition] = false;
            // Marks the current entity as inactive.
            intervalCounter = 0;
            // Resets the interval counter.
            removedCount++;
            // Increments the total count of inactive entities.
         }
      }
      currentPosition++;
      // Moves the current position pointer forward.
      if (entityStates.length - 1 < currentPosition) currentPosition = 1;
      // Wraps the position pointer back to 1 if it exceeds the total number of entities.
   }

   for (var currentPosition = 1; currentPosition <= totalEntities; currentPosition++) {
      // Iterates through all possible entity positions from 1 to N.
      if (entityStates[currentPosition]) console.log(currentPosition);
      // If an entity is still active, its position is printed to the console.
   }
}