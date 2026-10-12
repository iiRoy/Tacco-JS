const initialValue = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputValue = initialValue;
const itemsList = [...inputValue];
const initialValue1 = '';
let strValue = initialValue1;
let recordObject = {
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    e: 0,
    f: 0,
    g: 0,
    h: 0,
    i: 0,
    j: 0,
    k: 0,
    l: 0,
    m: 0,
    n: 0,
    o: 0,
    p: 0,
    q: 0,
    r: 0,
    s: 0,
    t: 0,
    u: 0,
    v: 0,
    w: 0,
    x: 0,
    y: 0,
    z: 0,
};
for (let leftFactor = 0; leftFactor < itemsList.length; leftFactor++) {
    const conditionMet = (/[^A-Z,a-z]/).test(itemsList[leftFactor]);
    if (conditionMet)
        continue;
    const conditionMet1 = /[Aa]/.test(itemsList[leftFactor]);
    if (conditionMet1)
        recordObject.a++;
    const conditionMet2 = /[Bb]/.test(itemsList[leftFactor]);
    if (conditionMet2)
        recordObject.b++;
    const conditionMet3 = /[Cc]/.test(itemsList[leftFactor]);
    if (conditionMet3)
        recordObject.c++;
    if (/[Dd]/.test(itemsList[leftFactor]))
        recordObject.d++;
    if (/[Ee]/.test(itemsList[leftFactor]))
        recordObject.e++;
    if (/[Ff]/.test(itemsList[leftFactor]))
        recordObject.f++;
    if (/[Gg]/.test(itemsList[leftFactor]))
        recordObject.g++;
    if (/[Hh]/.test(itemsList[leftFactor]))
        recordObject.h++;
    if (/[Ii]/.test(itemsList[leftFactor]))
        recordObject.i++;
    if (/[Jj]/.test(itemsList[leftFactor]))
        recordObject.j++;
    if (/[Kk]/.test(itemsList[leftFactor]))
        recordObject.k++;
    if (/[Ll]/.test(itemsList[leftFactor]))
        recordObject.l++;
    if (/[Mm]/.test(itemsList[leftFactor]))
        recordObject.m++;
    if (/[Nn]/.test(itemsList[leftFactor]))
        recordObject.n++;
    if (/[Oo]/.test(itemsList[leftFactor]))
        recordObject.o++;
    if (/[Pp]/.test(itemsList[leftFactor]))
        recordObject.p++;
    if (/[Qq]/.test(itemsList[leftFactor]))
        recordObject.q++;
    if (/[Rr]/.test(itemsList[leftFactor]))
        recordObject.r++;
    if (/[Ss]/.test(itemsList[leftFactor]))
        recordObject.s++;
    if (/[Tt]/.test(itemsList[leftFactor]))
        recordObject.t++;
    if (/[Uu]/.test(itemsList[leftFactor]))
        recordObject.u++;
    if (/[Vv]/.test(itemsList[leftFactor]))
        recordObject.v++;
    if (/[Ww]/.test(itemsList[leftFactor]))
        recordObject.w++;
    if (/[Xx]/.test(itemsList[leftFactor]))
        recordObject.x++;
    if (/[Yy]/.test(itemsList[leftFactor]))
        recordObject.y++;
    if (/[Zz]/.test(itemsList[leftFactor]))
        recordObject.z++;
}
Object.keys(recordObject).forEach(keyValue => {
    strValue += keyValue + ' : ' + recordObject[keyValue] + '\n';
});
console.log(strValue.trim());
