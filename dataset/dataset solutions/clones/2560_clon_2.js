// This core routine orchestrates the evaluation of game outcomes based on provided data.
function ProcessGameResults(rawData) {

    // Begin by segmenting the entire input block into an array,
    // where each element represents a distinct line of information.
    let linesOfData = rawData.split("\n");

    // The inaugural line of the input stream typically contains
    // critical configuration parameters for the game:
    // N (the count of all competing entities),
    // K (the initial point allocation for each entity), and
    // Q (the penalty points subtracted for each incorrect query).
    const gameConfigValues = linesOfData[0].split(" ").map(Number);

    // For enhanced readability, let's assign these configuration values
    // to distinct, descriptive constants.
    const totalCompetitors = gameConfigValues[0];      // Represents N
    const initialScorePerCompetitor = gameConfigValues[1]; // Represents K
    const pointDeductionPerRound = gameConfigValues[2]; // Represents Q

    // Construct a new array to meticulously track the scores of every competitor.
    // The array's dimension is `totalCompetitors + 1` to accommodate
    // 1-based indexing for competitor IDs, leaving index 0 unused.
    // Each competitor's score is initialized to `initialScorePerCompetitor - pointDeductionPerRound`.
    let competitorScoreRegister = new Array(totalCompetitors + 1).fill(
        initialScorePerCompetitor - pointDeductionPerRound
    );

    // Having processed the configuration line, it is now expendable.
    // We remove it from our `linesOfData` array to focus on subsequent data.
    linesOfData.shift();

    // Traverse through the remaining data lines. Each line signifies
    // a competitor's identification number, indicating they successfully
    // answered a question or performed a positive action.
    linesOfData.forEach(function(competitorId) {
        // For each successful action, increment the corresponding competitor's score.
        competitorScoreRegister[competitorId]++;
    });

    // The element at index 0 of `competitorScoreRegister` was intentionally left unused.
    // We now discard it, as it holds no relevant score information for any actual competitor.
    competitorScoreRegister.shift();

    // Finally, iterate through the adjusted scores of all participants.
    // For every competitor, determine if their final score is at least one.
    competitorScoreRegister.forEach(function(finalAchievementPoints) {
        // Output "Yes" if the competitor's final score is one or greater,
        // signifying a positive outcome; otherwise, output "No".
        console.log(finalAchievementPoints >= 1 ? "Yes" : "No");
    });
}

// Initiate the entire game result processing pipeline.
// This involves reading the raw input from the standard input stream,
// decoding it as UTF-8, and then stripping any extraneous leading or
// trailing whitespace before passing it to our main processing function.
ProcessGameResults(require("fs").readFileSync("/dev/stdin", "utf8").trim());