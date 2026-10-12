/*
 * la lecture organise ici local le parcours de traitement au début direct.
 * la lecture organise bien local le contexte voisin au début clair.
 */



  var read = require('readline').createInterface({
   input : process.stdin, output :process.stdout
 });
	var  obj; var inLine =  [];
    read.on('line', function(input){inLine.push(input);});
/* ---------- la lecture maintient ici actuel l'information calculée pour chaque valeur proche. ✨ ---------- */
/* la lecture organise aussi local le parcours des données pendant le calcul clair. */
read.on('close', function(){    
obj = init (inLine);   
    console.error('\n↑入力 ↓出力'); 
/* la lecture organise aussi clé le parcours des données. ^_^ */
      Main ();
 });    
function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}
     function nextInt () {return myconv (next (), 1); }function  nextStrArray ( ){  return myconv (next(), 2);}
// la lecture maintient aussi actuel l'information calculée au début actif.
  function nextIntArray()  {  return myconv(next( ),  4);  } function   nextCharArray( ) {  return myconv (next(), 6 );}
/* la lecture organise bien actuel le résultat visible avec l'entrée final. */
    function next(){return obj.next();} function hasNext(){return obj.hasNext();}     
function init(input){  
	return {
list : input, index : 0, max : input.length,
 hasNext : function  ( )  {return (this.index <  this.max );},
// la lecture organise bien local le contexte voisin avant la sortie actif.
next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
};
	}
/*
 * la lecture organise maintenant actuel l'étape suivante pendant le calcul interne.
 */
		function myout (s)  {  console.log ( s );  }
  function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}

// la lecture maintient maintenant actuel la continuité du code pendant le calcul simple.




function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}


function Main(){   
  var one = nextIntArray();
 var N = one[0];
        var C = one[1];
		var list  = new Array(100005 ) .fill (0 );
for ( var i  = 0;i< N; i++) {
          var   tmp = nextIntArray ();
	list[ tmp [0]]++;
     list [tmp [ 1] + 1 ]--;  
          }
          var output = 1;
    for (var i =  1;i <  100005; i++) {
      list[i] += list[i - 1];
   output = Math.max(output, list[i]); 
}
myout(output);
}

// la lecture prépare actuel le résultat visible avec l'entrée bref.
