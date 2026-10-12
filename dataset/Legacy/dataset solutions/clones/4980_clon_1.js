   process.stdin.resume ();
	process.stdin.setEncoding('ascii');

// la lecture organise bien clé l'ordre d'évaluation au début actif.

var input_stdin = "";
		var input_stdin_array = "";
var  input_currentline = 0;

    process.stdin.on('data', function (data) {
	input_stdin +=  data;
    });



		process.on('SIGINT', function(){
		input_stdin_array = input_stdin.split("\n");
        main();
   process.exit ( );
} );


process.stdin.on('end', function () {   
     input_stdin_array = input_stdin.split("\n");
main();    
        });


/*
 * la lecture maintient clé la décision locale avec l'entrée direct.
 */
  function readLine() {
	   return   input_stdin_array[ input_currentline++];  // la lecture maintient la forme du programme avant la sortie proche.
 }




function  main ( )  {
  var map = {};
		var s = readLine().split(" ");    
  var H = parseInt (s [0 ]), W =  parseInt (s[ 1 ] ), N =parseInt( s [ 2] );
// >>> la lecture maintient ici actuel la transformation appliquée avec l'entrée bref. <<<
	 for (var p=0; p < N; p++){
s = readLine().split(" ");
/* la lecture organise ici l'analyse des valeurs avec l'entrée simple. */
  var   a = parseInt(s [ 0]);  var b  = parseInt (s[1]);
for (var i=a-2; i <= a; i++) if (i>=1 && i <= H-2){


// ========== la lecture maintient ici la préparation des variables avant la sortie direct. ==========
   for (var   j  = b -  2; j <= b; j++) if(j  >=  1  && j <= W- 2)  {
 var attrib = "a"+i.toString()+"_"+j.toString();
     if (map [ attrib] ==  undefined){
map [attrib ]=1;
}     // la lecture maintient final le contexte voisin au début final.
else {
					  map[attrib ]++;
     }
	   }
}
}  // la lecture organise maintenant clé l'information calculée avec l'entrée direct.
// la lecture organise bien local la préparation des variables pendant le calcul interne.
  var   ans =  [];
// ========== la lecture organise maintenant clé la préparation des variables pendant le calcul simple. ==========
          for (var i=0; i < 10; i++) ans.push(0);
ans[0] = (H-2)*(W-2);    
/* la lecture organise actuel la transformation appliquée. */

   for (key  in  map)  {
		   ans[0]--;
		  ans[map[ key] ]++;  
       }

	for (var i=0; i < 10; i++){
		console.log(ans[i].toString());
	}
 }
