'use strict'

const main = arg => {
    var input = arg.trim().split("\n");
    const lastIndex = input.indexOf("0 0");
    const nums = input.slice(0, lastIndex);
    const result = [...Array(nums.length)].map(obj => (0));

    const callback = (num, max, target, i) => {
        if(num.length >= 3){ return; }
        for(var j=num[num.length-1]+1;j<=max;j++){
            const newNum = [...num];
            newNum.push(j);
            const sum = newNum.reduce((a, b) => a + b);
            if(100 < newNum.length){ break; }
            if(sum === target ){
                if(newNum.length < 3){break;} 
                //    console.log("nums:"+JSON.stringify(newNum));
                result[i]++; 
            }
            if(sum < target){ 
                callback(newNum, max, target, i);
            } else {
                break;
            }
        }
    }

    nums.forEach((row,num) => {
        const next = row.split(" ").map(str => parseInt(str, 10));
        const n = next[0];
        const x = next[1];

        for(var i=1;i<=n;i++){
            callback([i], n, x, num);
        }
    });

    console.log(result.join("\n"));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
