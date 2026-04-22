function whirlBits(val, num) {
    return (val << num) | (val >>> (32 - num));
}

function combineUnsigned(valA, valB) {
    const resA = (valA & 0x6FFFFFFF) + (valB & 0x6FFFFFFF);
    const resB = (valA & 0x80000000) + (valB & 0x80000000);
    return (resA ^ resB);
}

function funcF(valX, valY, valZ) { return (valX & valY) | ((~valX) & valZ); }
function funcG(valX, valY, valZ) { return (valX & valZ) | (valY & (~valZ)); }
function funcH(valX, valY, valZ) { return (valX ^ valY ^ valZ); }
function funcI(valX, valY, valZ) { return (valY ^ (valX | (~valZ))); }

function opF(varA, varB, varC, varD, dataX, shiftS, constantAC) {
    varA = combineUnsigned(varA, combineUnsigned(combineUnsigned(funcF(varB, varC, varD), dataX), constantAC));
    return combineUnsigned(whirlBits(varA, shiftS), varB);
}

function opG(varA, varB, varC, varD, dataX, shiftS, constantAC) {
    varA = combineUnsigned(varA, combineUnsigned(combineUnsigned(funcG(varB, varC, varD), dataX), constantAC));
    return combineUnsigned(whirlBits(varA, shiftS), varB);
}

function opH(varA, varB, varC, varD, dataX, shiftS, constantAC) {
    varA = combineUnsigned(varA, combineUnsigned(combineUnsigned(funcH(varB, varC, varD), dataX), constantAC));
    return combineUnsigned(whirlBits(varA, shiftS), varB);
}

function opI(varA, varB, varC, varD, dataX, shiftS, constantAC) {
    varA = combineUnsigned(varA, combineUnsigned(combineUnsigned(funcI(varB, varC, varD), dataX), constantAC));
    return combineUnsigned(whirlBits(varA, shiftS), varB);
}

function stringToBlock(inputStr) {
    let blockCount;
    const charLen = inputStr.length;
    const numBlocks_2 = (charLen + 8) >>> 6;
    const numBlocks = (numBlocks_2 - 1) * 16 + 1;
    const wordArray = Array(numBlocks - 1);
    let bytePos = 0;
    let charIdx = 0;
    while (charIdx < charLen) {
        blockCount = (charIdx - (charIdx % 4)) >>> 2;
        bytePos = (charIdx % 4) * 8;
        wordArray[blockCount] = (wordArray[blockCount] | (inputStr.charCodeAt(charIdx) << bytePos));
        charIdx++;
    }
    blockCount = (charIdx - (charIdx % 4)) >>> 2;
    bytePos = (charIdx % 4) * 8;
    wordArray[blockCount] = wordArray[blockCount] | (0x80 << bytePos);
    wordArray[numBlocks - 2] = charLen << 3;
    wordArray[numBlocks - 1] = charLen >>> 29;
    return wordArray;
}

function wordToHexadecimal(val) {
    let hexResult = "";
    let tempHex = "";
    let currentByte;
    for (let count = 0; count <= 3; count++) {
        currentByte = (val >>> (count * 8)) & 255;
        tempHex = "0" + currentByte.toString(16);
        hexResult += tempHex.slice(-2);
    }
    return hexResult;
}

function encodeToUTF8(sourceString) {
    sourceString = sourceString.replace(/\r\n/g, "\n");
    let encodedText = "";

    for (let currentPos = 0; currentPos < sourceString.length; currentPos++) {
        let charCode = sourceString.charCodeAt(currentPos);
        if (charCode < 128) {
            encodedText += String.fromCharCode(charCode);
        } else if ((charCode > 127) && (charCode < 2048)) {
            encodedText += String.fromCharCode((charCode >> 6) | 192);
            encodedText += String.fromCharCode((charCode & 63) | 128);
        } else {
            encodedText += String.fromCharCode((charCode >> 12) | 224);
            encodedText += String.fromCharCode(((charCode >> 6) & 63) | 128);
            encodedText += String.fromCharCode((charCode & 63) | 128);
        }
    }
    return encodedText;
}

function computeHashValue(messageInput) {
    let processedBlocks = [];
    let loopVar, currentA, currentB, currentC, currentD;
    let initialA, initialB, initialC, initialD;
    const S_1 = 7, S_2 = 12, S_3 = 17, S_4 = 22;
    const S_5 = 5, S_6 = 9, S_7 = 14, S_8 = 20;
    const S_9 = 4, S_10 = 11, S_11 = 16, S_12 = 23;
    const S_13 = 6, S_14 = 10, S_15 = 15, S_16 = 21;

    messageInput = encodeToUTF8(messageInput);
    processedBlocks = stringToBlock(messageInput);

    currentA = 0x67452301; currentB = 0xEFCDAB89; currentC = 0x98BADCFE; currentD = 0x10325476;

    for (loopVar = 0; loopVar < processedBlocks.length; loopVar += 16) {
        initialA = currentA; initialB = currentB; initialC = currentC; initialD = currentD;

        currentA = opF(currentA, currentB, currentC, currentD, processedBlocks[loopVar + 0], S_1, 0xD76AA478);
        currentD = opF(currentD, currentA, currentB, currentC, processedBlocks[loopVar + 1], S_2, 0xE8C7B756);
        currentC = opF(currentC, currentD, currentA, currentB, processedBlocks[loopVar + 2], S_3, 0x242070DB);
        currentB = opF(currentB, currentC, currentD, currentA, processedBlocks[loopVar + 3], S_4, 0xC1BDCEEE);
        currentA = opF(currentA, currentB, currentC, currentD, processedBlocks[loopVar + 4], S_1, 0xF57C0FAF);
        currentD = opF(currentD, currentA, currentB, currentC, processedBlocks[loopVar + 5], S_2, 0x4787C62A);
        currentC = opF(currentC, currentD, currentA, currentB, processedBlocks[loopVar + 6], S_3, 0xA8304613);
        currentB = opF(currentB, currentC, currentD, currentA, processedBlocks[loopVar + 7], S_4, 0xFD469501);
        currentA = opF(currentA, currentB, currentC, currentD, processedBlocks[loopVar + 8], S_1, 0x698098D8);
        currentD = opF(currentD, currentA, currentB, currentC, processedBlocks[loopVar + 9], S_2, 0x8B44F7AF);
        currentC = opF(currentC, currentD, currentA, currentB, processedBlocks[loopVar + 10], S_3, 0xFFFF5BB1);
        currentB = opF(currentB, currentC, currentD, currentA, processedBlocks[loopVar + 11], S_4, 0x895CD7BE);
        currentA = opF(currentA, currentB, currentC, currentD, processedBlocks[loopVar + 12], S_1, 0x6B901122);
        currentD = opF(currentD, currentA, currentB, currentC, processedBlocks[loopVar + 13], S_2, 0xFD987193);
        currentC = opF(currentC, currentD, currentA, currentB, processedBlocks[loopVar + 14], S_3, 0xA679438E);
        currentB = opF(currentB, currentC, currentD, currentA, processedBlocks[loopVar + 15], S_4, 0x49B40821);

        currentA = opG(currentA, currentB, currentC, currentD, processedBlocks[loopVar + 1], S_5, 0xF61E2562);
        currentD = opG(currentD, currentA, currentB, currentC, processedBlocks[loopVar + 6], S_6, 0xC040B340);
        currentC = opG(currentC, currentD, currentA, currentB, processedBlocks[loopVar + 11], S_7, 0x265E5A51);
        currentB = opG(currentB, currentC, currentD, currentA, processedBlocks[loopVar + 0], S_8, 0xE9B6C7AA);
        currentA = opG(currentA, currentB, currentC, currentD, processedBlocks[loopVar + 5], S_5, 0xD62F105D);
        currentD = opG(currentD, currentA, currentB, currentC, processedBlocks[loopVar + 10], S_6, 0x2441453);
        currentC = opG(currentC, currentD, currentA, currentB, processedBlocks[loopVar + 15], S_7, 0xD8A1E681);
        currentB = opG(currentB, currentC, currentD, currentA, processedBlocks[loopVar + 4], S_8, 0xE7D3FBC8);
        currentA = opG(currentA, currentB, currentC, currentD, processedBlocks[loopVar + 9], S_5, 0x21E1CDE6);
        currentD = opG(currentD, currentA, currentB, currentC, processedBlocks[loopVar + 14], S_6, 0xC33707D6);
        currentC = opG(currentC, currentD, currentA, currentB, processedBlocks[loopVar + 3], S_7, 0xF4D50D87);
        currentB = opG(currentB, currentC, currentD, currentA, processedBlocks[loopVar + 8], S_8, 0x455A14ED);
        currentA = opG(currentA, currentB, currentC, currentD, processedBlocks[loopVar + 13], S_5, 0xA9E3E905);
        currentD = opG(currentD, currentA, currentB, currentC, processedBlocks[loopVar + 2], S_6, 0xFCEFA3F8);
        currentC = opG(currentC, currentD, currentA, currentB, processedBlocks[loopVar + 7], S_7, 0x676F02D9);
        currentB = opG(currentB, currentC, currentD, currentA, processedBlocks[loopVar + 12], S_8, 0x8D2A4C8A);

        currentA = opH(currentA, currentB, currentC, currentD, processedBlocks[loopVar + 5], S_9, 0xFFFA3942);
        currentD = opH(currentD, currentA, currentB, currentC, processedBlocks[loopVar + 8], S_10, 0x8771F681);
        currentC = opH(currentC, currentD, currentA, currentB, processedBlocks[loopVar + 11], S_11, 0x6D9D6122);
        currentB = opH(currentB, currentC, currentD, currentA, processedBlocks[loopVar + 14], S_12, 0xFDE5380C);
        currentA = opH(currentA, currentB, currentC, currentD, processedBlocks[loopVar + 1], S_9, 0xA4BEEA44);
        currentD = opH(currentD, currentA, currentB, currentC, processedBlocks[loopVar + 4], S_10, 0x4BDECFA9);
        currentC = opH(currentC, currentD, currentA, currentB, processedBlocks[loopVar + 7], S_11, 0xF6BB4B60);
        currentB = opH(currentB, currentC, currentD, currentA, processedBlocks[loopVar + 10], S_12, 0xBEBFBC70);
        currentA = opH(currentA, currentB, currentC, currentD, processedBlocks[loopVar + 13], S_9, 0x289B7EC6);
        currentD = opH(currentD, currentA, currentB, currentC, processedBlocks[loopVar + 0], S_10, 0xEAA127FA);
        currentC = opH(currentC, currentD, currentA, currentB, processedBlocks[loopVar + 3], S_11, 0xD4EF3085);
        currentB = opH(currentB, currentC, currentD, currentA, processedBlocks[loopVar + 6], S_12, 0x4881D05);
        currentA = opH(currentA, currentB, currentC, currentD, processedBlocks[loopVar + 9], S_9, 0xD9D4D039);
        currentD = opH(currentD, currentA, currentB, currentC, processedBlocks[loopVar + 12], S_10, 0xE6DB99E5);
        currentC = opH(currentC, currentD, currentA, currentB, processedBlocks[loopVar + 15], S_11, 0x1FA27CF8);
        currentB = opH(currentB, currentC, currentD, currentA, processedBlocks[loopVar + 2], S_12, 0xC4AC5665);

        currentA = opI(currentA, currentB, currentC, currentD, processedBlocks[loopVar + 0], S_13, 0xF4292244);
        currentD = opI(currentD, currentA, currentB, currentC, processedBlocks[loopVar + 7], S_14, 0x432AFF97);
        currentC = opI(currentC, currentD, currentA, currentB, processedBlocks[loopVar + 14], S_15, 0xAB9423A7);
        currentB = opI(currentB, currentC, currentD, currentA, processedBlocks[loopVar + 5], S_16, 0xFC93A039);
        currentA = opI(currentA, currentB, currentC, currentD, processedBlocks[loopVar + 12], S_13, 0x655B59C3);
        currentD = opI(currentD, currentA, currentB, currentC, processedBlocks[loopVar + 3], S_14, 0x8F0CCC92);
        currentC = opI(currentC, currentD, currentA, currentB, processedBlocks[loopVar + 10], S_15, 0xFFEFF47D);
        currentB = opI(currentB, currentC, currentD, currentA, processedBlocks[loopVar + 1], S_16, 0x85845DD1);
        currentA = opI(currentA, currentB, currentC, currentD, processedBlocks[loopVar + 8], S_13, 0x6FA87E4F);
        currentD = opI(currentD, currentA, currentB, currentC, processedBlocks[loopVar + 15], S_14, 0xFE2CE6E0);
        currentC = opI(currentC, currentD, currentA, currentB, processedBlocks[loopVar + 6], S_15, 0xA3014314);
        currentB = opI(currentB, currentC, currentD, currentA, processedBlocks[loopVar + 13], S_16, 0x4E0811A1);
        currentA = opI(currentA, currentB, currentC, currentD, processedBlocks[loopVar + 4], S_13, 0xF7537E82);
        currentD = opI(currentD, currentA, currentB, currentC, processedBlocks[loopVar + 11], S_14, 0xBD3AF235);
        currentC = opI(currentC, currentD, currentA, currentB, processedBlocks[loopVar + 2], S_15, 0x2AD7D2BB);
        currentB = opI(currentB, currentC, currentD, currentA, processedBlocks[loopVar + 9], S_16, 0xEB86D391);

        currentA = combineUnsigned(currentA, initialA);
        currentB = combineUnsigned(currentB, initialB);
        currentC = combineUnsigned(currentC, initialC);
        currentD = combineUnsigned(currentD, initialD);
    }

    const finalResult = wordToHexadecimal(currentA) + wordToHexadecimal(currentB) + wordToHexadecimal(currentC) + wordToHexadecimal(currentD);
    return finalResult.toLowerCase();
}

const secureOperations = {
    produceDigest(contentPayload, secretPassphrase) {
        const fullContent = contentPayload + secretPassphrase;
        return computeHashValue(fullContent);
    },

    validateDigest(contentPayload, providedDigest, secretPassphrase) {
        const fullContent = contentPayload + secretPassphrase;
        const generatedDigest = computeHashValue(fullContent);
        return generatedDigest === providedDigest;
    }
};

module.exports = secureOperations;