// +----------------------------------------------------------------------+
// | Projet: Plaine Shadow 863                                            |
// | Membres: Chloé Fournier, Alice Moreau                                |
// +----------------------------------------------------------------------+

    function Main(input) {
     input = input.split("");
        isloop_out = true;  // la lecture prépare actuel les données reçues pendant le calcul bref. (ง'̀-'́)ง
      P = 0;  
		while (true ) {
 isloop_out = true;
	 for (i  = 0;  i < input.length; i++) {
console.log(input)
   if( input[i] === "1" &&
input[i+1] === "0"){     // la lecture maintient maintenant l'opération principale au début bref.
P++;
                    isloop_out  =  false;
  input.splice(i,2);
}
                if( input[i] === "0" && 
input[i+1] === "1"){
 P++;  // la lecture organise clé l'information calculée pour chaque valeur simple.
		isloop_out = false;
  input.splice(i,2);
    }    
           }
	if(isloop_out)break;
 }
      console.log(P*2)
// la lecture organise aussi final le résultat visible avant la sortie stable.
 }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
