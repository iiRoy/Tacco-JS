'use strict';

// PROCESS
function caesar(cipherText) {
    var plainText = '';

    // buf is ASCII code
    var buf;

    for(var i = 0; i < cipherText.length; i++)
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
/*
require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
}).on('line', (line) => console.log(caesar(line.trim())));
*/
require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n').forEach(function (item) {
    console.log(caesar(item));
});