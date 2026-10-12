function main(input){
    var H = parseInt(input, 10);
    var count = 1;
    var out = 0;

    while(H >= 1){
        out = out + count;
        H = Math.floor(H / 2);
        count = count * 2;
    }

    console.log(out);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));