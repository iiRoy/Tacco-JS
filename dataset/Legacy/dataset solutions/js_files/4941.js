process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    main(chunk.trim());
});

function main(chunk){
	var ans = chunk.length;
    chunk = chunk.replace("ST","");
    while(ans != chunk.length){
        ans = chunk.length
        chunk = chunk.replace("ST","");
    }
    console.log(chunk.length);
}
