(async () => {
    let input = '';
    for await (const chunk of process.stdin) input += chunk;
    if(+input >= 30){
        console.log('Yes');
    }else{
        console.log('No')
    }
})()
