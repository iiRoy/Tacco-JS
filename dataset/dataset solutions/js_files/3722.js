"use strict"

function main(input) {

    let num = Number(input.split('\n')[0])
    let tmp = num
    let sum = 0
    for (let i = 1; i <= input.length; i++) {
        sum += tmp % 10 //一の位
        tmp = Math.floor(tmp / 10) //一桁削る
            // or 
            //tmp = (tmp-(tmp % 10) / 10
    }
    if (num % sum == 0) console.log('Yes')
    else console.log('No')
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));