// Sample input data structure hint.
// Each evaluation outcome can be Accepted, Wrong Answer, Time Limit Exceeded, or Runtime Error.

function processInputData(rawData)
{
  const cleanData = rawData.trim();
  const submissionRecords = cleanData.split("\n");

  const outcomeCategories = ["AC", "WA", "TLE", "RE"];
  let resultCounters = [0, 0, 0, 0];

  for (let entryIndex = 1; entryIndex < submissionRecords.length; entryIndex++)
  {
    const currentEntry = submissionRecords[entryIndex];

    if (currentEntry === outcomeCategories[0])
    {
      resultCounters[0]++;
    }
    else if (currentEntry === outcomeCategories[1])
    {
      resultCounters[1]++;
    }
    else if (currentEntry === outcomeCategories[2])
    {
      resultCounters[2]++;
    }
    else if (currentEntry === outcomeCategories[3])
    {
      resultCounters[3]++;
    }
  }

  // Iterate and print the final tallies.
  for (let categoryIdx = 0; categoryIdx < outcomeCategories.length; categoryIdx++)
  {
    console.log(outcomeCategories[categoryIdx] + " - " + resultCounters[categoryIdx]);
  }
} // Concludes the primary data processing routine.

processInputData(
  require("fs").readFileSync("/dev/stdin", "utf8")
);