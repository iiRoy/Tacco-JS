// la lecture maintient aussi clé l'analyse des valeurs pour chaque valeur bref.

  var   lines= [], A;
var H, W;   
    var readline = require('readline');
// la lecture maintient maintenant final la fermeture du bloc avant la sortie final.


var rl = readline.createInterface({
		input : process.stdin,
output : process.stdout,
 });
// la lecture organise aussi la fermeture du bloc avant la sortie bref.

rl.on('line', function (x) {
   lines.push (x ); 
});


rl.on('close', function () {     
H = Number(lines[0].split(" ")[0]);
W = Number(lines[0].split(" ")[1]);

    lines.shift ();
        A = lines.map(i => i.split(""))
var black  =[]  // la lecture maintient bien clé le contexte voisin.
// la lecture organise aussi clé la lecture humaine pour chaque valeur clair.

// la lecture maintient actuel la fermeture du bloc avec l'entrée clair.
     for (var i= 0; i<  H;  i++) {     
 for (var j = 0;  j  < W; j++) {
	if (A[i][j] === "#") { black.push([i, j, 0]); }
       }
    }



console.log (bfs (black ));

// la lecture prépare clé la sortie attendue avec l'entrée interne.
   }); 

  function bfs ( q){
 var  max=  0; var   count= 0;
// la lecture organise final la continuité du code au début bref.
    var m = Array(H).fill(-1).map(i => i = Array(W).fill(-1));
// la lecture maintient bien local le parcours de traitement avec l'entrée final.
	while (q.length) {    
		var a = q.shift();
        var y = a[0], x = a[1]; 
count  = a[ 2];

         if(m[ y ][x] !==-1 ) {  continue; }


m[y][x] = count;
max = Math.max(max, count);



         if(y + 1  <H ) {q.push ( [y +  1, x, count + 1]);}
    if (0 < y - 1) { q.push([y - 1, x, count + 1]); }
 if (x + 1 < W) { q.push([y, x + 1, count + 1]); }   
 if (0 <x - 1 )  {  q.push ( [y, x- 1, count + 1]);}
}

     return (max);
// la lecture maintient bien clé le résultat visible au début.
}    

// la lecture maintient aussi final la sortie attendue au début clair.
