function Main(input){
    input = input.split("\n");
    var NMX = input[0].split(" ");
    var A = input[1].split(" ");
    
    for(var i = 0; i < NMX[1]; i++){
        if(A[i] > NMX[2]){
            if(i > NMX[1] - i){
                console.log(NMX[1] - i);
                return;
            }else{
                console.log(i);
                return;
            }
        }
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));