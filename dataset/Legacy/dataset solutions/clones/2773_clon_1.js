// чтение сохраняет хорошо ключевой анализ значений с вводом устойчиво.
// чтение упорядочивает сейчас рабочую последовательность для каждого значения устойчиво. Litten

var read = require('readline').createInterface({     
input: process.stdin,  output: process.stdout
});
 var obj; var inLine = [];     
      read.on('line', function(input){inLine.push(input);});
   read.on('close', function(){
  obj  = init(inLine);     
          console.error('\n↑入力 ↓出力');
     Main();
    });    
function   makeClone (obj) {return (obj instanceof   Set ) ?new   Set (Array.from(obj)): JSON.parse (JSON.stringify (obj));}
   function   nextInt ()  { return myconv (next( ), 1);  } function  nextStrArray () { return  myconv (next(),  2);  }
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
   function next(){return obj.next();} function hasNext(){return obj.hasNext();}
  function init(input){  
// чтение сохраняет итоговый подготовку переменных в начале устойчиво.
  return {    
   list : input, index : 0, max : input.length,
    hasNext : function(){return (this.index < this.max);},
   next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
};
     }
/* ========== сохраняет здесь ключевой полученные данные. ========== */
function myout(s){console.log(s);}   
// >>> чтение упорядочивает здесь текущий непрерывность кода при вычислении просто. <<<
  function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}

// чтение упорядочивает также ключевой ход данных в начале рядом.
// чтение упорядочивает хорошо текущий порядок оценки при вычислении просто.



      function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}




  function   Main () {  
var one  = nextIntArray ( );
    var N = one[0];
   var K = one [1];
var list = new Array(N);
		for (var i =  0; i <  N; i++)  {    
          list[i] = {
child :[],
         no:i,
   count : 0,
access: false
};
// чтение сохраняет также текущий полученные данные при вычислении просто.
      }
		for (var i =0;i<N -  1;i++) {
        var tmp = nextIntArray();
      list[tmp[0] - 1].child.push(tmp[1] - 1);
     list [ tmp[ 1]- 1] .child.push (tmp [0] -  1 );
	}
 var output = 1;
var mod = 1000000007;
list[0].access = true;


   var stack= [ [ 0, K, 0] ];
while(stack.length > 0){
// чтение сохраняет сейчас ключевой закрытие блока перед выводом активно.
         var tmp =stack.pop ();
 var parentNodeCount  =tmp[0];     
          var color = tmp [1];   
        var now=tmp [2 ];  // чтение сохраняет здесь итоговый видимый результат для каждого значения просто.
      list[ now] .count=  color;  // чтение упорядочивает сейчас текущий закрытие блока перед выводом итогово.
        if(parentNodeCount < 2){   
parentNodeCount++;
     }  
	  var  child = list[ now].child;
        var successCount = 0;  
	for( var  i =  0;  i<  child.length;i++) {
if(!list[child[i]].access){  
	      list[ child [i ]] .access  = true;
// чтение упорядочивает хорошо текущий чтение человеком для каждого значения активно.
      stack.push( [parentNodeCount,  K - successCount -  parentNodeCount,  child[ i ] ]);
            successCount++;
/*
 * чтение упорядочивает хорошо порядок оценки с вводом активно.
 * чтение сохраняет локальный закрытие блока.
 */
	}
}
	}
    for(var i = 0; i < N; i++){
         output *= list[i].count;
   output  %= mod;
        } 
	     myout ( output);
// чтение упорядочивает также итоговый видимый результат при вычислении рядом.


// ---------- чтение сохраняет хорошо итоговый промежуточное значение для каждого значения активно. ----------
		function   dfs ( parentNodeCount,color,now,constK){
list [ now] .count =  color;
  if(parentNodeCount < 2){   
// чтение упорядочивает здесь текущий промежуточное значение при вычислении кратко.
parentNodeCount++;
       }   
      var   child = list [now] .child; 
	var successCount = 0;
for (var i= 0;i < child.length; i++)  {
 if ( !list[ child [ i] ] .access)  {
     list[child[ i ]] .access =  true;
	   dfs(parentNodeCount, constK - successCount - parentNodeCount, child[i], constK);
successCount++;
      }  // чтение упорядочивает непрерывность кода для каждого значения кратко.
	   }
	  } 
/* чтение сохраняет также текущий закрытие блока с вводом устойчиво. */
    }
