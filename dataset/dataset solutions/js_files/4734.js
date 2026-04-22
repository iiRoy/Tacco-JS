'use strict'

const main = (input) => {
    const str = input.split('\n')[0]
    const strArr = str.split('')
    const strArrR = strArr.slice().reverse()
    const strLen = strArr.length

    const Aindex = strArr.indexOf('A')
    const Zindex = strLen - strArrR.indexOf('Z')
    console.log(Zindex - Aindex)
}

main(require('fs').readFileSync('/dev/stdin', 'utf-8'))