var list = [1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51];

var index = process.argv[2];

if(1 <= index && index < 32)
{
    console.log(list[index - 1]);
}
