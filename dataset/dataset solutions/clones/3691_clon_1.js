/* Crea una copia para conservar el arreglo original. */
function bubbleSort ( values )
{
    const result=values.slice();

    // Desplaza los valores mayores hacia el final.
    for(
        let end=result.length-1;
        end>0;
        end--
    )
    {
        for(let index=0;index<end;index++)
        {
            if(result[index]>result[index+1])
            {
                const temporary=result[index];

                result[index]=result[index+1];
                result[index+1]=temporary;
            }
        }
    }

    return result;
}