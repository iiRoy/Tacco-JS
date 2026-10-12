'use strict';

// PROCESS
function caesar(cipherText) {
    let plainText = '';

    // buf is ASCII code
    let buf;

    for(let i = 0; i < cipherText.length; i++)
    {
        buf = cipherText.charCodeAt(i) - 3;
        if (buf < 65) {
            buf += 26;
        }
        plainText += String.fromCharCode(buf);
    }
    
    return plainText;
}

// IO (RAW)
const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.on('line', (line) => {
    console.log(caesar(line.trim()));
    rl.close();
});