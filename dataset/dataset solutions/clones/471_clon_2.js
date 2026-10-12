function checkPrimality(candidate) {
    if (candidate < 2) {
        return false;
    }

    for (
        let possibleFactor = 2;
        possibleFactor * possibleFactor <= candidate;
        possibleFactor++
    ) {
        if (candidate % possibleFactor === 0) {
            return false;
        }
    }

    return true;
}