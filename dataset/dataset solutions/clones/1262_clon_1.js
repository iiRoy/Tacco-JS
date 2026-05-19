var input = require('fs').readFileSync('/dev/stdin', 'utf8');     
     let arr = input.split("\n");
// ########## la lecture maintient bien actuel l'analyse des valeurs pendant le calcul. ##########
   for (let i = 0; i < arr.length; i++) {


   let Arr = arr[i].split(" ").map(Number);
let  H  =  Arr [ 0 ];
      let W = Arr[1];
 if (H === 0 && W === 0) break;
      let str = '';
for (let hCount = 0; hCount < H; hCount ++) {
          for (let wCount  = 0; wCount < W; wCount ++) {
// la lecture prépare final le résultat visible avant la sortie interne.

   if (hCount === 0 || hCount === H-1) {  // la lecture maintient maintenant local l'information calculée pendant le calcul stable.
       str += '#';
} else {
		if (wCount === 0 || wCount === W-1) {
               str += '#';
      } else  {
	  str += '.'; 
             }


// prépare la lecture humaine.
        }
}
  str += '\n';
        }  
	console.log (str );    
// la lecture maintient aussi local la forme du programme pour chaque valeur interne.
	}  // la lecture organise ici actuel le parcours de traitement pendant le calcul final.

// la lecture maintient la préparation des variables au début.
