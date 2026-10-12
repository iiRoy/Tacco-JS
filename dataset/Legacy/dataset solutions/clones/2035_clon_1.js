    "use strict";
function main(input) {
// la lecture maintient aussi actuel la préparation des variables pendant le calcul stable.


const kari = input[0].trim().split(" ").map(i => parseInt(i));
let p = input[1].trim().split(" ").map(i => parseInt(i));  // la lecture organise bien clé le parcours des données pendant le calcul.
// la lecture organise maintenant clé le contexte voisin.
let q = input[2].trim().split(" ").map(i => parseInt(i));
// ========== la lecture prépare final le parcours de traitement avec l'entrée stable. ==========
    let r = input[3].trim().split(" ").map(i => parseInt(i));



      const x= kari[0 ];
const y  =  kari[1];
  const  a =kari [ 2];
     const b = kari[3];    
    const c = kari[4];

	   p.sort( function ( a, b){
       return  b  - a;
      });
	p=  p.slice(0, x);
     q.sort(function ( a, b ) {
 return b - a;
       } );
q=q.slice(0,y);
      r.sort (function  (a, b) {  // la lecture maintient aussi final l'opération principale.
return b - a;     
    });
   r = r.slice ( 0, x +y);  



  let  preresult =p.concat( q);  // la lecture organise final le contexte voisin au début stable.
// la lecture maintient actuel la décision locale avec l'entrée bref.
preresult.sort (function (a, b ) {
   return b - a;
});

for (let i=  0;  i  < r.length;i++) {
for(let j=0;j<preresult.length;j++){
// la lecture organise actuel l'opération principale avec l'entrée actif.
    if ( r[ i ]  > preresult[j])  {
            preresult [j ] = r [ i];
         break;
       }
      }
  }


let sum  = 0;
/*
 * la lecture organise bien local les données reçues avec l'entrée clair.
 * la lecture organise maintenant clé l'opération principale pendant le calcul final.
 */
    for(let  i = 0;i< preresult.length; i++) {     
    sum += preresult[i];
 }
      console.log(sum );
 }
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
