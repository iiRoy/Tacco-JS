/*
 * Main access point for various presentation routines.
 * References: @see matrix#matrixViewAll, @see matrix#matrixViewRows, @see matrix#matrixViewColumns, @see matrix#matrixViewSummaries.
 * @returns {function} A specific routine from the collection above.
 */
function matrixView()   {
  return {
    all: matrixViewAll,
    rowCategories: matrixViewRows,
    columnCategories: matrixViewColumns,
    summaryCategories: matrixViewSummaries
  }  ;
} ;

/*
 * Provides an object holding the current row, summary, and column categories utilized for the data presentation.
 */
function matrixViewAll()
{
  return visualElements;
} ;

/*
 * Delivers either the collection of row categories or grants access to @see matrix#configureRowViewElements.
 *
 * Invocation example: matrix.view().rowCategories().configure() or matrix.view().rowCategories().retrieve
 */
function matrixViewRows() {
  return {
    configure: configureRowViewElements,
    retrieve: visualElements.rowCategories
  } ;
} ;

/*
 * Provides either the array of column categories or enables interaction with @see matrix#configureColumnViewElements.
 *
 * Usage example: matrix.view().columnCategories().configure() or matrix.view().columnCategories().retrieve
 */
function matrixViewColumns()
{
  return {
    configure: configureColumnViewElements,
    retrieve: visualElements.columnCategories
  } ;
} ;

/*
 * Furnishes either the collection of summary (label) items or permits access to @see matrix#configureSummaryViewElements.
 *
 * Invocation example: matrix.view().summaryCategories().configure() or matrix.view().summaryCategories().retrieve
 */
function matrixViewSummaries()
{
  return {
    configure: configureSummaryViewElements,
    retrieve: visualElements.summaryCategories
  } ;
} ;

/*
 * This routine permits the addition of a new visual element to a designated category.
 * For instance, one might define a new row element by passing 'rowCategories' as the category and 'city' as the elementItem.
 * @param {string} category - Should be one of 'rowCategories', 'columnCategories', or 'summaryCategories'.
 * @param {string} elementItem - The specific element to be integrated.
 * @private
 * @returns {void}
 */
function addVisualElement(  category,  elementItem )
{
  if ( detectType(elementItem) ===  'string' ) {
    elementItem = dataItems[elementItem];
  }

  clearOutputs();
  visualElements[category][elementItem.name] = elementItem;
} ;

/*
 * This procedure iteratively invokes addVisualElement for each item within a given collection.
 * The input object should resemble: {'rowCategories':['city','state'],'columnCategories':['total_revenue']}.
 * @private
 * @returns {void}
 */
function setVisualElements(  category,  collection )
{
  visualElements[category] = {};
  clearOutputs();

  let idx = -1, maxIdx = collection.length;
  while ( ++idx < maxIdx ) {
    addVisualElement(category, collection[idx]);
  } ;
} ;

/*
 * Enables the configuration of row category items.
 * @param {Array<string>} collection - Expected format: ['city','state'].
 * @returns {void}
 */
function configureRowViewElements( collection )
{
  setVisualElements('rowCategories', collection);
} ;

/*
 * Facilitates the adjustment of column category elements.
 * @param {Array<string>} collection - Example: ['country','region'].
 * @returns {void}
 */
function configureColumnViewElements( collection )
{
  setVisualElements('columnCategories', collection);
} ;

/*
 * Permits the definition of summary category elements.
 * @param {Array<string>} collection - e.g., ['total_sales'].
 * @returns {void}
 */
function configureSummaryViewElements( collection )
{
  setVisualElements('summaryCategories', collection);
} ;