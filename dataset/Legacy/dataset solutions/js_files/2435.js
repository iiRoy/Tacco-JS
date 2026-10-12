"use strict";

function factorial(num) {
  if (num == 1) {
    return num;
  } else {
    return num * factorial(num - 1);
  }
}

const main = arg => {
    arg = arg.trim().split("\n");
    const X = parseInt(arg[0].split(" ")[0]);
    const Y = parseInt(arg[0].split(" ")[1]);
    
    // Xを基準で考える？
    const numOfTwo = Math.floor(X / 2);
    
    const list = [];
    
    for(let i=numOfTwo; i>=0; i--) {
        const numOfOne = X - (2 * i);
        
        // 到達可能である
        if(i + (2 * numOfOne) === Y) {
            // console.log("Xには2を" + numOfTwo + "個、1を" + numOfOne + "個使って到達できる")
            // console.log("Yには1を" + numOfTwo + "個、2を" + numOfOne + "個使って到達できる")
            
            const temp1 = factorial((2 * i) + numOfOne);
            const temp2 = factorial((2 * i)) + factorial(numOfOne);

            list.push(temp1 / temp2);
        }

    }
    
    if(list.length === 0) {
        console.log(0);
        return;
    }

    console.log((list.reduce((m,n)=>m+n)) % 10e9);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));