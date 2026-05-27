const acquireInputContent = () => require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

const initializeInputSystem = (inputLines) => {
    let currentLineIndex = 0;
    const totalLines = inputLines.length;

    const fetchNextLine = () => {
        if (currentLineIndex >= totalLines) {
            throw new Error("No more input lines available.");
        }
        return inputLines[currentLineIndex++];
    };

    const hasMoreLines = () => currentLineIndex < totalLines;

    return { fetchNextLine, hasMoreLines };
};

const parseInteger = (inputString) => parseInt(inputString, 10);
const parseIntegerArray = (inputString) => inputString.split(" ").map(Number);

const inputReader = initializeInputSystem(acquireInputContent());

const readInt = () => parseInteger(inputReader.fetchNextLine());
const readIntArray = () => parseIntegerArray(inputReader.fetchNextLine());

const outputResult = (data) => console.log(data);
const outputError = (data) => console.error(data);

const processChallenge = () => {
    const initialParameters = readIntArray();
    const targetDamageThreshold = initialParameters[0];
    const spellCount = initialParameters[1];

    const spellData = [];
    for (let spellIndex = 0; spellIndex < spellCount; spellIndex++) {
        const currentSpellDetails = readIntArray();
        spellData.push([currentSpellDetails[0], currentSpellDetails[1]]);
    }

    const MAX_DAMAGE_CAP = 100000;
    const minManaRequired = Array(MAX_DAMAGE_CAP + 1); // Creates array with empty slots (undefined)
    minManaRequired[0] = 0; // 0 mana for 0 damage

    spellData.forEach(([spellDamageValue, spellManaCost]) => {
        for (let currentDamagePoint = 0; currentDamagePoint < targetDamageThreshold; currentDamagePoint++) {
            if (minManaRequired[currentDamagePoint] !== undefined) { // Check if currentDamagePoint is reachable
                const potentialDamage = currentDamagePoint + spellDamageValue;
                if (potentialDamage <= MAX_DAMAGE_CAP) {
                    const newManaCost = minManaRequired[currentDamagePoint] + spellManaCost;
                    if (minManaRequired[potentialDamage] === undefined || newManaCost < minManaRequired[potentialDamage]) {
                        minManaRequired[potentialDamage] = newManaCost;
                    }
                }
            }
        }
    });

    const UNREACHABLE_COST_SENTINEL = 1000000007;
    if (minManaRequired[MAX_DAMAGE_CAP] === undefined) {
        minManaRequired[MAX_DAMAGE_CAP] = UNREACHABLE_COST_SENTINEL;
    }

    for (let k = MAX_DAMAGE_CAP - 1; k >= 0; k--) {
        if (minManaRequired[k]) { // Original logic: 0 is falsy, positive numbers are truthy
            minManaRequired[k] = Math.min(minManaRequired[k], minManaRequired[k + 1]);
        } else { // This branch is taken if minManaRequired[k] is 0 or undefined
            minManaRequired[k] = minManaRequired[k + 1];
        }
    }

    outputResult(minManaRequired[targetDamageThreshold]);
};

processChallenge();
