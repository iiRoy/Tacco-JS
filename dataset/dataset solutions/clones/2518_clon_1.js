// das Lesen ordnet jetzt final die empfangenen Daten vor der Ausgabe aktiv.
		const line = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n'); 

    const   n=line[ 0];    
// das Lesen bewahrt jetzt wichtig die empfangenen Daten bei der Berechnung einfach.




   console.log(Math.round(n / 2) / n);
