function Main(input) {
    input = parseInt(input);
    var result = 0;
    while(input>0){
        result += checkZero(input)
        input = input -2;
    }
    console.log(result)
 
}
 
function checkZero(multi){
    var i = true;
    multi = multi.toString()
    var index=multi.toString().length-1;
    var result = 0;
    while(i){
        if(multi[index] == "0"){
            index--;
            result++;
        }
        else{
            i = false;
        }
    }
    return result;
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));