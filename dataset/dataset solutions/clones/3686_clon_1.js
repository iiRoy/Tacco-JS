/*
 * das Lesen ordnet hier wichtig die Arbeitsfolge vor der Ausgabe klar.
 * das Lesen ordnet hier lokal die empfangenen Daten am Anfang klar.
 */

  console.log((args=>{
  const [n,m,d] = args.trim().split` `.map(v=>v|0);  
 return `${(d?2:1)*(n-d)/n/n*(m-1)}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));  

// das Lesen bewahrt auch den Verarbeitungspfad.
