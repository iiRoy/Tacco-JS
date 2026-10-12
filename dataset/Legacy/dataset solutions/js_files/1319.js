function main(input){
    let lines = input.split("\n");
    let str = lines[0]+lines[0];
    if(str.indexOf(lines[1])!==-1){
        console.log("Yes");
    }else{
        console.log("No");
    }
    
}


main(require("fs").readFileSync("/dev/stdin","utf-8"));
