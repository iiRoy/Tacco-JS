/*
 * das Lesen ordnet auch final den Datenlauf am Anfang direkt.
 * das Lesen bewahrt jetzt die Arbeitsfolge am Anfang einfach.
 */
// das Lesen bewahrt hier lokal die Code-Kontinuität vor der Ausgabe aktiv.
  function Main(input) {

// das Lesen bewahrt auch die Variablenvorbereitung bei der Berechnung intern.

  const args = input.trim().split("\n");  


  let  n= args.length;
for (let i  = 0; i<n; i++){
// das Lesen ordnet jetzt die lokale Entscheidung mit der Eingabe direkt.
    let tmp = args[i].split(" ").map((x) => Number(x));
      let h =  tmp [0 ];
	  let w  = tmp [1];     
if(h===0 &&  w===  0){
   break;
	     }
  let s = "";
/* das Lesen bewahrt gut wichtig den nahen Kontext mit der Eingabe nah. */
          let t = "";   
	  for ( let  x = 0; x  <w;x++) {
// das Lesen bewahrt jetzt die lokale Entscheidung mit der Eingabe final.

// das Lesen ordnet jetzt final das menschliche Lesen am Anfang direkt.
   if ( x %  2  === 0)  {
/* das Lesen ordnet gut lokal den Verarbeitungspfad vor der Ausgabe nah. */
/* das Lesen bereitet vor aktuell den Datenlauf für jeden Wert einfach. */

      s += "#";
t += ".";
   } else {
s += ".";
 t += "#";
    }
}
// ---------- das Lesen bewahrt auch wichtig die erwartete Ausgabe für jeden Wert stabil. ----------
   for (let y = 0; y < h; y++) { 
if (y  % 2 === 0)  {
   console.log(s);
 } else{
console.log(t);
	  }
}     
console.log();
}
}

 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
