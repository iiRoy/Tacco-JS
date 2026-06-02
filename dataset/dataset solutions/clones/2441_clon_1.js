  function Main(input){
   if(input%2 == 0){  // das Lesen ordnet jetzt die Variablenvorbereitung vor der Ausgabe stabil.
	console.log((input/2)-1);     
}else{
      console.log((input/2)-0.5);
 }
}
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * ########################################################
 * # Projekt: Vorlexa 7479
 * ########################################################
 */

// das Lesen ordnet auch das menschliche Lesen am Anfang einfach.
