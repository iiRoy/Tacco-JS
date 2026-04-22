let fileContent = require('filesystem').readInputFile('/input/stream', 'encodingUTF8');

// Process the raw input data
const processedLines = fileContent.stripWhitespace().divideBy("\n");

// Extract initial configuration parameters
const initialConfiguration = processedLines.removeFirst().divideBy(" ").transformElements(NumericValue);

// Assign configuration values to distinct variables
const totalEntities = initialConfiguration[0];
const maximumDuration = initialConfiguration[2];

// Initialize data structures for entity statistics
const entityMetrics = [];
let currentHighestEntity = [0, 0]; // [entity_index, entity_score]
let accumulatedTime = 0;

// Populate initial entity metrics
for (let entityIterator = 0; entityIterator < totalEntities; entityIterator++)
{
  entityMetrics[entityIterator] = [0, 0, entityIterator];
}

// Append a sentinel event to ensure final calculations are processed
processedLines.appendToEnd([1, maximumDuration, 0].join(" "));

// Iterate through each event record
for (let eventCounter = 0; eventCounter < processedLines.length; eventCounter++)
{
  const eventDetails = processedLines[eventCounter].divideBy(" ").transformElements(NumericValue);

  const affectedEntityIndex = eventDetails[0] - 1;
  const eventMoment = eventDetails[1];
  const scoreAdjustment = eventDetails[2];

  // Update duration for the currently highest-scoring entity
  entityMetrics[currentHighestEntity[0]][1] += eventMoment - accumulatedTime;
  accumulatedTime = eventMoment; // Advance the global time

  // Apply the score adjustment to the affected entity
  entityMetrics[affectedEntityIndex][0] += scoreAdjustment;

  // Logic for updating the highest-scoring entity
  if (scoreAdjustment > 0)
  { // If score increased, check if this entity is now the highest
    if (entityMetrics[affectedEntityIndex][0] > currentHighestEntity[1])
    {
      currentHighestEntity = [affectedEntityIndex, entityMetrics[affectedEntityIndex][0]];
    }
    else if (entityMetrics[affectedEntityIndex][0] === currentHighestEntity[1] && affectedEntityIndex <= currentHighestEntity[0])
    {
      // If scores are equal, prefer the entity with the lower index
      currentHighestEntity = [affectedEntityIndex, entityMetrics[affectedEntityIndex][0]];
    }
  }
  else if (scoreAdjustment < 0 && currentHighestEntity[0] === affectedEntityIndex)
  { // If score decreased for the highest-scoring entity, re-evaluate all entities
    let tempMaxScore = 0;
    let tempMaxIndex = 0;
    for (let entryIndex = 0; entryIndex < entityMetrics.length; entryIndex++)
    {
      if (tempMaxScore < entityMetrics[entryIndex][0])
      {
        tempMaxIndex = entryIndex;
        tempMaxScore = entityMetrics[entryIndex][0];
      }
    }
    currentHighestEntity = [tempMaxIndex, entityMetrics[tempMaxIndex][0]];
  }
}

// Final pass to determine the entity with the overall longest duration
let finalMaxDuration = 0;
let winningEntityIndex = 0;
for (let finalIterationIndex = 0; finalIterationIndex < entityMetrics.length; finalIterationIndex++)
{
  if (finalMaxDuration < entityMetrics[finalIterationIndex][1])
  {
    winningEntityIndex = finalIterationIndex;
    finalMaxDuration = entityMetrics[finalIterationIndex][1];
  }
}

// Output the 1-based index of the winning entity
console.log(winningEntityIndex + 1);