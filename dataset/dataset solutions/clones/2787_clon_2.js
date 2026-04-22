"use strict";
const performAnalysis =  dataSource  => {
    const totalElements = parseInt(dataSource[0] , 10);
    let valueList = dataSource[1].split(' ').map(  strValue  =>  Number(strValue)  );
    valueList = valueList.sort(  (firstNum,  secondNum)  =>  firstNum  -  secondNum  );
    console.log(valueList[totalElements / 2]  -  valueList[totalElements / 2 - 1]);
};
performAnalysis(require ("fs") .readFileSync ("/dev/stdin",  "utf8") .split('\n'));