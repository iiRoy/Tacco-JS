function Main(input){
 input = input.split("\n");
 inputStr = input[0].split(" ");
 var N = Number.parseInt(inputStr[0]);
 var A = input[1].split(" ");
 var i = 0;
 var out = 0;
 var val = 0;
 var pos = 0;
 var abssum = 0;
 var mainus_cnt = 0;
 var zeroflg = 0;
  
 //負の数が幾つあるか数える
 for ( i = 0 ; i < N; i++) {
   if ( Number.parseInt(A[i]) < 0 ) {
     mainus_cnt += 1;
   }
   if ( Number.parseInt(A[i]) === 0 ) {
     zeroflg = 1;
   }
 }
 //console.log(mainus_cnt);
 //console.log(zeroflg);
  
 //0が無く、マイナスが偶数の場合、絶対値が最も小さい文字の場所を特定する
 if ( zeroflg === 0 &&  (mainus_cnt % 2)  !== 0 ) {
   val = Math.abs(Number.parseInt(A[0]));
   pos = 0;
   for ( i=1 ; i < N; i++) {
     if ( val > Math.abs(Number.parseInt(A[i])) ) {
        val = Math.abs(Number.parseInt(A[i]));
        pos = i;
     }
   }
 }
 //console.log(val);
 //console.log(pos);
  
 //forで回しながら絶対値を足しこむ。
 for ( i=0 ; i<N ; i++) {
   //console.log(i);
   if ( zeroflg === 1 || (( mainus_cnt % 2 ) === 0))  {
     abssum = abssum + Math.abs(Number.parseInt(A[i]));
   } else {
     if ( i === pos) {
       abssum = abssum - Math.abs(Number.parseInt(A[i]));
     } else {
       abssum = abssum + Math.abs(Number.parseInt(A[i]));
     }
   }
   //sum = sum + Math.abs(Number.parseInt(A[i]));
 }
 console.log(abssum);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
