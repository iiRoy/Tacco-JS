const    inputArgumentString    =    process.argv[2];
const    transformedToUppercase    =    inputArgumentString.toUpperCase();
const    transformedToLowercase    =    inputArgumentString.toLowerCase();

if    (inputArgumentString    ==    transformedToUppercase)    {
    console.log("A");
}    else    {
    console.log("a");
}