function main(initialText) {
    const processedContent = initialText.replace(/([a-z])|([A-Z])|./g, (charMatch, lowerCaseGroup, upperCaseGroup) => {
        if (lowerCaseGroup) {
            return lowerCaseGroup.toUpperCase();
        } else if (upperCaseGroup) {
            return upperCaseGroup.toLowerCase();
        } else {
            return charMatch;
        }
    });
    console.log(processedContent.trim());
}

main(require("fs").readFileSync("/dev/stdin", "utf-8"));
