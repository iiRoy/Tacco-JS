process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    main(chunk.trim());
});

function main(chunk){
    var line = chunk.split("");
    
    
    chunk = chunk.replace("ST","");
    while(ans != chunk.length){
        ans = chunk.length
        chunk = chunk.replace("ST","");
        chunk = chunk.replace("SSTT","");
        chunk = chunk.replace("SSSTTT","");
        chunk = chunk.replace("SSSSTTTT","");
    }
    console.log(chunk.length);
}
