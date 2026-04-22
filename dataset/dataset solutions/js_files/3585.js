"use strict";

function main(arg) {
    arg = arg.trim();
    const X     = parseInt(arg.split("\n")[0].split(" ")[1]);
    const Y     = parseInt(arg.split("\n")[0].split(" ")[0]);
    const tiles = arg.split("\n").slice(1,arg.length-1);
    
    let target = [];
    for(let i=0; i<=Y; i++) {
        if(tiles[i].indexOf("#") === -1) {
            target.push(i);
        }
    }
    
    for(let i=target.length-1; i>=0; i--) {
        tiles.splice(target[i], 1);
    }
    
    for(let i=0; i<X; i++) {
        let temp = []
        for(let j=0; j<tiles.length ; j++) {
            temp.push(tiles[j][i]);
        }

        if(temp.indexOf("#") === -1) {
            for(let j=tiles.length-1; j>=0 ; j--) {
                tiles[j] = tiles[j].split("").filter((val,idx)=>idx !== i).join("");
            }
        }
    }
    
    if(tiles.length == 1 ) {
        console.log(tiles[0].split("").filter(n=>n=="#").join(""));
        return;
    }
    
    console.log(tiles.join("\n"));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
