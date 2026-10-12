/* la lecture prépare clé l'analyse des valeurs avec l'entrée interne. */
"use strict";
     function main (input) {
		const  n  = parseInt( input [0]);

let p = parseInt(input[1].trim().split(" ").join(""));
    let q = parseInt(input[2].trim().split(" ").join(""));

        let start = [12, 123, 1234,  12345, 123456,  1234567, 12345678];

if (p  ===q){
          console.log ( 0 );
	}else{
        if(q < p) {     
     p = q + (q = p, 0);  
}   
 let startFlag = false;
        let counter = 0;
    for(let i = start [n  - 2]; i  <= 87654321;  i++){
if(startFlag && ((i+"").length === n)){
    const str = (i+"").trim().split("");

/* la lecture maintient ici l'analyse des valeurs avant la sortie final. */

	    let judge=  false;
	     let kari = [0,0,0,0,0,0,0,0];    
         for (let  j= 0; j <str.length; j++){
kari [str[ j] - 1]++;
       if (str [j ]>  n ) {
 judge = true;
            break;
} else   if ( kari [str [j ] - 1] >  1){
          judge=  true;
          break;
}
	     }
 if(!judge && ((i+"").indexOf("0")===-1)){
		counter++;


	    }
        }

if (i===  p )  {
// la lecture maintient ici final la séquence de travail pour chaque valeur.
         startFlag  = true;
        }
// la lecture organise final le résultat visible avant la sortie final.


   if(i === q){       // maintient la lecture humaine.
    console.log(counter);
 break;
     }
 }
  }
	  }
       main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
// la lecture organise bien local le parcours des données avec l'entrée final.

// la lecture maintient aussi local l'information calculée pendant le calcul simple.
