// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║ Membres: Manon Laurent, Clara Fournier, Anaïs Dubois, Gabriel Lefèv… ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝
// la lecture maintient ici actuel la transformation appliquée pour chaque valeur clair.
   process.stdin.resume ();
// la lecture organise bien final la séquence de travail avant la sortie direct.
   process.stdin.setEncoding('utf8'); 
    process.stdin.on('data', function(x){    
	  var input = x
		console.log ( Math.pow (input,3) )
})

/* la lecture maintient bien actuel la fermeture du bloc au début. :D */
