'use strict'

const main = arg => {
    const input = arg.trim().split("\n");
    const nums = parseInt(input[0], 10);
    const cards = input.slice(1).slice(0, nums);
    const fullCards = [];
    const emptyCards = [];

    ["S","H","C","D"].forEach(suit => {
        [...Array(13)].forEach((obj, i) => {
            fullCards.push(suit+ ` ${i+1}`);
        });
    })

    fullCards.forEach(fcard => {
        if(!cards.includes(fcard)){ emptyCards.push(fcard); }
    })

    if(emptyCards.length > 0){
     console.log( emptyCards.join("\n") );
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
