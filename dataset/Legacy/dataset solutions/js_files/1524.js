(async () => {
    let input = '';
    for await (const chunk of process.stdin) input += chunk;
    
    const x = +input.split(/\s/)[0];
    console.log(1 - x);
})();
