"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N  = parseInt(arg[0].split(" ")[0]);
    let H  = parseInt(arg[0].split(" ")[1]);
    const ab = arg.slice(1, N + 1).map(n=>n.split(" "));
    
    let strongestPoint = 0;
    let strongestIndex = 0;
    let throwSum = 0;
    
    for(let i in ab) {
        const a = parseInt(ab[i][0]);
        const b = parseInt(ab[i][1]);
        
        throwSum += b;
        
        if(a > strongestPoint) {
            strongestIndex = i;
            strongestPoint = a;
        }
    }

    let strongestKatana = ab[strongestIndex];
    
    // まず、全部投げて倒せるならそれが最適
    if(throwSum >= H) {
        console.log(N);
        return;
    }
    
    
    // 通常攻撃が弱い刀をふる必要はない
    // 最強の刀以外は全部投げる
    if(N > 1) {
        H -= throwSum - ab[strongestIndex][1];
    }
    
    // (残りHP - 投げた場合の攻撃力) / 通常攻撃力 を切り上げれば良い
    const restHP = H - ab[strongestIndex][1];

    // 最強の刀の振る回数+投げる回数
    const strongestAttacksAndThrow = Math.ceil(restHP / ab[strongestIndex][0]);
    
    console.log(strongestAttacksAndThrow)
    
    // Nが1のときだけ例外がある
    console.log(N === 1 ? strongestAttacksAndThrow + 1 : strongestAttacksAndThrow + (N - 1));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));