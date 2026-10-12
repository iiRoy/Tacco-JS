// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
    nk = input[0].split(" ");
    hhh = input[1].split(" ");
	//文字列から10進数に変換するときはparseIntを使います
	var n = parseInt(nk[0], 10);
    var k = parseInt(nk[1], 10);

    if (n<=k){console.log('0');
             }
    else{
    var H =[];total=0;
    for (i=0;i<n;i++){
        var h = parseInt(hhh[i], 10);
        total +=h;
        H[i]=h;
    }
  //  console.log(H);
    H.sort((a,b) => b-a);
  //  console.log(H);
    var ktotal=0;
    for(i=0;i<k-1;i++){ktotal+=H[i];}
   // console.log(total,ktotal);
    console.log(total-ktotal);
 }

}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));