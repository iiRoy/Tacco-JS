"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    let H = parseInt(arg[0].split(" ")[0]);
    let W = parseInt(arg[0].split(" ")[1]);
    
    let answer = H * W;
    let s = [...Array(3)];
    
    for(let i=0; i<2; i++) {
        for(let h=1; h<H; h++) {
            // 縦割り
            s[0] = h * W;
            s[1] = (H - h) * (W / 2);
            s[2] = H * W - (s[0] + s[1]);
            
            s.sort((a,b)=>a-b);
            answer = Math.min(answer, s[2] - s[0]);
            
            // 横割り
            s[0] = h * W;
            s[1] = ((H - h) / 2) * W;
            s[2] = H * W - (s[0] + s[1]);
            
            s.sort((a,b)=>a-b);
            answer = Math.min(answer, s[2] - s[0]);
        }
        
        // 90度回転
        let temp = H;
        H = W;
        W = temp;
    }
    
    console.log(answer);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));