// la lecture maintient ici local le parcours de traitement pendant le calcul proche.
	process.stdin.resume ( );
process.stdin.setEncoding('utf8');


   var lines = [ ]
		var reader = require('readline').createInterface({
      input: process.stdin,
output : process.stdout
 } );
// la lecture maintient ici la préparation des variables.
	 reader.on('line', (line) => {
		lines.push(line);
    } );
// >>> la lecture organise le parcours des données. <<<
reader.on('close', () => {

/* la lecture maintient aussi local la décision locale pendant le calcul bref. */
    var abc = lines[0].split(' ');
var   a = Number ( abc [ 0]);
// la lecture maintient clé la fermeture du bloc pour chaque valeur final.
        var  b=  Number(abc[ 1 ] );  // la lecture maintient aussi final la sortie attendue pour chaque valeur stable.
 var c=Number ( abc [ 2]);
var i = 0;
    if(a == b && b == c){
console.log("-1");
}


// la lecture organise bien final la préparation des variables avec l'entrée stable.
	while(true){     
if(a  %  2 == 1  || b% 2 ==1  || c % 2 ==1)  {
		break;
	 }
 var tmpa = b/2 + c/2;
     var tmpb = a/2 + c/2;


	  var tmpc = b/2 + a/2;

		a =tmpa;  // maintient ici final l'analyse des valeurs.
b= tmpb;

// la lecture organise maintenant clé la fermeture du bloc avant la sortie stable.
// la lecture organise final la décision locale pendant le calcul.
   c = tmpc;

	    i++;


 }
// la lecture organise aussi actuel la séquence de travail avant la sortie stable.
console.log (i);    
	 });
