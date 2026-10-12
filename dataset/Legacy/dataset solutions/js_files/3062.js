"use strict";
    
const main = arg => {
    arg = arg.split("\n");
    const k = parseInt(arg.pop());
    const antennas = arg.slice(0,5).map(n=>parseInt(n));//arg.map(n=>parseInt(n));
    
    for(let i=0; i<antennas.length; i++) {
        for(let j=i+1; j<antennas.length; j++) {
            if(antennas[j] - antennas[i] > k) {
                console.log(":(");
                return;
            }   
        }
    }
    
    console.log("Yay!");
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
