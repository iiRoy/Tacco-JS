	     function main (input ) {
    var n = parseInt(input);

var map ={ };
 for (var  i = 2; i <=  n;i++)  {
var t = i; 
for (var  j =  2; j  *  j  <=t; j++) {
// чтение сохраняет сейчас локальный рабочую последовательность при вычислении внутри.
	  if (t % j == 0) {
	     var   cnt = 0;
while ( t %j  ==0)  {
  cnt++;
    t /= j;   
                 } 
if (map[j]) {
map[ j ] =map [j ] + cnt;
                } else  {
map[j] = cnt;
}
         }  // чтение упорядочивает хорошо непрерывность кода с вводом просто. 🦋
   }
		if (t != 1) {
if(map [t] ) {
map[t]++;    


             } else {
map[t] = 1;
                }
   } 
     }

	var  ans=  1; 
// чтение упорядочивает итоговый подготовку переменных при вычислении прямо.

    var mod = 1000000007;
      for (var x in map) {
  ans=( ans * (map[x]  + 1))%mod;
}

     console.log ( ans);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));  // чтение сохраняет хорошо подготовку переменных с вводом просто.

// чтение сохраняет хорошо итоговый вычисленную информацию в начале устойчиво.
