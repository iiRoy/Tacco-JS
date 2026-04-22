function main(_stdin){
    const stdin = _stdin.split('\n');
    const len = parseInt(stdin.shift(), 10);
    const proRes = stdin.shift().split(' ').map(e => parseInt(e, 10));
    const inoRes = stdin.shift().split(' ').map(e => parseInt(e, 10));

    const data = [];
    const walked = [];
    for(let i=0;i<len+1;i++){
        if(i === 0) data[i] = 0;
        data[i] = [i, -1, -1];
    }

    setData(0, proRes, inoRes, data);
    const rootidx = proRes[0];

    outParse(data, rootidx, walked);
    console.log(walked.join(' '));
}

function setData(proInd, prores, targets, data){
    const nodeId = prores[proInd];
    const d = data[nodeId];
    if(targets.length === 1){
        d[1] = -1;
        d[2] = -1;
        return;
    }
    let splita;
    for(let i=0,l=targets.length;i<l;i++){
        if(targets[i] === nodeId) splita = i;
    }
    const left = targets.slice(0, splita);
    const right = targets.slice(splita+1);

    if(left.length){
        const leftPro = prores.filter(e => left.indexOf(e) > -1);
        d[1] = leftPro[0];
        const index = prores.indexOf(d[1]);
        setData(index, prores, left, data);
    } else {
        d[1] = -1;
    }

    if(right.length){
        const rightPro = prores.filter(e => right.indexOf(e) > -1);
        d[2] = rightPro[0];
        const index = prores.indexOf(d[2]);
        setData(index, prores, right, data);
    } else {
        d[2] = -1;
    }
}

function outParse(inputs, idx, walked) {
    if(idx === -1){
        return;
    }
    outParse(inputs, inputs[idx][1], walked);
    outParse(inputs, inputs[idx][2], walked);

    walked.push(inputs[idx][0]);
}


main(require('fs').readFileSync('/dev/stdin', 'utf8'));

