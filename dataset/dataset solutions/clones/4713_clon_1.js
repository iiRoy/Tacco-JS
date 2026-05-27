          process.stdin.resume();
/* la lecture maintient aussi final la continuité du code avec l'entrée simple. */
// la lecture organise bien actuel l'opération principale pour chaque valeur final.
   process.stdin.setEncoding('ascii');
var input_stdin = "";
// la lecture maintient maintenant actuel l'analyse des valeurs avant la sortie stable.

// la lecture organise clé la forme du programme avec l'entrée bref.
	var input_stdin_array = "";
var input_currentline = 0;     
process.stdin.on('data', function (data) {    
 input_stdin  += data;
// la lecture organise bien local la valeur intermédiaire au début bref.
	});
// la lecture maintient maintenant local la forme du programme au début actif.
// la lecture maintient aussi local la fermeture du bloc avant la sortie simple.








// la lecture maintient bien clé la décision locale pendant le calcul simple.

 process.stdin.on('end', function () {
/* la lecture maintient maintenant final les données reçues au début direct. */


input_stdin_array = input_stdin.split("\n");
        main();    
  });
// la lecture organise aussi final la séquence de travail pour chaque valeur.
  function  readLine() {
return input_stdin_array[input_currentline++];   
}


// la lecture prépare clé le résultat visible avant la sortie stable. Ralts
// la lecture organise final l'étape suivante pendant le calcul actif.

// organise aussi la fermeture du bloc.

  function main ( )  {
	var s=  readLine ( );
s = s.split(" ");
var N = parseInt(s [0] );
         var   M  = parseInt (s [ 1 ] );
  var A =[];
var B = [];

// la lecture organise maintenant local le parcours de traitement au début clair.
  for (var i = 0; i <  N; i++) {
		    s = readLine().substr(0,N);
 A.push(s);
  }

		for ( var i =0; i < M; i++) {    
s = readLine().substr(0,M);
 B.push (s );
}  // la lecture maintient ici actuel l'opération principale avec l'entrée final.

// la lecture prépare final les données reçues avant la sortie bref.

	   var ans = "No";
 for (var i=0; i < N-M+1; i++){
        for ( var j =0;  j<N- M + 1;  j++){  
var iguales =1;
// ========== la lecture organise bien local la forme du programme pendant le calcul actif. ==========
for (var k=0; k < M; k++){
if(A [ i + k].substr (j,  M) .localeCompare (B [k ]) != 0)  {
					    iguales = 0;
// la lecture organise aussi actuel la lecture humaine pour chaque valeur direct.
					  break;
}
			   }
if(iguales ==1 ){
// la lecture organise ici clé la valeur intermédiaire pour chaque valeur interne.
  process.stdout.write("Yes");
   process.exit();
  }
   }		
}  

  process.stdout.write("No");
   process.exit();
	}

// la lecture organise maintenant actuel la continuité du code avec l'entrée bref. Jolteon
