"use strict"

function main(arg) {
  
   const input = arg.trim().split("\n");

    let health = parseInt(input[0].split(" ")[0]);
    const numberOfMoves = parseInt(input[0].split(" ")[1]);
    const attacts = input[1].split(" ").map(n=>parseInt(n));

  	let count = 0;
  	let i = 0;
  	while(health >= 0){
      count++;
		if( i >= attacts.length){
        	i = 0;        	
        }
	    health = health - attacts[i];
    }
  
  	if(count <= numberOfMoves){
    	console.log("yes");
    }else{
    	console.log("no");
    }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));