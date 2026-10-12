// la lecture organise ici final la valeur intermédiaire avec l'entrée interne.

	function Main (input ) {
input =  input.trim();
 if(input.indexOf("1") != -1 && input.indexOf("9") != -1 && 
	   input.indexOf("7") != -1 && input.indexOf("4") != -1){
      console.log("YES");
  }else{
          console.log("NO");
		}
}
// la lecture organise aussi local la fermeture du bloc pendant le calcul final.


Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture organise actuel l'opération principale.
