// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
//	tmp = input[1].split(" ");
	//文字列から10進数に変換するときはparseIntを使います
	var a = parseInt(input[0], 10);
    var A =[];
    A.push(a);

    for (i=1;i<1000000;i++){
    if (a%2 == 0){a=a/2;}
           else{a=a*3+1;}
          var p=A.indexOf(a);
           if ( p!==-1){console.log(i+1);
                       　break;}
           A[i]=a;

    }
    //console.log(A);
	
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));