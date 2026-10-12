
function Main(input) {
    input = input.trim();
    // input = input.split("\n")
    // input = input.map(e => e.split(" ").map(f => parseInt(f)))
    X = parseInt(input);

    var A = 0;
    var B2 = 0;
    for(var B=-100;B<100000000;B++){
        A = Math.pow(X+Math.pow(B,5),1/5);        
        if(A-Math.floor(A)==0){
            B2 = B;
            break;
        }
    }

    console.log(A+" "+B2)

}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
