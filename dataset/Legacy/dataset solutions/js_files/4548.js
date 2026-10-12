function main(data){
    input = data.split("\n");
    len = input[0];
    total = 0;
    
    for(i = 1; i <= len; i += 1){
        total += parseInt(input[i],10);
    }
    while(total % 10 === 0){
        min = 101;
        index = -1;
        for(i = 1, len = input.length; i < len; i += 1){
            if(min > input[i]){
                min = parseInt(input[i],10);
                index = i;
            }
        }
        
        input.splice(index, 1);
        total -= min;
        
        if(total <= 0){
            total = 0;
            break;
        }
    }
    console.log(total);
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));