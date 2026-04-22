"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const S = arg[0].split("");
    
    const MOD = 1000000007;
    
    let dp = [];
    
    // dp[i][j]は後ろからi桁を13で割った余りがjであるものの個数
    for(let i=0;i<S.length+1;i++){
        dp.push(Array(13).fill(0));
    }
    
    dp[0][0] = 1;
    
    for(let i=0; i<S.length; i++) {
        const c = S[i] === "?" ? -1: parseInt(S[i]);
        
        for(let j=0; j<10; j++) {
            if(c !== -1 && c !== j) continue;
            
            for(let k=0; k<13; k++) {
                dp[i + 1][(k * 10 + j) % 13] += dp[i][k];
            }
        }
        
        for(let j=0; j<13; j++) {
            dp[i+1][j] %= MOD;
        }
    }
    
    console.log(dp[S.length][5]);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));