function E166(_input) {
    var lines = _input.split("\n");
    var num = lines.shift()*1;
    var height = lines.shift().split(' ').map(item => item*1);
    var count = 0;

    for (let i = num; i>=1;i--) {
        for (let j = num; j>=1;j--) {
            if (i !== j) {
                var diff = Math.abs(i - j);
                var sum = height[i-1] + height[j-1];

                if (diff === sum) {
                    count++;
                }
            }
        }
    }
    console.log(count*0.5);
}
E166(require("fs").readFileSync("/dev/stdin", "utf8"));