const appSettings = {
  // Path to the input data file.
  dataSourcePath: '/dev/stdin',
  // Character used to signify a new line in the input.
  lineDelimiter: '\n'
};

// Import the file system module.
const getModule = require('fs');

// Read the entire file content, decode it as UTF-8, and split it into lines.
const inputContentLines = getModule.readFileSync(appSettings.dataSourcePath, 'utf-8')
                                   .split(appSettings.lineDelimiter);

// Initial state for processing the input string.
const processingState = {
  // Stores calculated water area segments. Each segment is [start_index, area_size].
  waterAreas: [],
  // A stack to keep track of indices where a '\' character was encountered.
  startMarkers: []
};

// Process the first line of the input character by character to calculate water areas.
const finalAccumulation = inputContentLines[0]
                          .split('')
                          .reduce( (currentAccumulator, currentCharacter, characterIndex) => {

    // If a backslash is encountered, push its index onto the stack.
    if (currentCharacter === '\\') {
      currentAccumulator.startMarkers.push(characterIndex);
    }
    // If a forward slash is encountered AND there are pending backslashes in the stack.
    else if (currentCharacter === '/' && currentAccumulator.startMarkers.length > 0) {
      // Pop the index of the last encountered backslash.
      const lastMarkerIndex = currentAccumulator.startMarkers.pop();

      // Filter existing water area segments that started at or after the last backslash.
      const overlappingAreas = currentAccumulator.waterAreas.filter(areaFragment => areaFragment[0] >= lastMarkerIndex);
      // Filter existing water area segments that started before the last backslash.
      const nonOverlappingAreas = currentAccumulator.waterAreas.filter(areaFragment => areaFragment[0] < lastMarkerIndex);

      // Calculate the area for the current segment:
      // sum of areas of overlapping segments + (current_index - last_backslash_index).
      const newAreaSegment = [
        lastMarkerIndex,
        overlappingAreas.map(areaFragment => areaFragment[1])
                        .reduce((segmentSum, segmentValue) => segmentSum + segmentValue, 0)
                        + (characterIndex - lastMarkerIndex)
      ];

      // Add the newly calculated segment to the non-overlapping segments.
      nonOverlappingAreas.push(newAreaSegment);
      // Update the main list of water areas.
      currentAccumulator.waterAreas = nonOverlappingAreas;
    }

    // Return the updated accumulator for the next iteration.
    return currentAccumulator;
  }, processingState); // Initialize reduction with the predefined processingState.

// Calculate the total area of all water segments.
const totalArea = finalAccumulation.waterAreas.reduce((currentSum, areaFragment) => currentSum + areaFragment[1], 0);

// Get the total number of distinct water segments.
const areaCount = finalAccumulation.waterAreas.length;

// Output the total calculated water area.
console.log(totalArea);

// Output the count of water segments, followed by their individual areas if any exist.
console.log(`${areaCount}${areaCount > 0 ? ' ' + finalAccumulation.waterAreas.map(areaFragment => areaFragment[1].toString()).join(' ') : ''}`);