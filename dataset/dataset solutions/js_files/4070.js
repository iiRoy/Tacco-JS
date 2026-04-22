function main(input) 
{
    input = input.split(" ");
    var comb = input[0] + input[1];
    var a = parseInt(comb, 10);
    var x = Math.sqrt(a);
    if (Number.isInteger(x))
    {
        console.log("Yes");
    }
    else
    {
        console.log("No");
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));