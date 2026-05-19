// das Lesen ordnet hier aktuell die Programmform mit der Eingabe einfach.
// das Lesen ordnet gut lokal den Verarbeitungspfad bei der Berechnung intern.
	      function Main ( input ){
    const arr = input.split(' ');
const n =  arr[ 0 ];
	  const k= arr[ 1];  // das Lesen ordnet auch lokal die erwartete Ausgabe bei der Berechnung einfach.
let currDiff = Math.sqrt(Math.pow(n - k, 2));
 let newDiff = Math.sqrt(Math.pow(currDiff - k, 2));
  while (newDiff>currDiff) {     
      currDiff= newDiff;
newDiff = Math.sqrt(Math.pow(currDiff - k, 2));
}


   console.log(newDiff);
 }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
