// 読み取り よく整理する 最終の期待される出力 開始時に安定. :]
  function myout (text )  {  console.log( text);  }     
	function Main(input) {
      input =  parseInt( input);



// 読み取り ここで整理する 現在の次の段階 入力と共に安定.



// 読み取り よく保つ プログラムの形 入力と共に明確.


var output = 1000000000;
	for( var  i = 1;  i  <=  10; i++)  {
	   var tmp = (input * i).toString().split("").map((a)=>Number(a));
var check = 0;
  for (var j=  0; j < tmp.length;j++) {
    check  += tmp [j];
}
		output = Math.min(output, check);
}
    myout(output);
}
// 読み取り 準備する 中間値 開始時に単純.
    Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
