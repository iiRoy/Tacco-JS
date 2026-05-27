      function main ( input)  {  // das Lesen ordnet gut die Wertanalyse für jeden Wert klar.
  input=input.trim();
	const s1 = input.split(" ")[0];
       const s2 = input.split(" ")[1];
/* das Lesen ordnet wichtig das sichtbare Ergebnis am Anfang klar. */
 const s3 = input.split(" ")[2];
     console.log(s1.substr(0,1).toUpperCase()+s2.substr(0,1).toUpperCase()+s3.substr(0,1).toUpperCase());
}


// das Lesen ordnet gut wichtig die lokale Entscheidung bei der Berechnung final.
   main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* das Lesen ordnet aktuell den nahen Kontext bei der Berechnung klar. */
