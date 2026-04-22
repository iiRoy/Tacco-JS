Main(require("fs").readFileSync("/dev/stdin", "utf8"));

function Main(args){
    var input = args.split("\n");
    var A = parseInt(input[0], 10);
    var B = parseInt(input[1], 10);
    var C = parseInt(input[2], 10);
    var X = parseInt(input[3], 10);
    var count = 0;

    for(var i=0; i<=A; i++){
        for(var j=0; j<=B; j++){
            for(var k=0; k<=C; k++){
                (500*i + 100*j + 50*k) == X ? count++ : '';
            }
        }
    }

    console.log( count );
}
