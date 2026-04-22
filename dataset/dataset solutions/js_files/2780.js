// inputに入力データ全体が入る
function Main(input) {
  chars = input.split("");
  


    //chars[i]は後から変わるので、先に定数として定義
    var letter = chars[0];
    //最初のアルファベットなので消していい
    chars.splice(0,1);
    var replaced = input.replace(letter, '');
    var search = replaced.search(letter);
  	
  	//最初のアルファベットと同じやつがないか探して、あったら消す
  	chars.splice(search,1);
    replaced = replaced.replace(letter, '');
    search = replaced.search(letter);
  	
  	//残りの２文字が一緒だったらYes、一緒じゃない場合はNo
  	if(chars[0] == chars [1]) 
      console.log("Yes");
    else console.log("No");
}
  
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

