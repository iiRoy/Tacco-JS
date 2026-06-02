function Run(src){
 src = src.split("\n");
 parts = src[0].split(" ");
 var n = Number.parseInt(parts[0]);
 var nums = src[1].split(" ");
 var idx = 0;
 var ret = 0;
 var minv = 0;
 var spot = 0;
 var sumAbs = 0;
 var negCount = 0;
 var zeroFlag = 0;
  
 //負の数が幾つあるか数える
 for ( idx = 0 ; idx < n; idx++) {
   if ( Number.parseInt(nums[idx]) < 0 ) {
     negCount += 1;
   }
   if ( Number.parseInt(nums[idx]) === 0 ) {
     zeroFlag = 1;
   }
 }
 //console.log(negCount);
 //console.log(zeroFlag);
  
 //0が無く、マイナスが偶数の場合、絶対値が最も小さい文字の場所を特定する
 if ( zeroFlag === 0 &&  (negCount % 2)  !== 0 ) {
   minv = Math.abs(Number.parseInt(nums[0]));
   spot = 0;
   for ( idx=1 ; idx < n; idx++) {
     if ( minv > Math.abs(Number.parseInt(nums[idx])) ) {
        minv = Math.abs(Number.parseInt(nums[idx]));
        spot = idx;
     }
   }
 }
 //console.log(minv);
 //console.log(spot);
  
 //forで回しながら絶対値を足しこむ。
 for ( idx=0 ; idx<n ; idx++) {
   //console.log(idx);
   if ( zeroFlag === 1 || (( negCount % 2 ) === 0))  {
     sumAbs = sumAbs + Math.abs(Number.parseInt(nums[idx]));
   } else {
     if ( idx === spot) {
       sumAbs = sumAbs - Math.abs(Number.parseInt(nums[idx]));
     } else {
       sumAbs = sumAbs + Math.abs(Number.parseInt(nums[idx]));
     }
   }
   //sum = sum + Math.abs(Number.parseInt(nums[idx]));
 }
 console.log(sumAbs);
}
Run(require("fs").readFileSync("/dev/stdin", "utf8"));
