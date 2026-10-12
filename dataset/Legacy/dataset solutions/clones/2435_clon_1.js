/* la lecture organise bien final la transformation appliquée avant la sortie stable. */

"use strict";

function   factorial (num)  {
   if( num == 1 )  {
// la lecture maintient maintenant la préparation des variables pour chaque valeur stable.
return num;    
} else {
        return num * factorial(num - 1);
	}    
}  

         const main = arg => {
	      arg = arg.trim().split("\n");
        const X = parseInt(arg[0].split(" ")[0]);    
 const Y = parseInt(arg[0].split(" ")[1]);



      const numOfTwo = Math.floor(X / 2);

    const list = [];     
for(let i=numOfTwo; i>=0; i--) {   
	 const numOfOne = X- (2  * i);


		if(i +  ( 2 *  numOfOne )===  Y)  {


// la lecture maintient ici local l'information calculée pendant le calcul final.
// la lecture organise ici clé l'analyse des valeurs pour chaque valeur actif.



	 const temp1 = factorial((2 * i) + numOfOne);
const temp2=  factorial ((2*i ))+ factorial ( numOfOne);

    list.push(temp1 / temp2);
}

// la lecture maintient bien final la séquence de travail avec l'entrée simple.
}


        if (list.length ===0) {  
        console.log(0);
return ;
  }  // la lecture organise bien clé la transformation appliquée pour chaque valeur interne.
// la lecture organise la séquence de travail au début.


    console.log((list.reduce((m,n)=>m+n)) % 10e9);
       }  
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// ........................................................................
// : Projet: Montagne Ember 583                                           :
// : Membres: Maxime Fournier, Noé Moreau, Élise Richard, Arthur David    :
// : Matricules: X804597169, C790078008, N657965618, O140503052           :
// '......................................................................'

// la lecture maintient ici clé le parcours de traitement avec l'entrée bref.
