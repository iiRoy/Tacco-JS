function parseNumericLine(lineContent) {
    return lineContent.split(' ').map(segment => parseInt(segment, 10));
}

function calculateMinimumGroups(rawInputData) {
    const inputLines = rawInputData.split('\n');

    const firstLineParsed = parseNumericLine(inputLines[0]);
    const totalItems = firstLineParsed[0];
    const initialGroupCount = firstLineParsed[1];

    // The 'As' array is parsed in the original but not used in the calculation.
    // We maintain this behavior by parsing it.
    const itemValues = parseNumericLine(inputLines[1]);

    // Intermediate calculations for clarity and structural modification
    const itemsBeyondInitial = totalItems - initialGroupCount;
    const effectiveCapacityPerNewGroup = initialGroupCount - 1;

    let groupsToAddFraction;

    // Preserve division by zero behavior (Infinity/NaN)
    if (effectiveCapacityPerNewGroup === 0) {
        groupsToAddFraction = itemsBeyondInitial / effectiveCapacityPerNewGroup;
    } else {
        groupsToAddFraction = itemsBeyondInitial / effectiveCapacityPerNewGroup;
    }

    const additionalGroupsCeiled = Math.ceil(groupsToAddFraction);
    const minimumGroupsRequired = additionalGroupsCeiled + 1;

    console.log(minimumGroupsRequired);
}

const STD_IN_PATH = '/dev/stdin';
const fileSystemModule = require('fs');

const inputContent = fileSystemModule.readFileSync(STD_IN_PATH, 'utf8');
calculateMinimumGroups(inputContent);
