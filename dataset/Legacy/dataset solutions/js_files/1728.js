
"use strict";

const main = arg => {
    const input = arg.trim().split("\n");
    let firseRow = input[0].split(' ').map(Number);
    let secondRow = input[1].split(' ').map(Number);
    let thirdRow = input[2].split(' ').map(Number);

    let sumTime = 0;
    let sumBook = 0;
    function tt(arr1, arr2, sumT, limit, books) {
        //制限時間超えてるか確認
        if (sumT > limit) {
            console.log(books -1);
            return;
        } else if (sumT == limit) {
            console.log(books);
            return;
        } else if (arr1.length === 0 && arr2.length === 0 && sumT > limit) {
            console.log(books -1);
            return;
        } else if (arr1.length === 0 && arr2.length === 0) {
            console.log(books -1);
            return;
        }
        //2つの机の一番上にある本の時間を比べて、少ないほうをsumTimeに加算、その後その本を削除し、読んだ本を1冊追加
        if (arr1.length !== 0 && arr2.length !== 0){
            if (arr1[0] >= arr2[0]) {
                sumT = sumT + arr2[0];
                arr2.shift();
                books = books + 1;
            } else if (arr2[0] > arr1[0]) {
                sumT = sumT + arr1[0];
                arr1.shift();
                books = books + 1;
            }   
        } else if(arr1.length === 0 && arr2.length !== 0) {
            sumT = sumT + arr2[0];
            arr2.shift();
            books = books + 1;
        } else if(arr2.length === 0 && arr1.length !== 0) {
            sumT = sumT + arr1[0];
            arr1.shift();
            books = books + 1;
        }
        
        //再帰
        tt(arr1, arr2, sumT, limit, books);
    }
    
    tt(secondRow, thirdRow, sumTime, firseRow[2], sumBook);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));  