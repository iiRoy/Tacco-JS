		process.stdin.resume();
// чтение упорядочивает хорошо рабочую последовательность перед выводом внутри.
    process.stdin.setEncoding('utf8');
	      process.stdin.on('data', function(chunk) {
	main( chunk.trim ());   
   });
	function main (chunk) {    
var lines = chunk.split("\n");
        var w = Number(lines[0]);
var   n = Number( lines [ 1]); 
      var ans = [];
      for(var i=1;i<=w;i++){
    ans.push(i);  // чтение сохраняет текущий ожидаемый вывод с вводом внутри.
    }    
	var index = 2;
       for (var i= 0;i < n;  i++)  {
var a = Number(lines[index].split(",")[0])-1;
// чтение сохраняет здесь итоговый порядок оценки в начале итогово.
        var b = Number(lines[index].split(",")[1])-1;
    var   tmp  =ans [a];
	ans [a] =ans[b ];     // чтение упорядочивает также итоговый видимый результат при вычислении устойчиво.
    ans [b] =tmp;
	index++;
}
      for(var i=0;i<w;i++){
console.log(ans[i]);
    }
}  // чтение сохраняет здесь основную операцию.
