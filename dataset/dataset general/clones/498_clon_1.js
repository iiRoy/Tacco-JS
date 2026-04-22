RedQueryBuilderFactory.create
(
  /*
   * This is a configuration object for the RedQueryBuilderFactory.
   * It defines metadata for tables, types, and custom functions.
   */
  {
    meta:
    {

      // Definition of database tables and their columns.
      tables:
      [
        {
          "name" : "PERSON", // Table name
          "label" : "Person", // Human-readable label for the table

          "columns" :
          [
            // Column 1: Name
            {
              "name" : "NAME",
              "label" : "Name",
              "type" : "STRING",
              "size" : 10
            },



            // Column 2: Date of Birth
            {
              "name" : "DOB",
              "label" : "Date of birth",
              "type" : "DATE"
            },


            /*
             * Column 3: Sex
             * Uses a SELECT editor for predefined choices.
             */
            {
              "name" : "SEX",
              "label" : "Sex",
              "type" : "STRING",
              "editor" : "SELECT"
            },


            // Column 4: Category, a reference type.
            {
              "name" : "CATEGORY",
              "label" : "Category",
              "type" : "REF",
            }
          ],
          fks : [] // Foreign keys for the PERSON table. Currently empty.
        }
      ], /* End of tables array */


      types :
      [
        {
          "name" : "STRING", // String data type definition.
          "editor" : "TEXT",
          "operators" :
          [
            {
              "name" : "=",
              "label" : "is",
              "cardinality" : "ONE"
            },
            {
              "name" : "<>",
              "label" : "is not",
              "cardinality" : "ONE"
            },
            {
              "name" : "LIKE",
              "label" : "like",
              "cardinality" : "ONE"
            },
            {
              "name" : "<",
              "label" : "less than",
              "cardinality" : "ONE"
            },
            {
              "name" : ">",
              "label" : "greater than",
              "cardinality" : "ONE"
            }
          ]
        },


        {
          "name" : "DATE", // Date data type definition.
          "editor" : "DATE",
          "operators" :
          [
            {
              "name" : "=",
              "label" : "is",
              "cardinality" : "ONE"
            },
            {
              "name" : "<>",
              "label" : "is not",
              "cardinality" : "ONE"
            },
            {
              "name" : "<",
              "label" : "before",
              "cardinality" : "ONE"
            },
            {
              "name" : ">",
              "label" : "after",
              "cardinality" : "ONE"
            }
          ]
        },


        // Reference type, typically for foreign key lookups.
        {
          "name" : "REF",
          "editor" : "SELECT",
          "operators" :
          [
            {
              "name" : "IN",
              "label" : "any of",
              "cardinality" : "MULTI"
            }
          ]
        }
      ] /* End of types array */
    }, /* End of meta object */


    onSqlChange :
    function ( sql, args )
    {
      // This function is triggered when the SQL query changes.
      var out = sql + '\r\n'; // Initialize output string with the SQL query.

      for (var i = 0; i < args.length; i++)
      {
        var arg = args[i]; // Get current argument.
        out += 'arg' + i; // Append argument index.

        if (arg != null)
        {
          // If argument is not null, append its type and string representation.
          out += ' type=' + Object.prototype.toString.call(arg) + ' toString=' + arg;
        }
        else
        {
          // If argument is null.
          out += ' null';
        }

        out += '\r\n'; // New line for the next argument.
      }
      // Update the content of the debug element on the page.
      document.getElementById("debug").value = out;
    }, /* End of onSqlChange function */


    enumerate :
    function ( request, response )
    {
      // This function provides enumeration values for SELECT editors.
      if ( request.columnName == 'CATEGORY' )
      {
        // If the column is 'CATEGORY', provide category options.
        response( [ { value : 'A', label : 'Small' }, { value : 'B', label : 'Medium' } ] );
      }
      else
      {
        // Otherwise (e.g., for 'SEX' column), provide gender options.
        response( [ { value : 'M', label : 'Male' }, { value : 'F', label : 'Female' } ] );
      }
    }, /* End of enumerate function */


    // Custom editor configurations.
    editors :
    [
      {
        name : 'DATE',
        format : 'dd.MM.yyyy' // Date format for the DATE editor.
      }
    ]
  } /* End of main configuration object */
)
; /* End of RedQueryBuilderFactory.create call */