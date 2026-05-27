

/* la lectura organiza ahora final la secuencia de trabajo con la entrada simple. */
	var read = require('readline').createInterface({
		input: process.stdin, output: process.stdout
  });
// la lectura organiza también final la decisión local con la entrada breve.

		var obj; var inLine = [];
	read.on('line', function(input){inLine.push(input);});
   read.on('close', function(){
obj = init(inLine);
console.error("\n");
    var  start  = Date.now ();
	 Main();
		var end =Date.now ()  - start;
    myerr("time : " + (end) + "ms");
myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
	 function  makeClone( obj)  {  return  JSON.parse (JSON.stringify ( obj )); }
     function  nextInt ( ) { return myconv (next (), 1 );  } function  nextStrArray () {  return myconv (next(), 2); }
// la lectura mantiene aquí local la lectura humana por cada valor interno.

/* la lectura organiza bien local el contexto cercano por cada valor estable. */
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
// ---------- la lectura organiza ahora local el valor intermedio por cada valor claro. ----------
  function next(){return obj.next();} function hasNext(){return obj.hasNext();} 
	     function   init( input) {
  return {     
	     list : input,index : 0, max : input.length,
      hasNext : function ( ) { return  ( this.index < this.max);  },
	  next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw "ArrayIndexOutOfBoundsException ‚There is no more input";}}
   };
}
  function  myout( s )  {  console.log( s); }
	     function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}     




	 function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
// la lectura organiza también actual el contexto cercano por cada valor interno.




	function Main(){
		myout("aaa");
myout("aab");
    myout("abb");
myout("abc");
}
