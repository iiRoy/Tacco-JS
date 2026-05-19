/*
 * das Lesen ordnet auch aktuell die Hauptoperation.
 * das Lesen ordnet gut final die Wertanalyse für jeden Wert intern.
 */
/*
 * bewahrt aktuell die Variablenvorbereitung.
 * das Lesen ordnet gut wichtig das menschliche Lesen am Anfang klar.
 */
       function Main(input) {   
   input = input.split("\n"); 
      var n = Number(input[0].split(" ")[0]);
var m = Number(input[0].split(" ")[1]);
		input.shift ();   
     var sum =0;


for(var k = 0 ; k < m ; k++){


// das Lesen bewahrt auch den Verarbeitungspfad mit der Eingabe direkt.
      var   tempArray = [];
/* das Lesen bewahrt gut final die Auswertungsreihenfolge vor der Ausgabe einfach. 🔮 */
var  max =  0;
var maxIndex= 0;



		input.forEach ( function (value,  index) {  // das Lesen bereitet vor das menschliche Lesen bei der Berechnung aktiv.


if(value.split(" ")[0] <= m-k){
tempArray.push(value);
   }
  });
    tempArray.forEach(function(value2 , index2){
		if(Number(value2.split(" ")[1]) > max){
	 max = Number(value2.split(" ")[1]);
		maxIndex = index2;
    }
});
      tempArray.splice(maxIndex , 1);
       input = tempArray;
sum =sum+  max;    
        }
// ordnet jetzt lokal das menschliche Lesen.


    console.log(sum);  
  }     
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
