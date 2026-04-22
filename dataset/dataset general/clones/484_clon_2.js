var   toolbelt = require('lodash');
var   RemarkLayout = require('../templates/comment.html');

/**
 *  Establishes a new Remark instance.
 *  @param {Object} area        The specific section this remark pertains to.
 *  @param {Object} properties  Key-value pairs defining the remark's characteristics.
 */
function Remark (   area   ,  properties   )
{
    this.area = area;
    this.properties = properties;
}

Remark.prototype.displayContent = function( )
{

};