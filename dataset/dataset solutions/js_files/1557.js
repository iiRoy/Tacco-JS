function MainD(input){
    const arr = input.split('\n');
    const arrAB = arr.map(val => val.split(' '));
    const setAB = arr.map(val => new Set(val.split(' ')));
    // グループ数
    let groupNum = arrAB.length;
    for(let i=1; i<arrAB.length; i++){ //まず2つめから
        for(let j=0; j<i; j++){ // 1つ目をみる
            if(setAB[j].has(arrAB[i][0]) || setAB[j][0].has(arrAB[i][1])){
                groupNum--;
                break;
            }
        }
    }
    console.log(groupNum);
}
MainD(require("fs").readFileSync("/dev/stdin", "utf8").trim());
