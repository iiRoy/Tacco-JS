"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0]);
    
    arg.shift();
    
    const answers = arg;
    const map = [];
    const As = [];
    let cnt = 0;
    
    for(let i=0; i<N; i++) {
        map[i] = { 0: 0, 1: 0, unkindFrom: [], unkindFor: []}
    }
    
    for(let i=0; i<answers.length; i++) {
        let A = parseInt(answers[i]);
        As.push(answers.slice(~~i + 1, ~~i + A + 1));
        
        i = parseInt(i) + parseInt(A);
        
    }

    for(let i in As) {
        for(let j in As[i]) {
            const X = parseInt(As[i][j].split(" ")[0]);
            const Y = parseInt(As[i][j].split(" ")[1]);
        
        
            map[X-1][Y]++;
            
            if(Y === 0) {
                // console.log("X:" + (X - 1))
                map[X-1].unkindFrom.push(parseInt(i));
                map[i].unkindFor.push(X-1);
            }
        }
    }
    
    // console.log(As)
    // console.log(JSON.stringify(map));
    
    let cnt2 = 0;
    
    for(let i in map) {
        if(map[i][0] >= 1 && map[i][1] >= 1) {
            cnt += map[i][0];
        }
        
        for(let j in map[i].unkindFrom) {
            if(map[i].unkindFor.filter(n=>n===map[i].unkindFrom[j]).length) {
                cnt2++;
            }
        }
    }
    
    console.log(N - ( cnt + (cnt2 / 2) ));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));