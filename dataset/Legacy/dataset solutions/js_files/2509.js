"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const S = arg[0].split("");
    const K = parseInt(arg[1]);

    let streakS = 0;
    let streakS2 = 0;
    
    if(S.length === 1) {
        console.log(Math.floor(K / 2));
        return;
    }
    
    let S2 = [...S];
    let flag = false;
    // まず
    // pattern1の連続箇所を調べる
    // 最初と最後は極力別にしたい、それが可能かの判定が必要
    for(let i=0; i<S.length-1; i++) {
        // 連続している
        if(S[i] === S[parseInt(i)+1] && i === S.length-2) {
            streakS++;
            S[parseInt(i)+1]= "|";
            continue;
        }
        
        if(S[i] === S[parseInt(i)+1]) {
            streakS++;
            
            if(i !== 0) {
                S[parseInt(i)+1] = "*";
            } else {
                S[i] = "*";
                flag = true;
            }
        }
    }
    
    let first = S[0];
    let last  = S[S.length-1];
    
    // 先頭と最後が同じ時、偶数の時だけ両はしを置き換える
    if(first === last) {
        S2[0] = "@";
        S2[S2.length - 1] = "@";
        
        streakS2 = 2;
    }
    
    // pattern2の連続箇所を調べる
    for(let i=0; i<S2.length-1; i++) {
        // 連続している
        if(S2[i] === S2[i+parseInt(1)]) {
            streakS2++;
            S2[parseInt(i) + 1] = "?";
        }
    }
    
    let answer = 0;
    
    // console.log(S)
    // console.log(S2)
    // console.log(streakS);
    // console.log(streakS2);
    
    if(K % 2 === 0) {
        answer = (streakS + streakS2) * (K / 2); 
    } else {
        answer = (streakS * Math.ceil(K / 2)) + (streakS2 * Math.floor(K / 2)); 
    }

    console.log(answer);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));