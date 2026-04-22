// This file is designed for quick testing of the CSS AST parser.
// It allows checking a specific CSS string without needing to set up full test cases.
//
// How to use:
// 1. Modify the 'css' variable on line 18 with your desired CSS string.
// 2. Adjust the 'syntax' variable if your CSS is SCSS, Less, etc. (default is SCSS).
// 3. Run this script using Node.js: `node test/ast.js` (assuming this file is in `test/ast.js`).
//
// The script will output:
// - The original CSS string.
// - The Abstract Syntax Tree (AST) generated from the CSS.
// - The CSS string translated back from the generated AST.
//
// Important: Identifiers, variables, and logic are kept *exactly* the same as the original.
// Only whitespace and comments have been altered to demonstrate a Type I clone.

var css        = 'div {$color: nani}' ;

var syntax     = 'scss' ;

var gonzales   = require ( './../lib/gonzales' ) ;

// This function recursively converts the AST into a more human-readable tree string.
// It helps visualize the structure of the parsed CSS.
var astToTree  = function (  tree,   level  )
{
    // Ensure level is initialized to 0 if not provided.
    level           = level  ||  0 ;

    var spaces      = dummySpaces ( level ) ;
    var s           = ( level  ?  '\n' + spaces  :  '' )  +  '[' ;

    // Iterate over each element in the current AST node.
    tree.forEach (  function (  e  )
    {
        // Only process elements that have a defined 'ln' property (line number).
        // This check ensures we only process actual AST nodes and not metadata.
        if (  e.ln  ===  undefined  )
        {
            s  +=  (  Array.isArray (  e  )  ?  astToTree (  e,  level + 1  )  :  (  '\'' +  e.toString()  +  '\''  )  )  +  ', ' ;
        }
    }  ) ;

    // Remove the trailing comma and space, then close the bracket.
    return  s.substr (  0,  s.length - 2  )  +  ']' ;
} ;

// Helper function to generate indentation spaces based on the given number.
var dummySpaces  = function (  num  )
{
    // Uses a pre-defined long string of spaces to efficiently create indentation.
    return  '                                                  '.substr (  0,  num * 2  ) ;
} ;

// Parse the CSS string into an Abstract Syntax Tree using the gonzales library.
var ast        = gonzales.cssToAST (  {  css: css,  syntax: syntax  }  ) ;


// --- Output Section ---

// Log the original source string for reference.
console.log (  '\n== Source string:'  ) ;
console.log (  css  ) ;


// Log the generated Abstract Syntax Tree (AST).
// The astToTree function formats it nicely for console output.
console.log (  '\n== AST:'  ) ;
console.log (  astToTree (  ast  )  ) ;


// Log the CSS string translated back from the AST.
// This helps verify the AST parsing and re-serialization process.
console.log (  '\n== Translated string:'  ) ;
console.log (  gonzales.astToCSS (  {  ast: ast,  syntax: syntax  }  )  ) ;