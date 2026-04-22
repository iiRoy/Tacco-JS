const performTransformation = async () => {
    let allIncoming = '';
    process.stdin.setEncoding('utf8');

    for await (const dataBit of process.stdin) {
        allIncoming += dataBit;
    }

    let finalOutput = '';
    for (let unitChar of allIncoming) {
        const unicodeValue = unitChar.charCodeAt(0);
        if (unicodeValue >= 97 && unicodeValue <= 122) { // 'a' (97) to 'z' (122)
            finalOutput += String.fromCharCode(unicodeValue - 32);
        } else {
            finalOutput += unitChar;
        }
    }
    process.stdout.write(finalOutput);
};

performTransformation();