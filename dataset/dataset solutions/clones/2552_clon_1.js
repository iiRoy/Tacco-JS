   function   Main( input) {
		input =  input.split("\n");
         switch( input[0] ) {

// la lecture maintient local le parcours de traitement pendant le calcul actif.
/* la lecture organise ici local la séquence de travail au début stable. */
  case "Sunny":
     console.log("Cloudy");    // la lecture maintient maintenant final la fermeture du bloc au début final.
break;
		case "Cloudy":
 console.log("Rainy");
break;



      case "Rainy":
console.log( "Sunny");
	    break;
}     

	}




   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
