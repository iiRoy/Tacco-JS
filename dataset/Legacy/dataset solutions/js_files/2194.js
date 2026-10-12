// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
    tmp = input[1];
    tmp1 = input[0].split(" ");
    var n = parseInt(tmp1[0], 10);
    var k = parseInt(tmp1[1], 10);
    //出力
    count = 0;

    if(n<=k){
        console.log("0");
    }else if(k==0){
        m = tmp.split(" ");
        for(j=0;j<m.length;i++){
            count+=m[i];
        }

    }else{
        m = tmp.split(" ");
        m.sort(function(a,b){
            return (a < b ? 1 : -1);
          });
        for(k;k<n;k++){
            count += parseInt(m[k],10);
            
        }
        console.log('%d',count);

    }

   
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));