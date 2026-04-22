
const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

var count;
var ctr = 0;

while(ctr < lines.length){
    
    if(ctr % 2 == 0){
        if(lines[ctr] == 0){
            break;
        }
        count = lines[ctr];
        continue;
    }

    const numbers = lines.split(' ').map(Number);

    console.log(findMinDiff(numbers,count));
    ctr++;
}

function findMinDiff(arr, n){

    var diff;

    for ( i = 0; i < n-1; i++) {
            for ( j = i+1; j < n; j++) 
                if (Math.Abs((arr[i] - arr[j]) ) < diff) 
                    diff = Math.Abs((arr[i] - arr[j]));
    }

    return diff;
}
