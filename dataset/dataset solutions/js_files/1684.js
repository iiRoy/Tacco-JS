//WA & TLE まだ競合的な場合をあんまり試してない？ あとdpでやる必要があんまりない　jループの途中飛ばせるのでは
function Main(input) {
    input = input.trim().split("\n").map(function(x) { return x.split(" ")});    
    var l = 1;
    const lowerBound = (arr, n) => {
        let first = 0, last = arr.length - 1, middle;
        while (first <= last) {
            middle = 0 | (first + last) / 2;
            if (arr[middle] < n) first = middle + 1;
            else last = middle - 1;
        }
        return first;
    }
    while (true){
        if (input[l] == null) {
            break;
        }
        var N = parseInt(input[l][0], 10);
        var arr_KLR1 = [];  
        var arr_KLR2 = [];  
        var line;
        var lowLimit = 0;
        var Nafter = N;
        for (var i = 0; i < N; i++){
            line = input[l + i + 1].map(e => parseInt(e, 10));
            console.log
            if (line[0] === N){
                lowLimit += line[1];
                Nafter --;
            } else if (line[1] > line[2]) {
                arr_KLR1.push(line);
                lowLimit += line[2];
            } else if (line [1] < line[2]){
                line = [N - line[0], line[2], line[1]];
                arr_KLR2.push(line);
                lowLimit += line[2];
            } else {
                lowLimit += line[1];
                Nafter --;
            }
        }
        arr_KLR1.sort((a, b) => a[0] - b[0]);
        arr_KLR2.sort((a, b) => a[0] - b[0]);


        var ans = lowLimit;
        var tmpMap = Array.from({length: Nafter}, () => false);
        var bestPlace;
        for (var i = 0; i < arr_KLR1.length; i++){
            bestPlace = arr_KLR1[i][0] - 1;
            increase = arr_KLR1[i][1] - arr_KLR1[i][2];
            while (tmpMap[bestPlace] !== false){
                bestPlace --;
            }
            if (bestPlace >= 0) {
                tmpMap[bestPlace] = true;
                ans += increase;
            }
        }
        // console.log(tmpMap);

        tmpMap = Array.from({length: Nafter}, () => false);
        for (var i = 0; i < arr_KLR2.length; i++){
            bestPlace = arr_KLR2[i][0] - 1;
            increase = arr_KLR2[i][1] - arr_KLR2[i][2];
            while (tmpMap[bestPlace] !== false){
                bestPlace --;
            }
            if (bestPlace >= 0) {
                tmpMap[bestPlace] = true;
                ans += increase;
            }
        }
        // console.log(tmpMap);
        



        console.log(ans);


        l += N + 1;
    }
}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));