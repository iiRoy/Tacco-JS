"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0].split(" ")[0]);
    const K = parseInt(arg[0].split(" ")[1]);
    
    const S = arg[1].split("").map(n=>parseInt(n));
    
    // 奇数番目に連続する1の数、偶数版目に連続する0の数 の配列を用意
    let list = [];
    
    if(S.indexOf(0) === -1) {
        console.log(N);
        return;
    }
    
    if(S.indexOf(1) === -1) {
        console.log(N);
        return;
    }
    
    if(S[0] !== 1) {
        list.push(0);
    }
    
    if(S[S.length] !== 1) {
        S.push(0);
    }
    
    let streak = 0;
    
    for(let i=1; i<=S.length; i++) {
        if(S[i] === S[i - 1]) {
            streak++;
        } else {
            streak++;
            list.push(streak);
            streak = 0;
        }
    }
    
    // 集計
    let temp = 0;
    let answer = 0;
    
    for(let i in list) {
        temp += list[i];
        
        if((parseInt(i) + 1) % (K + (K + 1)) === 0) {
            answer = Math.max(answer, temp);
            temp = 0;
        }
    }
    
    answer = Math.max(answer, temp);
    
    console.log(answer);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));