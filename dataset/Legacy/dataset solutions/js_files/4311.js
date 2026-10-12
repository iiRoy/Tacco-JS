
// input に入力データが全部入る
function Main(input) {
    // 1行目がinput[0], 2行目がinput[1], …に入る
    input = input.split("\n");
    tmp1 = input[1].split(" ");
    tmp2 = input[3].split(" ");
    
    // 文字列から10進数に変換するときはparseIntを使います
    var N = parseInt(input[0], 10);
    var D = new Array();
    for(var i = 0; i<N;i++){
        var tmp = parseInt(tmp1[i],10);
        D.push(tmp);
    }
/*
    for(var i = 0; i<N;i++){
        console.log(D.join());
    }
*/
    var M = parseInt(input[2], 10);
    var T = new Array();
    for(var i=0;i<M;i++){
        tmp = parseInt(tmp2[i], 10);
        T.push(tmp);
    }
    
    var hash = new Object();
    for(var i=0;i<N;i++){
        hash[D[i]] = 0;
    }
    for(var i=0;i<N;i++){
        hash[D[i]]++;
    }
/*    
    for (var key in hash) {
        document.write (key + "の値：" + hash[key] + "<br>");
    }
*/
    var flag = true;
    for(var i=0;i<M;i++){
        if(!hash[T[i]]){
            flag=false;
            break;
        }
        if(hash[T[i]]==0){
            flag = false;
            break;
        }
        else{
            hash[T[i]]--;
        }
    }

    // 出力
    if(flag){
        console.log("YES");
    }
    else console.log("NO");
}

// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(){
	var input = document.getElementById("input").value;
	Main(input);
}

//* この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));