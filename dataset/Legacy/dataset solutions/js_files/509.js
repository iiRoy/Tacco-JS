process.stdin.resume();
process.stdin.setEncoding('utf8'); 
process.stdin.on('data', function(input){
    var edx, ii;
    var lines = input.trim().split("\n");
    for(var i=0;i<lines.length;++i){
        var n, diffCnt;
        var dataset, x1, x2;
        var map;
        n = parseInt(lines[i++]);
        if( n===0 ) break;
        map = new Array(n+1);
        dataset = lines[i].trim().split(" ");
        x2 = parseInt(dataset[1]);
        x1 = parseInt(dataset[0]);
        map[1] = x2 - x1;
        edx = 0;
        diffCnt = 0;
        x1 = x2;
        for(ii=2;ii<dataset.length;++ii){
            x2 = parseInt(dataset[ii]);
            map[ii] = x2 - x1;
            if( map[ii] != map[ii-1] ){
                edx = ii;
                ++diffCnt;
            }
            x1 = x2;
            
            if( diffCnt === 3 ){
                console.log(dataset[edx-2]);
                return;
            }
            else if( diffCnt == 1 && ii - edx > 1){
                console.log(dataset[edx-2]);
                return;
            }
        }
        
        console.log(dataset[edx]);
    }
            
});