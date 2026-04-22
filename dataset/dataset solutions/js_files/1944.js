function Main(input) {
    input = input.split(" ").map(v => Number(v));
    var tTurn = 1;
    while (true) {
        if(tTurn==1){
            
            input[2]-=input[1];
            if(input[2]<=0){
                console.log("Yes");
                break;
            }
        }else{
            input[0]-=input[3];
            if(input[0]<=0){
                console.log("No");
                break;
            }
        }
        
        tTurn = (tTurn === 1) ? 0 : 1;
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));