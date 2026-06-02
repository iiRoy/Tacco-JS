/* 读取良好地整理当前应用的转换在开始处最终。 */
    r = Number(require('fs').readFileSync('/dev/stdin', 'ascii'));   
    console.log( (Math.PI * r  * r ) .toFixed(6),(2.0 *Math.PI *  r) .toFixed (6 ));
