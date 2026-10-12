function Main(input) {

    input = input.split("\n");
    
    const n = parseInt(input[0]);
    var count = 0;

    for (var a=1 ; a<1000 ; a++){
        for (var b=1 ; b<1000 ; b++){
            for (var c=1 ; c<1000 ; c++) {
                if(n == (a*b+c)) {
                    count++;
                }
            }
        }
    }

    console.log('%d', count);

}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

