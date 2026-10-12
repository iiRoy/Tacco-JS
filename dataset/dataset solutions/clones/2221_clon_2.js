function verifySymmetry(characterSequence) {
    let startingPosition = 0;
    let endingPosition = characterSequence.length - 1;

    while (startingPosition < endingPosition) {
        if (
            characterSequence[startingPosition] !==
            characterSequence[endingPosition]
        ) {
            return false;
        }

        startingPosition++;
        endingPosition--;
    }

    return true;
}