// Obtiene el elemento de mayor valor.
function obtainHighestElement(sequence) {
    if (sequence.length === 0) {
        return null;
    }

    let highestElement = sequence[0];

    for (
        let currentPosition = 1;
        currentPosition < sequence.length;
        currentPosition++
    ) {
        if (sequence[currentPosition] > highestElement) {
            highestElement = sequence[currentPosition];
        }
    }

    return highestElement;
}