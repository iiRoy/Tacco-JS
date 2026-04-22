"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0].split(" ")[0]);
    let A = arg[1].split(" ").map(n=>parseInt(n)).sort((a,b)=>a-b);
    
    // console.log(A);
    
    let i = 0;
    
    //for(let i=0; i<N; i++) {
    while(i < N) {
        // console.log("i:" + i);
        // console.log("A[i]:" + A[i]);
        
        if(A[i] === -1) {
            i++;
            continue;
        }
        
        let flg = false;
        let setted = false;
        let next;
        
        for(let j=i+1; j<N; j++) {
            // console.log("A[j]:" + A[j]);
            if(A[j] === -1) continue;
            
            if(A[j] === A[i]) {
                flg = true;
            }
            
            if(A[j] % A[i] === 0) {
                A[j] = -1;
                // A.splice(j, 1);
            } else if(!setted){
                next = j;
                setted = true;
            }
        }
        
        if(flg) A[i] = -1; 
        
        // console.log(A);
        // console.log("next:" + next)
        // console.log("-------")
        //A = A.filter(n=> n !== -1);
        if(next) {
            i = next;
        } else {
            i++;
        }
    }
    
    // console.log(A);

    console.log(A.filter(n=>n !== -1).length);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));