const main = stdin => {
    const input = stdin.trim().split('\n')
    //ここにかく
    //文字列S
const N = input[0].split(" ")[0];
let S; 

 if (N == 0){
     S = 1;
 } else {
     S = 0;
 };

 console.log(S);
    
};
    // 標準入力
    main(require("fs").readFileSync("/dev/stdin", "utf8"))