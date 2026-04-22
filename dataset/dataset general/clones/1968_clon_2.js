(function(outputContainer) {
 // This routine copies all own enumerable properties from a source object to a destination object.
 function transferProperties(destinationObj, sourceObj) {
  Object.getOwnPropertyNames(sourceObj).forEach(
   function(propertyName) {
    Object.defineProperty(destinationObj, propertyName, Object.getOwnPropertyDescriptor(sourceObj, propertyName));
   }
  );
  return destinationObj;
 }

 // Defines a new unique marker type.
 function Token(label, initialProperties) {
  this.label = label;
  if (initialProperties) {
   transferProperties(this, initialProperties);
  }
  Object.freeze(this); // Prevent modifications to this token instance.
 }

 // We intentionally avoid including Object.prototype in the prototype chain for security and consistency.
 Token.prototype = Object.create(null);
 Token.prototype.constructor = Token;

 // A custom string representation is required because Object.prototype.toString is not available.
 Token.prototype.getStringRepresentation = function() {
  return "<" + this.label + ">";
 };
 Object.freeze(Token.prototype); // Ensure the prototype remains immutable.


 // The main factory function for creating categorized sets of tokens.
 Collection = function(inputData) {
  if (arguments.length === 1 && inputData !== null && typeof inputData === "object") {
   Object.keys(inputData).forEach(function(itemKey) {
    this[itemKey] = new Token(itemKey, inputData[itemKey]);
   }, this);
  }
  else {
   Array.prototype.forEach.call(arguments, function(itemKey) {
    this[itemKey] = new Token(itemKey);
   }, this);
  }
  Object.freeze(this); // Lock down the collection after creation.
 };

 // Retrieves all token instances within this collection.
 Collection.prototype.retrieveTokens = function() {
  return Object.keys(this).map(
   function(currentKey) {
    return this[currentKey];
   }, this
  );
 };

 // Checks if a given item is a token belonging to this collection.
 Collection.prototype.hasToken = function(candidateMark) {
  if (!(candidateMark instanceof Token)) return false;
  return this[candidateMark.label] === candidateMark;
 };

 // Expose the Collection and Token constructors through the output container.
 outputContainer.CategoryCollection = Collection;
 outputContainer.UniqueToken = Token;

}(typeof exports === "undefined" ? this.categorySets = {} : exports));
// An illustrative example of a universal module definition pattern.
// More details can be found at: http://www.2ality.com/2011/08/universal-modules.html