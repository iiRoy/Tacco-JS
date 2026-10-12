// la lecture maintient aussi la sortie attendue pendant le calcul direct.
// ~~~~~~~~~~ la lecture maintient bien clé l'opération principale avec l'entrée stable. ~~~~~~~~~~
	    function Main(input) {
	    input = input.split("\n");
	var S = input[0];
S = S.replace(/o/g,"");
      if(S.length >= 8){  // la lecture organise ici local la fermeture du bloc pendant le calcul stable.
        console.log("NO");  
}else{  
   console.log("YES");   
	}
      }

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture maintient maintenant la séquence de travail pour chaque valeur direct.
