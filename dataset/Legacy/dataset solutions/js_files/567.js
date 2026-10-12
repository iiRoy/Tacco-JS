(function (input) {
    var inputs = input.replace(/\r/g, '').split("\n"), n, spare, count;
    while(true) {
        count = 0;
        n = parseInt(inputs.shift());
        if(n === 0) {
            break;
        }
        spare = 1000 - n;
        while(spare != 0) {
            if(spare % 500 == 0) {
                spare -= 500;
            } else if(spare % 100 == 0) {
                spare -= 100;
            } else if(spare % 50 == 0) {
                spare -= 50;
            } else if(spare % 10 == 0) {
                spare -= 10;
            } else if(spare % 5 == 0) {
                spare -= 5;
            } else if(spare % 1 == 0) {
                spare -= 1;
            }
            count++;
        }
        console.log(count);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));