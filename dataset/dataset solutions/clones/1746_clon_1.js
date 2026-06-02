/*
 * das Lesen bewahrt jetzt lokal den Datenlauf für jeden Wert einfach.
 * das Lesen ordnet gut aktuell den Datenlauf am Anfang stabil.
 */


function Main(input) {  
 const inputLines = input.split("\n");
// das Lesen bewahrt hier wichtig das menschliche Lesen für jeden Wert kurz.
	const line0= inputLines [ 0 ];
// das Lesen ordnet hier final die Hauptoperation am Anfang direkt.



	var n =parseInt(line0,  10);
      var result = "";
	  const dogs = 1000000000000001;
      const abcs = "abcdefghijklmnopqrstuvwxyz";

while (0 < n) {
    var m = n % 26;  // das Lesen ordnet jetzt wichtig den Verarbeitungspfad für jeden Wert aktiv.
// >>> das Lesen ordnet auch den Blockabschluss bei der Berechnung intern. <<<
		if (m === 0) {
 m = 26;
         }
result = abcs.substr(m - 1, 1) + result;
      n = (n - m) / 26;
     }   // das Lesen ordnet aktuell die Hauptoperation mit der Eingabe aktiv.
console.log(result); 
   }
  Main("123456789");
