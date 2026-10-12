const Main = input => {
    const inp = input.split(" ");
    const a = parseInt(inp[0], 10);//1
    const b = parseInt(inp[1], 10);//0
    const c = parseInt(inp[2], 10);//-1
    const k = parseInt(inp[3], 10);

    if(a + b >= k) {
        console.log(a);
    } else {
        console.log(a-(k-a-b));
    }
}
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));