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
        var KList1 = [];
        var KList2 = [];
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
                KList1.push(line[0] - 1);
            } else if (line [1] < line[2]){
                line = [N - line[0], line[2], line[1]];
                arr_KLR2.push(line);
                lowLimit += line[2];
                KList2.push(line[0] - 1);
            } else {
                lowLimit += line[1];
                Nafter --;
            }
        }
        arr_KLR1.sort((a, b) => a[0] - b[0]);
        arr_KLR2.sort((a, b) => a[0] - b[0]);
        KList1.sort((a, b) => a - b).filter(function (x, i, self) {
            return self.indexOf(x) === i;
        });
        KList2.sort((a, b) => a - b).filter(function (x, i, self) {
            return self.indexOf(x) === i;
        });
        var spaceList1 = [[], []];
        var spaceList2 = [[], []];
        var getSpaceListIndex1 = Array.from({length: KList1[KList1.length - 1] + 1}, () => 0);
        var getSpaceListIndex2 = Array.from({length: KList1[KList2.length - 1] + 1}, () => 0);
        var old = -1;
        for (var i = 0; i < KList1.length; i++){
            spaceList1[0].push(KList1[i] - old);
            spaceList1[1].push(0);
            getSpaceListIndex1[KList1[i]] = i;
            old = KList1[i];
        }
        old = -1;
        for (var i = 0; i < KList2.length; i++){
            spaceList2[0].push(KList2[i] - old);
            spaceList2[1].push(0);
            getSpaceListIndex2[KList2[i]] = i;
            old = KList2[i];
        }



        var ans = lowLimit;
        var bestPlace, tmpSpaceListIndex;
        for (var i = 0; i < arr_KLR1.length; i++){
            increase = arr_KLR1[i][1] - arr_KLR1[i][2];
            tmpSpaceListIndex = getSpaceListIndex1[arr_KLR1[i][0] - 1];
            while (spaceList1[1][tmpSpaceListIndex] === spaceList1[0][tmpSpaceListIndex] && tmpSpaceListIndex >= 0){
                 tmpSpaceListIndex --;
            }
            if (tmpSpaceListIndex >= 0) {
                spaceList1[1][tmpSpaceListIndex] ++;
                ans += increase;
            }
        }

        for (var i = 0; i < arr_KLR2.length; i++){
            increase = arr_KLR2[i][1] - arr_KLR2[i][2];
            tmpSpaceListIndex = getSpaceListIndex2[arr_KLR2[i][0] - 1];
            while (spaceList2[1][tmpSpaceListIndex] === spaceList2[0][tmpSpaceListIndex] && tmpSpaceListIndex >= 0){
                 tmpSpaceListIndex --;
            }
            if (tmpSpaceListIndex >= 0) {
                spaceList2[1][tmpSpaceListIndex] ++;
                ans += increase;
            }
        }

    
        console.log(ans);


        l += N + 1;
    }
}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));