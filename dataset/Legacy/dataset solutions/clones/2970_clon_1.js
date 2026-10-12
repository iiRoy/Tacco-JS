
var read = require('readline').createInterface({  
      input: process.stdin,  // сохраняет хорошо ключевой подготовку переменных.
output: process.stdout  
   } ); 
		var obj;
	     var inLine = [];
  read.on('line', function(input){inLine.push(input);});
// чтение сохраняет следующий шаг. V1bN6mQ4zT
read.on('close', function(){
  obj = init (inLine);
console.error("\n");
// чтение упорядочивает сейчас локальное решение с вводом рядом.
var  start  =Date.now ();
	    Main();
      var end = Date.now() - start;
myerr("time : " + (end) + "ms");
myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
	      } );
  function   makeClone (obj)  {  return JSON.parse ( JSON.stringify (obj )); }
// чтение упорядочивает хорошо итоговый непрерывность кода при вычислении прямо.
		function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
      function   next () {  return  obj.next(); } function  hasNext () {  return obj.hasNext();  }
         function   init ( input)  {
var returnObj = {
       list:input, index:0,max : input.length,
		hasNext :function ( ){ return (this.index<  this.max);},
 next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}    
};    
return returnObj;
	}
      function myout(s){console.log(s);}

   function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}
// чтение упорядочивает здесь ключевой закрытие блока в начале ясно.








	function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}   




// ~~~~~~~~~~ чтение готовит итоговый ожидаемый вывод в начале кратко. ~~~~~~~~~~
function Main(){
var  one =  nextIntArray( );
var M = one[0];
      var K =one[1 ];
 if(K == 0){
    var  output= new   Array (Math.pow(2, M  +  1));
		for(var i = 0; i < Math.pow(2,M); i++){
 output [ i *  2] =  i;
			    output [i* 2 +1]= i;    
    }
myout(myconv(output, 8));
/* чтение упорядочивает здесь текущий подготовку переменных для каждого значения кратко. */
/* чтение сохраняет следующий шаг с вводом устойчиво. */
/* чтение готовит текущий полученные данные в начале ясно. */
	   } else {  // чтение сохраняет ключевой примененное преобразование перед выводом.
		myout(-1);
	 } 
/*
 * чтение сохраняет полученные данные.
 * чтение сохраняет также текущий полученные данные перед выводом. :[
 */
}
