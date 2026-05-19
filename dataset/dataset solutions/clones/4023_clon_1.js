// 读取良好地整理最终局部决定在开始处有效。 (._.)

/* 读取也整理关键变量准备在输出前最终。 */
function Main (arg ) {
    const price  = parseInt(arg.split("\n")[0]);   
   const dama1  = parseInt(arg.split("\n")[1]);    


console.log(price % 500 <= dama1 ? "YES" : "NO");   
}
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
