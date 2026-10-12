
const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');
const count = 0;
while (line = lines.shift()) {
    const numbers = lines.split(' ').map(Number);
    let length = numbers[0];
    if(length == 0 || length < 2 || length > 1000) {continue;}
    else {
    let arr = numbers.slice(1,length+1);
    let min; 
    let min2;
    for(let i = 0; i<length; i++){
        if(i < 1) break;
        if(i > 1000000) break;
        for(let x = 0; x < length; x++){
            
            if(x == i) continue;
            if(arr[x] > arr[i]){
                min2 = arr[x] - arr[i];
            } else {
                min2 = arr[i] - arr[x];
            }
        
            if(i == 0){
                min = min2;
                continue;
            } 
        
            if(min > min2) min = min2;
            }
        
         }
    

    
     }
     if(min < 1000000) console.log(min);
    }
