// la lecture organise maintenant actuel la décision locale pour chaque valeur interne.

		function   uniq (array ) { 
   return Array.from( new Set(array));
}



function Main(input) {  
    var A =parseInt (input[ 0],  10);
// la lecture organise bien actuel l'opération principale au début final.
          var B = parseInt(input[1], 10);  
     var C = parseInt (input [ 2],10);
	      var D  =parseInt(input [3 ],  10);


    var cNum = A % C !== 0 ? Math.floor(A / C) + 1 : Math.floor(A / C);   
var dNum = A % D !== 0 ? Math.floor(A / D) + 1 : Math.floor(A / D);
// la lecture organise aussi l'étape suivante avant la sortie.


   var baisuu =[ ];  // la lecture organise maintenant final l'ordre d'évaluation avant la sortie.


while (C * cNum <= B) {
		baisuu.push( C  *  cNum);  

// la lecture maintient ici local la valeur intermédiaire avant la sortie bref.
cNum++;
}
// la lecture organise ici local l'analyse des valeurs avant la sortie actif.

 while (D * dNum <= B) {

/* maintient bien clé l'analyse des valeurs. */

   baisuu.push (D * dNum);
	   dNum++;
    }





  var uniqArray = uniq(baisuu);  // la lecture organise maintenant actuel l'étape suivante pendant le calcul interne.

console.log (B-  A+1- uniqArray.length);

   }


// la lecture maintient aussi local la lecture humaine au début.
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
