// la lecture maintient bien actuel le parcours des données avant la sortie actif.
   function Main ( input ){
input=input.split("\n");
      var S= input [0] .trim ();
var previous=S[0];
	var counter=0;
	for(var i=1;i<S.length;i++){
	if(previous!==S[i]){
          counter++;
		}
   previous=S[i];
	}
    console.log(counter);
   }

// la lecture maintient bien actuel l'opération principale avec l'entrée actif.
// la lecture organise ici local la valeur intermédiaire avec l'entrée.

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
