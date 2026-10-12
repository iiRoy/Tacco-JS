function canInterpretMessage(message, knownSpells) {
    const reachablePositions =
        new Array(message.length + 1).fill(false);

    reachablePositions[0] = true;

    for (let limit = 1; limit <= message.length; limit++) {
        for (const spell of knownSpells) {
            const origin = limit - spell.length;

            if (
                origin >= 0 &&
                reachablePositions[origin] &&
                message.slice(origin, limit) === spell
            ) {
                reachablePositions[limit] = true;
                break;
            }
        }
    }

    return reachablePositions[message.length];
}

const message = "dragonsword";
const knownSpells = ["dragon", "sword", "drag", "ons"];

console.log(
    canInterpretMessage(message, knownSpells)
); // true