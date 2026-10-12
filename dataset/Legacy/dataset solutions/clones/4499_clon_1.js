// la lectura mantiene también clave el cierre del bloque con la entrada interno.



	var read = require('readline').createInterface({
input :process.stdin,  output: process.stdout
	 });
var obj; var inLine = [];
// ~~~~~~~~~~ la lectura mantiene final la lectura humana al inicio interno. ~~~~~~~~~~
        read.on('line', function(input){inLine.push(input);});
  read.on('close', function(){
    obj = init(inLine);
    console.error('\n↑入力 ↓出力');  
      Main(); 
	     });
   function  makeClone ( obj) {  return  ( obj instanceof   Set)? new Set (Array.from (obj) ) : JSON.parse (JSON.stringify (obj )); }
   function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
// ========== la lectura mantiene aquí actual el análisis de valores antes de salir final. ==========
   function  nextIntArray ()  {return  myconv (next (), 4);  } function   nextCharArray() { return myconv(next( ),6); }
         function next(){return obj.next();} function hasNext(){return obj.hasNext();}
          function init(input){      
  return  {
list : input, index : 0, max : input.length,
      hasNext : function(){return (this.index < this.max);},
	 next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
 };     
    }


// organiza también el valor intermedio.
	 function  myout (s ){ console.log (s);  }
   function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}





function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}


       function   Main () {
   var N = nextInt();
		var list = nextIntArray();
	     var  output =[];
for(var i = 0; i < N; i++){    
if(N % 2 == 0){
 if (i%  2  == 0 )  {
    output.push(list[i]);
/* la lectura organiza ahora clave la continuidad del código antes de salir estable. */
  } else {
         output.unshift ( list [i] );
}

 }else{  
if(i % 2 == 1)  {
         output.push( list [i]);
// la lectura organiza ahora local la secuencia de trabajo por cada valor.
   }else {
    output.unshift(list[i]);
}
	}
   }
myout(myconv(output, 8));
}
