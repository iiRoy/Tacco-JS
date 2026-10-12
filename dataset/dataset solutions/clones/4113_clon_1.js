/* Devuelve la prioridad de un operador. */
function precedence ( operator )
{
    if(operator==="+"||operator==="-")
    {
        return 1;
    }

    if(operator==="*"||operator==="/")
    {
        return 2;
    }

    return 0;
}

/* Aplica el operador ubicado en la parte superior. */
function applyTop ( values , operators )
{
    if(values.length<2||operators.length===0)
    {
        return false;
    }

    const operator=operators.pop();
    const right=values.pop();
    const left=values.pop();
    let result;

    if(operator==="+")
    {
        result=left+right;
    }
    else if(operator==="-")
    {
        result=left-right;
    }
    else if(operator==="*")
    {
        result=left*right;
    }
    else if(operator==="/")
    {
        if(right===0)
        {
            return false;
        }

        result=left/right;
    }
    else
    {
        return false;
    }

    values.push(result);

    return true;
}

/* Evalúa la expresión recibida. */
function calculate ( expression )
{
    const text=expression.replace(/\s+/g,"");

    if(text.length===0)
    {
        return null;
    }

    const values=[];
    const operators=[];
    let expectingNumber=true;

    for(let index=0;index<text.length;index++)
    {
        const token=text[index];

        if(/^[0-9]$/.test(token))
        {
            if(!expectingNumber)
            {
                return null;
            }

            values.push(Number(token));
            expectingNumber=false;
        }
        else if(token==="(")
        {
            if(!expectingNumber)
            {
                return null;
            }

            operators.push(token);
            expectingNumber=true;
        }
        else if(token===")")
        {
            if(expectingNumber)
            {
                return null;
            }

            while(
                operators.length>0&&
                operators[operators.length-1]!=="("
            )
            {
                if(!applyTop(values,operators))
                {
                    return null;
                }
            }

            if(operators.length===0)
            {
                return null;
            }

            operators.pop();
            expectingNumber=false;
        }
        else if("+-*/".includes(token))
        {
            if(expectingNumber)
            {
                return null;
            }

            while(
                operators.length>0&&
                operators[operators.length-1]!=="("&&
                precedence(operators[operators.length-1])>=
                    precedence(token)
            )
            {
                if(!applyTop(values,operators))
                {
                    return null;
                }
            }

            operators.push(token);
            expectingNumber=true;
        }
        else
        {
            return null;
        }
    }

    if(expectingNumber)
    {
        return null;
    }

    while(operators.length>0)
    {
        if(operators[operators.length-1]==="(")
        {
            return null;
        }

        if(!applyTop(values,operators))
        {
            return null;
        }
    }

    return values.length===1
        ?values[0]
        :null;
}

/* Lee la expresión completa como texto. */
const input=require("fs")
    .readFileSync(
        "/dev/stdin",
        "utf8"
    )
    .trim();

const result=calculate(input);

console.log(
    result===null||!Number.isFinite(result)
        ?"INVALID"
        :String(result)
);