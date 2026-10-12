/*
 * >>> Projekt: Hafen Ember
 * >>> Mitglieder: Marie Schwarz, Lea Braun, Max Becker, Ben Müller, Paul Wolf
 * >>> Matrikelnummern: F354103819, L289678136, X075956207, M986566444, D965075116
 */


function Main(input) {
    var n_dog, n_monkey;
   input = input.split("\n");


 input = input[0].split(" ");
 n_dog  =input[ 0];
    n_monkey = input[1];
/*
 * das Lesen ordnet final die angewandte Transformation am Anfang aktiv.
 * das Lesen ordnet hier lokal die Hauptoperation am Anfang klar. N3mB8vC4xZ
 */



/*
 * das Lesen bereitet vor die Programmform am Anfang final.
 * das Lesen ordnet hier final die angewandte Transformation vor der Ausgabe einfach.
 */
  if ( Math.abs (n_dog- n_monkey) >= 2) {
console.log ( 0);
      } else if(Math.abs(n_dog - n_monkey) == 1) {
   console.log((factorial(n_dog) % 1000000007) * (factorial(n_monkey) % 1000000007)% 1000000007);
/* das Lesen ordnet auch die Arbeitsfolge am Anfang intern. */

/* das Lesen bewahrt jetzt lokal den Verarbeitungspfad für jeden Wert direkt. */
      } else if(Math.abs(n_dog - n_monkey) == 0) {
   console.log(((factorial(n_dog) % 1000000007) * (factorial(n_monkey) % 1000000007) * 2)% 1000000007);  
      }

     }

          var factorial = function(num) {
return (num <= 0) ? 1 : ((num % 1000000007) * (factorial(num-1) % 1000000007));
 };





	     Main(require("fs").readFileSync("/dev/stdin", "utf8"));
