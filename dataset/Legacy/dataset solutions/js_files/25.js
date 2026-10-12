function reverseStr(str) {
    var splitString = str.split("");  
    var reverseArray = splitString.reverse(); 
    var joinArray = reverseArray.join(""); 
console.log(joinArray)    
    
}
reverseStr("Harry")