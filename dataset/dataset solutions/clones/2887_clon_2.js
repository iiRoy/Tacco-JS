function soulution(source) {
    var num = parseInt(source.trim(),10);
    console.log(Math.floor(((num - 2) * 180)));
}
 
soulution(require("fs").readFileSync("/dev/stdin", "utf8"));
