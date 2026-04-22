const getCharacterRemover = (charPattern) => {
    const pattern = charPattern === undefined ? '\\s' : charPattern;
    return new RegExp(`[${pattern}]`);
};

const stripPrefix = (sourceText, prefixChars) => {
    const charMatcher = getCharacterRemover(prefixChars);
    let startOffset = 0;
    while (startOffset < sourceText.length && charMatcher.test(sourceText[startOffset])) {
        startOffset++;
    }
    return sourceText.slice(startOffset);
};

const stripSuffix = (sourceText, suffixChars) => {
    const charMatcher = getCharacterRemover(suffixChars);
    let endOffset = sourceText.length - 1;
    while (endOffset >= 0 && charMatcher.test(sourceText[endOffset])) {
        endOffset--;
    }
    return sourceText.slice(0, endOffset + 1);
};

const stripBothEnds = (sourceText, endChars) => {
    return stripPrefix(stripSuffix(sourceText, endChars), endChars);
};

const hexDigitsMap = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

const byteToTwoHex = (inputByte) => {
    const highNibble = Math.floor(inputByte / 16);
    const lowNibble = inputByte % 16;
    return hexDigitsMap[highNibble] + hexDigitsMap[lowNibble];
};

const uint32ToEightHex = (inputVal) => {
    let resultHex = '';
    resultHex += byteToTwoHex((inputVal >>> 24) & 0xFF);
    resultHex += byteToTwoHex((inputVal >>> 16) & 0xFF);
    resultHex += byteToTwoHex((inputVal >>> 8) & 0xFF);
    resultHex += byteToTwoHex(inputVal & 0xFF);
    return resultHex;
};

const pageRankSalt = "This is a secret salt for the PageRank hash function, do not share!";
const ROTATE_SHIFT_VAL = 23;

const rotateRight32 = (num, shift) => {
    const effectiveShift = shift % 32;
    if (effectiveShift === 0) return num;
    const leftPart = num >>> effectiveShift;
    const rightPart = num << (32 - effectiveShift);
    return (leftPart | rightPart) >>> 0;
};

const computePageRankDigest = (inputString) => {
    const initialDigestValue = 0x01020305;
    
    const charCodes = Array.from(inputString).map(c => c.charCodeAt(0));

    const finalDigestValue = charCodes.reduce((accumulator, currentCharCode, index) => {
        const saltChar = pageRankSalt.charCodeAt(index % pageRankSalt.length);
        const intermediateResult = accumulator ^ saltChar ^ currentCharCode;
        return rotateRight32(intermediateResult, ROTATE_SHIFT_VAL);
    }, initialDigestValue);

    return uint32ToEightHex(finalDigestValue);
};

const retrieveRatingForAddress = (webAddress) => {
    let relevantPathSegment;
    try {
        const hashRemoved = webAddress.split("#")[0];
        const protocolStripped = hashRemoved.split("//")[1];
        relevantPathSegment = protocolStripped || hashRemoved; // Fallback if no protocol
    } catch (e) {
        relevantPathSegment = webAddress;
    }

    const computedHash = computePageRankDigest(relevantPathSegment);
    
    const queryBase = "http://toolbarqueries.google.com/tbr?client=navclient-auto&ch=8";
    const infoParam = "info:" + relevantPathSegment;
    const fullQueryUrl = `${queryBase}${computedHash}&features=Rank&q=${infoParam}`;

    let pageRatingOutcome = "N/A";

    const httpAgent = new XMLHttpRequest();
    httpAgent.open("GET", fullQueryUrl, false);
    httpAgent.send();

    const receivedText = httpAgent.responseText;

    if (receivedText.length < 15) {
        try {
            const parts = receivedText.split(":");
            if (parts.length > 2) {
                pageRatingOutcome = parts[2].split("\n")[0];
            } else {
                pageRatingOutcome = "N/A";
            }
        } catch (parseError) {
            console.warn("PageRank response parsing error for short text:", receivedText, parseError);
            pageRatingOutcome = "N/A";
        }
    } else {
        pageRatingOutcome = "0";
    }
    
    return stripBothEnds(pageRatingOutcome);
};

const browserInterface = chrome.browserAction;

const alterBadgeText = (messageContent, targetTabId) => {
    browserInterface.setBadgeText({
        'text': messageContent,
        'tabId': targetTabId
    });
};

const adjustIconImage = (imagePath, targetTabId) => {
    console.log("Setting icon to:", imagePath);
    browserInterface.setIcon({
        'path': imagePath,
        'tabId': targetTabId
    });
};

let lastKnownAddress = "";
let currentActiveAddress = "";

chrome.tabs.onUpdated.addListener((identifierForTab, infoOnChanges, tabDetails) => {
    if (!tabDetails.url || tabDetails.url.startsWith("chrome://")) {
        return;
    }

    const currentTabRating = retrieveRatingForAddress(tabDetails.url);
    
    alterBadgeText(currentTabRating, tabDetails.id);
    
    adjustIconImage("images/" + currentTabRating + ".png", tabDetails.id);
});