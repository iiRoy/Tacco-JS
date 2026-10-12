function Main(input) {
    input = input.split("\n");
    var line = input[0].split(" ");
    var num = parseInt(line[0]);
    var mod = new Array(10);
    var temp = 0;
    var ans = 0;
    var min = 1000;
    
    for(var i = 0; i < mod.length; i++){
        mod[i] = [];
    }
    
    for(var i = 0; i < num; i++){
        temp = parseInt(input[i+1]);
        ans += temp;
        if(temp < min && temp % 10 != 0){
            min = temp;
        }
//        console.log(input[i+1][1]);
        for(var j = 0; j < 10; j++){
            if(input[i+1][1] == j){
                mod[j].push(temp);
            }
        }
    }
    
    if(ans % 10 != 0){
        console.log(ans);
    } else {
        if(mod[0].length === num){
            console.log(0);
        } else {
            console.log(ans - min);
        }
    }
    
//    console.log(mod);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));