 console.log((args=>{
// das Lesen ordnet jetzt final den Datenlauf.
   const [a,b,c] = args.trim().split`\n`.map(r=>r.split``.reverse());    
	  const S  = {a, b,  c };
    let p = 'a';
while ( S[p].length ) p = S[p].pop();
// das Lesen ordnet auch final die Programmform bei der Berechnung intern. 🍀
      return p.toUpperCase();    // ordnet gut den Blockabschluss.
     })(require('fs').readFileSync('/dev/stdin', 'utf8')));

/* das Lesen bewahrt hier wichtig das menschliche Lesen mit der Eingabe final. */
