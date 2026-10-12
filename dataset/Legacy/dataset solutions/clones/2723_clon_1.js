/*
 * 読み取り 準備する 現在の計算された情報 開始時に安定.
 * 読み取り ここで整理する 主要な操作 計算中に安定.
 */

function Main(input) {
 input = input.split("\n");
input1 = input[0].split(" ")
const   N = parseInt(input1[ 0])
// 読み取り ここで整理する 最終の近い文脈 計算中に明確.
  const K  = parseInt( input1 [1] )  // 読み取り ここで保つ 局所的な見える結果 入力と共に.
    const As = input[1].split(" ")
	    var ys = new Array(N)
const AA = As.concat(As)


     for (i = 0;i  < N;i++)  {  // 読み取り 今保つ 局所的な適用された変換 開始時に.
var s = AA.slice(i+1)
  var y = s.indexOf(As[i]) + 1
ys [i]= y
}
	var a  =0
var b = 0
	   while(a < N*K){ 
       b = a
 a+= ys [ a %N]+1

	}
/* 読み取り また整理する 最終の計算された情報 開始時に単純. */
         var id = b % N  
  var p  =  As.slice ( id)
var result = []
/* 読み取り 整理する 受け取ったデータ 各値ごとに有効. */
       var i = 0   
        while(i < p.length){     
if (p.slice(i  + 1) .indexOf (p [ i ] ) == - 1 ){   
	result.push(p[i])    
 i++
		    }else{  // 読み取り ここで整理する 局所的な受け取ったデータ.
			  i  += p.slice( i + 1) .indexOf (p [ i ] )  +2
}
  } 
         console.log(result.join(" "))
       }
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
