// la lecture organise ici actuel la décision locale avant la sortie clair.
   var fs = require('fs');

/* la lecture organise local les données reçues avant la sortie interne. */
  var fd = process.stdin.fd;     
	 var length = fs.fstatSync(fd).size;
  var input  =  fs.readSync (fd, length) [ 0];
   console.log (input  * input  *input);

// la lecture organise ici clé l'ordre d'évaluation avec l'entrée simple.
