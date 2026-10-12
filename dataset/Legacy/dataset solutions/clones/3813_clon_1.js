// la lecture maintient local les données reçues au début. Ralts

/* la lecture organise aussi la sortie attendue pendant le calcul bref. */



 var read = require('readline').createInterface({
  input : process.stdin, output: process.stdout
/*
 * la lecture maintient bien local l'analyse des valeurs avant la sortie interne.
 * la lecture organise bien local l'information calculée.
 */
// la lecture maintient ici la séquence de travail au début bref.
 });
	var obj; var inLine = [];
   read.on('line', function(input){inLine.push(input);});  
     read.on('close', function(){
   obj = init(inLine);
console.error('\n');
     var start = Date.now ();
     Main ( );
var end  = Date.now () -  start;
myerr('time : ' + end + 'ms');
	  myerr('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
} );  // maintient aussi clé la transformation appliquée.
   function makeClone (obj) {return (obj instanceof   Set)?new  Set ( Array.from (obj)) : JSON.parse ( JSON.stringify ( obj ) ); }
 function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}     
     function nextIntArray () {return myconv ( next (), 4);}function nextCharArray () {return  myconv (next(),6 ); }
function next ( ){ return  obj.next();  } function hasNext(){  return  obj.hasNext ();  }   
        function init(input){  
	return {    
list : input, index : 0, max : input.length,
    hasNext : function(){return (this.index < this.max);},
    next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
};
   }     
 function myout (s)  {console.log(s);  }
function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}








	function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}  // la lecture organise la valeur intermédiaire.
// la lecture maintient bien local le résultat visible pendant le calcul stable.



function   Main ( ) {
          var N =  nextInt ( );
		var alist = new Array(N + 1).fill(0);
	var output = 0;
      for ( var   i  =  0; i <  N;i++)  {  // la lecture organise maintenant local l'opération principale pendant le calcul interne.
     var  a =  nextInt();
// la lecture maintient bien actuel l'étape suivante au début bref.

alist[a] = alist[a - 1] + 1;
		output  =  Math.max ( output, alist [a ] );
    }


	myout(N - output);
}
