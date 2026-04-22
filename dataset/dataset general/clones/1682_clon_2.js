/*
 * Due to constraints in current browser rendering of flexible box layouts,
 * the decision was made to utilize a grid-based approach.
 */

App.namespace("App.widgets");

App.widgets.MobileDataGrid = App.extend( App.Container,
{
	layoutMode             : "stretch",

	allowMultipleSelection : false,
	scrollingDirection     : "y-axis",

	initializeComponent    : function () {
		var _self_ = this; /* Reference to the current component instance */

		_self_.childComponents = _self_.dataDisplay = _self_.constructDataDisplay();

		// Check if the array for attached elements is not yet initialized
		if ( !App.isArray( _self_.attachedElements ) )
		{
			_self_.attachedElements = [];
		}

		_self_.gridHeader = new App.BaseComponent( _self_.composeHeaderSection() );
		_self_.attachedElements.push( _self_.gridHeader ); // Add the header to the docked items collection

		App.widgets.MobileDataGrid.superclass.initializeComponent.call( _self_ );

		var currentDataSource = _self_.dataStore;

		currentDataSource.on("recordUpdated", _self_.propagateDataModification, _self_);
	},

	propagateDataModification : function ( dataSource, recordInstance, modificationAction ) {
		var _self_ = this; // Component context

		// Trigger a custom event to notify listeners about data changes
		_self_.triggerEvent("dataSourceUpdate", dataSource, recordInstance, modificationAction);
	},

	composeHeaderSection : function () {
		var _self_                  = this,
			columnDefinitions       = _self_.columnDefinitions,
			visibleColumnCount      = _self_.retrieveColumnCount( false ), // Get count of non-hidden columns
			columnSegmentWidth      = 100 / visibleColumnCount,
			headerMarkup            = '<table class="app-grid-head">'; // Start of the header table structure

		headerMarkup += '    <thead><tr>';
		for ( var idx = 0; idx < columnDefinitions.length; idx++ )
		{
			var currentColumn  = columnDefinitions[idx],
				flexWeight     = currentColumn.flexWeight || 1,
				cssClasses     = ""; // Initialize CSS classes string

			var calculatedWidth = flexWeight * columnSegmentWidth; // Calculate column width based on flex factor

			if ( currentColumn.isHidden )
			{
				cssClasses += "app-grid-column-hidden"; // Add hidden class if column is not visible
			}

			// Append table header cell markup
			headerMarkup += '<th width="' + calculatedWidth + '%" class="app-grid-cell app-grid-header-cell app-grid-column-' + currentColumn.dataField + ' ' + cssClasses + '" data-field="' + currentColumn.dataField + '">' + currentColumn.title + '</th>';
		}
		headerMarkup += '    </tr></thead>';
		headerMarkup += '</table>';

		return {
			position       : "top", // Position the header at the top
			contentHtml    : headerMarkup,
			eventHandlers  : {
				contextObject  : _self_,
				onAfterRender  : _self_.setupHeaderInteraction // Callback after rendering
			}
		};
	},

	setupHeaderInteraction : function ( componentInstance ) {
		var _self_        = this,
			elementRef    = componentInstance.getElement(); // Get the DOM element of the header component

		// Attach a click event listener to the header element
		elementRef.on("tap", _self_.processHeaderClick, _self_);
	},

	processHeaderClick : function ( eventObject, targetElement ) {
		eventObject.preventBubble(); // Stop event propagation

		var _self_          = this,
			clickedElement  = App.getElement( targetElement ), // Wrap the target element
			dataField       = clickedElement.getDatasetValue("dataField"); // Retrieve the data field from the element's dataset

		if ( typeof dataField === "string" )
		{
			_self_.dataStore.sortRecords( dataField ); // Sort the data store by the clicked column's data field
			clickedElement.applyAttributes({
				sortOrder : _self_.dataStore.sortDirectionMap[dataField] // Update sort attribute on the header
			});
		}
	},

	constructDataDisplay : function () {
		var _self_              = this,
			columnDefinitions   = _self_.columnDefinitions,
			visibleColumnCount  = _self_.retrieveColumnCount( false ), // Count of currently visible columns
			rowTemplate         = '<tr class="app-grid-data-row {isModified:this.markRowModified(parent)}">', // Template for a single data row
			columnWidthUnit     = 100 / visibleColumnCount;

		for ( var idx = 0; idx < columnDefinitions.length; idx++ )
		{
			var currentColumn   = columnDefinitions[idx],
				flexWeight      = currentColumn.flexWeight || 1,
				calculatedWidth = flexWeight * columnWidthUnit,
				inlineStyle     = (idx === columnDefinitions.length - 1) ? "padding-right: 10px;" : "", // Add right padding for the last column
				cssClasses      = currentColumn.cssClass || ""; // Custom CSS class for the column

			inlineStyle += currentColumn.style || ""; // Append any additional inline styles

			if ( currentColumn.isHidden )
			{
				cssClasses += "app-grid-column-hidden"; // Mark column as hidden
			}

			// Build the table data cell markup for each column
			rowTemplate += '<td width="' + calculatedWidth + '%" class="app-grid-cell app-grid-column-' + currentColumn.dataField + ' ' + cssClasses + ' {isModified:this.markCellModified(parent)}" style="' + inlineStyle + '" data-field="' + currentColumn.dataField + '" data-row-index="{recordIndex}">{' + currentColumn.dataField + '}</td>';
		}
		rowTemplate += '</tr>';

		return new App.DataDisplayWidget({
			dataStore            : _self_.dataStore,
			rowSelector          : "tr.app-grid-data-row", // Selector for individual data rows
			singleSelectionMode  : _self_.allowMultipleSelection,
			scrollMode           : _self_.scrollingDirection,
			displayTemplate      : new App.TemplateEngine(
				'<table style="width: 100%;">',
					'<tpl for=".">', // Loop through each record in the data store
						rowTemplate,
					'</tpl>',
				'</table>',
				{
					markRowModified : function ( isRecordModified, recordData ) {
						return isRecordModified ? "app-grid-data-row-modified" : "";
					},
					markCellModified : function ( isFieldModified, recordData ) {
						return isFieldModified ? "app-grid-cell-modified" : "";
					}
				}
			),
			processRecordData    : function ( rawData, recordIndex, dataRecord ) {
				var activeColumn,
					idx            = 0,
					totalCols      = columnDefinitions.length;
				var processedData  = {};
				processedData.changedFields = {}; // Object to track changed fields
				for ( ; idx < totalCols; idx++ )
				{
					activeColumn = columnDefinitions[idx];
					if ( typeof activeColumn.renderFunction === "function" )
					{
						// Apply a custom renderer function if available
						processedData[activeColumn.dataField] = activeColumn.renderFunction.apply( _self_, [rawData[activeColumn.dataField], activeColumn, dataRecord, recordIndex] );
					} else {
						processedData[activeColumn.dataField] = rawData[activeColumn.dataField];
					}
				}

				processedData.isModified = dataRecord.isModified; // Indicate if the record itself is modified

				processedData.recordIndex = recordIndex; // Store the original index of the record
				return processedData;
			},
			forwardedEvents      : [ // Events to re-fire from the DataView
				"beforeSelection",
				"containerClick",
				"itemDoubleClick",
				"itemSwipeGesture",
				"itemClick",
				"selectionAltered"
			]
		});
	},

	// includeHidden = true to count all columns regardless of visibility
	retrieveColumnCount : function ( includeHidden ) {
		var _self_             = this,
			columnDefinitions  = _self_.columnDefinitions,
			countOfColumns     = 0;

		for ( var idx = 0; idx < columnDefinitions.length; idx++ )
		{
			var currentColumn = columnDefinitions[idx];
			// Skip columns without a title if not including hidden ones
			if ( !includeHidden && typeof currentColumn.title !== "string" ) { continue; }
			if ( !currentColumn.isHidden )
			{
				countOfColumns += currentColumn.flexWeight || 1; // Sum flex weights for visible columns
			}
		}

		return countOfColumns;
	},

	getFieldMappings : function () {
		var _self_         = this,
			fieldMap       = {},
			columnDefinitions = _self_.columnDefinitions;

		for ( var idx = 0; idx < columnDefinitions.length; idx++ )
		{
			fieldMap[columnDefinitions[idx].dataField] = idx; // Map data field names to their column index
		}

		return fieldMap;
	},

	toggleColumnVisibility : function ( columnIndex ) {
		var _self_ = this;

		if ( typeof columnIndex === "string" )
		{
			var fieldMap = _self_.getFieldMappings();
			columnIndex = fieldMap[columnIndex]; // Resolve column index from data field name
		}
		var containerElement    = _self_.getElement(), // Main grid element
			dataField           = _self_.columnDefinitions[columnIndex].dataField,
			cellElements        = containerElement.query("td.app-grid-column-"+dataField); // Select all cells for this column

		for ( var cellIdx = 0; cellIdx < cellElements.length; cellIdx++ )
		{
			var currentCellElement = App.getElement( cellElements[cellIdx] );
			if ( currentCellElement.hasClass("app-grid-column-hidden") )
			{
				currentCellElement.removeClass("app-grid-column-hidden");
				this.columnDefinitions[columnIndex].isHidden = false; // Update column definition state
			} else {
				currentCellElement.addClass("app-grid-column-hidden");
				this.columnDefinitions[columnIndex].isHidden = true; // Update column definition state
			}
		}

		_self_.adjustColumnWidths(); // Re-calculate and apply column widths
	},

	adjustColumnWidths : function () {
		var _self_              = this,
			containerElement    = _self_.getElement(),
			headerSectionWidth  = _self_.gridHeader.getElement().getPixelWidth(), // Get the actual width of the header
			columnDefinitions   = _self_.columnDefinitions,
			cellElements        = containerElement.query("td.app-grid-cell"),
			visibleColumnCount  = _self_.retrieveColumnCount( false ),
			columnUnitWidth     = 100 / visibleColumnCount,
			fieldMap            = _self_.getFieldMappings();

		for ( var cellIdx = 0; cellIdx < cellElements.length; cellIdx++ )
		{
			var currentCellElement = App.getElement( cellElements[cellIdx] ),
				dataField          = currentCellElement.getDatasetValue("dataField"),
				activeColumn       = columnDefinitions[fieldMap[dataField]],
				flexWeight         = activeColumn.flexWeight || 1,
				newWidth           = flexWeight * columnUnitWidth / 100 * headerSectionWidth; // Calculate new pixel width

			currentCellElement.setPixelWidth(newWidth); // Apply the new width to the cell
		}
	},

	navigateAndDisplayRow : function ( rowIndex ) {
		var _self_           = this,
			containerElement = _self_.getElement(),
			rowElements      = containerElement.query("tr.app-grid-data-row"),
			targetRowElement = App.getElement( rowElements[rowIndex] ),
			scrollManager    = _self_.dataDisplay.scrollManager;

		var scrollCoordinates = {
			x: 0,
			y: targetRowElement.domNode.offsetTop // Get the vertical offset of the target row
		};

		scrollManager.scrollIntoView( scrollCoordinates, true ); // Smoothly scroll to the row
	},

	getDataView : function () {
		var _self_ = this;

		return _self_.dataDisplay; // Return the internal data display component
	},

	attachDataSource : function ( dataSource ) {
		var _self_          = this,
			dataViewInstance = _self_.getDataView(); // Get the data display component

		dataViewInstance.attachDataSource(dataSource); // Bind the new data source to the data view
	},

	getBoundDataSource : function () {
		var _self_          = this,
			dataViewInstance = _self_.getDataView();

		return dataViewInstance.getBoundDataSource(); // Retrieve the currently bound data source
	},

	retrieveRowElement : function ( rowIndex ) {
		var _self_ = this;
		if ( typeof rowIndex === "object" )
		{
			var dataSource = _self_.getBoundDataSource();
			rowIndex = dataSource.indexOfRecord(rowIndex); // Find index if a record object is passed
		}

		var containerElement = _self_.getElement(),
			rowElements      = containerElement.query("tr"); // Query all table rows

		return rowElements[rowIndex + 1]; // Return the specific row element (accounting for header row)
	}
});

App.register("mobiledatagrid", App.widgets.MobileDataGrid);