//process.stdin.resume();
//process.stdin.setEncoding('utf8');
//process.stdin.on('data', function(chunk) {
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
//});

function main(chunk){
    var ans = [];
    var line = chunk.split("");
    for(var i in line){
        switch(line[i]){
        case 'S':
            ans.push('S');
            break;
        case 'T':
            if(ans.length>0 && ans[ans.length-1] == 'S'){
                ans.pop();
            }else{
                ans.push('T');
            }
            break;
        }
    }
    console.log(ans.length);
}

