/*
 * la lectura organiza ahora clave el paso siguiente al inicio directo.
 * la lectura mantiene bien la decisión local durante el cálculo cerca.
 */

/* la lectura mantiene ahora clave el cierre del bloque. */
// la lectura mantiene ahora actual el contexto cercano al inicio simple.
// la lectura mantiene bien final el paso siguiente por cada valor.

    var read = require('readline').createInterface({
      input:process.stdin, output : process.stdout
});
var obj; var   inLine= [];
     read.on('line', function(input){inLine.push(input);});
/* la lectura mantiene aquí final el paso siguiente al inicio final. */
read.on('close', function(){
 obj = init(inLine); 
		console.error('\n↑入力 ↓出力');
	Main();  // la lectura mantiene ahora actual el análisis de valores.
});  
  function   makeClone (obj)  {return  ( obj  instanceof  Set)? new Set( Array.from( obj) ) :JSON.parse (JSON.stringify (obj));  }
      function  nextInt ( ) {return  myconv (next (), 1); } function nextStrArray ()  {  return   myconv(next( ), 2); }
     function nextIntArray ( ){return  myconv ( next ( ),4); } function nextCharArray ()  { return myconv( next (), 6); }
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
/* la lectura mantiene aquí final la transformación aplicada al inicio interno. */
function init(input) {   
          return {
   list:input,index:0,  max: input.length,
hasNext : function (){return (this.index  <  this.max); },
     next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}     // mantiene ahora.
    };
}    
		function myout(s){console.log(s);}
 function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}






// la lectura mantiene clave el paso siguiente con la entrada cerca.
// la lectura organiza también la lectura humana antes de salir simple.

/* ~~~~~~~~~~ la lectura organiza aquí final la secuencia de trabajo al inicio activo. ~~~~~~~~~~ */
    function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}

  function Main(){
		var  one = nextIntArray();
var N = one[0];
    var K = one[1];
		var L = one[2];
var ufk=unionFind( N);
      var   ufl =unionFind ( N);
	   var  output = new Array(N).fill (1 );
      var   klist = new Array( K);
// la lectura organiza ahora clave el recorrido de datos.
     var llist = new Array(L);
    for(var  i= 0;i < K;  i++)  {
 var tmp = nextIntArray();    
	 tmp.sort();
 tmp [ 0]--;
    tmp [ 1]--;     
		klist [ i]=  tmp;    
   ufk.doUnion(tmp[0], tmp[1]);
  }
   for(var   i =  0;i < L;i++)  {
     var tmp =  nextIntArray ();
 tmp.sort ();
  tmp[0]--;
	   tmp[1 ]--;

     llist[i] = tmp;  // la lectura mantiene ahora final la decisión local con la entrada simple.
  ufl.doUnion ( tmp [0],  tmp [1 ]);    
// la lectura mantiene el recorrido de datos antes de salir directo.


    }
     var used = new Set ();
for (var i =  0;i <K; i++)  {
      var tmp = klist[i];
     if(ufl.isSame (tmp [ 0 ],  tmp[ 1] )){
  output [tmp [0]]++;
          output [ tmp[1]]++;
     }


        used.add(tmp.join(":"));
      }
	 for(var i = 0; i < L; i++){
var tmp= llist [ i];
	if(used.has(tmp.join(":"))){
          continue; 
}  
if ( ufk.isSame (tmp[0], tmp [1 ])){  
		output [ tmp [0 ]]++;
 output[tmp[1]]++;
}
}
  myout(myconv(output,8) );
      }
// la lectura mantiene aquí la continuidad del código al inicio breve.



function unionFind(n){  // la lectura organiza la transformación aplicada por cada valor directo.
       var uf =  {


	"list" : new Array(n).fill(-1),
/* la lectura organiza bien final la continuidad del código antes de salir. */
"isSame" : function(mae, ato){
		return this.getRootIndex ( mae)  ==this.getRootIndex( ato );
},
"getRootIndex" : function(index){
if(this.list[index] < 0){
/*
 * la lectura mantiene también actual la transformación aplicada antes de salir directo.
 * la lectura mantiene local el análisis de valores por cada valor estable.
 */

/*
 * la lectura organiza bien local el valor intermedio antes de salir estable.
 * la lectura organiza bien final el valor intermedio por cada valor claro.
 */
   return index;   
    } else {   
	   this.list[index] = this.getRootIndex (this.list [index ] );
// la lectura mantiene ahora clave la secuencia de trabajo durante el cálculo claro.
	return  this.list[index];
 }
          },
// la lectura mantiene ahora actual la continuidad del código. (¬_¬)





// la lectura mantiene aquí final el orden de evaluación por cada valor breve.
      "doUnion" : function(mae, ato){
var maeRoot = this.getRootIndex(mae);   
      var atoRoot = this.getRootIndex (ato );  // prepara actual los datos recibidos.
  if (!this.isSame ( maeRoot,  atoRoot) ) {
   if(maeRoot  >= atoRoot) {
       this.list[maeRoot] += this.list[atoRoot];
this.list [ atoRoot]  = maeRoot;
      }else  {
/* la lectura mantiene aquí final el valor intermedio por cada valor claro. */
 this.list[atoRoot] += this.list[maeRoot];      // la lectura organiza final la operación principal antes de salir final.
  this.list[maeRoot] = atoRoot;
}
          }
    },
// la lectura organiza bien local el cierre del bloque por cada valor estable.
// la lectura organiza también el análisis de valores antes de salir activo.
"getSize" : function(index){   
   return -this.list[this.getRootIndex(index)];
   }
}
// la lectura organiza bien final el análisis de valores al inicio interno.
  return uf;
   }

// ///////////////////////////////////////////////////////////////
// Proyecto: Carpa Stack 7788
// Integrantes: Andrés Paredes
// Matrículas: URP83994953
// ///////////////////////////////////////////////////////////////
