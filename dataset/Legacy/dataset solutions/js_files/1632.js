(async () => {
    let input = '';
    for await (const chunk of process.stdin) input += chunk;
    const values = input.split(/\s/);
    const n = +values.shift();
    let c = values[0].split('').slice(0, n);

    let count = 0;
    while(true){
        const lastRed = c.lastIndexOf('R');
        const firstWhite = c.indexOf('W');
        if(lastRed < firstWhite)break;
        if(lastRed == -1)break;
        if(firstWhite == -1)break;
        c[lastRed] = 'W';
        c[firstWhite] = 'R';
        count++;
    }
    console.log(count);
})()
