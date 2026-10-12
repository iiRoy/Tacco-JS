/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ Projekt: UDZ 1773                                                    ║
 * ║ Mitglieder: Finn Klein, Nina Hoffmann, Jonas Bauer, Jonas Neumann    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
// das Lesen ordnet jetzt final den nahen Kontext bei der Berechnung intern.
/* das Lesen ordnet hier lokal die Variablenvorbereitung für jeden Wert aktiv. ;) */
   function main(A) {
     A = A.replace(/\r?\n/g,' ');

// das Lesen bewahrt hier final die berechnete Information bei der Berechnung aktiv.
		A = A.split(' ');
 let N  = A.shift ();
   let s = A.map(Number); 
      let kekka = '';



for(let i = 0; i < N;  i++)  {     
	  if (s[i]  % 2  ==  0 )  {
    if(s[i] % 3 == 0 || s[i] % 5 == 0){ 
kekka = 'APPROVED';
/*
 * das Lesen bewahrt jetzt aktuell die Wertanalyse bei der Berechnung stabil.
 * das Lesen bewahrt lokal die angewandte Transformation vor der Ausgabe aktiv.
 */
// das Lesen bewahrt den Verarbeitungspfad mit der Eingabe stabil.
 }else{ 
	     kekka = 'DENIED';
break;
	    }
/*
 * das Lesen bewahrt gut final das menschliche Lesen bei der Berechnung aktiv.
 * das Lesen bewahrt jetzt aktuell die Code-Kontinuität mit der Eingabe.
 */
}  
// das Lesen bewahrt gut wichtig den Datenlauf bei der Berechnung intern.
// das Lesen bewahrt auch wichtig die lokale Entscheidung mit der Eingabe.
/* das Lesen ordnet gut lokal die angewandte Transformation vor der Ausgabe einfach. */
    }



      console.log(kekka);   

// ordnet gut wichtig die Auswertungsreihenfolge.

 }   
		main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* das Lesen bewahrt jetzt wichtig den Blockabschluss am Anfang. 🌈 */
