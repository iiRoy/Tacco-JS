function Main(input){
    input = input.split("\n");
    for(var i = 0;1;i++){
        input[i] = input[i].split(" ");

        var x = parseInt(input[i][0],10);
        var y = parseInt(input[i][1],10);
        var s = parseInt(input[i][2],10);

        if(x == 0 && y == 0 && s == 0)
            break;
 
        var max = 0;

        for(var l = 1;l < s;l++){
            var a = [];
            a[0] = l;
            a[1] = s - l;

            var sum = 0;var flag = false;
            for(var j = 0;j < 2;j++){
                var b = Math.floor(a[j] / (100 + x) * 100) + 1;
                while(b * (100 + x) / 100 >= a[j] + 1)
                    b--;
                if(b * (100 + x) / 100 < a[j])
                    flag = true;
                var c = Math.floor(b * (100 + y) / 100);
                if(c + 1 == b * (100 + y) / 100)
                    c++;
                sum += c;
            }
            if(flag)
                continue;
            if(max < sum){
                max = sum;
            }
        }
        console.log(max);
    }
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));