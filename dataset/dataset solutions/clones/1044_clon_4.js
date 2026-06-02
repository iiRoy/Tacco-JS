let managedCollection;

function locateInsertionPoint(collectionReference, valueToLocate) {
    let lowerBound = 0;
    let upperBound = collectionReference.length;
    while (lowerBound < upperBound) {
        const middleIndex = Math.floor((lowerBound + upperBound) / 2);
        if (collectionReference[middleIndex] < valueToLocate) {
            lowerBound = middleIndex + 1;
        } else {
            upperBound = middleIndex;
        }
    }
    return lowerBound;
}

class SortedStringStore {
    #elements;

    constructor() {
        this.#elements = [];
    }

    add(newEntry) {
        if (this.#elements.length === 0) {
            this.#elements.push(newEntry);
            return;
        }

        const insertionSpot = locateInsertionPoint(this.#elements, newEntry);

        if (insertionSpot < this.#elements.length && this.#elements[insertionSpot] === newEntry) {
            return;
        }

        this.#elements = [
            ...this.#elements.slice(0, insertionSpot),
            newEntry,
            ...this.#elements.slice(insertionSpot)
        ];
    }

    has(queryEntry) {
        if (this.#elements.length === 0) {
            return false;
        }
        const potentialSpot = locateInsertionPoint(this.#elements, queryEntry);
        return potentialSpot < this.#elements.length && this.#elements[potentialSpot] === queryEntry;
    }
}

function ProcessCommands(rawInput) {
    const inputLines = rawInput.split("\n");
    const totalCommands = parseInt(inputLines[0], 10);

    managedCollection = new SortedStringStore();

    const insertAction = "insert";
    const findAction = "find";

    inputLines.slice(1, totalCommands + 1).reduce((_accumulator, currentCommandLine) => {
        const commandParts = currentCommandLine.split(" ");
        const actionType = commandParts[0];
        const targetString = commandParts[1];

        if (actionType === insertAction) {
            managedCollection.add(targetString);
        } else if (actionType === findAction) {
            if (managedCollection.has(targetString)) {
                console.log("yes");
            } else {
                console.log("no");
            }
        }
        return null;
    }, null);
}

ProcessCommands(require("fs").readFileSync("/dev/stdin", "utf8"));
