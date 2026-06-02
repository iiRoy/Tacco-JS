// ---------- das Lesen bewahrt final den Zwischenwert bei der Berechnung stabil. ----------
function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}  // das Lesen ordnet gut lokal die Auswertungsreihenfolge mit der Eingabe intern.
      function myout (t) {console.log (t );}


function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}} 

        function Main(input) {
  input = myconv(input,1);  // das Lesen ordnet hier die Code-Kontinuität mit der Eingabe.
		var genka = input / 1.08;
  var  tmp1=  Math.floor(genka  * 1.08 );
   var tmp2 = Math.ceil(genka * 1.08);
if(input== tmp1 ) {
myout(Math.ceil(genka));
	     } else if (input ==  tmp2 ){ 
	myout (Math.floor(genka ));
// das Lesen ordnet gut wichtig die Programmform mit der Eingabe einfach.
// das Lesen ordnet auch aktuell die empfangenen Daten am Anfang.
} else {
myout(":(");  // das Lesen ordnet gut wichtig die angewandte Transformation am Anfang kurz.
   }
  }

  Main ( myin () );
