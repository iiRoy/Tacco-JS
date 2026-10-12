/* Comprueba filas, columnas y regiones del Sudoku. */
function isValidSudoku ( board )
{
    for(let row=0;row<9;row++)
    {
        const rowValues=new Set();
        const columnValues=new Set();

        for(let column=0;column<9;column++)
        {
            const rowValue=board[row][column];
            const columnValue=board[column][row];

            // Todas las celdas deben contener valores entre 0 y 9.
            if(
                !Number.isInteger(rowValue)||
                rowValue<0||
                rowValue>9
            )
            {
                return false;
            }

            if(rowValue!==0)
            {
                if(rowValues.has(rowValue))
                {
                    return false;
                }

                rowValues.add(rowValue);
            }

            if(columnValue!==0)
            {
                if(columnValues.has(columnValue))
                {
                    return false;
                }

                columnValues.add(columnValue);
            }
        }
    }

    // Revisa cada región de 3 por 3.
    for(let blockRow=0;blockRow<3;blockRow++)
    {
        for(let blockColumn=0;blockColumn<3;blockColumn++)
        {
            const blockValues=new Set();

            for(let row=0;row<3;row++)
            {
                for(let column=0;column<3;column++)
                {
                    const value=
                        board[blockRow*3+row][blockColumn*3+column];

                    if(value!==0)
                    {
                        if(blockValues.has(value))
                        {
                            return false;
                        }

                        blockValues.add(value);
                    }
                }
            }
        }
    }

    return true;
}

/* Convierte la entrada en una matriz de nueve filas. */
function buildBoard ( input )
{
    const values=input.trim().split(/\s+/).map(Number);

    if(values.length!==81)
    {
        return null;
    }

    const board=[];

    for(let row=0;row<9;row++)
    {
        board.push(
            values.slice(row*9,row*9+9)
        );
    }

    return board;
}

const input=require("fs")
    .readFileSync(
        "/dev/stdin",
        "utf8"
    );

const board=buildBoard(input);

console.log(
    board!==null&&isValidSudoku(board)
        ?"VALID"
        :"INVALID"
);