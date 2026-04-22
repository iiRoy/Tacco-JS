// This module provides Object-Relational Mapping (ORM) capabilities
// specifically for instances of the 'Order' class.
//
// Key ORM principles applied here:
//   - JavaScript classes are mapped to database tables.
//   - Instances of these classes correspond to individual rows in those tables.
//   - Fields within the class instances map directly to columns in the database table.
//
// In essence, this code establishes the mapping logic:
// How a record (row) from the 'postgres order' table
// is represented as a JavaScript 'Order' object.

module . exports = function ( sequelize , DataTypes ) {

    // The 'define' method is used to define a new model.
    return sequelize . define ( "Order" , {

        // Define the 'coinbase_id' column:
        coinbase_id : {
            type : DataTypes . STRING , // Data type for the ID
            unique : true ,            // Ensures each ID is unique
            allowNull : false          // This field cannot be null
        } ,

        // Define the 'amount' column:
        amount : {
            type : DataTypes . FLOAT   // Floating-point number for the amount
        } ,

        // Define the 'time' column:
        time : {
            type : DataTypes . STRING , // String representation of time
            allowNull : false           // This field is also mandatory
        }

    } ) ;

} ;