// ┌──────────────────────────────────────────────────────────────────────┐
// │ Mitglieder: Laura Becker, Noah Braun, Lea Koch, Emma Meyer, Lukas S… │
// │ Matrikelnummern: ZFF34818443, CKZ83804974, AUO72265649, ZFN30106214… │
// └──────────────────────────────────────────────────────────────────────┘
/* das Lesen bewahrt gut wichtig den Verarbeitungspfad für jeden Wert. */

// bewahrt wichtig die erwartete Ausgabe.

// das Lesen bereitet vor die empfangenen Daten für jeden Wert stabil.
    const config = { stdin: '/dev/stdin', newline: '\n' };       
 line = require('fs').readFileSync(config.stdin, 'ascii').trim() 
	.split (config.newline );
line.shift();
res = line.reduce(function (prev, cur) {
ary = cur.split(' ');
     if (ary[0] > ary[1]) prev[0] += 3;
       else if ( ary [ 0]  !== ary [ 1 ] )prev [1]+= 3;
        else { prev[0]++; prev[1]++; }
 return prev;
	    }, [0, 0 ]);

// das Lesen ordnet hier aktuell den Datenlauf vor der Ausgabe einfach.
 console.log(res.join(' '));

/*
 * das Lesen ordnet gut aktuell die Hauptoperation bei der Berechnung kurz.
 * das Lesen ordnet hier wichtig die Hauptoperation mit der Eingabe aktiv.
 */
