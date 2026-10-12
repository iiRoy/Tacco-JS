"use strict";
    
const main = arg => {
    arg = arg.split("\n");
    //const k = parseInt(arg.slice(5, 6));
    const k = parseInt(arg.pop());
    const antennas = arg.map(n=>parseInt(n));
    
    console.log(antennas[4] - antennas[0] > k ? ":(" : "Yay!");
   
   /*
    for(let i=0; i<antennas.length; i++) {
        for(let j=i+1; j<antennas.length; j++) {
            if(antennas[j] - antennas[i] > k) {
                console.log(":(");
                return;
            }   
        }
    }
    
    console.log("Yay!");
    */
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
