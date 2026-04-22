function main(input){
    input = input.split("\n");
    temp = input[1].split(" ");
    len = input[0];
    list = [];
    index = 0;
    for(var i = 0; i < len; i+=1){
        num = Math.floor(temp[i] / 400);
        if(num > 7){
            index += 1;
        }else{
            if(list.indexOf(num) === -1){
                list.push(num);
            }
        }
    }
    console.log(list.length ,list.length + index);
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));