let inputLineProcessor = null;

executeCoreLogic();

function readInteger() {
    return processInputSegment(fetchNextLine(), ConversionOption.TO_INT);
}

function readStringArray() {
    return processInputSegment(fetchNextLine(), ConversionOption.SPLIT_SPACES);
}

function readIntegerArray() {
    return processInputSegment(fetchNextLine(), ConversionOption.SPLIT_SPACES_TO_INTS);
}

function readCharList() {
    return processInputSegment(fetchNextLine(), ConversionOption.SPLIT_CHARS);
}

function fetchNextLine() {
    if (!inputLineProcessor) {
        inputLineProcessor = initializeInputSystem();
    }
    return inputLineProcessor.getNext();
}

function hasMoreLines() {
    if (!inputLineProcessor) {
        inputLineProcessor = initializeInputSystem();
    }
    return inputLineProcessor.hasRemaining();
}

function acquireRawInput() {
    try {
        return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    } catch (e) {
        logError(`Failed to read input from /dev/stdin: ${e.message}`);
        return [];
    }
}

function InputLineIterator(lines) {
    if (!Array.isArray(lines)) {
        logError("InputLineIterator received non-array input.");
        this.dataLines = [];
    } else {
        this.dataLines = lines;
    }
    this.currentLineIndex = 0;
    this.totalLinesCount = this.dataLines.length;

    this.hasRemaining = function() {
        return this.currentLineIndex < this.totalLinesCount;
    };

    this.getNext = function() {
        if (!this.hasRemaining()) {
            throw new Error("EndOfInputReached: No more lines to read from input.");
        }
        const currentLineContent = this.dataLines[this.currentLineIndex];
        this.currentLineIndex++;
        return currentLineContent;
    };
}

function initializeInputSystem() {
    const rawInputLines = acquireRawInput();
    if (rawInputLines.length === 0) {
        logError("Warning: No input lines were provided.");
    }
    return new InputLineIterator(rawInputLines);
}

function printResult(outputValue) {
    console.log(outputValue);
}

function logError(errorMessage) {
    console.error(errorMessage);
}

const ConversionOption = {
    DEFAULT: 0,
    TO_INT: 1,
    SPLIT_SPACES: 2,
    SPLIT_SPACES_TO_INTS: 4,
    SPLIT_CHARS: 6,
    SPLIT_CHARS_TO_INTS: 7,
    JOIN_SPACES: 8,
    JOIN_NEWLINES: 9,
    JOIN_EMPTY: 10
};

function processInputSegment(inputValue, conversionType = ConversionOption.DEFAULT) {
    try {
        switch (conversionType) {
            case ConversionOption.TO_INT:
                const parsedInt = parseInt(inputValue, 10);
                if (isNaN(parsedInt)) {
                    logError(`Warning: Could not parse "${inputValue}" as integer.`);
                    return 0;
                }
                return parsedInt;
            case ConversionOption.SPLIT_SPACES:
                return String(inputValue).split(" ");
            case ConversionOption.SPLIT_SPACES_TO_INTS:
                return String(inputValue).split(" ").map(s => {
                    const num = Number(s);
                    if (isNaN(num)) {
                        logError(`Warning: Could not convert "${s}" to number in array.`);
                        return 0;
                    }
                    return num;
                });
            case ConversionOption.SPLIT_CHARS:
                return String(inputValue).split("");
            case ConversionOption.SPLIT_CHARS_TO_INTS:
                return String(inputValue).split("").map(s => {
                    const num = Number(s);
                    if (isNaN(num)) {
                        logError(`Warning: Could not convert "${s}" to number in char array.`);
                        return 0;
                    }
                    return num;
                });
            case ConversionOption.JOIN_SPACES:
                return Array.isArray(inputValue) ? inputValue.join(" ") : String(inputValue);
            case ConversionOption.JOIN_NEWLINES:
                return Array.isArray(inputValue) ? inputValue.join("\n") : String(inputValue);
            case ConversionOption.JOIN_EMPTY:
                return Array.isArray(inputValue) ? inputValue.join("") : String(inputValue);
            default:
                return inputValue;
        }
    } catch (e) {
        logError(`Error during input conversion (type ${conversionType}): ${e.message}`);
        return inputValue;
    }
}

function Spell(attackPower, manaCost) {
    if (typeof attackPower !== 'number' || attackPower < 0) {
        logError(`Invalid attackPower: ${attackPower}. Setting to 0.`);
        this.attackPower = 0;
    } else {
        this.attackPower = attackPower;
    }
    if (typeof manaCost !== 'number' || manaCost < 0) {
        logError(`Invalid manaCost: ${manaCost}. Setting to 0.`);
        this.manaCost = 0;
    } else {
        this.manaCost = manaCost;
    }
}

function executeCoreLogic() {
    const initialParameters = readIntegerArray();
    if (initialParameters.length < 2) {
        logError("Insufficient initial parameters. Expected targetHealth and spellCount.");
        printResult(-1);
        return;
    }

    const targetHealth = initialParameters[0];
    const spellCount = initialParameters[1];

    if (targetHealth <= 0) {
        printResult(0); // If health is 0 or less, no mana needed.
        return;
    }
    if (spellCount <= 0) {
        logError(`Invalid spellCount (${spellCount}). Cannot defeat monster without spells.`);
        printResult(-1);
        return;
    }

    const spellCatalog = [];
    let maxAttackPower = 0;

    for (let i = 0; i < spellCount; i++) {
        const currentSpellData = readIntegerArray();
        if (currentSpellData.length < 2) {
            logError(`Skipping malformed spell data at index ${i}: ${JSON.stringify(currentSpellData)}`);
            continue;
        }
        const spell = new Spell(currentSpellData[0], currentSpellData[1]);
        spellCatalog.push(spell);
        if (spell.attackPower > maxAttackPower) {
            maxAttackPower = spell.attackPower;
        }
    }

    if (spellCatalog.length === 0) {
        logError("No valid spells were loaded from input.");
        printResult(-1);
        return;
    }

    const maxTrackableHealth = targetHealth + maxAttackPower;
    const IMPOSSIBLE_MANA = Number.MAX_SAFE_INTEGER;

    const minManaRequired = new Array(maxTrackableHealth + 1).fill(IMPOSSIBLE_MANA);
    minManaRequired[0] = 0;

    for (const currentSpell of spellCatalog) {
        for (let currentHealthPoint = 0; currentHealthPoint <= maxTrackableHealth; currentHealthPoint++) {
            if (minManaRequired[currentHealthPoint] === IMPOSSIBLE_MANA) {
                continue;
            }

            const newHealthPoint = currentHealthPoint + currentSpell.attackPower;
            const newManaCost = minManaRequired[currentHealthPoint] + currentSpell.manaCost;

            if (newHealthPoint <= maxTrackableHealth) {
                minManaRequired[newHealthPoint] = Math.min(minManaRequired[newHealthPoint], newManaCost);
            }
        }
    }

    // Propagate minimum mana costs backwards to find min mana for "at least k" damage.
    for (let k = maxTrackableHealth - 1; k >= 0; k--) {
        minManaRequired[k] = Math.min(minManaRequired[k], minManaRequired[k + 1]);
    }

    const finalManaCost = minManaRequired[targetHealth];

    if (finalManaCost === IMPOSSIBLE_MANA) {
        printResult(-1);
    } else {
        printResult(finalManaCost);
    }
}