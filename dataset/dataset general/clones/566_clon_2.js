const DataTransformer = {

    // The set of characters used in Base64 encoding. This is a private constant.
    _b64Alphabet : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // Converts a given string into its Base64 representation.
    toBase64 : function (originalText) {
        let transformedOutput = "";
        let byteOne, byteTwo, byteThree, segmentA, segmentB, segmentC, segmentD;
        let charPosition = 0;

        originalText = this._encodeToUtf8(originalText);

        while (charPosition < originalText.length) {

            byteOne = originalText.charCodeAt(charPosition++);
            byteTwo = originalText.charCodeAt(charPosition++);
            byteThree = originalText.charCodeAt(charPosition++);

            segmentA = byteOne >> 2;
            segmentB = ( (byteOne & 3) << 4 ) | ( byteTwo >> 4 );
            segmentC = ( (byteTwo & 15) << 2 ) | ( byteThree >> 6 );
            segmentD = byteThree & 63;

            if (isNaN(byteTwo)) {
                segmentC = segmentD = 64;
            } else if (isNaN(byteThree)) {
                segmentD = 64;
            }

            transformedOutput +=
                this._b64Alphabet.charAt(segmentA) +
                this._b64Alphabet.charAt(segmentB) +
                this._b64Alphabet.charAt(segmentC) +
                this._b64Alphabet.charAt(segmentD);

        }

        return transformedOutput;
    },

    // Decodes a Base64 encoded string back to its original form.
    fromBase64 : function (encodedPayload) {
        let decodedResult = "";
        let val1, val2, val3;
        let pA, pB, pC, pD;
        let currentOffset = 0;

        encodedPayload = encodedPayload.replace( /[^A-Za-z0-9\+\/\=]/g, "" );

        while (currentOffset < encodedPayload.length) {

            pA = this._b64Alphabet.indexOf(encodedPayload.charAt(currentOffset++));
            pB = this._b64Alphabet.indexOf(encodedPayload.charAt(currentOffset++));
            pC = this._b64Alphabet.indexOf(encodedPayload.charAt(currentOffset++));
            pD = this._b64Alphabet.indexOf(encodedPayload.charAt(currentOffset++));

            val1 = ( pA << 2 ) | ( pB >> 4 );
            val2 = ( (pB & 15) << 4 ) | ( pC >> 2 );
            val3 = ( (pC & 3) << 6 ) | pD;

            decodedResult += String.fromCharCode(val1);

            if ( pC !== 64 ) {
                decodedResult += String.fromCharCode(val2);
            }
            if ( pD !== 64 ) {
                decodedResult += String.fromCharCode(val3);
            }

        }

        decodedResult = this._decodeFromUtf8(decodedResult);

        return decodedResult;

    },

    // A private utility method for converting strings to UTF-8 encoding.
    _encodeToUtf8 : function (sourceStringData) {
        sourceStringData = sourceStringData.replace(/\r\n/g, "\n");
        let utf8EncodedString = "";

        for (let idx = 0; idx < sourceStringData.length; idx++) {

            let characterCode = sourceStringData.charCodeAt(idx);

            if (characterCode < 128) {
                utf8EncodedString += String.fromCharCode(characterCode);
            }
            else if ( (characterCode > 127) && (characterCode < 2048) ) {
                utf8EncodedString += String.fromCharCode( (characterCode >> 6) | 192 );
                utf8EncodedString += String.fromCharCode( (characterCode & 63) | 128 );
            }
            else {
                utf8EncodedString += String.fromCharCode( (characterCode >> 12) | 224 );
                utf8EncodedString += String.fromCharCode( ( (characterCode >> 6) & 63 ) | 128 );
                utf8EncodedString += String.fromCharCode( (characterCode & 63) | 128 );
            }

        }

        return utf8EncodedString;
    },

    // A private utility method for decoding UTF-8 encoded strings.
    _decodeFromUtf8 : function (utf8InputString) {
        let processedString = "";
        let currentPosition = 0;
        let codeVal = 0, nextCodeVal = 0, furtherCodeVal = 0;

        while ( currentPosition < utf8InputString.length ) {

            codeVal = utf8InputString.charCodeAt(currentPosition);

            if (codeVal < 128) {
                processedString += String.fromCharCode(codeVal);
                currentPosition++;
            }
            else if ( (codeVal > 191) && (codeVal < 224) ) {
                nextCodeVal = utf8InputString.charCodeAt(currentPosition + 1);
                processedString += String.fromCharCode( ( (codeVal & 31) << 6 ) | ( nextCodeVal & 63 ) );
                currentPosition += 2;
            }
            else {
                nextCodeVal = utf8InputString.charCodeAt(currentPosition + 1);
                furtherCodeVal = utf8InputString.charCodeAt(currentPosition + 2);
                processedString += String.fromCharCode( ( (codeVal & 15) << 12 ) | ( (nextCodeVal & 63) << 6 ) | ( furtherCodeVal & 63 ) );
                currentPosition += 3;
            }

        }

        return processedString;
    }

};