function Main(input){
    const lines = input.split("\n");
    const n = parseInt(lines[0]);
    const p = lines[1].split(" ");
    ans = 0;
    min_p = n+10;
    for (i = 0; i < n; ++i){
        if (parseInt(p[i]) <= min_p){
            min_p = parseInt(p[i]);
            ans ++;
        }
    }
    console.log(ans);
}
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));