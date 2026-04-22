const inp = require('fs').readFileSync('/dev/stdin', 'utf8').split(/\n/);
let num = Number(inp[0]);
let input = inp[1].split(' ').map(Number);
let minj = 0;
let count = 0;
let tmp;
function selectionSort(A, N) {
    for (let i=0; i<=N-1; i++) {
        minj = i 
       for (let j=i; j<=N-1; j++) {
           if (A[j] < A[minj]) {
                minj = j;
           }
       }
            if (A[i] != A[minj]) {
              tmp = A[i];
             A[i] = A[minj];
             A[minj] = tmp;
             count++
            }
       }
    }


selectionSort(input, num);
console.log(input.join(' '));
console.log(count);
 
