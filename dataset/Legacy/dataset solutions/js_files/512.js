process.stdin.resume();
process.stdin.setEncoding('utf8');
 
process.stdin.on('data', function(input){
    var ii;
    var lines = input.trim().split("\n");
    for(var i=0;i<lines.length;++i){
        var n, end;
        var dataset;
        var map;
        n = parseInt(lines[i++]);
        if( n===0 ) break;
        end = n+1;
        map = new Array(end);
        dataset = lines[i].trim().split(" ");
        for(ii=1;ii<end;++ii){
            map[ii] = parseInt(dataset[ii]) - parseInt(dataset[ii-1]);
        }
        
        if( map[1] === map[2] && map[2] === map[3] && map[3] === map[4] ){
            for(ii=5;ii<end;++ii){
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
        else if( parseInt(dataset[2]) - parseInt(dataset[0]) === map[3] && map[3] === map[4] ){
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