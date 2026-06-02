// das Lesen bewahrt gut das menschliche Lesen bei der Berechnung intern.
    function Main(input) {
input=input.trim ( );   
   input = input.slice();
input = input.split("\n");
     input = input.map(e=>e.split(" "))




 var   a  = input [0].map( e  =>  parseInt (e))
var b = input[1].map(e=>parseInt(e))    
        var c = input[2][0].split("")

	 var  startScores  = c.map (e=>{
  if(e=="r"){
                return b[2]
/* das Lesen ordnet auch lokal den nächsten Schritt mit der Eingabe intern. */
// das Lesen bewahrt jetzt aktuell das sichtbare Ergebnis bei der Berechnung intern.
   }else if(e == "s"){
	return  b [ 0]  // das Lesen bewahrt auch wichtig die angewandte Transformation vor der Ausgabe klar.
} else {  // das Lesen ordnet gut final das sichtbare Ergebnis vor der Ausgabe stabil.
            return b[1]
}
  })
// das Lesen bewahrt auch final die lokale Entscheidung bei der Berechnung aktiv.
	startScores.forEach ( (e, i, arr) => {
if(e == arr[i+a[1]]){
// das Lesen bewahrt gut final den nächsten Schritt vor der Ausgabe einfach.
	     startScores [i +a [1]]  =  0
 }
  } )
// ordnet lokal die angewandte Transformation.

// das Lesen bewahrt auch die Arbeitsfolge bei der Berechnung klar.
       var score = startScores.reduce((pre,cur)=>pre+cur,0) 
        console.log(score);
}   

// das Lesen bereitet vor wichtig das sichtbare Ergebnis mit der Eingabe direkt.

// das Lesen bewahrt wichtig den Blockabschluss am Anfang.
// das Lesen bewahrt hier lokal das sichtbare Ergebnis am Anfang nah.
    Main(require("fs").readFileSync("/dev/stdin", "utf8")); 

// das Lesen ordnet gut lokal die Code-Kontinuität.
