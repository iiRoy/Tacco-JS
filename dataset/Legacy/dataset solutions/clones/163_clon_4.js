var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
    buffer = new Buffer(length),
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');

(function processCipherTexts() {
    const coprimeMultipliers = new Int8Array([1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]);

    const inverseMap = new Map([
        [1, 1], [3, 9], [5, 21], [7, 15], [9, 3], [11, 19],
        [15, 7], [17, 23], [19, 11], [21, 5], [23, 17], [25, 25]
    ]);

    const applyEncryption = (originalIndex, factor, shift) => (originalIndex * factor + shift) % 26;

    const applyDecryption = (encryptedIndex, invFactor, shift) => {
        let intermediate = (encryptedIndex - shift + 26) % 26;
        return (intermediate * invFactor) % 26;
    };

    const charT = 19;
    const charH = 7;
    const charA = 0;
    const charI = 8;
    const charS = 18;

    input.slice(1, +input[0] + 1).forEach(currentEncryptedText => {
        let solutionFound = false;

        coprimeMultipliers.some(currentAlpha => {
            const currentAlphaInverse = inverseMap.get(currentAlpha);

            Array.from({ length: 26 }, (_, b) => b).some(currentBeta => {
                const encT = String.fromCharCode(applyEncryption(charT, currentAlpha, currentBeta) + 97);
                const encH = String.fromCharCode(applyEncryption(charH, currentAlpha, currentBeta) + 97);
                const encA = String.fromCharCode(applyEncryption(charA, currentAlpha, currentBeta) + 97);
                const encI = String.fromCharCode(applyEncryption(charI, currentAlpha, currentBeta) + 97);
                const encS = String.fromCharCode(applyEncryption(charS, currentAlpha, currentBeta) + 97);

                const pattern = new RegExp(encT + encH + "(" + encA + encT + "|" + encI + encS + ")");

                if (pattern.test(currentEncryptedText)) {
                    const decryptedText = currentEncryptedText.replace(/[a-z]/g, char => {
                        const charCode = char.charCodeAt(0) - 97;
                        const originalIndex = applyDecryption(charCode, currentAlphaInverse, currentBeta);
                        return String.fromCharCode(originalIndex + 97);
                    });
                    console.log(decryptedText);
                    solutionFound = true;
                    return true;
                }
                return false;
            });
            return solutionFound;
        });
    });
})();
