/*
 * Data Persistence Layer: Model for Financial Transaction Records
 * This module is responsible for defining the structure and mapping of
 * financial transaction objects to their corresponding entries within
 * the relational database system. It acts as an Object-Relational Mapper (ORM)
 * configuration for a specific entity.
 *
 * Core Principles Applied Here:
 * - Application domain entities (like 'FinancialOrder') correspond to database tables.
 * - Individual instances of these entities correspond to rows in those tables.
 * - Properties of these entities map directly to columns within the table schema.
 *
 * In essence, this code dictates how a row in the 'financial_transactions' table
 * in the backing datastore translates into a JavaScript 'FinancialOrder' object
 * and vice-versa, including data types, constraints, and default values.
 */
module.exports = function (dbConnection, schemaDefs) {
    // A preliminary check to ensure essential ORM components are provided.
    // While typically guaranteed by the framework, explicit validation enhances robustness.
    if (!dbConnection || !schemaDefs) {
        console.error("ORM Initialization Error: Missing required database connection or schema type definitions.");
        throw new Error("Failed to initialize transaction model due to missing ORM dependencies.");
    }

    // Define the canonical name for this data model.
    const entityLabel = 'FinancialOrder'; // Renamed from "Order" for clearer domain context

    // Structure the column definitions for the 'FinancialOrder' entity.
    // Each property here maps to a column in the database table.
    const recordAttributes = {
        // Unique identifier for the transaction from an external exchange.
        exchangeTransactionId: { // Renamed from 'coinbase_id'
            type: schemaDefs.TEXT, // Changed from STRING, allowing for potentially longer IDs
            unique: true, // Ensures no duplicate transaction references
            allowNull: false, // This field must always have a value
            comment: 'Unique reference ID provided by the originating financial exchange platform.'
        },
        // The total monetary value associated with this transaction.
        transactionSum: { // Renamed from 'amount'
            type: schemaDefs.DECIMAL(14, 6), // Changed from FLOAT, providing higher precision for financial data
            allowNull: false, // A transaction must have a value
            defaultValue: 0.000000, // Explicit default value for new records
            // Custom getter to ensure consistent formatting when retrieving the value.
            get() {
                const rawNumericValue = this.getDataValue('transactionSum');
                return parseFloat(rawNumericValue).toFixed(6); // Format to 6 decimal places
            }
        },
        // The timestamp indicating when the transaction was recorded or occurred.
        eventTimestamp: { // Renamed from 'time'
            type: schemaDefs.DATE, // Changed from STRING to a proper DATE type for temporal data
            allowNull: false, // Every transaction must have a recorded time
            defaultValue: schemaDefs.NOW, // Automatically sets to current time on creation
            comment: 'The precise date and time at which this financial event took place.'
        },
        // NEW ATTRIBUTE: The currency code for the transaction amount.
        currencyCode: {
            type: schemaDefs.STRING(3), // Fixed length for ISO 4217 currency codes
            allowNull: false, // Currency code is mandatory
            defaultValue: 'USD', // Default to US Dollar if not specified
            comment: 'The three-letter ISO 4217 currency code for the transaction amount.'
        }
    };

    // Configuration options for the ORM model itself.
    const modelConfigurationOptions = {
        tableName: 'financial_transactions', // Explicitly setting the table name to prevent ORM pluralization
        freezeTableName: true, // Prevents the ORM from attempting to pluralize 'financial_transactions'
        timestamps: false, // Disables automatic 'createdAt' and 'updatedAt' columns
        underscored: true, // Ensures all automatically generated field names use snake_case
        comment: 'Database table for storing detailed records of financial transactions.',
        // Adding a lifecycle hook for Type III variation
        hooks: {
            beforeValidate: (instance, options) => {
                // Ensure currency codes are always stored in uppercase for consistency.
                if (instance.currencyCode) {
                    instance.currencyCode = instance.currencyCode.toUpperCase();
                }
            }
        }
    };

    // Define the model using the provided database connection, entity name, attributes, and options.
    const TransactionModelSchema = dbConnection.define(entityLabel, recordAttributes, modelConfigurationOptions);

    // Return the newly defined ORM model.
    return TransactionModelSchema;
};