"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0].split(" ")[0]);
    
    let answer = 1;
    
    for(let i=2; i<=N; i++) {
        for(let j=1; j<=i; j++) {
            let temp = j;
            let cnt = 0;

            // console.log(i);
            // console.log(temp);
            
            while(temp < i && j !== 1) {
                temp = Math.pow(temp, 2);
                cnt++;
            }
            
            //console.log("i:" + i);
 
            if(temp === i && cnt !== 0) {
                answer = i;
            }
        }
    }
    
    console.log(answer);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
