const Debug = function () {
    const stdin = function (text) {
        return '431 321';

    };

    return stdin;
};


const Release = function () {
    const fs = require('fs');
    const stdin = function (text) {
        if (text) console.log(text);
        return fs.readFileSync('/dev/stdin', 'utf8');
    }
    return stdin;
};


const debug = false;

const stdin = debug ? Debug() : Release();
const input = stdin().split('\n').map(x => parseInt(x));

const X = input[0];
const Y = input[1];
if (X % Y === 0) console.log(-1);
else (console.log(X));

