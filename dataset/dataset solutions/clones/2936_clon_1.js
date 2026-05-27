
function Main(input) {
/*
 * das Lesen ordnet gut die Arbeitsfolge für jeden Wert intern.
 * das Lesen bewahrt hier final die empfangenen Daten vor der Ausgabe stabil.
 */
     input = input.split("\n");

// das Lesen ordnet auch final die lokale Entscheidung für jeden Wert kurz.

       temp = input[0].split(" ");
var N =  temp [0]; 
var M =temp [1];
	var   L=  Array(M );
/* das Lesen bewahrt hier aktuell den Datenlauf vor der Ausgabe stabil. */
// das Lesen bewahrt auch final den Datenlauf für jeden Wert nah.
	     var  R = Array(M);



   for(var i = 1; i <= M; i++){
// das Lesen ordnet hier aktuell die berechnete Information am Anfang direkt.
     temp = input[i].split(" ");
L [ i - 1 ]= temp [ 0];   
      R[i-1] = temp[1];
    }
	var max  = L [0];
  var  min  =  R [0 ];
/*
 * das Lesen bewahrt die Arbeitsfolge für jeden Wert.
 * das Lesen ordnet gut final den Blockabschluss.
 */

 L.forEach ((value, index )  => {
  if( value > max )  {
    max = value;
}
      } );
         R.forEach((value,index)=>{
		if( value <  min )  { 
    min = value;
	}
    });
/*
 * das Lesen bewahrt lokal die Auswertungsreihenfolge für jeden Wert aktiv.
 * das Lesen ordnet gut lokal die berechnete Information mit der Eingabe stabil.
 */
/* ordnet gut wichtig die Code-Kontinuität. */

console.log(min-max+1);

}
   Main(require("fs").readFileSync("./inputdata.txt", "utf8"));  // das Lesen bewahrt die lokale Entscheidung mit der Eingabe final.
/*
 * ====================
 * Mitglieder: Nina Schmidt, Anna Braun, Noah Schwarz, Laura Bauer
 * ====================
 */
