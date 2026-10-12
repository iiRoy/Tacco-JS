function Main(input) {
    input = input.trim().split("\n").map(function(x) { return x.split(" ")});
    let N = parseInt(input[0][0], 10);
    let K = parseInt(input[0][1], 10);
    let v_P = input[1].map(e => parseInt(e, 10));
    let v_C = input[2].map(e => parseInt(e, 10));
    let doneOrNot = Array.from({length: N}, () => false);

    let circle = [];

    let start, tmp, tmp2, tmp3, circleSum;
    let ans = -1 * Infinity;
    for (let i = 0; i < N; i++){
        
        if (!doneOrNot[i]){
            // console.log("i", i);
            circle.push([[i + 1, v_C[i]]]);
            circleSum = v_C[i];
            start = i + 1;
            tmp = i + 1;
            while(true){
                doneOrNot[tmp - 1] = true;
                tmp2 = v_P[tmp - 1];
                if (start === tmp2) break;
                tmp = tmp2;
                circleSum += v_C[tmp - 1];
                circle[circle.length - 1].push([tmp, v_C[tmp - 1]]);
            }

            let tmpCircle = circle[circle.length - 1].slice();
            let MAXremain = -1 * Infinity;
            // let nRemain = Math.min(tmpCircle.length, K);
            let nRemain;
            if (K <= tmpCircle.length) nRemain = K;
            else if (circleSum > 0) {
                nRemain = K % tmpCircle.length;
                if (nRemain === 0) nRemain = tmpCircle.length;
            } else {
                nRemain = tmpCircle.length;
            }
            // console.log("nRemain", nRemain, "l", tmpCircle.length);
            for (let j = 0; j < tmpCircle.length; j++){
                tmp3 = 0;
                for (let k = j; k < j + nRemain; k++){
                    let k2 = k % tmpCircle.length;
                    tmp3 += tmpCircle[k2][1];
                    // console.log(tmp3);
                    MAXremain = Math.max(MAXremain, tmp3);
                }
                // console.log("here", MAXremain, circleSum);
            }

            // console.log("see this", i, tmpCircle);
    
            ans = Math.max(ans, MAXremain + Math.max(0, circleSum) * ((K - nRemain) / tmpCircle.length));
            // console.log("ans", ans, Math.max(0, circleSum), Math.floor(K / tmpCircle.length));
        }



    }


    console.log(ans);

}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));
