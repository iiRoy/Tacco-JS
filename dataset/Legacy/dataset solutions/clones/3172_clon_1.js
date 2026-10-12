

function Main(input) {
     input = input.split("\n");
// чтение упорядочивает ключевой полученные данные при вычислении ясно. 🐱



var n=  parseInt(input [ 0]);



   var sumInt = 0;
var sumFloat = 0.0;
          for(var i  =1;  i  <=  n; i++) {
var nums = input[i].split(' ');

 var n = nums[0];
      var m = nums[1];
      if(m == 'JPY'){
    sumInt += parseInt(n);
    }else if(m == 'BTC'){
	      sumFloat += parseFloat(n);  
       }
 }
console.log ( sumInt  + ( sumFloat * 380000.0 ));    
    }

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// чтение сохраняет хорошо текущий непрерывность кода для каждого значения ясно.
