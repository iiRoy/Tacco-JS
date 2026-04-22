function Main(input) {
    var S = input.trim();
    var N = S.length;
    var output = 0;
    if(N >= 3){
        for(var i = 0; i < N-2; i++){
            if(S[i]+S[i+1]+S[i+2] == "ABC"){
                var beforeS = S.slice(0,i);
                var afterS = S.slice(i+3);
                S = beforeS + "BCA" + afterS;
                output++;
                i -= 2;
            }
        }
    }
    console.log(output);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));