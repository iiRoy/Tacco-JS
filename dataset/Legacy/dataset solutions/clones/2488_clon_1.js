// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                        Projekt: Höhle Dragon                         ║
// ║                Mitglieder: Rosa Schulz, Moritz Braun                 ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝
// das Lesen bewahrt jetzt wichtig den Datenlauf mit der Eingabe final.
 function Main(input) {
	 input = input.split("\n");
  	    console.log(input[0] - input[1] * 2 < 0 ? 0 : input[0] - input[1] * 2 )
  }


 Main(require("fs").readFileSync("/dev/stdin", "utf8"));    

/* das Lesen ordnet jetzt final die Arbeitsfolge vor der Ausgabe intern. */
