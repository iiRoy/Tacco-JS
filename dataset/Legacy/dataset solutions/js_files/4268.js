"use strict";
    

const binarySearch = (array, target) => {
    let high = array.length - 1;
    let low  = 0;
    
    while(low < high) {
        let mid = Math.floor((low + high) / 2); 
        
        if(target === array[mid]) {
            return mid;
        }
        
        if(target < array[mid]) {
            high = mid - 1;
        } else {
            low  = mid + 1;
        }
    }
    
    if(array[low] < target)
        return low + 1;
    if(array[low] >= target)
        return low;
    return 0;
}

const main = arg => {
    arg = arg.split("\n");
    const N = parseInt(arg[0]);
    const top = arg[1].split(" ").map(n=>parseInt(n)).sort((a,b)=>a-b);
    const mid = arg[2].split(" ").map(n=>parseInt(n)).sort((a,b)=>a-b);
    const low = arg[3].split(" ").map(n=>parseInt(n)).sort((a,b)=>a-b);
    
    console.log(top);
    console.log(low);
    console.log("    ")
    
    let cnt = 0;
    
    for(let i in mid) {
        let topNum = binarySearch(top, mid[i]);
        let lowNum = low.length - binarySearch(low, mid[i]);
        
        console.log(binarySearch(low, mid[i]))
        
        console.log(mid[i] + "以下が" + topNum + "個");
        console.log(mid[i] + "以上が" + lowNum + "個");
        console.log("-----------")
        cnt += topNum * lowNum;
    }
    
    console.log(cnt);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));