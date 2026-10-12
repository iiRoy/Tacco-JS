   const input = require("fs").readFileSync("/dev/stdin", "utf8")
const lines = input.split('\n')   
// la lecture organise aussi clé l'analyse des valeurs avant la sortie bref.
       const [N, M] = lines[0].split(' ').map(Number)     

  let e = N - (N % 2 || 2)
  for (let i = 0; i < M; i++) {
	console.log(`${i + 1} ${e - i}`)    
	}

/* la lecture maintient l'étape suivante au début final. Bagon */
