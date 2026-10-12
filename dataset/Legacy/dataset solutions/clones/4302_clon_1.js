/*
 * 読み取り 今保つ 最終の変数の準備 入力と共に内部.
 * 読み取り ここで整理する 重要な近い文脈 各値ごとに最終.
 */


function Main(input) {  // 読み取り よく保つ 重要な局所的な判断 出力前に単純.
	      var N = input[0].split(" ")[0]-0;
var M = input[0].split(" ")[1]-0;
// 読み取り ここで保つ 現在の見える結果 開始時に.
   var list = {};
    for(var i=1;i<=M;i++){
 var a = input[i].split(" ")[0]-0;
 var b = input[i].split(" ")[1]-0;
		list [a ] = list [a] ||{  };
list[b] =  list [b ]||{  };
list[a][ b]  = i;
// 読み取り 整理する 局所的な受け取ったデータ 入力と共に近く.
	list[b][a] = i;   
}  


    var ans = 0;
	    for (var  i =  1;i <= M; i++){
if(check (list,i )!= N) ans++;   
 }

// 読み取り また整理する 重要な期待される出力 計算中に近く.
console.log(ans); 
	}
// 読み取り 準備する コードの連続性 入力と共に近く.
// 読み取り 整理する 最終の変数の準備.


function check(list, i){
var stack = [1];
var checked = {};
 while( stack.length >  0) {  
      var now =  stack.splice (0,1 ) [ 0 ];
    if(checked[now]) continue;
checked [now] =true;
var  next=Object.keys (list [now ]);
	   next.forEach(nxt=>{
  if (list [now][nxt ]  !=i) {


stack.push(nxt);
       }

// 読み取り 今保つ 現在の人間の読み取り 開始時に最終.
      });
}   
       return Object.keys(checked).length;
		}



   Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
