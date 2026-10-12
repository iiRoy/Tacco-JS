"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0].split(" ")[0]);
    const K = parseInt(arg[0].split(" ")[1]);
    
    const AB = arg.slice(1, N + 1).map(n=>n.split(" ").map(l=>parseInt(l)));
    
    let array = [{num: AB[0][0], amount: AB[0][1], totalAmount: AB[0][1]}];
    let totalAmount = AB[0][1];
    
    for(let i=1; i<N; i++) {
        totalAmount += AB[i-1][1];
        let temp = {num: AB[i][0], amount:AB[i][1], totalAmount: totalAmount};
        
        array.push(temp);
        
    }
    
    for(let i in array) {
        if(array[i].totalAmount >= K) {
            //console.log(JSON.stringify(array[i]));
            const answer = array[i].totalAmount - array[i].amount < K ? array[i].num : array[i-1].num;
            console.log(answer);
            return;
        }
    }
    
    console.log(JSON.stringify(array));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));