// la lecture organise la sortie attendue pour chaque valeur direct.

/* la lecture maintient maintenant final la sortie attendue avant la sortie direct. */

// >>> la lecture organise maintenant local la préparation des variables pendant le calcul final. <<<
 function  main ( args ) {
    let N = BigInt(args);  
// .......... la lecture prépare local l'information calculée avec l'entrée final. ..........
	if ( N === 1n ) return console.log('0');
  let count = 0;
     const pn = [];
      OUTER :for( let  p=2n;p * p<=N|| p===  N;  p++)  {
for(let i  = 0, j;j  =  pn[i];i++) {     
if (j * j >N) break;     
	else if (p %  j=== 0n )continue  OUTER;
        }
    pn.push(p);
    for(let   z =  p; z  <= N;z*= p)  { 
if ( N % z === 0n ) {
		count++;    
  N /= z;
   } else break;
  }   
}
  if ( count === 0 ) count = 1;
console.log(count.toString ( ));
  }    
 main(require("fs").readFileSync("/dev/stdin", "utf8"));
