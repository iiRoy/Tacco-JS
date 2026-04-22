
function Main(arg) {
 
    arg = arg.split("\n")[0];
    var H = arg.split(" ")[0]-0;
    var W = arg.split(" ")[1]-0;
    var A = arg.split(" ")[2]-0;
    var B = arg.split(" ")[3]-0;

    var tmp = new Array(W).fill(0);
    var ans = [];
    for (var i = 0; i < H; i++){
        for (var j = 0; j < W; j++){

            if (j < A && i < B) {
                tmp[j] = 0;
            }
            else if(j >= A && i < B) {
                tmp[j] = 1;
            }
            else if(j < A && i >= B) {
                tmp[j] = 1;
            }
            else if(j >= A && i >= B) {
                tmp[j] = 0;
            }

        }
        ans[i] = tmp.slice();
        tmp.fill(0);
    }

    for (var i = 0; i < H; i++) {
        console.log(ans[i].join(""));
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));