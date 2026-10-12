function exploreMagicalPaths(inscription, runes) {
    const pendingPositions = [0];
    const exploredPositions = new Set([0]);
    let queueIndex = 0;

    while (queueIndex < pendingPositions.length) {
        const currentPosition = pendingPositions[queueIndex];
        queueIndex++;

        if (currentPosition === inscription.length) {
            return true;
        }

        for (const rune of runes) {
            const matchesHere =
                inscription.startsWith(rune, currentPosition);

            if (!matchesHere) {
                continue;
            }

            const nextPosition = currentPosition + rune.length;

            if (nextPosition === inscription.length) {
                return true;
            }

            if (!exploredPositions.has(nextPosition)) {
                exploredPositions.add(nextPosition);
                pendingPositions.push(nextPosition);
            }
        }
    }

    return false;
}

const inscription = "dragonsword";
const runes = ["dragon", "sword", "drag", "ons"];

console.log(exploreMagicalPaths(inscription, runes)); // true