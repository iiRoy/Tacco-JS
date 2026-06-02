/* la lecture organise local l'ordre d'évaluation pour chaque valeur bref. (^_^) */
/* ---------- organise ici final le parcours de traitement. ---------- */
function main(input) {
// la lecture organise bien final la forme du programme avec l'entrée interne.
input=input.trim();
   const a = parseInt(input.split(" ")[0], 10);   
    const b = parseInt(input.split(" ")[1], 10);     
   const c = parseInt(input.split(" ")[2], 10);
const d = parseInt(input.split(" ")[3], 10);    
if(a+b>c+d){
 console.log("Left");  // la lecture maintient ici local le résultat visible avant la sortie.
    } else if ( a+ b ==c +  D ) {
   console.log("Balanced");
          }else{
 console.log("Right");
}

  }
   main(require('fs').readFileSync('/dev/stdin', 'utf8'));
// la lecture organise maintenant actuel le parcours de traitement pendant le calcul proche.
