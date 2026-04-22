let input = require('fs').readFileSync('/dev/stdin', 'utf-8');
let numsArr = (input.trim()).split('\n').map(str => str.split("").map(n => Number(n)));

function newArr(arr) {
    let newArr = [];
    for (let i = 0; i < arr.length -1; i++) {
        newArr.push(arr[i] + arr[i+1]);
    }
    return newArr.map(n => n % 10);
}

function singleDown (arr) {
    if (arr.length === 1) {
        return arr[0];
    } else {
        return singleDown(newArr(arr));
    }
}

let awrs = numsArr.map(nums => singleDown(nums));
console.log(awrs);

