let totalSeconds = 86400;

while (true) {
    let eventCount = parseInt(readline());

    if (eventCount === 0) {
        break;
    }

    let timeline = new Array(totalSeconds + 1).fill(0);

    for (let k = 0; k < eventCount; k++) {
        let [beginTimeStr, finishTimeStr] = readline().split(' ');

        let [h1, m1, s1] = beginTimeStr.split(':').map(Number);
        let [h2, m2, s2] = finishTimeStr.split(':').map(Number);

        let startIdx = h1 * 3600 + m1 * 60 + s1;
        let endIdx = h2 * 3600 + m2 * 60 + s2;

        timeline[startIdx]++;
        timeline[endIdx]--;
    }

    for (let l = 0; l < totalSeconds; l++) {
        timeline[l + 1] += timeline[l];
    }

    console.log(Math.max(...timeline));
}
