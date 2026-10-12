function encodeRepeatedCharacters(text) {
    if (text.length === 0) {
        return "";
    }

    const encodedGroups = [];
    let groupStart = 0;

    for (
        let groupEnd = 1;
        groupEnd <= text.length;
        groupEnd++
    ) {
        const groupContinues =
            groupEnd < text.length &&
            text[groupEnd] === text[groupStart];

        if (groupContinues) {
            continue;
        }

        const character = text[groupStart];
        const groupLength = groupEnd - groupStart;

        encodedGroups.push(
            character + String(groupLength)
        );

        groupStart = groupEnd;
    }

    return encodedGroups.join("");
}