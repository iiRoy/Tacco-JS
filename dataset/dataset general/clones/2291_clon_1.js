function   Storage ( name,   size   ) {

  // Default size for the database is 5MB.
  // We pass all parameters, just in case browser implementations
  // become more restrictive in the future.
  size  =  size  ||  5  *  1024  *  1024  ; /* Calculate default size in bytes */

  // Check for webOS user agent for specific openDatabase call
  if  (  navigator.userAgent.indexOf("webOS")  !=  -1  )
  {
    this.db  =  openDatabase(name  +  ".syncopate.db")  ;
  }
  else
  {
    /* Standard Web SQL Database API call for other browsers */
    this.db  =  openDatabase(name  +  ".syncopate.db",  "",  "",  size,  function  (  ) { }  )  ;
  }
}

Storage.prototype  =
{
  logging:  false, // Flag to enable/disable logging within the Storage instance.

  /*
   * Private method for logging messages.
   * Dynamically defines the logging mechanism based on available environments.
   */
  _log:  function  (  obj  )
  {
    if  (  !this.logging  ) {
      return  ; // If logging is disabled, exit early.
    }

    // This section implements a lazy definition of the _log method.
    // The first time _log is called, it checks the environment
    // and redefines itself to use the appropriate logging utility.
    if  (  typeof  Titanium  !==  "undefined"  )
    {
      this._log  =  function  (  obj  )
      {
        Titanium.API.debug(obj)  ;
      }  ;
    }

    else  if  (  typeof  Mojo  !==  "undefined"  )
    {
      this._log  =  function  (  obj  )
      {
        Mojo.Log.error(obj)  ;
      }  ;
    }

    else  if  (  typeof  console  !==  "undefined"  &&  typeof  console.log  ===  "function"  )
    {
      this._log  =  function  (  obj  )
      {
        console.log(obj)  ;
      }  ;
    }
    // After redefinition, call the newly defined _log method with the original object.
    this._log(obj)  ;
  },

  /*
   * Copies data from a read-only ResultSetRowList into a new array of writable objects.
   * This is necessary because Web SQL result sets often return read-only row objects.
   */
  _buildRows:  function  (  resultSet  )
  {
    var  rows  =  [  ]  ;
    for  (  var  i  =  0,  j  =  resultSet.rows.length  ;  i  <  j  ;  i++  )
    {
      var  currentRow  =  resultSet.rows.item(i)  ; // Get the current read-only row.
      var  usableRow  =  {  }  ; // Create a new writable object.

      // Iterate over properties of the read-only row and copy them.
      for  (  var  col  in  currentRow  )
      {
        usableRow[col]  =  currentRow[col]  ;
      }
      rows.push(usableRow)  ; // Add the writable row to the array.
    }
    return  rows  ; // Return the array of writable row objects.
  },

  // Escapes single quotes in a string for SQL insertion.
  _escapeString:  function  (  str  )
  {
    return  "'"  +  str.replace(/'/g,  "''")  +    "'"  ;
  },

  /*
   * Builds the SQL WHERE clause based on a conditions object.
   * Supports simple equality, array conditions (e.g., [operator, operand]),
   * and handles string escaping.
   */
  _buildConditionSql:  function  (  conditions  )
  {
    var  conditionSql  =  "",
        sqlParts  =  [],
        condition,
        operator,
        operand,
        element  ;

    if  (  !conditions  )
    {
      return  conditionSql  ; // No conditions provided, return empty string.
    }

    for  (  colName  in  conditions  )
    {
      condition  =  conditions[colName]  ;
      if  (  typeof  condition  ===  "string"  )
      {
        sqlParts.push(colName  +  "  =  "  +  this._escapeString(condition))  ;
      }
      else  if  (  condition.constructor  ===  Array  )
      {
        operator  =  condition[0]  ;
        operand  =  condition[1]  ;

        if  (  typeof  operand  ===  "string"  )
        {
          if  (  operator.toLowerCase()  !=  "in"  ) // Don't escape 'IN' clause operands.
          {
            operand  =  this._escapeString(operand)  ;
          }
        }
        else  if  (  operand.constructor  ===  Array  )
        {
          /* Handle array of operands for IN clause */
          for  (  i  =  0,  j  =  operand.length  ;  i  <  j  ;  i++  )
          {
            element  =  operand[i]  ;
            if  (  typeof  element  ===  "string"  )
            {
              operand[i]  =  this._escapeString(element)  ;
            }
          }
          operand  =  "("  +  operand.join(",")  +  ")"  ;
        }
        sqlParts.push(colName  +  "  "  +  operator  +  "  "  +  operand)  ;
      }
      else
      {
        // Numeric or boolean conditions
        sqlParts.push(colName  +  "  =  "  +  condition)  ;
      }
    }
    conditionSql  =  sqlParts.join("  AND  ")  ; // Join all parts with AND.

    if  (  conditionSql  )
    {
      conditionSql  =  "  WHERE  "  +  conditionSql  ; // Prepend WHERE if conditions exist.
    }

    return  conditionSql  ;
  },

  /*
   * Constructs the SET clause for an SQL UPDATE statement.
   * Handles string escaping for column values.
   */
  _buildUpdateSql:  function  (  table,  data  )
  {
    var  setSql  =  ""  ;
    for  (  colName  in  data  )
    {
      if  (  typeof  data[colName]  ===  "string"  )
      {
        setSql  +=  colName  +  "  =  '"  +  data[colName].replace(/'/g,  "''")  +  "',  "  ;
      }
      else
      {
        setSql  +=  colName  +  "  =  "  +  data[colName]  +  ",  "  ;
      }
    }

    setSql  =  setSql.slice(0,  -2)  ; // Remove the trailing comma and space.

    var  sql  =  "UPDATE  "  +  table  +  "  SET  "  +  setSql  ;
    if  (  data.id  )
    {
      sql  +=  "  WHERE  id  =  "  +  data.id  ; // Add ID condition if present.
    }

    return  sql  ;
  },

  /*
   * Executes an SQL query.
   * Handles success and failure callbacks, and transaction management.
   * success callback always receives an array of row objects.
   * failure callback receives an error string.
   */
  run:  function  (  sql,  success,  failure,  transaction  )
  {
    this._log(sql)  ; // Log the SQL query being executed.

    if  (  success  &&  transaction  )
    {
      var  oldSuccess  =  success  ;
      success  =  function  (  tx,  resultSet  )
      {
        oldSuccess(resultSet)  ;
      }  ;
    }

    if  (  transaction  )
    {
      transaction.executeSql(sql,  [],  success,  failure)  ;
    }
    else
    {
      // If no transaction is provided, start a new one.
      this.db.transaction(function  (  tx  )
      {
        tx.executeSql(sql,  [],
          function  (  tx,  resultSet  )
          {
            if  (  success  )
            {
              success(resultSet)  ;
            }
          },
          function  (  tx,  error  )
          {
            if  (  failure  )
            {
              failure(error.message)  ;
            }
          }
        )  ;
      })  ;
    }
  },

  /*
   * Creates a new table in the database.
   * cols should be an object literal like {colName: colType, ...}.
   */
  createTable:  function  (  name,  cols,  success,  failure,  tx  )
  {
    var  colSql  =  ""  ;
    for  (  colName  in  cols  )
    {
      colSql  +=  ",  "  +  colName  +  "  "  +  cols[colName]  ;
    }

    var  sql  =  "CREATE  TABLE  IF  NOT  EXISTS  "  +  name  +  "  (id  INTEGER  PRIMARY  KEY  AUTOINCREMENT"  +  colSql  +  ")"  ;
    this.run(sql,  success,  failure,  tx)  ;
  },

  /*
   * Drops an existing table from the database.
   */
  dropTable:  function  (  name,  success,  failure,  tx  )
  {
    var  sql  =  "DROP  TABLE  IF  EXISTS  "  +  name  ;
    this.run(sql,  success,  failure,  tx)  ;
  },

  /*
   * Renames an existing table.
   */
  renameTable:  function  (  oldName,  newName,  success,  failure,  tx  )
  {
    var  sql  =  "ALTER  TABLE  "  +  oldName  +  "  RENAME  TO  "  +  newName  ;
    this.run(sql,  success,  failure,  tx)  ;
  },

  /*
   * Creates an index on a specified column in a table.
   */
  createIndex:  function  (  tableName,  colName,  success,  failure,  tx  )
  {
    var  sql  =  "CREATE  INDEX  IF  NOT  EXISTS  "  +  tableName  +  "_"  +  colName  +  "_index  ON  "  +  tableName  +  "  ("  +  colName  +  ")"  ;
    this.run(sql,  success,  failure,  tx)  ;
  },

  /*
   * Drops an existing index.
   */
  dropIndex:  function  (  tableName,  colName,  success,  failure,  tx  )
  {
    var  sql  =  "DROP  INDEX  IF  EXISTS  "  +  tableName  +  "_"  +  colName  +  "_index"  ;
    this.run(sql,  success,  failure,  tx)  ;
  },

  /*
   * Adds a new column to an existing table.
   */
  addColumn:  function  (  tableName,  colName,  colType,  success,  failure,  tx  )
  {
    var  sql  =  "ALTER  TABLE  "  +  tableName  +  "  ADD  COLUMN  "  +  colName  +  "  "  +  colType  ;
    this.run(sql,  success,  failure,  tx)  ;
  },

  /*
   * Reads data from a table based on conditions and options.
   * conditions: obj literal {colName: reqVal} or {colName: [comparisonOp, comparisonVal]}
   * options: obj literal {group: ..., order: ..., limit: ..., offset: ...}
   * The success callback receives an array of row objects.
   */
  read:  function  (  table,  conditions,  options,  success,  failure,  tx  )
  {
    var  self  =  this  ;
    if  (  success  )
    {
      var  oldSuccess  =  success  ;
      success  =  function  (  resultSet  )
      {
        var  rows  =  self._buildRows(resultSet)  ; // Convert read-only rows to writable.
        oldSuccess(rows)  ;
      }  ;
    }
    else
    {
      // If no success callback provided, log the rows.
      success  =  function  (  resultSet  )
      {
        var  rows  =  self._buildRows(resultSet)  ;
        self._log(rows)  ;
      }  ;
    }

    var  sql  =  "SELECT  *  FROM  "  +  table  ;
    sql  +=  this._buildConditionSql(conditions)  ; // Append WHERE clause.

    if  (  options  )
    {
      if  (  options.group  )
      {
        sql  +=  "  GROUP  BY  "  +  options.group  ;
      }
      if  (  options.order  )
      {
        sql  +=  "  ORDER  BY  "  +  options.order  ;
      }
      if  (  options.limit  )
      {
        sql  +=  "  LIMIT  "  +  options.limit  ;
      }
      if  (  options.offset  )
      {
        sql  +=  "  OFFSET  "  +  options.offset  ;
      }
    }

    this.run(sql,  success,  failure,  tx)  ;
  },

  /*
   * Counts rows in a table based on conditions.
   * The success callback receives the rowCount.
   */
  count:  function  (  table,  conditions,  success,  failure,  tx  )
  {
    if  (  success  )
    {
      var  oldSuccess  =  success  ;
      success  =  function  (  resultSet  )
      {
        var  rowCount  =  resultSet.rows.item(0)["COUNT(*)"]  ;
        oldSuccess(rowCount)  ;
      }  ;
    }
    else
    {
      var  self  =  this  ;
      success  =  function  (  resultSet  )
      {
        var  rowCount  =  resultSet.rows.item(0)["COUNT(*)"]  ;
        self._log(rowCount)  ;
      }  ;
    }

    var  sql  =  "SELECT  COUNT(*)  FROM  "  +  table  ;
    sql  +=  this._buildConditionSql(conditions)  ;

    this.run(sql,  success,  failure,  tx)  ;
  },

  /*
   * Writes data to a table (inserts new row or updates existing).
   * data: obj literal {colName: colVal, ...}
   * success callback takes no params for update, insertId if insert.
   */
  write:  function  (  table,  data,  success,  failure,  tx  )
  {
    var  self  =  this,
        sql,
        oldSuccess  ;

    if  (  data.id  )
    {
      // If data has an 'id', perform an UPDATE.
      sql  =  this._buildUpdateSql(table,  data)  ;

      if  (  success  )
      {
        oldSuccess  =  success  ;
        success  =  function  (  resultSet  )
        {
          oldSuccess()  ; // For update, success callback takes no arguments.
        }  ;
      }
      else
      {
        success  =  function  (  resultSet  )
        {
          self._log(resultSet)  ;
        }  ;
      }
    }
    else
    {
      // If no 'id', perform an INSERT.
      var  colSql  =  "",  valSql  =  ""  ;
      for  (  colName  in  data  )
      {
        colSql  +=  colName  +  ",  "  ;
        if  (  typeof  data[colName]  ===  "string"  )
        {
          valSql  +=  "'"  +  data[colName].replace(/'/g,  "''")  +  "',  "  ;
        }
        else
        {
          valSql  +=  data[colName]  +  ",  "  ;
        }
      }
      colSql  =  colSql.slice(0,  -2)  ; // Remove trailing comma and space.
      valSql  =  valSql.slice(0,  -2)  ;

      sql  =  "INSERT  INTO  "  +  table  +  "  ("  +  colSql  +  ")  VALUES("  +  valSql  +  ")"  ;

      if  (  success  )
      {
        oldSuccess  =  success  ;
        success  =  function  (  resultSet  )
        {
          oldSuccess(resultSet.insertId)  ; // For insert, success callback gets insertId.
        }  ;
      }
      else
      {
        success  =  function  (  resultSet  )
        {
          self._log(resultSet.insertId)  ;
        }  ;
      }
    }
    this.run(sql,  success,  failure,  tx)  ;
  },

  /*
   * Updates existing rows in a table based on data and conditions.
   * data: obj literal {colName: colVal, ...}
   * conditions: obj literal {colName: reqVal, ...}
   */
  update:  function  (  table,  data,  conditions,  success,  failure,  tx  )
  {
    var  sql  =  this._buildUpdateSql(table,  data)  ;
    sql  +=  this._buildConditionSql(conditions)  ;

    if  (  success  )
    {
      var  oldSuccess  =  success  ;
      success  =  function  (  resultSet  )
      {
        oldSuccess()  ; // Update success callback has no arguments.
      }  ;
    }
    else
    {
      var  self  =  this  ;
      success  =  function  (  resultSet  )
      {
        self._log(resultSet)  ;
      }  ;
    }

    this.run(sql,  success,  failure,  tx)  ;
  },

  /*
   * Deletes rows from a table based on conditions.
   * conditions: obj literal {colName: reqVal, ...}
   */
  erase:  function  (  table,  conditions,  success,  failure,  tx  )
  {
    var  sql  =  "DELETE  FROM  "  +  table  ;
    sql  +=  this._buildConditionSql(conditions)  ;
    this.run(sql,  success,  failure,  tx)  ;
  },

  /*
   * Executes a function within a database transaction.
   * func: A function that takes a transaction object (tx) as its argument.
   */
  transact:  function  (  func,  success,  failure  )
  {
    this.db.transaction(func,  failure  ||  function  (  ) { }  ,  success  ||  function  (  ) { }  )  ;
  }
}  ;