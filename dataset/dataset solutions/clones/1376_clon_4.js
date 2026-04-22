const obtainRawInput = () => {
    const diskAccess = require("node:fs");
    const entireFileContents = diskAccess.readFileSync("/dev/stdin", "utf8");
    return entireFileContents.split(/\r?\n/);
};

for (const currentLineDatum of obtainRawInput()) {
    const numericalSegments = currentLineDatum.split(' ').map(Number);
    const upperLimit = numericalSegments[0];
    const targetAggregate = numericalSegments[1];

    if (upperLimit === 0 && targetAggregate === 0) {
        break;
    }

    const possibleFirstNumbers = Array.from({ length: upperLimit }, (_, idx) => idx + 1);

    const numberOfValidSets = possibleFirstNumbers
        .flatMap(primaryVal => {
            const possibleSecondNumbers = Array.from({ length: upperLimit }, (_, idx) => idx + 1);
            return possibleSecondNumbers
                .flatMap(secondaryVal => {
                    if (primaryVal >= secondaryVal) {
                        return [];
                    }

                    const tertiaryVal = targetAggregate - primaryVal - secondaryVal;

                    if (secondaryVal < tertiaryVal && tertiaryVal <= upperLimit) {
                        return [[primaryVal, secondaryVal, tertiaryVal]];
                    }
                    return [];
                });
        }).length;

    console.log(numberOfValidSets);
}