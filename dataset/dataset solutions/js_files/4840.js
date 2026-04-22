var reader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var args = [];

reader.on('line', function (input) {
  args.push(input);
});


reader.on('close', function () {
    var str = args[0].split(" ");
    var num = [];
    var count = 0;
    for(var i = 0; i < str.length; i++){
        num[i] = parseInt(str[i]);
    }
    for(var i = num[0]; i <= num[1]; i++){
        if(!(i % num[2])){
            count++;
        }
    }
    console.log(count);
});
