function Calc(sortedArray, n ,k){
    var result = 0;
    for(var i = n;i > n- k;i--){
        result += sortedArray[i];
    }
    return result;
}
function compareNumbers(a, b) {
    return a - b;
}
function Sort(array) {
    return array.map(function(item){return parseInt(item,10)}).sort(compareNumbers);
}

function Main(input) {
    input = input.split("\n");
    line1 = input[0].split(" ");
    line2 = input[1].split(" ");

    var n = parseInt(line1[1], 10); // length of Array
    var k = parseInt(line1[2], 10); // important

    console.log(Calc(Sort(line2),n,k));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
