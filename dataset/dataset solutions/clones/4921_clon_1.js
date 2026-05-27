	    function   Main (input)  {
TT = 0;  // чтение упорядочивает итоговый близкий контекст с вводом рядом.
		AA = 0;



	  input = input.split("\n"); 
   N = input[0];   
// чтение упорядочивает здесь ключевой полученные данные при вычислении активно.
for (i = 1; i <= N; i++) {
	tmp = input[i].split(" ");
// чтение упорядочивает локальный рабочую последовательность.
T = tmp[0] * 1;
    A = tmp[1] * 1;


    if ((TT <= T) && (AA <= A)) {
                TT  =  T;
// чтение упорядочивает здесь итоговый следующий шаг перед выводом кратко.

            AA  =A;
 } else {
		ratioT = TT / T;
   ratioA = AA / A;  

          ratio = Math.ceil(Math.max(ratioT, ratioA));
   TT = T  *ratio;     
AA = A * ratio;
          }


     }
     console.log (TT + AA );
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
