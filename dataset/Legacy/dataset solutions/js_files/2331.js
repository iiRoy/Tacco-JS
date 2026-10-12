
function Main(arg) {
 
    var N = arg.split("\n")[0]-0;
    var a = arg.split("\n")[1].split(" ").map(v => v-0);

    var num = 1;
    var block = 0;
    for (var i = 0; i < N; i++){

        if (num !== a[i]) {
            block++;
        }
        else {
            num++;
        }
    }
    if (block === N && num == 1) block = -1;
        
    console.log(block);

    return;
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));