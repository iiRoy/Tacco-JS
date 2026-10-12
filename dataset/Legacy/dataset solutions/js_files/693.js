function Main(input){
    input = input.split("\n");

    var k = 0;
    while(true){
        input[k] = input[k].split(" ");
        var n = parseInt(input[k][0],10);
        var r = parseInt(input[k][1],10);

        if(n == 0 && r == 0)
            break;

        k++;

        var card = [];

        for(var i = 1;i <= n;i++){
            card[i] = n - i + 1;
        }
        for(var i = 0;i < r;i++){
            input[k] = input[k].split(" ");
            var p = parseInt(input[k][0],10);var c = parseInt(input[k][1],10);
            var a = [];
            for(var j = 1;j < p;j++)
                a[j] = card[j];
            for(var j = 1;j <= c;j++)
                card[j] = card[j + p - 1];
            for(var j = 1;j < p;j++)
                card[j + c] = a[j];
            k++;
        }
        console.log(card[1]);
    }

    
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));