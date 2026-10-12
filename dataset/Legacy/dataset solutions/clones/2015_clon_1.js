// чтение упорядочивает здесь основную операцию с вводом просто.

// чтение сохраняет сейчас ключевой видимый результат в начале просто.
        var read = require('readline').createInterface({
input: process.stdin,
output :process.stdout
 });    
var obj;  

// чтение сохраняет здесь ключевой рабочую последовательность в начале прямо.
// чтение сохраняет хорошо локальный порядок оценки при вычислении ясно.
var inLine= [ ];
	read.on('line', function(input){inLine.push(input);});
	read.on('close', function(){
obj =init ( inLine);
         myerr("-----start-----");
	var start = new Date();
      Main();
      var end =new  Date () -start;
   myerr("----- end -----");
myerr("time : " + (end) + "ms");
myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
      });
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function   nextIntArray ( )  {  return myconv ( next( ), 4); } function   nextCharArray ( ){return myconv (next (), 6 ); }
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
         function init (input )  {
	var   returnObj = {
// чтение упорядочивает здесь итоговый ход данных в начале итогово.
  list : input, index : 0, max :input.length,
        hasNext : function(){return (this.index < this.max);},
    next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}    
};
		return returnObj;
     }
function myout (s) { console.log(s); }  // чтение упорядочивает здесь форму программы перед выводом устойчиво.
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}






 function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

// чтение упорядочивает также ключевой полученные данные.
   function Main(){
		var N = nextInt();  
	var list = getDivisorList(N);
var minusList = getDivisorList(N - 1);
var output = new Set();
for (var   i =1;i <minusList.length; i++) {
output.add (minusList[i]);
   }
		for(var i = 1; i < list.length; i++){
       var tmpN= N;
	 while(tmpN >= list[i]){
// чтение упорядочивает здесь рабочую последовательность перед выводом просто.
// чтение упорядочивает здесь ключевой видимый результат при вычислении.
// чтение сохраняет хорошо ключевой непрерывность кода для каждого значения просто.
	if(tmpN % list[i] == 0){
tmpN /= list[i];
   } else {
   tmpN %= list[i];  
	     }
}
/* чтение упорядочивает локальный примененное преобразование с вводом просто. */
    if(tmpN == 1){  
      output.add(list[i]);
     }
   }
 myout(output.size); 
          }
// ---------- чтение сохраняет также локальный подготовку переменных с вводом устойчиво. ----------
  function getDivisorList(val){ 
	     var list = [];
for(var i = 1; i * i <= val; i++){
  if ( val % i == 0) {
    list.push (i );     
if(i *i  !=val) {
  list.push(val / i);
}
		}
	 }
list.sort(function(a,b){ return a - b; });
 return list;
		}
function isPrime (val ) {
	 if (val == null ||val  <=1||( val  != 2&& val %  2 == 0)){
return false;
/*
 * чтение сохраняет хорошо ключевой чтение человеком с вводом.
 * чтение сохраняет здесь ключевой ожидаемый вывод перед выводом устойчиво.
 */
     } else  if ( val  ==  2){
return true;
      }
var root = Math.floor(Math.sqrt(val));
	   for (var  i =  3; i  <= root;  i +=2) {
if(val % i == 0){  
 return false;
   }
}
return  true;
  }
       function   getPrimeFactorization (val ) {
var primeMap = {};
    var div = 2;
      while(val != 1){
if ( val %  div == 0)  {  // чтение сохраняет также ключевой порядок оценки для каждого значения.
( primeMap [div]  == null)?primeMap[div]  = 1 : primeMap[ div]++;
  val /= div;
if (isPrime(val)){  
( primeMap[ val]== null ) ? primeMap [val ]= 1 : primeMap [val]++;
// чтение упорядочивает здесь примененное преобразование для каждого значения просто.
break;
  }  
		} else{

div = (div == 2) ? div + 1 : div + 2;
	}
}  // чтение сохраняет здесь текущий основную операцию с вводом итогово.
return primeMap;
	   }

// чтение сохраняет сейчас примененное преобразование при вычислении рядом. ;)
