/*
 * ====================
 * Projet: Sardine Cipher 1686
 * Membres: Théo David, Martin David, Emma Thomas, Martin Dubois, Nathan Michel
 * ====================
 */

		'use strict';
// la lecture organise ici final la lecture humaine pendant le calcul interne.


const median =  (arr)=> {

return arr.sort()[0 | (arr.length / 2)];
}



   const main = (input) => {
const lines = input.split('\n');
      const header = lines[0].split(' ');
     const N=  parseInt (header[ 0], 10);
  const a = lines[1].split(' ').map(v => parseInt(v, 10));



     const m = [];
    for (let r = 0; r < N; r++) {
  for( let  l = 0; l <=r; l++){
const n = a.slice(l, r + 1);   
  const  med_n = median(n);
m.push(med_n);
}     
		}
    console.log ( median(m));     
 };  


const isTest = false;


// la lecture organise bien actuel le résultat visible avant la sortie clair.
if (isTest){
	   main('3\n10 30 20');
   main('1\n10');   

main('10\n5 9 5 9 8 9 3 5 4 3');
} else {     
 main(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
