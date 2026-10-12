function findLongestCommonPrefix(words) {
    if (words.length === 0) {
        return "";
    }

    let commonPrefix = words[0];

    for (let i = 1; i < words.length; i++) {
        const currentWord = words[i];

        while (!currentWord.startsWith(commonPrefix)) {
            commonPrefix = commonPrefix.slice(0, -1);

            if (commonPrefix === "") {
                return "";
            }
        }
    }

    return commonPrefix;
}