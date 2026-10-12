'use strict'

function main(input) {
    input = Number(input)
    let nummax = Number.MAX_SAFE_INTEGER
    let xxx = 1000000 // 10 ** 6 
    let numbers = [2, 1]
    for (let i = 2; i <= input; i++) {
        let tmp = numbers[i - 2] + numbers[i - 1]
        // console.log(i, tmp)
        if (tmp <= nummax) numbers.push(tmp)
        else numbers.push(tmp / xxx)

    }
    // console.log(Number.MAX_SAFE_INTEGER)





    if (tmp <= nummax) console.log(numbers.pop())
    else console.log(numbers.pop() * xxx)

}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))