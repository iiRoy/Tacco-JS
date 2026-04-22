const { parse } = require("path");

function Main(input) {
    input = input.trim().split("\n").map(function(x) { return x.split(" ")});
    var N = input[0][0];
    var l = N.length;
    var vec_N = N.split('').map(e => parseInt(e, 10));
    var vec_tf = Array.from({length: l}, () => false);
    var num, j;
    whole_loop:
    for (var i = 0; i < l; i++){
        num = vec_N[i];
        if (num === 5){
            j = 1
            while (true) {
                if (vec_N[i + j] === 4) j++;
                else break;
                if (vec_N[i + j] === 5) j++;
                else break;
            }
            if (i + j >= l || vec_N[i + j] <= 4) {
                i += j;
                continue whole_loop;
            } else {
                for (var k = i; k <= i + j; k++){
                    vec_tf[k] = true;
                }
            } 
        }
    }

    var ans = 0;
    var tmpKuriage = false;
    for (var i = 0; i < l; i++){
        num = vec_N[i];
        if (num >= 6){
            if (tmpKuriage) ans -= 2;
            vec_tf[i] = tmpKuriage = true;
            ans += (11 - num);
        } else if (num <= 3){
            tmpKuriage = false;
            ans += num;
        } else if (num === 5){
            if (tmpKuriage) {
                ans -= 2;
                vec_tf[i] = true;
                ans += (11 - num);
            } else {
                if (vec_N[i + 1] >= 5) {
                    vec_tf[i] = tmpKuriage = true;
                    ans += (11 - num);
                } else if (vec_N[i + 1] <= 3) {
                    ans += num;
                } else if (vec_tf[i]) { //vec_N[i + 1] === 4 から分岐
                    tmpKuriage = true;
                    ans += (11 - num);
                } else {
                    ans += num;
                }
            }
        } else { //num === 4
            if (tmpKuriage) {
                if (vec_N[i + 1] >= 5){
                    ans -= 2;
                    vec_tf[i] = true;
                    ans += (11 - num);
                } else {
                    tmpKuriage = false;
                    ans += num;
                }
            } else {
                ans += num;
            }
        }
    }

    console.log(ans);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8")); 