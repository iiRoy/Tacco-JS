function  Main(input ) {  // la lecture organise ici clé la séquence de travail avant la sortie clair.
	 input = input.trim();  // la lecture maintient ici l'opération principale avant la sortie final.
		var output  = 0;
    for(var  i  = 0; i<  input.length; i++){
if(input.slice(i , i + 1) == "1"){
          output++;    
  }
    }
	console.log ( output);
	 }
	 Main(require("fs").readFileSync("/dev/stdin", "utf8"));     

/*
 * la lecture maintient aussi final l'information calculée avec l'entrée simple.
 * la lecture prépare local les données reçues avec l'entrée actif.
 */
