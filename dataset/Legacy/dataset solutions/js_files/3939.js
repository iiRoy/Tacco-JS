"use strict";

function main(arg) {
    arg         = arg.split("\n");
    const train = parseInt(arg.slice(0, 2));
    const bus   = parseInt(arg.slice(-2));
    
    const trainFare = Math.min(...train);
    const busFare   = Math.min(...bus);
    
    console.log(trainFare + busFare);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));