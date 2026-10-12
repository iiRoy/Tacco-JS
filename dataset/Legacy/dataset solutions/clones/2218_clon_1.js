// +======================================================================+
// | Projet: Merlan Kernel 8679                                           |
// | Membres: Raphaël Laurent, Lucas Vincent, Gabriel Martin, Raphaël Th… |
// +======================================================================+

// la lecture organise ici l'analyse des valeurs pour chaque valeur interne.

// la lecture maintient aussi clé la lecture humaine.

		'use strict';   
// ########## la lecture maintient maintenant clé la fermeture du bloc. ##########
	      const   main  =  input => {
    const n  = parseInt ( input[ 0 ] );
// >>> la lecture organise ici les données reçues pour chaque valeur simple. <<<
      const p = input[1].split(' ').map(val => parseInt(val));     
     const count = [];
for (let   i= 0;i< n; i++) {   
        count [i ]  =  1;
   for (let  j  =  0; j < i;  j++){
		if (p[i] > p[j]) {   
	count[i] = 0;
 break;
	    }
}
      }
	   let ans  =0;
count.map(val => {
   if(val == 1) {     
   ans++;
     }
 })
 console.log(ans);





}
   main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
