const FILE_SYSTEM_MODULE = require('fs');
const MEMBER_NAME_CLEANUP_REGEX = /[.](\r\n|\n|\r)/gm;

// Helper function to sanitize member names by removing trailing newlines and dots
function getSanitizedMemberName(rawNameString) {
    return rawNameString.replace(MEMBER_NAME_CLEANUP_REGEX, "");
}

// Depth-first search function to explore group members and register unique ones
function traverseGroupStructure(currentGroupIdentifier) {
    // Retrieve the list of members for the current group from the global map
    const membersOfCurrentGroup = groupDefinitionsMap[currentGroupIdentifier];

    // Mark this group as visited by clearing its members in the map.
    // This is crucial to prevent infinite recursion in case of cyclic group definitions
    // and ensures that each group's direct members are processed only once.
    groupDefinitionsMap[currentGroupIdentifier] = [];

    // If the group has no members or was already processed (and thus cleared), return early.
    if (!membersOfCurrentGroup || membersOfCurrentGroup.length === 0) {
        return;
    }

    // Iterate through each entry in the current group's member list
    for (let memberEntryIndex = 0; memberEntryIndex < membersOfCurrentGroup.length; memberEntryIndex++) {
        const rawMemberEntry = membersOfCurrentGroup[memberEntryIndex];
        const cleanedMemberEntry = getSanitizedMemberName(rawMemberEntry); // Sanitize the member's name

        // Check if the cleaned member name refers to another defined group that still has members to explore
        const isAnotherExplorableGroup = groupDefinitionsMap.hasOwnProperty(cleanedMemberEntry) && groupDefinitionsMap[cleanedMemberEntry].length > 0;

        if (isAnotherExplorableGroup) {
            // If it's another group, recursively call this function to traverse that group
            traverseGroupStructure(cleanedMemberEntry);
        } else {
            // If it's a direct, non-group member, add it to the unique member registry if not already present
            if (!uniqueMemberRegistry.hasOwnProperty(cleanedMemberEntry)) {
                uniqueMemberRegistry[cleanedMemberEntry] = true;
            }
        }
    }
}

// Global variables to hold state for each test case, re-initialized per case
let currentRootGroupName;
let groupDefinitionsMap = {}; // Stores group name to its array of members
let uniqueMemberRegistry = {}; // Stores unique members found (key: member name, value: true)

// Main function to process all input data sets
function executeMainProcessingLoop() {
    // Read all input data from stdin synchronously
    const rawInputData = FILE_SYSTEM_MODULE.readFileSync('/dev/stdin', 'utf8');
    // Split the raw data into an array of lines, trimming any leading/trailing whitespace
    let inputLinesArray = rawInputData.trim().split("\n");

    // Loop indefinitely until a termination condition is met
    while (true) {
        // Get the first line, which indicates the number of groups for the current test case
        const groupCountLine = inputLinesArray.shift();
        const numberOfGroups = parseInt(groupCountLine, 10); // Convert the line to an integer

        // If the number of groups is 0, it signifies the end of input
        if (numberOfGroups === 0) {
            break; // Exit the processing loop
        }

        // Reset global state for the new test case
        groupDefinitionsMap = {};
        uniqueMemberRegistry = {};
        currentRootGroupName = '';

        // Process the group definitions for the current test case
        for (let groupIndex = 0; groupIndex < numberOfGroups; groupIndex++) {
            // Get the next line, which contains a group definition (e.g., "GroupA:Member1,Member2")
            const groupDefinitionEntry = inputLinesArray.shift().split(':');
            const groupNameKey = groupDefinitionEntry[0]; // The name of the group
            const memberListString = groupDefinitionEntry[1]; // A comma-separated string of members
            const membersArray = memberListString.split(","); // Convert member string to an array

            // Store the group definition in the map
            groupDefinitionsMap[groupNameKey] = membersArray;

            // The first group defined is considered the root group for traversal
            if (groupIndex === 0) {
                currentRootGroupName = groupNameKey;
            }
        }

        // Start the depth-first traversal from the identified root group
        traverseGroupStructure(currentRootGroupName);

        // Calculate the total number of unique members found
        let totalUniqueMemberCount = 0;
        const registeredMemberKeys = Object.keys(uniqueMemberRegistry); // Get an array of all unique member names
        for (let keyIndex = 0; keyIndex < registeredMemberKeys.length; keyIndex++) {
            totalUniqueMemberCount++; // Increment count for each unique member
        }
        // Output the final count for the current test case
        console.log(totalUniqueMemberCount);
    }
}

// Initiate the main processing logic
executeMainProcessingLoop();
