function MainA(input){
    let num = Number(input);
    let answer = "";
    const ACL = "ACL";
    for(let i=0; i<num; i++){
        answer += ACL;
    }
    console.log(answer);
}
MainA(require("fs").readFileSync("/dev/stdin", "utf8").trim());
