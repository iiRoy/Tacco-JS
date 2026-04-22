function verifyEquivalence(sourceContent) {
    let currentPart = "";
    const collectedParts = [];

    for (let index = 0; index < sourceContent.length; index++) {
        const character = sourceContent[index];
        if (character === ' ') {
            collectedParts.push(currentPart);
            currentPart = "";
        } else {
            currentPart += character;
        }
    }
    collectedParts.push(currentPart); 

    const firstQuantity = parseInt(collectedParts[0], 10) || 0;
    const secondQuantity = parseInt(collectedParts[1], 10) || 0;

    const outcomeGenerator = (condition) => condition ? 'Yes' : 'No';

    console.log(outcomeGenerator(firstQuantity === secondQuantity));
}

verifyEquivalence(require("fs").readFileSync("/dev/stdin", "utf8"));