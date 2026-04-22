"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const X = arg[0];
    
    if(X < 100) {
        console.log(0);
        return;
    }
    
    // 10の位をまず割り切る
    // そしたらあとは100で割れる
    // 10の位を割り切ってる間に100以下になると不可能になる？
    let digit10 = parseInt(X.split("").slice(-2).join(""));
    let cnt = 0;
    
    if(digit10 === 0) {
        console.log(1);
        return;
    }
    
    if(digit10 === 1) {
        cnt = digit10;
    }

    while(digit10 !== 0) {
        if(digit10 >= 5) {
            digit10 = digit10 % 5;
        } else if(digit10 >= 4) {
            digit10 = digit10 % 4;
        } else if(digit10 >= 3) {
            digit10 = digit10 % 3;
        } else if(digit10 >= 2){
            digit10 = digit10 % 2;
        } else if(digit10 >= 1) {
            digit10 = digit10 % 1;
        }
        cnt++;
    }
    
    // console.log("cnt:" + cnt);
    
    if(100 * cnt < X) {
        console.log(1)
    } else {
        console.log(0)
    }

}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));