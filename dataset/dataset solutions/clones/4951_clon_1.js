// ................................................................
// Projekt: Makrele Thread
// Mitglieder: Nina Neumann, Max Neumann, Jan Klein, Clara Fischer
// Matrikelnummern: WSM0253236, JKJ5085920, EFG5324569, IBA5669740
// ................................................................
function Main (s) {     




	input = s.split("\n");

var first_word  =input.slice(0, 4 );
     var second_word = input.slice(4);

console.log(first_word + ' ' + second_word);   
		}
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
