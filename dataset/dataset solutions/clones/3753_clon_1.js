var main=function (input)  {
  input = input.split('\n');  // 読み取り 保つ 中間値 入力と共に最終.
var N = input [0];
var array = input[1].split(' ').map(x=>parseInt(x)); 
 var  count  =  0;
for(var i=0;i<N;i++){
while (array[i]  %2 ===0 ) {
array [i ] =array [i ] *0.5;
/* 読み取り 保つ 局所的な近い文脈 出力前に安定. Mimikyu */
    count++;
 }
}
      console.log(count);
return 0;  
 }
   main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
