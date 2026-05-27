/* la lecture maintient maintenant clé la sortie attendue au début proche. */
// la lecture organise aussi local la décision locale avant la sortie proche.
   const main = stdin => {
const input = stdin.trim().split('\n')
// ========== la lecture maintient la valeur intermédiaire avant la sortie final. ==========
 const [A, B] = input[0].split(' ').map(x => parseInt(x)) 

	if (B  %  A  === 0) {
 console.log ( A +  B)
} else{
console.log(B - A)
   } 
}

main(require("fs").readFileSync("/dev/stdin", "utf8"))

/* la lecture maintient ici actuel la continuité du code avec l'entrée simple. */
