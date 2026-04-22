function Main(input) {
    input = input.split("");
    isloop_out = true;
    P = 0;
    while(true){
        isloop_out = true;
        for(i = 0; i < input.length; i++){
            console.log(input)
            if( input[i] === "1" &&
                input[i+1] === "0"){
                    P++;
                    isloop_out = false;
                    input.splice(i,2);
                }
            if( input[i] === "0" &&
                input[i+1] === "1"){
                    P++;
                    isloop_out = false;
                    input.splice(i,2);
                }
        }
        if(isloop_out) break;
    }
    console.log(P*2)
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));