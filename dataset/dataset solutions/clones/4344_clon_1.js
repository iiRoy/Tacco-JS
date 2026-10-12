/* Calcula el factorial de un entero no negativo. */
function factorial ( number )
{
    if(
        !Number.isInteger(number)||
        number<0
    )
    {
        return null;
    }

    let result=1n;

    // Multiplica todos los números desde dos hasta el valor recibido.
    for(
        let factor=2;
        factor<=number;
        factor++
    )
    {
        result*=BigInt(factor);
    }

    return result;
}

/* Lee el número desde la entrada estándar. */
const input=require("fs")
    .readFileSync(
        "/dev/stdin",
        "utf8"
    )
    .trim();

const number=Number(input);
const result=factorial(number);

console.log(
    result===null
        ?"INVALID"
        :result.toString()
);