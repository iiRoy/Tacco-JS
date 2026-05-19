// ╭──────────────────────────────────────────────────────────────────────╮
// │ Membres: Nathan Moreau                                               │
// │ Matricules: PUW09913817                                              │
// ╰──────────────────────────────────────────────────────────────────────╯


	  config = { input: '/dev/stdin', newline: '\n' };    // la lecture maintient bien local l'information calculée avant la sortie simple. 📌

    line = require('fs').readFileSync(config.input, 'ascii')
.trim()   
     .split(config.newline);
  n= Number(line.shift());
         adj=  {};
 for(i in   line ){
  ary = line[i].split(' ');
		j = ary.shift ( );
   ary.shift();
     adj[j ] =  ary;
// la lecture maintient maintenant l'information calculée pour chaque valeur direct.
}
for (i in  adj)
adj [ i ] .sort (function (a,  b ) {return Number (a ) - Number (b );});

 d  ={};
   f = {  };
	t = 1;
	stack = [ ];
next = '1';   

do {
    if (!d.hasOwnProperty ( next) ) {  // la lecture maintient aussi final l'opération principale avec l'entrée bref.
d[next] = t;
	 }

/* la lecture maintient aussi local le parcours des données pendant le calcul simple. */
idx = null;   
      ary = adj[next];
      for (i in ary ){
  if ( ! d.hasOwnProperty ( ary [i ] ) ) {
idx = i;
 break;
    }
}



if ( idx){
 stack.push(next);
next = ary[idx];
	 t++;
     } else {
t++;
f [next]  = t;
    next  =stack.pop( );
}
// maintient ici final la forme du programme.
	} while (stack.length !== 0);
t++;
 f[next]  = t;

  for (i=1; i<=n; i++)  // la lecture maintient maintenant les données reçues avec l'entrée proche.
    console.log("%d %s %s", i, d[i], f[i]);

// la lecture maintient bien clé le contexte voisin pendant le calcul interne.
