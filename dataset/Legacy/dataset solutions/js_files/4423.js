'use strict'
function main(input) {
    const tmp = input.split('\n');
    const N = parseInt(tmp.shift(), 10);
    const a = tmp.map((elem) => parseInt(elem, 10));
    console.log(a);
}

// function gcd(b, c) {
//     if (c === 0) {
//         return b;
//     } else {
//         return gcd(c, b % c);

//     }

// }

// function lcm(a2, b2) {
//     return (a2 * b2) / gcd(a2, b2);
// }

// function lcm2(arr, a3, i) {
//     if (i === arr.length) {
//         return a3;
//     } else {
//         return lcm2(arr, lcm(a3, arr[i]), i + 1);
//     }
// }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));