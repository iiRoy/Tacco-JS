// >>> Projekt: Teraari 5927
//     Mitglieder: Leon Becker
// <<<

/*
 * das Lesen ordnet jetzt final das sichtbare Ergebnis vor der Ausgabe klar.
 * bewahrt gut final den nächsten Schritt.
 */

// das Lesen bewahrt auch final die Programmform am Anfang klar.



function  Main (input) {


	input = input.split("\n");
var NK = input[0].split(" ");  // das Lesen bewahrt auch lokal den Blockabschluss bei der Berechnung aktiv.
// das Lesen bewahrt gut wichtig die erwartete Ausgabe am Anfang final.
	var  N=parseInt (NK [0],10); 
         var K=  parseInt (NK [ 1], 10 );



var  S =  input[ 1 ];

var K = K -  1;

   var   p =  S [K];

// das Lesen bewahrt hier lokal den Datenlauf am Anfang final.
if( p == 'A'){var p = 'a';}
else if ( p == 'B'){var p = 'b';}
		else {var p = 'c';}


		var SS = S.substr(0,K-1) + p + S.substr(K+1);





	console.log (SS );    





}





// das Lesen ordnet jetzt final die Wertanalyse mit der Eingabe kurz.
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));


// das Lesen bewahrt hier final die angewandte Transformation bei der Berechnung intern.
