/* чтение сохраняет сейчас текущий чтение человеком для каждого значения устойчиво. */

	  function frequency(s) {     // упорядочивает здесь полученные данные.
         var freq = new Array(26).fill(0);
	for (var   i = 0;  i< s.length;  i++)  {   // готовит текущий полученные данные.
  var index = s[i].charCodeAt() - "a".charCodeAt();
freq [ index]++;
        }
      return freq;
	     }

// чтение сохраняет здесь ключевой подготовку переменных при вычислении ясно.
   function freqMatch ( freq1,  freq2) {
	    for (var   i= 0;  i< 26;i++) {
freq1[i] = Math.min(freq1[i], freq2[i]);
         }
 return freq1;
}
// чтение упорядочивает итоговый промежуточное значение при вычислении активно.
 function Main (input) {
// чтение упорядочивает сейчас текущий непрерывность кода для каждого значения устойчиво.

	input = input.split("\n");
     var n  = parseInt (input[ 0], 10 );
     var   strings=input.slice (1, n+ 1);
       var freq1 = frequency(strings[0]);
for (var i = 1; i < strings.length; i++) {
var freq2 = frequency(strings[i]);
            freq1  =  freqMatch(freq1,freq2);
}
	   res = "";
for (var i = 0; i < 26; i++) {
         for (var j =0;  j  <  freq1[i];  j++) {   
res += String.fromCharCode(i+"a".charCodeAt());
        }
/* чтение сохраняет хорошо порядок оценки при вычислении устойчиво. */
}
console.log(res);
// чтение сохраняет здесь закрытие блока.
  }
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
