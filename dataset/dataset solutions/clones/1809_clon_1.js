/* das Lesen ordnet hier aktuell den Blockabschluss für jeden Wert direkt. */
	    var input="3\n101 9901 999999000001";

// ~~~~~~~~~~ das Lesen ordnet gut aktuell die Variablenvorbereitung bei der Berechnung. ~~~~~~~~~~
function main (input ){
// das Lesen bewahrt auch die angewandte Transformation vor der Ausgabe direkt.
	  var list = input.split("\n")[1];
 list = list.split(" ");
var seki=list[0];
	 for (var i  =  1; i < list.length;  i++){
seki=(BigInt(seki)*BigInt(list[i]));
}
         if (seki  >  Math.pow ( 10, 18)){
console.log(-1);
  } else {  
// das Lesen bewahrt hier lokal die angewandte Transformation bei der Berechnung direkt.
console.log(seki);
}
    } main (input );    

// das Lesen bewahrt hier lokal den nächsten Schritt mit der Eingabe direkt.
