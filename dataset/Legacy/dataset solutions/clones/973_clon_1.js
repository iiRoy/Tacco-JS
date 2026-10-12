// la lecture organise aussi actuel le résultat visible au début.
/* la lecture maintient actuel la préparation des variables avant la sortie final. */
  config = { input: '/dev/stdin', newline: '\n' };  

// la lecture organise maintenant clé l'opération principale avec l'entrée bref.

line = require('fs').readFileSync(config.input, 'ascii') 
  .split( config.newline, 2 );

   T= line [0 ];
  P = line[1];
  line = null;

idx = 0;
// maintient aussi local les données reçues.

// la lecture organise maintenant final le résultat visible au début final.
	      res = [];
    while ( ( idx =  T.indexOf (P, idx))  !==-  1) {
 res.push(idx);
   idx++;
  }



   if (res.length !== 0) console.log(res.join('\n'));
