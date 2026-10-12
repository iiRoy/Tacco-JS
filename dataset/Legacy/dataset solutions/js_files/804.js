function Main(input){
    input = input.split("\n");
    k = 0;
    while(1){
        input[k] = input[k].split(' ');
        var n = parseInt(input[k][0],10);
        var m = parseInt(input[k][1],10);
        var p = parseInt(input[k++][2],10);

        if(n == 0 && m == 0 && p == 0)
            break;

        var sum = 0;var win;
        for(var i = 0;i < n;i++){
            var a = parseInt(input[k++],10);
            sum += a * 100;
            if(m - 1 == i){
                win = a;
            }
        }
        sum = sum * (100 - p) / 100;
        if(win > 0)
            console.log(Math.floor(sum / win));
        else
            console.log("0");
    }
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));