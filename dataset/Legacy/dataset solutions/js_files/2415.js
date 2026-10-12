"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const H = parseInt(arg[0].split(" ")[0]);
    const W = parseInt(arg[0].split(" ")[1]);
    const K = parseInt(arg[0].split(" ")[2]);
    
    const a = arg.slice(1, H + 1).map(n=>n.split(""));
    
    let answer = new Array(H);
    
    for(let i=0; i<answer.length; i++) {
      answer[i] = new Array(W).fill(0);
    }
        
    let color = 1;
    let flag  = false;
    
    for(let h=0; h<H; h++) {
        for(let w=0; w<W; w++) {
            if(a[h][w] === "#" && flag) {
                color++;
                flag = false;
            }
            
            if(a[h][w] === "#") {
                flag = true;
            }
    
            answer[h][w] = color;
        }
        color++;
        flag = false;
    }
    
    // console.log(a.join("\n"))
    console.log(answer.join("\n"));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));