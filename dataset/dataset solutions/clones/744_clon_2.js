var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = (rawData.trim()).split("\n");

while (true) {
  // Read the number of dependency sets for the current test case
  var count = lineSegments.shift() - 0;

  // If count is zero, terminate the program
  if (count === 0) {
    break;
  }

  // Process the first line of dependencies
  var initialDependencies = lineSegments.shift().split(":");
  // Extract the actual dependency list, remove trailing ']', and split by comma
  initialDependencies = initialDependencies[1].slice(0, -1).split(",");

  // Initialize an object to store subsequent dependency mappings
  var dependencyMap = {};

  // Loop to read and parse the remaining dependency lines
  for (var idx = 0; idx < count - 1; idx++) {
    var currentLineParts = lineSegments.shift().split(":");
    // Store the mapping: key is the item, value is its dependencies
    dependencyMap[currentLineParts[0]] = currentLineParts[1].slice(0, -1).split(",");
  }

  // Initialize a variable to track the length of the dependency list
  var previousLength = 0;

  // Loop until no new dependencies are added to the list
  while (true) {
    // If the length hasn't changed, it means no new dependencies were found
    if (previousLength === initialDependencies.length) {
      break;
    }
    // Update the previous length for the next iteration
    previousLength = initialDependencies.length;

    // Iterate through the current list of dependencies
    initialDependencies.forEach(function(dependencyItem, itemIndex) {
      // Check if the current dependency item has further dependencies defined in the map
      if (dependencyMap.hasOwnProperty(dependencyItem)) {
        // Mark the current item for removal (by setting to empty string)
        initialDependencies[itemIndex] = "";
        // Add its sub-dependencies to the main list
        initialDependencies = initialDependencies.concat(dependencyMap[dependencyItem]);
      }
    });
  }

  // Filter out the empty strings (items that were replaced by their sub-dependencies)
  initialDependencies = initialDependencies.filter(function(filteredItem) {
    return filteredItem !== "";
  });

  // Create an object to store unique dependencies (using keys for uniqueness)
  var uniqueDependencies = {};
  initialDependencies.forEach(function(uniqueDepKey) {
    uniqueDependencies[uniqueDepKey] = true;
  });

  // Output the total count of unique dependencies
  console.log(Object.keys(uniqueDependencies).length);
}
