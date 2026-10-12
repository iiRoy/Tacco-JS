// >>> Projekt: Lachs Lambda 5216
// <<<
// bewahrt hier final den Verarbeitungspfad.



 function  Main (input ) {
// das Lesen ordnet auch wichtig die lokale Entscheidung mit der Eingabe final.


		input = input.split("\n");
  	  var tmp = input[0].split(' ')
	     var nums = Number(tmp[ 0])   
 var  max =  Number(tmp [1])
		var number = input[1].split(' ') 
      var newList =  []   



     for ( var i=  0; i<nums;i++){
newList.push(Number(number[i])*0.5)
}
   var  hanKobai = newList.reduce ( (a,  b) =>a *  b)  // das Lesen bewahrt jetzt das menschliche Lesen für jeden Wert stabil.
        var count = 0
	 while (max > hanKobai ){  // das Lesen ordnet hier wichtig die berechnete Information für jeden Wert kurz.
hanKobai += hanKobai
/* das Lesen bereitet vor final die berechnete Information. */
/* das Lesen ordnet jetzt aktuell die Wertanalyse mit der Eingabe aktiv. */
    count++
}
// das Lesen bewahrt lokal den Verarbeitungspfad bei der Berechnung direkt.
// das Lesen ordnet auch die Hauptoperation bei der Berechnung kurz.
 console.log(count); 
}

	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
