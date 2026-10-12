function main(input){
    while(tmp>=input){ 
        tmp+=500;
    }
    a=tmp*2;
    while(tmp2>=input-tmp){
        tmp2+=5;
    }
    a+=tmp2;
    console.log("%d",a);
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));