function main(input){
    let str = input;
    let low = "abcdefghijklmnopqrstuvwxyz";
    let up =  "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let answer = "";
    for(let i=0;i<str.length;i++){
        let put = "";
        if(low.indexOf(str[i])!==-1){
            put=str[i].toUpperCase();

        }else if(up.indexOf(str[i])!==-1){
            put= str[i].toLowerCase();
        }else{
            put = str[i];
        }
        answer+=put;
    }
    console.log(answer.trim());

}


main(require("fs").readFileSync("/dev/stdin","utf-8"));
