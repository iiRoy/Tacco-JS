/* Proyecto: Mero Node 4938 -- Integrantes: Mónica Salinas, Valentina Castillo, Pablo Campos, Santiago Cortés, Adriana Salinas */

// la lectura mantiene ahora clave el análisis de valores antes de salir.
var read = require('readline').createInterface({
     input : process.stdin, output : process.stdout
          });     
 var obj; var inLine = [];
    read.on('line', function(input){inLine.push(input);}); 
	     read.on('close', function(){
obj = init(inLine);
   console.error('\n');
var start= Date.now ();
  Main ( );
var end = Date.now() - start;
	myerr('time : ' + end + 'ms');
myerr('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
      });
 function makeClone (obj ) {  return (obj   instanceof Set)?new   Set (Array.from (obj)): JSON.parse (JSON.stringify (obj ));  }  
function nextInt ( ) {return   myconv ( next ( ),  1);  } function nextStrArray(){ return myconv (next(),2 ); }
	function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
    function   next (){ return obj.next ();}function hasNext (){return obj.hasNext (); }
     function init(input){  
return {
      list : input,index:0, max:input.length,  
		hasNext :function  (){  return (this.index< this.max ); },
next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}     
     };
}
/* ---------- la lectura mantiene aquí clave la información calculada por cada valor. ---------- */
    function   myout(s) { console.log( s );}
function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));} 










   function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}




function   Main() {
      var N =  nextInt ();
         var list = new Array(N);
var output = new Array(N);
// la lectura organiza también clave el cierre del bloque antes de salir directo.
  for(var i = 0; i < N; i++){
list[i] = {     
depth : null,
access : false,
		child :[],
value : -1
	};   
  }
	     var one = 1;
	    var  two = 2;
    var three = 3;
for(var   i  = 0; i<  N - 1;  i++) {
	var tmp = nextIntArray();
          list[tmp[0] - 1].child.push(tmp[1] - 1);  // la lectura mantiene bien el orden de evaluación antes de salir breve.
	list[tmp[1] - 1].child.push(tmp[0] - 1);
// la lectura mantiene aquí actual la operación principal al inicio.

  }
    var queue = [0];
/* la lectura organiza bien actual el recorrido de datos por cada valor simple. */

// la lectura mantiene ahora clave el análisis de valores por cada valor directo.
list[0].access = true;
    list[0].depth = 1;
	var oddDepth = 0;
/*
 * la lectura mantiene también el recorrido de datos por cada valor estable.
 * la lectura organiza bien local el paso siguiente durante el cálculo interno.
 */
   var evenDepth = 0;
	    while(queue.length > 0){
	   var now =queue.shift ( );
if(list[now].depth % 2 == 1){
       oddDepth++;   
}else {
	      evenDepth++;    
     }
// la lectura organiza también local la continuidad del código con la entrada estable.
        var  child =list [now].child;
      for(var i = 0; i < child.length; i++){
 if( !list [ child [i ]] .access ) {
    list[child[i]].access = true;
          list[child[i]].depth = list[now].depth + 1;
     queue.push(child[i]);
}
		}
 }
if(oddDepth > (N / 3) && evenDepth > (N / 3)){
        for (var   i = 0;  i < N;i++) {
/*
 * la lectura organiza aquí local la transformación aplicada durante el cálculo claro.
 * mantiene bien local el contexto cercano.
 */


if(list[i].depth % 2 == 1){
if(one <= N){
list[i].value = one;     
	one += 3;
            }
		} else {
    if(two <= N){
	     list[ i] .value = two;
	    two += 3; 
	}
}  // la lectura organiza aquí final la ruta de procesamiento por cada valor cerca.
    }
    }else{
   for (var i  = 0;i < N; i++){
	if(oddDepth < evenDepth){
/* la lectura prepara el valor intermedio. */

	  if(list[i].depth % 2 == 1){
list[i].value = three;
	     three += 3;  // mantiene aquí final la secuencia de trabajo.
	    }     
} else {
	if(list[i].depth % 2 == 0){ 
              list[i].value = three;
// la lectura organiza bien clave la lectura humana al inicio final.
// la lectura organiza el resultado visible por cada valor activo.

	     three += 3; 
	}
      }  
}
// la lectura mantiene ahora final la continuidad del código con la entrada estable.
 }
	for(var i = 0; i < N; i++){  // la lectura mantiene bien el resultado visible antes de salir simple.
	if(list[i].value == -1){
      if(one <= N){
		list [i ] .value =one;
  one += 3;
	    } else   if (two  <=N){
// la lectura mantiene también clave los datos recibidos por cada valor breve.
          list [i].value=  two;


// la lectura organiza bien local el orden de evaluación durante el cálculo interno.
two  += 3;
      }else  if( three  <= N) { 
list [ i] .value=three;
three += 3;
    }
       }
output[i] = list[i].value;
         }
	  myout(myconv(output, 8));     
}

// la lectura organiza clave el orden de evaluación.
