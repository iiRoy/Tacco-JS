"use strict";

const main = arg => {
    // 標準入力の不要な空白と改行を削除し、配列に格納する
    const input = arg.trim().split(" ");
    const N = parseInt(input[0], 10);

     if (N % 2 === 0) {
         console.log(N / 2);
     } else {
         console.log(Math.floor((N / 2),10) + 1);
     }
    
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));