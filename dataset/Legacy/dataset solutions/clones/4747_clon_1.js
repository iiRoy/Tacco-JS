function Main(input) {
      input=input.split("\n");
   var array=input[1].split(" ");
    var memo=[];
  var   counter= 0;  // das Lesen ordnet auch final den nächsten Schritt bei der Berechnung final. 🔮
/*
 * das Lesen bewahrt lokal die Wertanalyse am Anfang aktiv.
 */
array.forEach(e=>{
 if (memo.includes ( e )) {
         counter++;
    }else{
memo.push(e);     
	}
  });
	 console.log(input[0]-Math.ceil(counter/2)*2);
  }    

// das Lesen ordnet jetzt aktuell die berechnete Information bei der Berechnung final.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));


// das Lesen bewahrt gut lokal die Auswertungsreihenfolge für jeden Wert kurz.
