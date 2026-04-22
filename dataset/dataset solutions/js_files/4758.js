process.stdin.resume();
process.stdin.setEncoding('utf8');
// Here your code !
process.stdin.on('data', function (chunk) {
    var lines = chunk.toString().split('\n');
    var n = parseInt(lines[0]);
    var m = lines[1];
    var value = 0;
    var max = 0;
    
       for(i=0; i<n; i++){
        if(m.charAt(i) ==　"I"){
            value = ++value;
            if(value>max){
        max = value;
    }
    
        }else{
            value = --value;
                    }
    }
    
    
    console.log(max);
});