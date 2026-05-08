var heigths =  [1819,2003,876,2840,1723,1673,3776,2848,1592,922];
var sortedMountains = heigths.sort(sortNumbers);
 
for (i=0; i!=3; i++) {
    console.log(sortedMountains[i]);
}

function sortNumbers(a, b) {
    return b - a;
}