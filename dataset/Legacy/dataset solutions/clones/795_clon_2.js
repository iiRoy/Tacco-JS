var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data, splitting it into individual lines
var lineData = rawData.trim().split('\n');

// Main loop to process multiple test cases
while (true) {
  // Read the number of entries for the current test case
  // The `-0` converts the string to a number.
  var entryCount = Number(lineData.shift());

  // If the entry count is 0, it signifies the end of input
  if (entryCount === 0) {
    break;
  }

  // Array to store the start and end times in seconds for each entry
  var timeSlots = [];

  // Loop through each entry for the current test case
  while (entryCount--) {
    // Extract time strings (e.g., "HH:MM:SS HH:MM:SS")
    var timeStrings = lineData.shift().split(' ');

    // Parse start time components (hours, minutes, seconds)
    var startComponents = timeStrings[0].split(':').map(Number);
    // Parse end time components
    var endComponents = timeStrings[1].split(':').map(Number);

    // Convert start time to total seconds from midnight
    var startTimeSec = startComponents[0] * 3600 + startComponents[1] * 60 + startComponents[2];
    // Convert end time to total seconds from midnight
    var endTimeSec = endComponents[0] * 3600 + endComponents[1] * 60 + endComponents[2];

    // Add the converted time slot to the array
    timeSlots.push([startTimeSec, endTimeSec]);
  }

  // Sort the time slots based on their start times in ascending order
  timeSlots.sort(function(itemA, itemB) {
    return itemA[0] - itemB[0];
  });

  // Array to keep track of the end times of currently occupied tracks
  var availableTracks = [];
  // Counter for the minimum number of tracks required
  var requiredTracks = 0;

  // Iterate over each sorted time slot
  timeSlots.forEach(function(currentSlot) {
    // If no tracks are currently occupied, assign a new track
    if (availableTracks.length === 0) {
      requiredTracks++;
      availableTracks.push(currentSlot[1]); // Add the end time of this slot to available tracks
    } else {
      // Sort the available tracks by their end times to find the earliest available one
      availableTracks.sort(function(itemA, itemB) {
        return itemA - itemB;
      });

      // If the earliest available track finishes before or at the start of the current slot
      if (availableTracks[0] <= currentSlot[0]) {
        // Reuse that track: remove the old end time and add the new one
        availableTracks.shift();
        availableTracks.push(currentSlot[1]);
      } else {
        // No existing track can be reused, so a new track is needed
        requiredTracks++;
        availableTracks.push(currentSlot[1]); // Add the end time of this new slot
      }
    }
  });

  // Output the minimum number of tracks required for the current test case
  console.log(requiredTracks);
}
