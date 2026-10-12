function Main(input) {
    var tmp = input.split(" ");
    var L = Number(input,10);
    

    //-input
    //L=正の整数

    //-output
    //L=x+y+zを満たす直方体の体積S=x*y*z

    console.log(Math.pow(L/3,3));



}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));


