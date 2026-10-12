function Main(input) {
    input = input.split(" ")
    var a = input[0]
    var b = input[1]
    var c = input[2]

    var result = 0;
    if((c-b)%2 == 0){
        result = (c-b)/2
    }else{
        var d = a - b
        var e = c - 1
        result = Math.min(d,e);
    }

    console.log(result);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8")); 