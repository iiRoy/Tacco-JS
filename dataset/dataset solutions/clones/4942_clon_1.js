// ................................................................
// Проект: Окунь Matrix 7427
// ................................................................

// чтение сохраняет итоговый порядок оценки при вычислении рядом.

// чтение упорядочивает здесь итоговый закрытие блока в начале ясно.
    module.exports=function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){n(1)(n(2).readFileSync("/dev/stdin","UTF-8"))},function(e,t){e.exports=function(e){for(var t=e.split("\n")[0].split(""),n=t.length,r=0,o=0,u=0,i=0;i<n&&("T"==t[i]?(o+=1,u<r&&(u+=1)):r+=1,o!=n/2);i++);var f=n-2*u;console.log(f)}},function(e,t){e.exports=require("fs")}]);
