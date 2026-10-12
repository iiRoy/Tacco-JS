function isPalindrome(text) {
    if (text.length < 2) {
        return true;
    }

    const middle = Math.floor(text.length / 2);

    for (let offset = 0; offset < middle; offset++) {
        const oppositePosition = text.length - 1 - offset;

        if (
            text.charAt(offset) ===
            text.charAt(oppositePosition)
        ) {
            continue;
        }

        return false;
    }

    return true;
}