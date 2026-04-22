"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0].split(" ")[0]);
    const K = parseInt(arg[0].split(" ")[1]);
    const LR = arg.slice(1, N + 1).map(n=>n.split(" ").map(l=>parseInt(l)));
    
    const steps = arg[1].split(" ").map(n=>parseInt(n));
    const map = [...Array(N+1)].fill(0);
    
    let S = [];
    
    // 和集合
    for(let i=0; i<K; i++) {
        const L = LR[i][0];
        const R = LR[i][1];
        
        map[L]++;
        map[R+1]--;
    }
    
    let imosFlg = 0;
    
    for(let i=0; i<N; i++) {
        if(map[i] === 1) imosFlg++;
        if(map[i] === -1) imosFlg--;
        
        if(imosFlg) {
            S.push(i);
        }
    }
    
    // console.log(map);
    // console.log(S);
    // console.log("hage")
    
    const dp = [...Array(N)].fill(Infinity);
    const NS = S.length;
    
    dp[0] = 1;
    
    for(let i=1; i<N; i++) {
        //let temp = Infinity;
        
        // for(let j=1; j<=K; j++) {
        //     if(i-j >= 0) {
        //         temp = Math.min(temp, dp[i-j] + Math.abs(steps[i] - steps[i-j]));
        //     }
        // }

        let temp = 0;
        
        for(let j=0; j<NS; j++) {
            const hoge = S[j];
            // console.log("hoge:" + hoge)
            
            if(i-hoge >= 0 && dp[i - hoge] > 0 && dp[i-hoge] !== Infinity) {
                // console.log("きたよ！")
                temp += dp[i-hoge] % 998244353;
            }
        }
        
        dp[i] = temp % 998244353;
        // console.log("dp[i]:" + dp[i]);
        // console.log("-------")
    }
    
    // console.log(dp)
    
    console.log(dp[N-1] % 998244353);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
