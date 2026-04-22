const DataEncoder = {
    symbolMap: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    charIndex: null,
    isLegacyBrowser: /MSIE /.test(navigator.userAgent),
    isAncientBrowser: /MSIE [67]/.test(navigator.userAgent),

    packData: function (sourceText) {
        const byteSequence = DataEncoder.getByteRepresentation(sourceText);
        let bytePos = -1;
        const totalBytes = byteSequence.length;
        let octetOne, octetTwo, octetThree;
        const encodedQuartet = [, , , ];
        if (DataEncoder.isLegacyBrowser) {
            const finalOutput = [];
            while (++bytePos < totalBytes) {
                octetOne = byteSequence[bytePos];
                octetTwo = byteSequence[++bytePos];
                encodedQuartet[0] = octetOne >> 2;
                encodedQuartet[1] = ((octetOne & 3) << 4) | (octetTwo >> 4);
                if (isNaN(octetTwo))
                    encodedQuartet[2] = encodedQuartet[3] = 64;
                else {
                    octetThree = byteSequence[++bytePos];
                    encodedQuartet[2] = ((octetTwo & 15) << 2) | (octetThree >> 6);
                    encodedQuartet[3] = (isNaN(octetThree)) ? 64 : octetThree & 63;
                }
                finalOutput.push(DataEncoder.symbolMap.charAt(encodedQuartet[0]), DataEncoder.symbolMap.charAt(encodedQuartet[1]), DataEncoder.symbolMap.charAt(encodedQuartet[2]), DataEncoder.symbolMap.charAt(encodedQuartet[3]));
            }
            return finalOutput.join('');
        } else {
            let finalOutput = '';
            while (++bytePos < totalBytes) {
                octetOne = byteSequence[bytePos];
                octetTwo = byteSequence[++bytePos];
                encodedQuartet[0] = octetOne >> 2;
                encodedQuartet[1] = ((octetOne & 3) << 4) | (octetTwo >> 4);
                if (isNaN(octetTwo))
                    encodedQuartet[2] = encodedQuartet[3] = 64;
                else {
                    octetThree = byteSequence[++bytePos];
                    encodedQuartet[2] = ((octetTwo & 15) << 2) | (octetThree >> 6);
                    encodedQuartet[3] = (isNaN(octetThree)) ? 64 : octetThree & 63;
                }
                finalOutput += DataEncoder.symbolMap[encodedQuartet[0]] + DataEncoder.symbolMap[encodedQuartet[1]] + DataEncoder.symbolMap[encodedQuartet[2]] + DataEncoder.symbolMap[encodedQuartet[3]];
            }
            return finalOutput;
        }
    },
    getByteRepresentation: function (rawString) {
        let strPos = -1;
        const inputLength = rawString.length;
        let unicodeVal;
        const byteCollection = [];
        if (/^[\x00-\x7f]*$/.test(rawString))
            while (++strPos < inputLength)
                byteCollection.push(rawString.charCodeAt(strPos));
        else
            while (++strPos < inputLength) {
                unicodeVal = rawString.charCodeAt(strPos);
                if (unicodeVal < 128)
                    byteCollection.push(unicodeVal);
                else if (unicodeVal < 2048)
                    byteCollection.push((unicodeVal >> 6) | 192, (unicodeVal & 63) | 128);
                else
                    byteCollection.push((unicodeVal >> 12) | 224, ((unicodeVal >> 6) & 63) | 128, (unicodeVal & 63) | 128);
            }
        return byteCollection;
    }
};