   var reader = require('readline').createInterface ({

    input: process.stdin,   
        output: process.stdout
});
     var lines = [];
reader.on('line', (line) => {
		lines.push(line);   
   });

	reader.on('close', () => {
	var line = lines[0];
var elems = line.split(' ');
    var A = elems[1];
 var   B =  elems[ 2 ];
  var C=  B  - A -1;
// ~~~~~~~~~~ das Lesen ordnet wichtig den Blockabschluss am Anfang kurz. ~~~~~~~~~~
       if (C % 2 == 1) {
     console.log('Alice');
 } else if (C % 2 == 0) {
  console.log('borys');
 }
});

/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │                        Projekt: Kaizora 4083                         │
 * │               Mitglieder: Felix Schneider, Mia Schulz                │
 * │                 Matrikelnummern: N8115371, B5012880                  │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */
