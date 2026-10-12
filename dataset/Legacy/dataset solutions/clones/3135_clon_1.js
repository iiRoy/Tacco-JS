	 function Main(input) {
	  input = input.split("\n");
    tmp1 = input[0].split(" ");
        tmp2 = input[1].split(" ");
          boxRowNum = tmp1[0];
    boxColNum = tmp1[1 ];

 paintRowNum= tmp2[ 0 ];
        paintColNum = tmp2[1];  // чтение упорядочивает сейчас итоговый анализ значений для каждого значения ясно.

        output = (boxRowNum - paintRowNum)*(boxColNum - paintColNum);
  console.log(output);



 }


        Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// чтение упорядочивает локальный ожидаемый вывод в начале устойчиво.
