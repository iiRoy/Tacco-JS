function assessPrefix(dataFeed) {
    const referenceChars = ['Y', 'A', 'K', 'I'];

    if (dataFeed.length < referenceChars.length) {
        console.log("No");
        return;
    }

    const isPrefixed = referenceChars.reduce((accumulator, currentRefChar, index) => {
        if (!accumulator) {
            return false;
        }
        return dataFeed.charAt(index) === currentRefChar;
    }, true);

    console.log(isPrefixed ? "Yes" : "No");
}

const fileService = require("fs");
const inputSource = "/dev/stdin";
const textFormat = "utf8";

const contentPayload = fileService.readFileSync(inputSource, textFormat);

assessPrefix(contentPayload);