(function(currentContext){

    const characterPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const charToIndexMap = Object.fromEntries(Array.from(characterPool).map((char, index) => [char, index]));
    const indexToCharArr = [...characterPool];

    const textToCodePoints = (sourceText) =>
        Array.from(sourceText, char => char.charCodeAt(0));

    const codePointsToText = (numericSequence) => {
        const stringFragments = [];
        const segmentSize = 65536;
        for (let pos = 0; pos < numericSequence.length; pos += segmentSize) {
            stringFragments.push(String.fromCharCode(...numericSequence.slice(pos, pos + segmentSize)));
        }
        return stringFragments.join('');
    };

    const transformUnicodeToOctets = (codePointSequence) =>
        codePointSequence.flatMap(cp => {
            if (cp < 0x80) return [cp];
            if (cp < 0x800) return [0xC0 | (cp >>> 6), 0x80 | (cp & 0x3F)];
            return [0xE0 | ((cp >>> 12) & 0x0F), 0x80 | ((cp >>> 6) & 0x3F), 0x80 | (cp & 0x3F)];
        });

    const transformOctetsToUnicode = (octetSequence) => {
        const outputCodePoints = [];
        let readCursor = 0;
        const totalOctets = octetSequence.length;

        while (readCursor < totalOctets) {
            const firstByte = octetSequence[readCursor++];
            if (firstByte < 0x80) {
                outputCodePoints.push(firstByte);
            } else if ((firstByte & 0xE0) === 0xC0) {
                const secondByte = octetSequence[readCursor++];
                outputCodePoints.push(((firstByte & 0x1F) << 6) | (secondByte & 0x3F));
            } else if ((firstByte & 0xF0) === 0xE0) {
                const secondByte = octetSequence[readCursor++];
                const thirdByte = octetSequence[readCursor++];
                outputCodePoints.push(
                    ((firstByte & 0x0F) << 12) |
                    ((secondByte & 0x3F) << 6) |
                    (thirdByte & 0x3F)
                );
            }
        }
        return outputCodePoints;
    };

    const encodeOctetStream = (byteInput) => {
        const workingBytes = [...byteInput];
        let paddingCount = 0;
        while (workingBytes.length % 3 !== 0) {
            workingBytes.push(0);
            paddingCount++;
        }

        const encodedCharacters = [];
        for (let i = 0; i < workingBytes.length; i += 3) {
            const b0 = workingBytes[i];
            const b1 = workingBytes[i + 1];
            const b2 = workingBytes[i + 2];

            if (b0 > 255 || b1 > 255 || b2 > 255) {
                throw new Error('Invalid byte value encountered in stream.');
            }

            const combinedBits = (b0 << 16) | (b1 << 8) | b2;

            encodedCharacters.push(
                indexToCharArr[combinedBits >>> 18],
                indexToCharArr[(combinedBits >>> 12) & 0x3F],
                indexToCharArr[(combinedBits >>> 6) & 0x3F],
                indexToCharArr[combinedBits & 0x3F]
            );
        }

        for (let p = 0; p < paddingCount; p++) {
            encodedCharacters[encodedCharacters.length - 1 - p] = '=';
        }
        return encodedCharacters.join('');
    };

    const decodeTextStream = (b64Source) => {
        const sanitizedSource = b64Source.replace(/[^A-Za-z0-9+/=]/g, '');
        const outputOctets = [];
        const sourceLength = sanitizedSource.length;
        let finalPad = 0;

        if (sourceLength > 0 && sanitizedSource[sourceLength - 1] === '=') {
            finalPad++;
            if (sourceLength > 1 && sanitizedSource[sourceLength - 2] === '=') {
                finalPad++;
            }
        }

        for (let i = 0; i < sourceLength; i += 4) {
            const c0 = sanitizedSource[i] || 'A';
            const c1 = sanitizedSource[i + 1] || 'A';
            const c2 = sanitizedSource[i + 2] || 'A';
            const c3 = sanitizedSource[i + 3] || 'A';

            const v0 = charToIndexMap[c0];
            const v1 = charToIndexMap[c1];
            const v2 = charToIndexMap[c2];
            const v3 = charToIndexMap[c3];

            const valuePack = (v0 << 18) | (v1 << 12) | (v2 << 6) | v3;

            outputOctets.push(
                (valuePack >>> 16) & 0xFF,
                (valuePack >>> 8) & 0xFF,
                valuePack & 0xFF
            );
        }

        outputOctets.length -= finalPad;
        return outputOctets;
    };

    const textToOctets = (inputText) =>
        transformUnicodeToOctets(textToCodePoints(inputText));

    const encodePlainToCipher = (inputText) =>
        encodeOctetStream(textToCodePoints(inputText));

    const decodeCipherToPlain = (base64Text) =>
        codePointsToText(decodeTextStream(base64Text));

    let nativeEncoder;
    let encodeUnicodeToCipher;

    if (typeof globalThis.btoa === 'function') {
        nativeEncoder = globalThis.btoa;
        const convertUnicodeToPlain = (inputText) => codePointsToText(textToOctets(inputText));
        encodeUnicodeToCipher = (uni) => nativeEncoder(convertUnicodeToPlain(uni));
    } else {
        nativeEncoder = encodePlainToCipher;
        encodeUnicodeToCipher = (uni) => encodeOctetStream(textToOctets(uni));
    }

    let nativeDecoder;
    let decodeCipherToUnicode;

    if (typeof globalThis.atob === 'function') {
        nativeDecoder = globalThis.atob;
        const convertPlainToUnicode = (inputText) => codePointsToText(transformOctetsToUnicode(textToCodePoints(inputText)));
        decodeCipherToUnicode = (b64) => convertPlainToUnicode(nativeDecoder(b64));
    } else {
        nativeDecoder = decodeCipherToPlain;
        decodeCipherToUnicode = (b64) => codePointsToText(transformOctetsToUnicode(decodeTextStream(b64)));
    }

    const convertUnicodeToPlain = (inputText) => codePointsToText(textToOctets(inputText));
    const convertPlainToUnicode = (inputText) => codePointsToText(transformOctetsToUnicode(textToCodePoints(inputText)));

    currentContext.CipherToolkit = {
        octetEncode: encodeOctetStream,
        octetDecode: decodeTextStream,

        unicodeToOctetArray: transformUnicodeToOctets,
        octetToUnicodeArray: transformOctetsToUnicode,

        encodeFromPlain: encodePlainToCipher,
        decodeToPlain: decodeCipherToPlain,

        plainToUnicodeArray: (inp) => transformOctetsToUnicode(textToCodePoints(inp)),
        octetToUnicodeText: (inp) => codePointsToText(transformOctetsToUnicode(inp)),

        plainToUnicodeText: convertPlainToUnicode,

        unicodeToOctetArrayFromString: textToOctets,
        unicodeArrayToPlain: (inp) => codePointsToText(transformUnicodeToOctets(inp)),

        unicodeToPlainText: convertUnicodeToPlain,

        encodeFromUnicode: encodeUnicodeToCipher,
        decodeToUnicode: decodeCipherToUnicode,

        fromCipher: decodeCipherToPlain,
        toCipher: encodePlainToCipher,
        nativeDecoder: nativeDecoder,
        nativeEncoder: nativeEncoder,
        encodeUnicodeToByteString: convertUnicodeToPlain,
        decodeByteStringToUnicode: convertPlainToUnicode,
        transform: encodeUnicodeToCipher,
        transformUri: function(u){
            return encodeUnicodeToCipher(u).replace(/[+\/]/g, function(m0){
                return m0 == '+' ? '-' : '_';
            }).replace(/=+$/, '');
        },
        restore: function(a){
            return decodeCipherToUnicode(a.replace(/[-_]/g, function(m0){
                return m0 == '-' ? '+' : '/';
            }));
        }
    };

})(this);