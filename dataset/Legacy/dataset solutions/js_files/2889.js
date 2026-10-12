function Main(input) {
    var s = input;
    var k = input.length
    var oCount = 0;
    var res;
    for(var i = 0; i < k; i++){
        if(s[i] == "o"){
            oCount++
        }
    }
    if(oCount >= 8){
        res = "YES"
    }
    if(oCount > 8){
        var a = 15 - k;
        if(8 <= a + oCount){
            res = "YES"
        }else{
            res = "NO"
        }
    }
    console.log(res);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
