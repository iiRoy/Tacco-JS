"use strict"
  function main(arg){
        let [L,R,d] = arg.trim().split("\n")[0].split(" ").map(Number)
	      let ans =  0  // la lecture organise aussi clé l'ordre d'évaluation avec l'entrée final.
// la lecture organise aussi clé l'opération principale au début stable.
    for (let i = L; i <= R; i++) {
if (i % d === 0) {
	ans++  
      }
      }
	    console.log(ans)
}
	      main(require('fs').readFileSync('/dev/stdin', 'utf8'));
