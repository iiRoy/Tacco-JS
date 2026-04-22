'use strict'

// const main = (input) => {
//     let arr = input.split('\n')[0].split('')
//     let ans = 0

//     while (true) {
//         for(let i = 0; i < arr.length - 1; i++) {
//             if (arr[i] !== arr[i + 1]) {
//                 arr.splice(i, 2)
//                 ans += 2
//             } 
//         }

//         let set = new Set(arr)
//         if (set.size < 2) {
//             console.log(ans)
//             return
//         }
//     }
// }

const main = (input) => {
    let arr = input.split('\n')[0].split('')
    let count0 = 0
    let count1 = 0
    arr.forEach(v => {
        if(v === '0') count0++
        if(v === '1') count1++
    })
    
    console.log(Math.min(count0, count1) * 2)
}


main(require('fs').readFileSync('/dev/stdin', 'utf-8'))