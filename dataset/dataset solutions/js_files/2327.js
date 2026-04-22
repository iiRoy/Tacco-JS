// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	//文字列から10進数に変換するときはparseIntを使います
    input[0] = input[0].split(" ");
	var a = parseInt(input[0][0], 10);
  	var aft = a;
    var b = parseInt(input[0][1], 10);
    var bft = b;
  	var aso = new Array(100000);
    var bso = new Array(100000);
    var ans = 1;
    aso[0] = 0;
    aso[1] = 0;
    bso[0] = 0;
    bso[1] = 0;
	for(var i=2; i<=100000; i++){
      aso[i] = 0;
      bso[i] = 0;
      for(var j=0; j<1; j){
        if(a%i == 0){
           a = a/i;
           aso[i] += 1;
        }else{
           j = 1;
        }
      }
      for(var j=0; j<1; j){
        if(b%i == 0){
           b = b/i;
           bso[i] += 1;
        }else{
           j = 1;
        }
      }
    }
  for(var i=2; i<=100000; i++){
    if(aso[i] != 0 && bso[i] != 0){
      for(var j=0; j<Math.min(aso[i], bso[i]); j++){
        ans *= i;
      }
  }else if(aso[i] != 0){
      for(var j=0; j<aso[i]; j++){
        ans *= i;
      }
  }else if(bso[i] != 0){
      for(var j=0; j<bso[i]; j++){
        ans *= i;
      }
  }
  }
  var max = 0;
  if(max < ans){
    max = ans;
  }
  if(max < aft){
     max = aft;
  }
  if(max < bft){
    max = bft;
  }
  console.log(max);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));