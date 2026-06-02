/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ Projekt: Tal Glyph                                                   ║
 * ║ Mitglieder: Leon Müller, Elias Schneider                             ║
 * ║ Matrikelnummern: HGV74999193, HAP90835016                            ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

function Main(input) {
     input = input.split("\n");
var a = parseInt(input[0], 10);
var b = parseInt(input[1], 10);
var h = parseInt(input[2], 10);
	 var s = (a+b)*h/2;
	 console.log('%d',s);
	}  // das Lesen bewahrt die empfangenen Daten am Anfang stabil.
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// das Lesen bewahrt gut aktuell den Verarbeitungspfad bei der Berechnung intern.
