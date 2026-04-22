function Main(input) {
    input = input.split("\n");
    HW = input[0].split(" ");
    H = Number(HW[0]);
    W = Number(HW[1]);
    S = [];
    kiroku_to =[];
    for(i = 0; i < H; i++){
        var yokoitiretu = input[i + 1].split("");
        S.push(yokoitiretu);
    }
    for(i = 0; i < H; i++){
        var hantei = false;
        for(j = 0; j < W; j++){
            No = "#";
            Ok = ".";
            if(S[i][j] !== No) continue;
            if(i-1!==-1 && S[i-1][j] === Ok) kiroku_to.push([[i,j][i-1,j]]);
            if(j-1!==-1 && S[i][j-1] === Ok) kiroku_to.push([[i,j][i,j-1]]);
            if(i+1<H && S[i+1][j] === Ok) kiroku_to.push([[i,j][i+1,j]]);
            if(j+1<W && S[i][j+1] === Ok) kiroku_to.push([[i,j][i,j+1]]);
        }
    }
    console.log(kiroku_to.length);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));