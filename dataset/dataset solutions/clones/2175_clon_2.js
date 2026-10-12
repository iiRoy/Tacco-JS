function containSameLetters(leftText, rightText) {
    if (leftText.length !== rightText.length) {
        return false;
    }

    const letterAmounts = {};

    for (let position = 0; position < leftText.length; position++) {
        const currentLetter = leftText[position];
        letterAmounts[currentLetter] =
            (letterAmounts[currentLetter] || 0) + 1;
    }

    for (let position = 0; position < rightText.length; position++) {
        const currentLetter = rightText[position];

        if (!letterAmounts[currentLetter]) {
            return false;
        }

        letterAmounts[currentLetter]--;
    }

    return true;
}