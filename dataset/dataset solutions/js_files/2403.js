// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	var lines = input.split("\n");;
	var N = Number(lines[0].split(" ")[0]);
    var M = Number(lines[0].split(" ")[1]);
    var S = lines[1];
    var ans;
    
    if(N <= M){
        ans = N;
    }else{
        var ansArray = new Array();
        var presentIdx = 0;
        for(var i=M; i>=0; i--){
            if(i==0 && ansArray.length == 0){
                ans = -1;
                break;
            }
            if(N-presentIdx-i <= 0){
                ansArray.unshift(N-presentIdx);
                break;
            }
            if(S[N-presentIdx-i] == "0"){
                ansArray.unshift(i);
                presentIdx += i;
                i = M + 1;
                // console.log(presentIdx)
                // break;
            }
        }
        if(ans != -1){
            ans = ansArray.join(" ");
        }
    }
//	console.log(ans);
	//出力
	console.log('%s',ans);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));