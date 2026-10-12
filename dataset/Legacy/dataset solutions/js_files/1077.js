function createAlignedBaggage(baggage) {
    const aligned = [];
    baggage.forEach(e => aligned[e] = e);
    return aligned.filter(e => e !== undefined);
}

function minimumCostSort(baggage, len, cost, aligned) {
    let min = aligned[len - 1];
    let count = 0;

    for (let i = 0; i < len; i++) {
        if (baggage[i] !== aligned[i]) {
            count++;
            min = baggage[i] < min ? baggage[i] : min;
        }
    }

    if(baggage[0] === 0 && count > 2){
        baggage[baggage.indexOf(min)] = 0;
        baggage[0] = min;
        cost[0] += min;
        min = 0;
    }

    if(count) {
        const index = baggage.indexOf(min);
        // minの現在地に本来あるべき要素
        const target = baggage.indexOf(aligned[index]);
        const temp = baggage[target];
        baggage[target] = min;
        baggage[index] = temp;
        cost[0] += min + temp;
        minimumCostSort(baggage, len, cost, aligned);
    }
}

function main(stdin) {
    const input = stdin.split("\n");
    const length = parseInt(input.shift(), 10);
    const baggage = input[0].split(' ').map((e) => parseInt(e, 10));
    const cost = [0];
    const aligned = createAlignedBaggage(baggage);

    minimumCostSort(baggage, length, cost, aligned);
    console.log(cost[0]);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));

