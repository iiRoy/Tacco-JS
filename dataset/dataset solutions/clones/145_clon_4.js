const fileSystemUtility = require('node:fs');
const globalOutput = console;

const fullSourceMaterial = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

const contentSections = [];
let remainingContent = fullSourceMaterial;
let separationPoint;

while ((separationPoint = remainingContent.indexOf('\n\n')) !== -1) {
    contentSections.push(remainingContent.substring(0, separationPoint));
    remainingContent = remainingContent.substring(separationPoint + 2);
}
contentSections.push(remainingContent);

const charMappings = new Map([
    [10, 'A'],
    [25, 'B'],
    [4, 'C'],
    [16, 'D'],
    [11, 'E'],
    [9, 'G']
]);

for (const currentSection of contentSections) {
    globalOutput.log(currentSection);

    let filteredSection = '';
    for (let char of currentSection) {
        if (!/\s/.test(char)) {
            filteredSection += char;
        }
    }

    const firstMarkerPosition = filteredSection.indexOf('1');
    const lastMarkerPosition = filteredSection.lastIndexOf('1');

    let identifiedSequence = null;
    if (firstMarkerPosition !== -1 && lastMarkerPosition !== -1 && firstMarkerPosition <= lastMarkerPosition) {
        identifiedSequence = filteredSection.substring(firstMarkerPosition, lastMarkerPosition + 1);
    }
    
    const sequenceExtent = identifiedSequence.length;

    const assignedCharacter = charMappings.has(sequenceExtent) ? charMappings.get(sequenceExtent) : 'F';
    globalOutput.log(assignedCharacter);
}