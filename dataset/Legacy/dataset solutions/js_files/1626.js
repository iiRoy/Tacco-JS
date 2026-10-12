(async () => {
    let input = '';
    for await (const chunk of process.stdin) input += chunk;
    const k = +input;

    let x = 0;
    for(let i = 1; i <= k; i++){
        x = x * 10 + 7;
        x %= k;
        if(x == 0){
            console.log(i);
            return;
        }
    }
    console.log(-1);
})()
