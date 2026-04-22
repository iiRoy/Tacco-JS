// This module provides the configuration for an ORM (Object-Relational Mapper)
// to define the structure of a specific business entity.
// It maps the properties of a JavaScript object to columns in a database table.
// Specifically, it outlines how records from the 'transactions' table
// are represented as 'Transaction' objects in the application layer.

module.exports = function(
  dataGateway,
  attributeKinds
) {
  return dataGateway.define(
    "Transaction", {
      exchangeRefId: {
        type: attributeKinds.TEXT,
        unique: true,
        allowNull: false
      },
      totalValue: {
        type: attributeKinds.DECIMAL
      },
      eventTimestamp: {
        type: attributeKinds.TEXT,
        allowNull: false
      }
    }
  );
};