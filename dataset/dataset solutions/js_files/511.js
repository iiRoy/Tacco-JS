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
            x1 = x2;
        }
        
        if( map[1] === map[2] && map[2] === map[3] && map[3] === map[4] ){
            for(ii=5;ii<=n;++ii){
                if( map[ii] != map[1] ) break;
            }
            console.log(dataset[ii]);
        }
        else if( map[2] === map[3] && map[3] === map[4] ){
            console.log(dataset[0]);
        }
        else if( map[1] === map[2] && map[2] === map[3] ){
            console.log(dataset[4]);
        }
        else if( map[2] - parseInt(dataset[0]) === map[3] && map[3] === map[4] ){
            console.log(dataset[1]);
        }
        else if( map[1] === map[2] && map[2] === parseInt(dataset[4]) - parseInt(dataset[2]) ){
            console.log(dataset[3]);
        }
        else if( map[1] === parseInt(dataset[3]) - parseInt(dataset[1]) && map[1] === map[4] ){
            console.log(dataset[2]);
        }
    }       
});