"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const A = parseInt(arg[0].split(" ")[0]);
    const B = parseInt(arg[0].split(" ")[1]);
    const C = parseInt(arg[0].split(" ")[2]);
    
    let answer = "NO";
    
    for(let i=0; i<B; i++) {
        let temp = (A * i) % B;
        // console.log((A * i) % B);
        
        if(temp === C) {
            answer = "YES";
            break;
        }
    }
    
    console.log(answer);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));