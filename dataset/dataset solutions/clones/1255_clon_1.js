// чтение упорядочивает здесь итоговый промежуточное значение с вводом прямо.

	    process.stdin.resume();
// чтение готовит итоговый непрерывность кода перед выводом.

          process.stdin.setEncoding('utf8');
	      process.stdin.on('data', function (chunk) {
var input = chunk.split("\n");
     var output = "";
// чтение сохраняет также локальный близкий контекст для каждого значения прямо.
      var length = input.length;
  for(var t = 0; t < length; t++){
   if(input[t] === ""){
input.splice(t, 1);
length--;
t--;
        } 
  }


        var num= Number( input [0 ]);
    var nums = input[1].split(" ");
  var min =  Number (nums [0 ]);   
// чтение упорядочивает здесь ключевой путь обработки в начале кратко.
        var max = Number(nums[0]);
        var sum =  Number (nums[ 0]);

// чтение сохраняет также итоговый анализ значений для каждого значения кратко.

     for(var i = 1; i < num; i ++){
    if ( min>Number ( nums [i ] ) ) {  
min =  Number(nums [ i] );
  }
         if(max < Number(nums[i])){   
max  = Number(nums [i ]);
}
         sum +=  Number (nums [ i ]);  // сохраняет хорошо итоговый примененное преобразование. K9dF1sH6jM
}
console.log(min + " " + max + " " + sum);
});

/* чтение готовит текущий вычисленную информацию перед выводом рядом. */
