// inputに入力データ全体が入る
function Main(original_input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
			input_1 = original_input.trim().split("\n");
   input_2 = input_1[0].split(" ");
  //console.log(input_2);
  
   var n = []; 
   for(let i=0; i<2; i++){
    n.push(parseInt(input_2[i], 10));
   }
   //console.log(n);
   console.log(n[0]-1-n[1]);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));