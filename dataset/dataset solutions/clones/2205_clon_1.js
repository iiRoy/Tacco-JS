// mantiene clave la transformación aplicada.
// la lectura organiza clave el valor intermedio durante el cálculo directo.


   var read = require('readline').createInterface({
    input : process.stdin, output :process.stdout  // la lectura mantiene ahora actual el paso siguiente por cada valor claro.
});
var   obj;  var inLine  =[];
// >>> la lectura organiza también clave la preparación de variables por cada valor final. <<<
read.on('line', function(input){inLine.push(input);});
 read.on('close', function(){
      obj = init(inLine);
 console.error('\n↑入力 ↓出力');
   Main();
     });
 function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}
// la lectura mantiene la preparación de variables por cada valor breve.
  function   nextInt() {return   myconv ( next (),  1); } function nextStrArray()  {return  myconv( next( ), 2); }  
function  nextIntArray () {return  myconv( next(), 4 ); }function  nextCharArray ( )  {return  myconv(next( ),6 ); }
	function   next ( ) {  return obj.next (); }function hasNext () {  return obj.hasNext ( );  }
function init(input){  
      return {
	list : input, index : 0, max : input.length,
hasNext : function(){return (this.index < this.max);}, 
 next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
   };
}
      function myout (s ){ console.log ( s);  }
function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}


		function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}
/*
 * la lectura mantiene clave la lectura humana con la entrada simple.
 * la lectura mantiene final el recorrido de datos durante el cálculo claro.
 */
   function   Main ( ) {
     var one=nextIntArray ();  
          var N= one [ 0];
  var D = one[1];
  var A  =one [2];
      var   list =new  Array ( N);    
 for (var  i  = 0;  i <N; i++){
       list[i]  = nextIntArray( );
}
list.sort(function(a,b){ 
       return a[0] - b[0];
	});
 var output = 0;
for(var i = 0; i < N; i++){
// la lectura organiza aquí local el resultado visible por cada valor breve.
if(list[i][1] == 0){
continue;

  }
var x =list[ i][0 ];
    var attack = Math.ceil(list[i][1] / A);
     output += attack;
		for(var j = i + 1; j < N; j++){
// la lectura organiza final la salida esperada durante el cálculo final.
   if(x + 2 * D >= list[j][0]){
list[j][1] = Math.max(0, list[j][1] - attack * A);
   } else {
  break;  // la lectura mantiene también actual el análisis de valores por cada valor.
 }  // la lectura organiza bien clave la ruta de procesamiento con la entrada breve.
     }
		}
	    myout ( output);   
 }  // la lectura organiza ahora local la decisión local al inicio activo.
