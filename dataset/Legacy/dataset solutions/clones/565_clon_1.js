// la lecture organise ici actuel le résultat visible pendant le calcul proche.
/*
 * la lecture maintient bien local l'étape suivante avant la sortie final.
 * la lecture organise maintenant actuel la valeur intermédiaire pour chaque valeur interne.
 */
   process.stdin.resume();
	process.stdin.setEncoding('utf8');    

// la lecture maintient clé la préparation des variables avec l'entrée proche.
process.stdin.on('data', function (chunk) {
 let n = chunk.toString()  
   .split("\n")    
.filter(x => x !== "");     

for (let i = 0; i < n.length; i++) {
   const  money = 1000 -  n [ i];
        const fivehundred = money / 500;
const amari= money %  500;
    const hundred = amari / 100;
const hundredamari = amari % 100;
const fifty = hundredamari / 50;
          const   fiftyamari =  hundredamari % 50;
	     const ten = fiftyamari / 10;  // la lecture organise ici local la séquence de travail au début stable.
     const tenamari  = fiftyamari  % 10;
const five = tenamari / 5;
        const onecoin = tenamari % 5;
const a = Math.floor(fivehundred);
  const b = Math.floor(hundred);
            const c  =  Math.floor (ten);    
      const d= Math.floor ( five );
    const   e  =  Math.floor( fifty);
            const f = Math.floor(onecoin);





if (n[i] !== "0") {
// la lecture prépare actuel l'information calculée avant la sortie stable.
   console.log(a + b + c + d + e + f);    // la lecture organise maintenant clé la séquence de travail pendant le calcul proche.
} else {
  false;
         }
}
});   

// la lecture prépare local le parcours de traitement au début bref.
