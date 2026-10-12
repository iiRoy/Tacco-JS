function verifyAncientText(text, vocabulary) {
    const spellBook = new Set(vocabulary);
    const validPosition = Array(text.length + 1).fill(false);

    validPosition[0] = true;

    for (let beginning = 0; beginning < text.length; beginning++) {
        if (validPosition[beginning] === false) {
            continue;
        }

        let ending = beginning + 1;

        while (ending <= text.length) {
            const fragment = text.substring(beginning, ending);

            if (spellBook.has(fragment)) {
                validPosition[ending] = true;
            }

            ending++;
        }
    }

    if (validPosition[text.length]) {
        return true;
    }

    return false;
}

const ancientText = "dragonsword";
const vocabulary = ["dragon", "sword", "drag", "ons"];

console.log(verifyAncientText(ancientText, vocabulary)); // true