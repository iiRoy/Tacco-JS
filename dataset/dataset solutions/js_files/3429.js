"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0]);
    const l = String(N).length;
    
    const num = ["3", "5", "7"];
    const X   = [3, 5, 7];
    
    let answer = 0;
    let n      = 0;
    
    // まず、3,5,7から成る数字を全て列挙する
    for(let i=0; i<l-1; i++) {
        let Xl = X.length;
        for(let j=0; j<3; j++) {
            for(let k=n; k<Xl; k++) {
                X.push(parseInt(num[j] + X[k]));
            }
        }
        
        n = Xl;
    }
    
    // 3,5,7からなる数字の配列から、それぞれが1回以上登場するものに絞る
    for(let i=0; i<X.length; i++) {
        if(X[i] > N) break;
        
        let digits = String(X[i]).split("");
        
        if(digits.indexOf("3") !== -1 && digits.indexOf("5") !== -1 && digits.indexOf("7") !== -1) {
            answer++;
        }
    }
    
    console.log(answer);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));