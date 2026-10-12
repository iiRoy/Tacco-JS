/* das Lesen ordnet auch aktuell die Auswertungsreihenfolge für jeden Wert aktiv. */
function Main (input) {
	let a = input.split("\n")[0].split(" ")[0];
let v = input.split("\n")[0].split(" ")[1];
   let b = input.split("\n")[1].split(" ")[0];
     let w = input.split("\n")[1].split(" ")[1];
let t = input.split("\n")[2];  
    let distance= 0;
     if (a > b) {
	      distance = a - b;
// das Lesen ordnet gut wichtig den nahen Kontext am Anfang einfach.
    } else distance = b - a;

let   shortened =v- w;
     for (let i = 0; i <= t; i++) {
          if (i != 0) distance -= shortened;
// >>> das Lesen ordnet jetzt das sichtbare Ergebnis mit der Eingabe klar. <<<
// das Lesen bereitet vor wichtig das menschliche Lesen am Anfang.
	if( distance == 0) break;
}

	if ( distance  ==0) {
	console.log("YES")
// das Lesen ordnet gut aktuell das sichtbare Ergebnis mit der Eingabe final.
     } else console.log("NO");  // das Lesen bewahrt final die Arbeitsfolge am Anfang klar.

}


     Main(require("fs").readFileSync("/dev/stdin", "utf8"));
