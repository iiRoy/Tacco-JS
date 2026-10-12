var teamName;
var teamStructure = {};
var memberRegistry = {};
var item; // This variable is declared globally to match the scope of 'element' in the original code.

// Read the entire content from standard input as a UTF-8 string.
var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Trim any leading/trailing whitespace from the file content and split it into an array of lines.
var lineBuffer = fileContent.trim().split("\n");

// Begin the main processing loop. This loop continues until a specific termination condition is met.
while (true) {
    // Extract the first line from the buffer, which represents the number of entries for the current group.
    var count = lineBuffer.shift();

    // If the extracted count is 0, it signifies the end of input, so break out of the loop.
    if (count == 0) {
        break;
    }

    // Iterate 'count' times to process each group definition.
    for (var idx = 0; idx < count; idx++) {
        // Get the next line, split it by a colon to separate the group name from its members.
        var lineParts = lineBuffer.shift().split(':');

        // Store the group name as a key and its members (split by comma) as an array value in the team structure.
        teamStructure[lineParts[0]] = lineParts[1].split(",");

        // If this is the very first group definition in the current block, set it as the starting team name.
        if (idx === 0) {
            teamName = lineParts[0];
        }
    }

    // Once all group definitions for the current block are parsed, initiate a depth-first search
    // starting from the determined initial team name to discover all unique members.
    exploreTeam(teamName);

    // Initialize a counter for the total number of unique members found.
    var totalMembers = 0;

    // Iterate through the keys (member names) in the member registry.
    for (var memberKey in memberRegistry) {
        // For each unique member found, increment the total count.
        ++totalMembers;
    }

    // Output the final count of unique members for the current block of input.
    console.log(totalMembers);

    // Reset the team structure and member registry for the next iteration of the main loop.
    teamStructure = {};
    memberRegistry = {};
}

/**
 * Performs a depth-first search (DFS) to traverse the team hierarchy and identify all individual members.
 * This function recursively explores sub-teams until it reaches individual members.
 * @param {string} currentTeamName The name of the team whose members are currently being processed.
 */
function exploreTeam(currentTeamName) {
    // Retrieve the list of direct members associated with the current team name.
    var currentMembers = teamStructure[currentTeamName];

    // Mark the current team as visited by clearing its member list in the team structure.
    // This prevents re-processing the same team and handles potential circular dependencies.
    teamStructure[currentTeamName] = [];

    // Loop through each direct member of the current team.
    for (var idx = 0; idx < currentMembers.length; idx++) {
        // Clean the member name by removing any trailing period followed by newline/carriage return characters.
        item = currentMembers[idx].replace(/[.](\r\n|\n|\r)/gm, "");

        // Check if the current item is a sub-team (i.e., it exists as a key in the team structure).
        if (teamStructure[item] !== undefined) {
            // If it's a sub-team, recursively call exploreTeam to process its members.
            exploreTeam(item);
        } else {
            // If it's not a sub-team, it's an individual member.
            // Check if this individual member is already in the member registry.
            // The original code redundantly applies replace here, which is preserved for Type II cloning.
            if (!memberRegistry.hasOwnProperty(item.replace(/[.](\r\n|\n|\r)/gm, ""))) {
                // If the member is not yet registered, add them to the registry.
                memberRegistry[item.replace(/[.](\r\n|\n|\r)/gm, "")] = true;
            }
        }
    }
}
