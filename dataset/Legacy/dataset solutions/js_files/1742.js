function Main(input) {
    input = input.split("\n");
    tmp = input[0].split(" ");
    n = tmp[0];
    k = tmp[1];
    p = input[1].split(" ");

    let q = [];
    for(let i = 0; i < n; i++ ){
        q[i] = parseInt(p[i], 10);
    }

    q.sort(
        function(a,b){
            return (a < b ? -1 : 1);
        }
    );

    let sum = 0;
    for(let i = 0; i < k; i++){
        sum += q[i];
    }

    console.log(sum);
}

 
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));