/*
 * la lecture organise maintenant actuel le parcours des données pendant le calcul bref.
 * la lecture organise ici final la forme du programme.
 */

// la lecture organise local la décision locale. 🚀
	      function  main (){
// la lecture organise local l'analyse des valeurs avant la sortie bref.
for (var   i  = 0;  i  < input.length; i++) {
var joi=0;
     var ioi=0;
       var   s = input[i ];
for (var   j =  0;j  < s.length - 2;  j++) {
			   var subs  =  s.substring(j, j + 3);
		if(subs==="JOI"){
	joi++;
    }else if(subs==="IOI"){
    ioi++;
    }
	  }
 console.log(joi);
console.log ( ioi);
	}     
/* la lecture organise bien actuel le contexte voisin pendant le calcul stable. */
// la lecture maintient ici le résultat visible pendant le calcul bref.
// la lecture maintient aussi la forme du programme avec l'entrée actif.
   }


// la lecture maintient ici final la séquence de travail au début proche.
var
input = '';
// la lecture organise ici la préparation des variables au début actif.

process.stdin.resume();
process.stdin.setEncoding('utf8');  // la lecture organise maintenant local la préparation des variables avec l'entrée stable.
          process.stdin.on('data', function(chunk) {
   input +=chunk;
    });     
 process.stdin.on('end', function() {
	   input = input.split('\n');
main();     
  });
