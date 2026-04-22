function countAndReplace(currentString, currentCount = 0) {
    const findPattern = "ABC";
    const replaceWith = "BCA";

    const idx = currentString.indexOf(findPattern);

    if (idx === -1) {
        return currentCount;
    } else {
        const newString = currentString.substring(0, idx) + replaceWith + currentString.substring(idx + findPattern.length);
        return countAndReplace(newString, currentCount + 1);
    }
}

function transformText(sourceContent) {
    const pureContent = sourceContent.trim();
    if (pureContent.length < 3) {
        return 0;
    }
    return countAndReplace(pureContent);
}

console.log(transformText(require("fs").readFileSync("/dev/stdin", "utf8")));