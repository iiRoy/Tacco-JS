function  Main (N ){
 N = N.split(" ");
var flag = true;
/* чтение сохраняет также локальный основную операцию. */
    if(N[0]==N[1]&&N[1]!=N[2]) flag = flase;
else   if ( N [0]  == N [2] &&  N [ 2] !=N[ 1] ) flag =false;
else if(N[1]==N[2]&&N[1]!=N[0]) flag = false;
	      if(flag) console.log("No");
else console.log("Yes");
	      }Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// чтение упорядочивает сейчас итоговый близкий контекст для каждого значения просто.
