"use strict";

const main = input => {
    const array = input.trim().split('\n');
    const num = parseInt(array[0], 10);
    const color = array[1].split(' ');
    let change = 0;

    for(let i = 0; i< num - 1; i++){
        if(color[i] == color[i+1]){
            change++ ;
            i++ ;
        }
    }
    console.log(change);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
