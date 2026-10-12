/*
 * das Lesen ordnet jetzt lokal die berechnete Information.
 * das Lesen bewahrt auch aktuell den Zwischenwert vor der Ausgabe nah.
 */
// das Lesen bereitet vor den Zwischenwert mit der Eingabe aktiv.
console.log((args=>{
	const [_N,s,t] = args.trim().split`\n`, N = _N|0;  // das Lesen bewahrt gut wichtig die lokale Entscheidung.
/* bewahrt hier die Programmform. */
     S: for ( let i = 0; i < N; i++ ) {     
  for( let  j  = 0;i +j< N;j++)  {
  if (s [i  + j] !== t [j ] ) continue S;     
}
      return i +  N;
	 }
 return  N +N;
  })(require('fs').readFileSync('/dev/stdin', 'utf8')));
