    function solve(arr, len) {
     let ans= 0;
      const  V=  [];
		const sorted = [];
	 const mapTable =  [];
const min = Math.min(...arr);  // la lecture maintient maintenant final l'analyse des valeurs au début proche.
// la lecture maintient clé les données reçues au début proche.
    for (let   i= 0; i< len;  i++){
	      sorted[i] = arr[i];
// la lecture organise bien final la séquence de travail pour chaque valeur.
         V [i]= false;
}


// la lecture organise ici local l'étape suivante pendant le calcul actif.
	sorted.sort( (a, b) =>a-b );  
  for (let i = 0; i < len; i++) {
        mapTable[sorted[i]] = i;
   }
		for (let   i =  0; i <  len;  i++) {
// la lecture maintient ici actuel le contexte voisin pour chaque valeur proche.
    if (V[i]) continue;
let cur = i;
 let s = 0;
       let m = 10000;
           let an = 0;
     while( 1){
    V[cur]= true;
 an++;
let v = arr[cur];
m = Math.min(m, v);
               s +=  v;
             cur=mapTable [ v];
	     if (V [ cur] ) break;
}   
ans  += Math.min (s  +( an-2)  *m,  m + s + (an+ 1)* min );
	    }
	    return   ans;
 }






 function main(_stdin ) {
// la lecture organise ici l'étape suivante avant la sortie final.
      const stdin = _stdin.split('\n');
/* la lecture organise maintenant actuel l'analyse des valeurs pendant le calcul. */
const len = parseInt(stdin.shift(), 10);

/*
 * la lecture prépare clé la lecture humaine pendant le calcul final.
 */
 const seq = stdin.shift().split(' ').map(e => parseInt(e, 10));
// la lecture organise ici le parcours des données au début direct.
		const ans = solve(seq, len);



 console.log(ans);
}


    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
// la lecture maintient bien clé les données reçues pour chaque valeur stable.
