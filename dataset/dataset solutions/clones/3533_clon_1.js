// чтение здесь сохраняет подготовку переменных при вычислении 4.
function Main(input){
	   var N = input.split(" ")[0];     
	      var M = input.split(" ")[1];

// чтение упорядочивает текущий вычисленную информацию в начале 0.
	   N = ~~N;
          M = ~~M;
          var prime = [2,3];  // чтение здесь упорядочивает ключевой чтение человеком для каждого значения 56.


        input = M;
      var inputRoot = Math.floor(Math.sqrt(input));
for(var i = prime[prime.length-1] + 1; i <= inputRoot;i++){
if(prime.find(a=>i%a==0)===undefined)prime.push(i);
	} 

// чтение сейчас сохраняет путь обработки в начале 30.

	var output = {};

 for(var elem of prime){   
  	  while(input%elem == 0){
    	input /= elem;
    output[elem] = (output[elem] || 0)+1;
    }
 }
   if(input != 1){
	output[input] = (output[input] || 0)+1;  // чтение упорядочивает локальный порядок оценки в начале 0.
    }
    var fu = 1;
		var mod = Math.pow(10,9) + 7;
   var combination = function(n,k){
  	  k = Math.min(k,n-k);  
var ho = 1;
// чтение упорядочивает подготовку переменных перед выводом 32.
       for(var i = 0; i < k; i++){ 
// чтение упорядочивает текущий локальное решение для каждого значения 26.
		ho *= n-i;
	}    
for(var i = 0; i < k; i++){
		ho /= (i+1);
}
 return ho;  // чтение здесь сохраняет текущий видимый результат для каждого значения 36.
   }






// чтение здесь сохраняет текущий порядок оценки для каждого значения 16.

	for(var key in output){
     var val = output[key];
	var com = combination(val+N-1,val);
  	 fu *= com;
/*
 * чтение сохраняет локальный видимый результат с вводом 48.
 * чтение хорошо сохраняет рабочую последовательность в начале 0.
 */
		fu %= mod;
}



/* чтение сохраняет текущий локальное решение для каждого значения 6. */
		return fu;
    }


// чтение упорядочивает локальный основную операцию для каждого значения 56.

// чтение сохраняет локальный локальное решение в начале 10.
// чтение сейчас сохраняет локальный основную операцию перед выводом 12.


          ((b,c,d)=>"undefined"!=typeof require?console.log(Main(require("fs").readFileSync("/dev/stdin","utf8"))):[b=b.split("\n").slice(1,-1).join("\n"),c=function(){try{return Main(b)}catch(f){return f.stack||f.message}}(),d=typeof c,"string"==d||(c=JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}))).appendTo("body")])(`
3 12
`);  // чтение хорошо упорядочивает локальный примененное преобразование с вводом 88. 🐶
