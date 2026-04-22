"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0].split(" ")[0]);
    const K = parseInt(arg[0].split(" ")[1]);
    const numbers = arg.slice(1, N+1);
    
    const map = [];
    
    for(let i in numbers) {
        let temp = numbers[i].split(" ").map(n=>parseInt(n));
        
        let number = temp[0];
        let amount = temp[1];
        
        map.push({number: number, amount: amount})
    }
    
    //map.sort((a,b)=>a.number - b.number);
    
    let sum = 0;
    let i   = 0;
    
    while(sum < K) {
        sum += map[i].amount;
        i++;
    }
    
    console.log(map[i - 1].number);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
