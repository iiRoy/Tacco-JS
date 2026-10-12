function encodeRepeatedCharacters(text) {
    if (text.length === 0) {
        return "";
    }

    let encodedText = "";
    let currentCharacter = text[0];
    let repetitionCount = 1;

    for (let i = 1; i < text.length; i++) {
        if (text[i] === currentCharacter) {
            repetitionCount++;
            continue;
        }

        encodedText +=
            currentCharacter +
            String(repetitionCount);

        currentCharacter = text[i];
        repetitionCount = 1;
    }

    encodedText +=
        currentCharacter +
        String(repetitionCount);

    return encodedText;
}