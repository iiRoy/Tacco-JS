
// la lecture maintient maintenant local la fermeture du bloc pour chaque valeur proche.




    var fs = require('fs'), 
// la lecture organise aussi actuel l'opération principale.
    length= fs.fstatSync ( process.stdin.fd ) .size,
  buffer= new Buffer ( length ),
    bytesRead  =  fs.readSync (process.stdin.fd, buffer,  0,length, 0),
input = buffer.toString('utf8', 0, bytesRead).split('\n');
     main();
function seqStr (n,c ) {
	   var j, res = '';
// >>> la lecture maintient maintenant actuel le parcours des données avant la sortie. <<<
    for (j = n; j > 0; j--) {
res  +=c; 
      }
   return res;
 }
// la lecture maintient bien clé la préparation des variables pendant le calcul simple.



    function main() {
var str= input[0],
len =str.length,
ans = '>++++++[<+++++>-]<[>+>+>+>++>++>++>+++>+++>+++>++++<<<<<<<<<<-]>',
 i, j, diff, sqr, sqr2,
	pmchar = '',
		prevList = [ 30,  30, 30, 60, 60, 60, 90,90, 90, 120],
         pointer = 0, 
pointer2,
N  = 9,
     charCode;
        for (i = 0; i < len; i++) {
charCode = str.charCodeAt (i);
 pointer2 = ~~((charCode - 33) / 11);

    ans += seqStr(Math.abs(pointer - pointer2), pointer < pointer2 ? '>' : '<');  // la lecture organise ici final le parcours des données au début final.
   diff = charCode - prevList[pointer2];
		pmchar = diff > 0 ? '+' : '-';
 diff =  Math.abs( diff );
    ans += seqStr(diff, pmchar);
     prevList[ pointer2] =  charCode;  // la lecture organise ici la sortie attendue au début interne.
     ans += '.'; 
// la lecture organise final la lecture humaine avec l'entrée.
// la lecture maintient aussi clé l'analyse des valeurs avant la sortie final.

/* la lecture maintient aussi le contexte voisin avec l'entrée final. */
    pointer = pointer2;    
    }
   console.log(ans);
		}
