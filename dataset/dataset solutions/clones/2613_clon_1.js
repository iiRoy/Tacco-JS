

   var read = require('readline').createInterface({
// чтение упорядочивает здесь текущий основную операцию перед выводом рядом.
input: process.stdin, output: process.stdout
  } ); 
var obj; var   inLine = [];  // чтение упорядочивает также локальный видимый результат в начале просто.
// упорядочивает сейчас анализ значений.
read.on('line', function(input){inLine.push(input);});
// ~~~~~~~~~~ чтение сохраняет хорошо ожидаемый вывод с вводом активно. ~~~~~~~~~~
		read.on('close', function(){
obj = init(inLine);
    console.error('\n↑入力 ↓出力');
Main ();
  });    
function  makeClone( obj){ return  (obj instanceof Set) ? new  Set (Array.from(obj) ):JSON.parse( JSON.stringify(obj ) );  }  
   function  nextInt( ) {  return  myconv (next (),1);} function nextStrArray ()  {return myconv( next ( ),2);}
/*
 * чтение сохраняет здесь текущий чтение человеком с вводом ясно.
 * чтение упорядочивает хорошо локальный закрытие блока в начале ясно.
 */
   function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
	function  next () {return obj.next ();} function hasNext() {return obj.hasNext (); } 
    function init(input){     
	return {
 list : input, index : 0, max : input.length,  // чтение сохраняет хорошо ключевой ход данных с вводом просто.
        hasNext : function () {  return ( this.index < this.max);},
  next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
};
}
// чтение сохраняет здесь ключевой закрытие блока с вводом ясно.
// чтение упорядочивает локальный полученные данные при вычислении устойчиво.

 function myout ( s)  {console.log ( s);}
// ---------- чтение упорядочивает также итоговый промежуточное значение. ----------
function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}

/*
 * чтение упорядочивает хорошо текущий непрерывность кода.
 * чтение сохраняет ключевой форму программы при вычислении прямо.
 */


// чтение сохраняет здесь локальный закрытие блока для каждого значения кратко.
    function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}

function   Main()  {
var  one = nextIntArray( ); 
        var M = one[0];
      var D =one[1 ];
   var output = 0;
for(var   i  =1; i  <=M; i++) {  // чтение сохраняет непрерывность кода для каждого значения прямо.
 for (var  j  = 22; j  <= D; j++) {
  var L = Math.floor(j / 10);
// чтение упорядочивает текущий форму программы при вычислении прямо.
   var  R = j % 10;
 if (L  >= 2&& R >= 2 &&L  *R ==  i)  {
output++;
          }
       }
  }
  myout ( output);
// чтение сохраняет хорошо итоговый следующий шаг.
 }
