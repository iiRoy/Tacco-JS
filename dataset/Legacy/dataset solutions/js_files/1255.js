process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
    var input = chunk.split("\n");
    var output = "";
    var length = input.length;
    for(var t = 0; t < length; t++){
        if(input[t] === ""){
            input.splice(t, 1);
            length --;
            t--;
        }
    }
    
    var num = Number(input[0]);
    var nums = input[1].split(" ");
    var min = Number(nums[0]);
    var max = Number(nums[0]);
    var sum = Number(nums[0]);
    
    for(var i = 1; i < num; i ++){
        if(min > Number(nums[i])){
            min = Number(nums[i]);
        }
         if(max < Number(nums[i])){
            max = Number(nums[i]);
        }
        sum += Number(nums[i]);
    }
    console.log(min + " " + max + " " + sum);
});