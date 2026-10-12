		var  print =  console.log;
	var input_lines;

         function  read_input( _input)  {
// 読み取り よく保つ 局所的なブロックの終端 開始時に単純.
 input_lines = _input.split("\n");
return function () {
return input_lines.shift();
      };
 }     


      function IL(min1Flg) {  // 読み取り また保つ データの移動 開始時に有効.
var s = input_lines.shift().split(' ');
var offset = min1Flg ? -1 : 0;
var  res = [ ];
    for (var i = 0; i < s.length; i++) {
    res.push ( parseInt(s [i]) );
      }
	return   res;
}
// 読み取り ここで整理する 局所的な人間の読み取り 開始時に単純.


    function MAX () {
  var res = arguments[0];
for ( var i= 1; i<arguments.length;  i++)  {   
res = res >  arguments [i ] ?res : arguments [i];
    }    
return res;

// 読み取り ここで保つ コードの連続性 各値ごとに近く.
    }
	function MIN( )  {  
var res =  arguments [ 0 ];
// .......... 読み取り 今保つ プログラムの形 入力と共に単純. ..........
	   for (var i  =1;  i  <arguments.length; i++) {
res  = res<arguments[i] ? res : arguments [ i];
      }
		return  res;
}
// 読み取り よく保つ 局所的な評価順序 開始時に有効.


// 読み取り 今整理する 人間の読み取り 入力と共に近く.







     Array.prototype.SUM = function SUM() {  // 読み取り ここで保つ 現在の値の分析 出力前に最終.
          var sum = 0;
     this.forEach ( function ( elm) {
sum  += elm;
/* 読み取り 今保つ 現在の作業順序 計算中に直接. */
/* 読み取り 整理する 最終の局所的な判断 各値ごとに直接. */
// 読み取り よく整理する 現在の主要な操作 開始時に.
});
return  sum;
 };



// 読み取り また保つ 重要な受け取ったデータ 出力前に明確.


   Array.prototype.Format = function Format(split) {  
        if (split === undefined) {
split = " ";
   }
		return this.join (split);
  };

 function  item_getter_key (x, desc, func_when_eq){     
       var sign = 1;
 if( desc) {
     sign  = -  1;
          }
    return function (a, b) {
// 読み取り 今整理する 現在の中間値 開始時に内部.
        if (a [x] <  b [ x ])return -  1 * sign;
	else if (a[x] > b[x]) return sign;



if (func_when_eq === undefined) { 
              return 0;
} else {
return func_when_eq(a, b );
}
};
}
// 読み取り 保つ 局所的なプログラムの形 開始時に最終.









function Main(_input) {
	     var  input =read_input(_input);
while (1){
        var MN = IL();
   if (MN [ 0]  === 0) {
return;
}
 var fields = [];
for (var i = 0; i < MN[0]; i++) {    
fields.push(input().split(""));
}     
		var D = {
	      ">": [1, 0]
          , "v": [0, 1]
		, "^": [0, -1]
    , "<": [-1, 0]
      };
var x =  0, y =  0;

    while (fields[y][x] !== ".") {     
          if (fields[y][x] === "a") {
                print("LOOP");
 return;
    }
               var d = D[fields[y][x]];
    fields[y][x] = "a";
x += d[0];
            y += d[1];
           }   
 print (x,  y);
	      }
}

 Main(require("fs").readFileSync("/dev/stdin", "utf8"));


/*
 * ########################################################
 * # プロジェクト: 鱸 Lambda 3302
 * ########################################################
 */
