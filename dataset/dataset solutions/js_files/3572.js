'use strict';

const main = (input) => {
    const nums = input.split(' ');
    const N = parseInt(nums[0], 10);
    const K = parseInt(nums[1], 10);
    // a+b が N の倍数で a+c が Nの倍数であるなら (b-c) は Nの倍数
    // 同様に (a-b), (a-c) も N の倍数
    let numBCCache1 = {};
    let numBCCache2 = {};
    let count = 0;
    for (let a = 1; a <= N; a++) {
        let m = a % K;
        let minBC = K - m;
        if (((minBC * 2) % K) == 0) {
            // bc が任意の組で満たす
            // bc がいくつあるか数える
            let numBC = numBCCache1[minBC];
            if (typeof numBC === 'undefined') {
                numBC = 0;
                for (let bc = minBC; bc <= N; bc += K) {
                    numBC++;
                }
                numBCCache1[minBC] = numBC;
            }
            count += numBC * numBC;
        } else {
            // bc が任意の組で満たさない
            let numBC = numBCCache2[minBC];
            if (typeof numBC === 'undefined') {
                numBC = 0;
                for (let bc = minBC; bc <= N; bc += K) {
                    if (((bc * 2) % K) == 0) {
                        numBC++;
                    }
                }
                numBCCache2[minBC] = numBC;
            }
            count += numBC;
        }
    }
    console.log(count);
};

const isTest = false;

if (isTest) {
    main('3 2');
    main('5 3');
    main('31415 9265');
    main('35897 932');
} else {
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
}