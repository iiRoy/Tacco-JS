window.GlobalUtility = window.GlobalUtility || {};
window.GlobalUtility.SecureConverter = (function() {

    const b64Symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    const b64InverseMapping = new Map();
    for (let k = 0; k < b64Symbols.length; k++) {
        b64InverseMapping.set(b64Symbols[k], k);
    }
    b64InverseMapping.set('=', 64);

    const convertStringToByteSequence = (inputString) => {
        let normalizedInput = inputString.replace(/\r\n/g, "\n");
        let byteCollector = [];
        for (let charPointer = 0; charPointer < normalizedInput.length; charPointer++) {
            let characterCode = normalizedInput.charCodeAt(charPointer);

            if (characterCode < 0x80) {
                byteCollector.push(characterCode);
            } else if (characterCode < 0x800) {
                byteCollector.push((characterCode >> 6) | 0xC0);
                byteCollector.push((characterCode & 0x3F) | 0x80);
            } else {
                byteCollector.push((characterCode >> 12) | 0xE0);
                byteCollector.push(((characterCode >> 6) & 0x3F) | 0x80);
                byteCollector.push((characterCode & 0x3F) | 0x80);
            }
        }
        return new Uint8Array(byteCollector);
    };

    const convertByteSequenceToString = (byteSequence) => {
        let characterParts = [];
        let bytePointer = 0;
        let b_one, b_two, b_three;

        while (bytePointer < byteSequence.length) {
            b_one = byteSequence[bytePointer];

            if (b_one < 128) {
                characterParts.push(String.fromCharCode(b_one));
                bytePointer++;
            } else if ((b_one > 191) && (b_one < 224)) {
                b_two = byteSequence[bytePointer + 1];
                characterParts.push(String.fromCharCode(((b_one & 31) << 6) | (b_two & 63)));
                bytePointer += 2;
            } else {
                b_two = byteSequence[bytePointer + 1];
                b_three = byteSequence[bytePointer + 2];
                characterParts.push(String.fromCharCode(((b_one & 15) << 12) | ((b_two & 63) << 6) | (b_three & 63)));
                bytePointer += 3;
            }
        }
        return characterParts.join('');
    };

    return {
        encodeData : function (sourceData) {
            let utf8Data = convertStringToByteSequence(sourceData);
            let resultSegments = [];
            let dataPointer = 0;

            while (dataPointer < utf8Data.length) {
                let byteA = utf8Data[dataPointer];
                let byteB = utf8Data[dataPointer + 1];
                let byteC = utf8Data[dataPointer + 2];

                let outputVal1 = byteA >> 2;
                let outputVal2 = ((byteA & 0x03) << 4) | (byteB >> 4);
                let outputVal3 = ((byteB & 0x0F) << 2) | (byteC >> 6);
                let outputVal4 = byteC & 0x3F;

                if (byteB === undefined) {
                    outputVal3 = outputVal4 = 64;
                } else if (byteC === undefined) {
                    outputVal4 = 64;
                }

                resultSegments.push(b64Symbols[outputVal1]);
                resultSegments.push(b64Symbols[outputVal2]);
                resultSegments.push(b64Symbols[outputVal3]);
                resultSegments.push(b64Symbols[outputVal4]);

                dataPointer += 3;
            }
            return resultSegments.join('');
        },

        decodeData : function (b64EncodedInput) {
            let processedInput = b64EncodedInput.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            let byteOutput = [];
            let inputPointer = 0;

            while (inputPointer < processedInput.length) {
                let charVal1 = b64InverseMapping.get(processedInput[inputPointer++]);
                let charVal2 = b64InverseMapping.get(processedInput[inputPointer++]);
                let charVal3 = b64InverseMapping.get(processedInput[inputPointer++]);
                let charVal4 = b64InverseMapping.get(processedInput[inputPointer++]);

                let decodedByte1 = (charVal1 << 2) | (charVal2 >> 4);
                let decodedByte2 = ((charVal2 & 0x0F) << 4) | (charVal3 >> 2);
                let decodedByte3 = ((charVal3 & 0x03) << 6) | charVal4;

                byteOutput.push(decodedByte1);

                if (charVal3 !== 64) {
                    byteOutput.push(decodedByte2);
                }
                if (charVal4 !== 64) {
                    byteOutput.push(decodedByte3);
                }
            }
            return convertByteSequenceToString(byteOutput);
        }
    };

})();