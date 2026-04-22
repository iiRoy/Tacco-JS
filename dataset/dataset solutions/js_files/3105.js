function Main(input) {
    'use strict';

    const n = parseInt(input.split("\n").shift());
    const charList = ["A", "T", "G", "C"];
    const div = 1000000007;
    let obj = [];
    const tmpObj = [];
    (function addChar(init){
        const queue = [init];
        while(queue.length !== 0){
            const str = queue.shift();
            if(str.length !== 3){
                charList.forEach(char => queue.push(str + char));
            }else{
                if(!str.match(/ACG|AGC|GAC/)){
                    obj[str] = 1;
                    tmpObj[str] = 0;
                } 
            }
        }
    })("");

    if(n === 3) console.log(Object.keys(obj).length);
    else{
        for(let i = 0; i < n - 3; i++){
            const newObj = Object.assign([],tmpObj);
            Object.keys(obj).forEach(key => {
                const val = obj[key];
                charList.forEach(char => {
                    const newStr = key + char;
                    if(!newStr.match(/ACG|AGC|GAC|AG.C|A.GC/)) newObj[newStr.slice(-3)] += val % div;
                })
            })
            obj = newObj;
        }
        //RE
        //console.log(Object.values(obj).reduce((acc, curr) => acc + curr) % div);
        console.log(Object.keys(obj).reduce((acc, curr) => acc + obj[curr], 0) % div);
    }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));


