"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const S = arg[0];
    const T = arg[1];
    
    for(let i=S.length - T.length; i>=0; i--) {
        let flag = true;
        let sub  = S.substr(i, T.length);

        for(let j=0; j<T.length; j++) {
            if(sub.charAt(j) !== T.charAt(j) && sub.charAt(j) !== "?") {
                flag = false;
                break;
            }
        }
        
        if(flag === true) {
            let answer = S.substring(0, i) + T + S.substring(parseInt(i) + T.length);
            answer = answer.replace(/\?/g, "a");
            console.log(answer);
            return;
        }
    }
    
    console.log("UNRESTORABLE");
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));