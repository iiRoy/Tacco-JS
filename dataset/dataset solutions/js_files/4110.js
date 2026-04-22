"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0].split(" ")[0]);
    let H = parseInt(arg[0].split(" ")[1]);

    let AB = arg.slice(1, N + 1).map(n=>n.split(" ").map(l=>parseInt(l)));
    
    AB.sort((a,b)=>b[0] - a[0]);
    
    let throwSum = 0;
    const strongest = AB[0][0];
    
    for(let i=0; i<N; i++) {
        if(AB[i][1] > strongest) {
            throwSum += AB[i][1];
        }
    }
    
    let cnt = 0;
    
    // while(H > throwSum) {
    //     H -= AB[0][0];
    //     cnt++;
    // }
    
    // console.log("cnt" + cnt);

    cnt += Math.ceil(((H - throwSum) / strongest));
    cnt = Math.max(0, cnt);
    
    H -= cnt * strongest;

    if(H <= 0) {
        console.log(cnt);
        return;
    } 

    AB.sort((a,b)=>b[1] - a[1]);
    
    for(let i=0; i<N; i++) {
        H -= AB[i][1];
        cnt++;
        
        if(H <= 0) break;
    }
    
    console.log(cnt);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
