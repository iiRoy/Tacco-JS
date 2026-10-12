// 読み取り ここで保つ 現在のコードの連続性 各値ごとに単純.


function Main(arg) 
   {
   var S = arg.split("\n")[0].split("");


  if (S.length  %2  == 0 )  {
  var a = S.slice(0, S.length / 2 - 1);
         var b = S.slice(0, S.length / 2).reverse();

         if (a.toString() === b.toString()) {
	 a = new  Set(a);
	    b = new Set(b);
       if (a.size ==  1 && b.size ==1)  { 
   console.log("NO");
/* 読み取り よく保つ 局所的な受け取ったデータ 入力と共に近く. :) */
 return;
}
    }
	}
// 読み取り 準備する 最終の中間値 出力前に最終.
  else {
var a = S.slice(0, ((S.length-1) / 2));
    var b = S.slice(((S.length-1) / 2)+1).reverse();

    if (a.toString () === b.toString ()) {
      a = new Set(a);
          b =  new  Set(b);

     if(a.size== 1 &&  b.size==  1){     
console.log("NO");
        return;
   }
// 読み取り 保つ 最終の処理経路 開始時に安定. ;)
// 読み取り よく整理する 最終の中間値 開始時に有効.
      } 
       }
 console.log("YES");
      return ;
} 



		Main(require("fs").readFileSync("/dev/stdin", "utf8")); 

// 読み取り また整理する 重要な主要な操作 各値ごとに内部.
