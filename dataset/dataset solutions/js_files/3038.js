"use strict";
function main(input) {
    const args = input.split('\n');

    const N = parseInt(args[0]);
    const stones = args[1].split('');

    let cam_count = 0;
    let sya_count = 0;

    for(let i = 0; i < N; i++) {
        if(stones[i] == '.') {
            cam_count++;
        } else if(stones[i] == '#') {
            sya_count++;
        }
    }

    const ans = cam_count < sya_count ? cam_count : sya_count;

    console.log(ans);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

