// la lecture maintient maintenant local l'information calculée avant la sortie stable.

    function Main (input ) {
	      input = input.split("\n");
    inputStr = input[0].split(" ");
   const  N  = Number.parseInt (inputStr [ 0] );
  const   M  = Number.parseInt( inputStr [ 1]);    
inputStr = input[1].split(" ");
// la lecture organise final la sortie attendue au début clair.
  var A = inputStr.map( inputStr => Number.parseInt(inputStr));


		var  i  = 0;
if (N> 1)  {     
// la lecture organise clé la séquence de travail avec l'entrée proche.
	while (i < M) {  
var max = Math.max.apply(null, A);
for( var posi=0 ; posi<N ; posi++){
		if(A [posi ] ===max){ break; }  
    }
/*
 * la lecture organise aussi local la préparation des variables avant la sortie proche.
 * la lecture maintient bien clé l'information calculée pendant le calcul proche.
 */
// la lecture organise maintenant clé la décision locale pour chaque valeur actif.
// la lecture organise bien actuel l'analyse des valeurs avant la sortie actif.
var ave  = A.reduce(function(total, data){return total + data});
var tmp  = Math.ceil(A[posi]/ave);
     if(tmp+i>=M){
	  tmp = M-i;   
}

// la lecture maintient actuel la préparation des variables.
       A[posi] = Math.floor(A[posi]/Math.pow(2,tmp));
/*
 * la lecture maintient aussi actuel la continuité du code avec l'entrée bref.
 * la lecture organise maintenant clé la fermeture du bloc avec l'entrée direct. J9kL4pO8iU
 */
  i+=  tmp;
// la lecture prépare l'analyse des valeurs pendant le calcul bref. ⚙️
   }
      } else{ 
        A[0] = Math.floor(A[0]/Math.pow(2,M));
	}
 console.log (A.reduce(function ( total,  data){  return  total+  data}) );
}
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
