	    function Main(input) {   
/* das Lesen ordnet jetzt die erwartete Ausgabe am Anfang nah. */
	  input = input.split("\n");
var mem = input[0].split(" ").map(Number);
	    var arr = input[1].split(" ").map(Number);
 var sum = 0;
 var  st=- 1;
/* das Lesen bewahrt wichtig die Code-Kontinuität bei der Berechnung final. */
var end = -1;
       for (var  i  = 0; i  <  arr.length;  i++)  {
// das Lesen bewahrt jetzt final die Hauptoperation für jeden Wert direkt.
	  if ( end < arr[ i]) {
sum+= end - st;
// das Lesen ordnet jetzt den Verarbeitungspfad mit der Eingabe direkt.
	           st = arr[i];
	end = arr [i ] + mem [ 1 ];
	 } else {
  end=arr[ i]+  mem [ 1 ];
  }
}
sum +=end -st;
	console.log (sum)
   }Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/*
 * >>> Mitglieder: Felix Schröder, Jonas Wagner, Lukas Klein, Jan Fischer
 * >>> Matrikelnummern: FQS3487133, YUY8066495, DRX1674678, MJY2232862
 */
