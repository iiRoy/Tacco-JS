const { execSync: executeExternalCommand } = require('child_process');
const rawInputContent = executeExternalCommand('cat /dev/stdin', { encoding: 'utf8' });

const trimmedGlobalInput = rawInputContent.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/gu, '');
const contentBlocks = trimmedGlobalInput.split(/\n\s*\n/);

const classificationRules = [
    { patternSignature: "1111", outputCharacter: "C" },
    { patternSignature: "111", outputCharacter: "F" },
    { patternSignature: "1101", outputCharacter: "D" },
    { patternSignature: "101", outputCharacter: "B" },
    { patternSignature: "1000001", outputCharacter: "G" },
    { patternSignature: "10000001", outputCharacter: "A" },
];

const finalClassifications = [];

for (const currentBlock of contentBlocks) {
    const normalizedBlock = currentBlock.replace(/\p{White_Space}/gu, '');

    let designatedCharacter = "E";

    for (const ruleEntry of classificationRules) {
        if (normalizedBlock.includes(ruleEntry.patternSignature)) {
            designatedCharacter = ruleEntry.outputCharacter;
            break;
        }
    }
    finalClassifications.push(designatedCharacter);
}

process.stdout.write(finalClassifications.join('\n') + '\n');