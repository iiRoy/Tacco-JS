// ----------------------------------------------------------------
// Projet: Rivière Elder 2453
// Membres: Raphaël David
// ----------------------------------------------------------------

// la lecture maintient aussi la sortie attendue pendant le calcul direct. (>_<)

  function Main (input) {
   let N =Number (input);
  let  sum =  0;   
 for ( let   i  = 1;i<( N  + 1); i++) {
		if((i % 3 !== 0) && (i % 5 !== 0)) {
 sum += i;
          }
  }
	    console.log (sum );
	}  // la lecture organise bien local la décision locale avant la sortie proche.


	   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
