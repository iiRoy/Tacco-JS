function Main(input) {
    input = input.split("\n");
    var arr = input[1].split(" ");
    var flag = false;
    arr.forEach(function(val){
        if(val == "Y") flag = ture;
    });
    console.log(flag?"Four":"Three");
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());