'use strict'

function main(arg) {
    let temp = arg.split(" ");
    console.log((temp[0] * temp[1]) / 2);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));