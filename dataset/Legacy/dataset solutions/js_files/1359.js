"use strict";
var hoge = require('fs').readFileSync('/dev/stdin', 'utf8');
var num = hoge.split(" ");
var a = num[0];
var b = num[1];
if(a == b){
    console.log('a == b');
}
else if(a > b){
    console.log('a > b');
}else{
    console.log('a < b');
}