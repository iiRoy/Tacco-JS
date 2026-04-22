const fileSystem = require('fs');

// Fetch the entire content from standard input, decoded as UTF-8.
let rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Normalize the input: remove leading/trailing whitespace, then split into an array of lines.
let dataLinesArray = rawInputContent
  .trim()
  .split("\n");

// Process the initial line to extract configuration values.
// This line typically contains total count and a boundary value.
let configurationValues = dataLinesArray
    .shift()
    .split(" ")
    .map(Number);

// Extract the count of entities from the configuration.
let entityQuantity = configurationValues[0];

// Extract the upper boundary limit (L) from the configuration.
let upperBoundaryLimit = configurationValues[2];

// Initialize a collection to store each entity's operational state.
// Each state entry will be an array: [current_score, total_max_duration, initial_sequence_id].
let entityOperationalStates = [];

// Initialize a tracker for the entity currently holding the highest score.
// This array will hold: [index_of_leading_entity, highest_score_achieved].
let currentLeadingEntity = [0, 0];

// Initialize a counter for the total elapsed duration of the simulation.
let totalElapsedDuration = 0;

// Set up the initial state for each entity.
// All start with zero score, zero accumulated duration, and their original index.
for (let entityIterator = 0; entityIterator < entityQuantity; entityIterator++) {
  entityOperationalStates[entityIterator] = [0, 0, entityIterator];
}

// Append a final, synthesized event to ensure all durations are accounted for up to the limit.
// This event represents a state where entity 1 reaches the upper boundary with no score change.
dataLinesArray.push([1, upperBoundaryLimit, 0].join(" "));


// Process each event record from the input data.
dataLinesArray.forEach( function ( singleEventRecord ) {
  // Parse the event record into numerical components.
  let processedEventComponents = singleEventRecord
    .split(" ")
    .map(Number);

  // The index of the entity affected by this specific event.
  const affectedEntityIndex = processedEventComponents[0] - 1;
  // The moment in time when this event transpires.
  const eventOccurrenceMoment = processedEventComponents[1];
  // The incremental or decremental change to the entity's score.
  const scoreModificationValue = processedEventComponents[2];

  // Add the duration since the last event to the 'total_max_duration' of the
  // entity that was previously identified as the leader.
  entityOperationalStates[currentLeadingEntity[0]][1] += eventOccurrenceMoment - totalElapsedDuration;

  // Update the global simulation duration to reflect the current event's time.
  totalElapsedDuration = eventOccurrenceMoment;

  // Apply the score modification to the affected entity's current score.
  entityOperationalStates[affectedEntityIndex][0] += scoreModificationValue;

  // Logic to update the 'currentLeadingEntity' based on score modifications.
  if (scoreModificationValue > 0) {
    // If the affected entity's new score surpasses the current highest score,
    // it becomes the new leader.
    if (entityOperationalStates[affectedEntityIndex][0] > currentLeadingEntity[1]) {
      currentLeadingEntity = [affectedEntityIndex, entityOperationalStates[affectedEntityIndex][0]];
    }
    // If the new score equals the current highest, and its index is lower or equal,
    // it becomes the new leader (tie-breaking rule).
    else if (entityOperationalStates[affectedEntityIndex][0] === currentLeadingEntity[1] &&
             affectedEntityIndex <= currentLeadingEntity[0]) {
      currentLeadingEntity = [affectedEntityIndex, entityOperationalStates[affectedEntityIndex][0]];
    }
  }
  // If the score decreased AND the affected entity was the current leader,
  // a re-evaluation is necessary to find the new leader.
  else if (scoreModificationValue < 0 && currentLeadingEntity[0] === affectedEntityIndex) {
    let reEvaluatedHighestScore = 0;
    let newLeaderIdentifier = 0;

    // Iterate through all entities to discover the new entity with the maximum score.
    entityOperationalStates.forEach( (individualEntityState, entityOrdinal) => {
      if (reEvaluatedHighestScore < individualEntityState[0]) {
        newLeaderIdentifier = entityOrdinal;
        reEvaluatedHighestScore = individualEntityState[0];
      }
    });
    // Update the global tracker with the newly identified leading entity.
    currentLeadingEntity = [newLeaderIdentifier, entityOperationalStates[newLeaderIdentifier][0]];
  }
});


// Sort the entity operational states to determine the final ranking.
// Primary sort: 'total_max_duration' in descending order.
// Secondary sort (for ties): 'initial_sequence_id' in ascending order.
entityOperationalStates.sort( function ( firstComparableEntity, secondComparableEntity ) {
  // If accumulated durations are identical, use the original index for tie-breaking.
  if (firstComparableEntity[1] === secondComparableEntity[1]) {
    return firstComparableEntity[2] - secondComparableEntity[2];
  }
  // Otherwise, sort by accumulated duration in descending order (highest duration first).
  else {
    return secondComparableEntity[1] - firstComparableEntity[1];
  }
});

// Output the original sequence ID (plus one, as it's 0-indexed) of the top-ranked entity.
console.log(entityOperationalStates[0][2] + 1);