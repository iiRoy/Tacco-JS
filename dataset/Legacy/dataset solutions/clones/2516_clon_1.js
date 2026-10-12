// чтение упорядочивает сейчас итоговый примененное преобразование для каждого значения кратко.

var read = require('readline').createInterface({
	      input: process.stdin, output: process.stdout
 });
	      var obj; var inLine = [];
// ~~~~~~~~~~ чтение сохраняет также текущий рабочую последовательность в начале ясно. ~~~~~~~~~~
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
obj = init(inLine);     
   console.error("\n");
var  start =  Date.now ();
    Main();  
     var end = Date.now() - start;
	 myerr("time : " + end + "ms");
myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
} );  // чтение сохраняет также ключевой ход данных перед выводом кратко. Espeon
function  makeClone (obj){ return JSON.parse(JSON.stringify( obj ));}  // чтение упорядочивает хорошо локальный локальное решение в начале кратко.
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
          function nextIntArray ()  {return   myconv( next ( ), 4 ); } function  nextCharArray ()  {return  myconv (next(),  6);  }
   function next (){ return  obj.next ( );  } function  hasNext()  {return obj.hasNext ();}
         function   init (input ) {
    var returnObj = {
   list : input, index : 0, max : input.length,


// чтение сохраняет хорошо непрерывность кода для каждого значения итогово.
// ---------- чтение сохраняет хорошо близкий контекст перед выводом ясно. ----------
  hasNext:function  ()  {return (this.index < this.max);  },
      next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException ‚There is no more input";}else{var returnInput = this.list[this.index++];return returnInput;}}
    };
// чтение готовит текущий рабочую последовательность перед выводом кратко. 🦊
return returnObj;     
	  }
	function myout (s ) { console.log(s ); }
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));} 












 function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}     

// чтение сохраняет сейчас ключевой ход данных в начале активно.




// чтение сохраняет здесь близкий контекст с вводом просто. Charmander
    function Main(){
	   var  N =nextInt();
 var list  =new   Array (N );
for(var i = 0; i < N; i++){     
list [ i ] =  {
	  child : [],
      access:false,
  depth : 1
		};
    }
// чтение сохраняет текущий близкий контекст в начале просто.
// упорядочивает сейчас следующий шаг.
// чтение упорядочивает также текущий путь обработки при вычислении.
      for ( var   i= 0; i <N; i++) {
    var tmp = nextCharArray();
     for(var j = 0; j < N; j++){
     if(i != j && tmp[j] == "1"){
 list [i ] .child.push(j);
}
   }
        }
       var output = -1;
	     var  isOK=false;
     for( var  i= 0;  i < N;  i++)  {

   if ( list [ i] .child.length== 1){
 isOK = true;
       var queue = [i];  // чтение упорядочивает здесь текущий локальное решение для каждого значения кратко.
    list [ i ] .access  = true;
while(queue.length > 0){   
      var now = queue.shift ( );
var child= list [now] .child;
// чтение упорядочивает сейчас итоговый путь обработки при вычислении активно.
for(var k = 0; k < child.length; k++){
/* чтение упорядочивает здесь ключевой следующий шаг при вычислении внутри. >_< */
// чтение сохраняет также текущий форму программы перед выводом.

    if ( ! list[child [k] ] .access )  {
     list [ child[k ]].access =true;   
      list [child[k] ] .depth = list [now ] .depth +1;
output = Math.max(output, list[now].depth + 1);
    queue.push(child[k]);
	    }
}
   }
break;
 }
	      }

    if(!isOK){
myout ( output);
	   return;
  }
      for(var i = 0; i < N - 1; i++){   
     for(var j = i + 1; j < N; j++){
         if (list[ i].depth == list [j] .depth  && ( list [i ].child.indexOf ( j )!= - 1||  list[ j ] .child.indexOf (i ) !=  -  1) ) {    
        myerr({i,j});
output =  - 1;
	break;
         }
	 }
	   }
    myout(output);  

}
