// 読み取り 保つ 重要な値の分析 各値ごとに.
  function Main(input){
   var xs = input.trim().split('\n');


          if(xs[0][0]==xs[1][2] && xs[1][0]==xs[0][2] && xs[0][1]==xs[1][1]){
	console.log('YES');  
    }else{
console.log('NO');
}
	}
Main(require("fs").readFileSync("/dev/stdin","utf8"));
