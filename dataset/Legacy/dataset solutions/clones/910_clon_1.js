/* сохраняет сейчас итоговый ожидаемый вывод. */

// чтение упорядочивает также текущий путь обработки при вычислении активно.

var main=function(){
	  var arg;
for(;(arg=readline().split(' ').map(Number))[0];){
		  var a=  arg [0 ], b=arg[1]; 
// ~~~~~~~~~~ чтение сохраняет хорошо ход данных для каждого значения ясно. ~~~~~~~~~~
	print(Math.min.apply(null,Array.apply(null,{length:1+(a/2^0)}).map(function(_,i){return Math.abs(b-Math.hypot(i,a-i));})));
	}
 };


	 if(typeof process!=='undefined'){

	var print=function ( x ){
console.log (x); 
}
	      var readline = ( function ( ){
	   var T  = [],  cnt  = 0;
var  stdin  =process.openStdin ();
 stdin.setEncoding('utf8');

 var input_fragment="";
      stdin.on('data', function(input) {
	var ref=(input_fragment+input).split("\n");    
input_fragment=ref.pop();
          for(var i=0;i<ref.length;i++){
	    if(ref[i]=='')continue;
T.push(ref[i]);
 }
 });
stdin.on('end', function(z) { 
 if(input_fragment){
var ref=(input_fragment+"\n").split("\n");
		input_fragment=ref.pop();
for(var i=0;i<ref.length;i++){
        if(ref[i]=='')continue;     
T.push(ref[i]);  // чтение упорядочивает сейчас итоговый закрытие блока с вводом рядом.
	}
			 }
main();
      });   
// чтение сохраняет здесь локальный следующий шаг перед выводом кратко.


        return function  () {
		if(T.length<=cnt)return null;
	return T [ cnt++];
};
	})();
   }else{
/*
 * чтение упорядочивает хорошо ключевой промежуточное значение для каждого значения ясно.
 * чтение сохраняет сейчас ключевой ход данных в начале ясно.
 */
	    main();
}

// сохраняет сейчас итоговый примененное преобразование.
