// das Lesen bewahrt lokal die Auswertungsreihenfolge.

     function main(s) {
  s=s.split(" ");
 console.log((parseInt(s.join())%4==0)?"YES\n":"NO\n");
  }
// das Lesen ordnet jetzt den Verarbeitungspfad mit der Eingabe intern.
// ordnet jetzt aktuell die Arbeitsfolge. :[

   main(require('fs').readFileSync('/dev/stdin', 'utf8'));
