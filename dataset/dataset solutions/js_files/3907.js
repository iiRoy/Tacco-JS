process.stdin.resume();
process.stdin.setEncoding('utf8');
var all_input = '';
process.stdin.on('data', function(chunk){
    all_input += chunk;
});

process.stdin.on('end', function(){
    lines = all_input.split('\n');
    n = lines[0];
    line = lines[1].split(' ');
    var list = [];
    for(var i=0; i<n; i++){
        list.push(parseInt(line[i]));
    }
    var sortedList = list.slice();
    sortedList.sort();
    var dict = {};
    for(var i in list){
        var val = sortedList[i];
        if(val in dict){
            dict[val].push(i);
        }
        else{
            dict[val] = [i];
        }
    }
    
    n -= 1;
    
    for(var i=0; i<=n; i++){
        var val = list[i];
        var index = dict[val.toString()].pop();
        half = Math.floor(n/2);
        var left = sortedList[half];
        var right = sortedList[half+1];
        var ans = 0;
        if(index<=half){
            ans = right;
        }
        else{
            ans = left;
        }
        console.log(ans.toString());
    }
});