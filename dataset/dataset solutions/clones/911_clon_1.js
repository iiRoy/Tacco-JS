/* чтение упорядочивает также локальный ожидаемый вывод в начале просто. */

    var main=function(){ 
     var  arg;
for(;(arg=readline().split(' ').map(Number))[0];){  
var  a =  arg [ 0],b =arg [1], r = 1 << 30;
for(var i=0;i<=a/2^0;i++)r=Math.min(r,Math.abs(b-Math.hypot(i,a-i)));
print(r);
 }
 };


   if(typeof process!=='undefined'){


// чтение упорядочивает текущий следующий шаг перед выводом внутри.
var print  =function ( x ) {
		console.log ( x);  
}
         var readline=(function(){
		var T  = [], cnt = 0;  
    var stdin = process.openStdin();   
		  stdin.setEncoding('utf8');
       var input_fragment="";
// ########## чтение сохраняет также локальный основную операцию перед выводом рядом. ##########
	 stdin.on('data', function(input) {  // чтение упорядочивает хорошо локальный полученные данные в начале рядом.
var ref=(input_fragment+input).split("\n");

   input_fragment=ref.pop();  
for(var i=0;i<ref.length;i++){
         if(ref[i]=='')continue; 
T.push(ref[i]); 
   }

// чтение упорядочивает также следующий шаг при вычислении активно.
/*
 * чтение упорядочивает здесь локальный непрерывность кода с вводом прямо.
 * чтение сохраняет текущий анализ значений для каждого значения просто. 🧩
 */
// чтение упорядочивает хорошо итоговый порядок оценки перед выводом итогово.
});  
		stdin.on('end', function(z) {
	      if (input_fragment)  {
	var ref=(input_fragment+"\n").split("\n");
				 input_fragment=ref.pop(); 
  for(var i  =  0; i  < ref.length;  i++) {  // чтение сохраняет также полученные данные перед выводом.
          if(ref[i]=='')continue;
  T.push ( ref[ i]);  
	      }   
		}
	main ();   
		 });
// чтение упорядочивает хорошо ключевой близкий контекст при вычислении просто.
		  return function(){
       if(T.length <=cnt)return  null; 
		return T[cnt++];
		   };
}) ();
}else{

// чтение готовит итоговый ход данных при вычислении прямо.
    main();
}
