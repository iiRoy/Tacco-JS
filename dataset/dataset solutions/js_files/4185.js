    // inputに入力データ全体が入る
    function Main(input) {
    	// 1行目がinput[0], 2行目がinput[1], …に入る
    	input = input.split("\n");
      tmp = input[0].split(" ");
      
    	//文字列から10進数に変換するときはparseIntを使います
    	var N = parseInt(tmp[0], 10);
    	var A = parseInt(tmp[1], 10);
    	var B = parseInt(tmp[2], 10);

      var CalcA = A * N;

      if( CalcA >= B){
      	console.log('%d',CalcA);
      }else{
        console.log('%d',B);
      }

    	//出力
    	//console.log('%d %s',a+b+c,s);
    }

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

