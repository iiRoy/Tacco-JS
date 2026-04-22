'use strict'

function main(input) {
    let n = Number(input.split('\n')[0].split(' ')[0]);
    let a = [];
    for (let i = 0; i < n; i++) {
        a[i] = Number(input.split('\n')[1].split(' ')[i]);
    }
    let ans = 0;
    for (let i = 0; i < a.length + 1; i++) {
        if ((i+1)%2!==0 && a[i]%2!==0) {
            ans++;
        }
    }
    console.log(ans);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));