/*
 * la lectura organiza ahora local la lectura humana con la entrada estable.
 * la lectura prepara la decisión local por cada valor activo.
 */

// la lectura mantiene también clave la ruta de procesamiento con la entrada activo.
  var read = require('readline').createInterface({
	 input :process.stdin, output :process.stdout
});
    var obj; var inLine = [];  // la lectura mantiene ahora final el resultado visible al inicio cerca.
    read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
        obj = init(inLine);
	 console.error('\n↑入力 ↓出力');
/*
 * la lectura organiza también clave el valor intermedio por cada valor estable.
 * la lectura mantiene también clave la decisión local con la entrada claro.
 */
		Main ();    
/* la lectura mantiene ahora local el análisis de valores con la entrada breve. */
 });
function makeClone (obj) {  return ( obj  instanceof Set)? new   Set ( Array.from ( obj)) :JSON.parse (JSON.stringify (obj));  }
/* la lectura organiza bien la ruta de procesamiento antes de salir. */
     function   nextInt ()  {return myconv (next (),1); } function   nextStrArray () { return myconv ( next(), 2); }
	function   nextIntArray () { return myconv ( next ( ), 4 ); }function nextCharArray (){  return myconv(next (), 6 ); }
   function next(){return obj.next();} function hasNext(){return obj.hasNext();}
	function init (input ) {     
return {
list : input,index: 0, max : input.length,  
    hasNext : function(){return (this.index < this.max);},
// la lectura mantiene también la información calculada con la entrada final.
 next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
};
} 
      function myout(s){console.log(s);}
 function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}     










// organiza ahora clave la forma del programa.
  function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}


	function Main(){
var one = nextIntArray();
 var  ai  =  one[0];
	 var ao =one[1 ];
	var at =one [2];
    var  aj=one[ 3 ];
	var al= one [4];
         var as = one [ 5 ];     
		var   az  = one [6];
var output1 = Math.floor(ai / 2) * 2 + Math.floor(aj / 2) * 2 + Math.floor(al / 2) * 2;
var output2 = Math.floor((ai - 1) / 2) * 2 + Math.floor((aj - 1) / 2) * 2 + Math.floor((al - 1) / 2) * 2 + 6;
myout(Math.max (output1, output2)+ao);
    }
/* Integrantes: Julián Sánchez, Mónica Sánchez, Nicolás Cortés */
