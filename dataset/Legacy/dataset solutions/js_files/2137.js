// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
    tmp0 = input[0].split(" ");
    tmp1 = input[1].split(" ");
	//文字列から10進数に変換するときはparseIntを使います
    var n = parseInt(tmp0[0], 10);
    
      var X=[];
    for(i=0;i<n;i++){
           var r = parseInt(tmp1[i], 10);
            X[i]=r;}
              var min=Math.min(...X);var max = Math.max(...X);
// console.log(min,max);
  //  console.log(X);
     var XX=[];
    
       var total=0;
      for(l=min;l<=max;l++){
               for(i=0;i<n;i++){
                      var x = X[i];
                       var a=　x-l;
                      // console.log(a);
                        total=total+a*a;
                               }
                           XX[l]=total;var total=0;
        }
   //console.log(XX);
   
  XX.splice( 0, min );
  //console.log(XX);
  var ans=Math.min(...XX);
  console.log(ans);

}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));// inputに入力データ全体が入る
