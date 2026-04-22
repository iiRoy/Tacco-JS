;

( function ( $alias ) {
  $alias.fn.displayChartFromTable = function () {

    // Define the chart types that are permitted for use.
    var permittedChartStyles = [ 'column', 'line', 'area', 'spline', 'pie' ];

    // Helper function to retrieve a JavaScript function reference from a string path.
    var retrieveCallbackFunction = function ( dataGrid, propertyKey ) {
      var callbackName = $alias( dataGrid ).data( propertyKey );
      if ( typeof callbackName !== 'undefined' ) {
        var nameSegments = callbackName.split( '.' );
        var executableFn = window[ nameSegments[ 0 ] ]; // Start with global object
        for ( var segmentIndex = 1, segmentCount = nameSegments.length; segmentIndex < segmentCount; segmentIndex++ ) {
          executableFn = executableFn[ nameSegments[ segmentIndex ] ];
        }
        return executableFn;
      }
    };

    // Iterate over each selected HTML table element.
    this.each( function () {
      var currentSheet = $alias( this );
      var jqSheet      = $alias( currentSheet );
      var yAxisQuantity = 1; // Default to a single Y-axis.

      // Extract the primary chart title from the table's caption element.
      var sheetTitles = $alias( 'caption', currentSheet );
      var chartHeader = sheetTitles.length ? $alias( sheetTitles[ 0 ] ).text() : '';

      var chartDisplayArea;
      // Determine where the chart should be rendered based on data attributes.
      if ( jqSheet.data( 'chart-area-position' ) !== 1 ) {
        // Fetch the selector for the chart's rendering container.
        var areaSelector = jqSheet.data( 'chart-area' );
        if ( !areaSelector ) {
          throw "The 'chart-area' data attribute is a mandatory configuration.";
        }

        if ( areaSelector[ 0 ] === '#' || areaSelector.indexOf( '..' ) === -1 ) {
          // If it's an absolute selector (ID or simple class/tag).
          chartDisplayArea = $alias( areaSelector );
        } else {
          // Handle relative selectors (e.g., '../sibling').
          var baseElement = currentSheet;
          var activeAreaSelector = areaSelector;

          while ( activeAreaSelector.indexOf( '..' ) !== -1 ) {
            activeAreaSelector = activeAreaSelector.replace( /^.. /, '' );
            baseElement = baseElement.parent();
          }
          chartDisplayArea = $alias( activeAreaSelector, baseElement );
        }
        if ( chartDisplayArea.length !== 1 ) {
          throw "The specified 'chart-area' is either not found or appears multiple times in the DOM.";
        }
        chartDisplayArea = chartDisplayArea[ 0 ];
      } else {
        // If the chart should be placed immediately before the table.
        jqSheet.before( '<div></div>' );
        chartDisplayArea = jqSheet.prev();
        chartDisplayArea = chartDisplayArea[ 0 ];
      }

      // Obtain the global chart type setting from the table's data attributes.
      var mainChartStyle = jqSheet.data( 'chart-type' );
      if ( !mainChartStyle ) {
        throw "The 'chart-type' data attribute is required for chart generation.";
      }
      // Validate the main chart style against allowed types.
      if ( $alias.inArray( mainChartStyle, permittedChartStyles ) === -1 ) {
        throw "The 'chart-type' data attribute must be one of: " + permittedChartStyles.join( ', ' );
      }

      // Get the stacking configuration for the chart.
      var stackingOption = jqSheet.data( 'chart-stacking' );
      if ( !stackingOption ) {
        stackingOption = 'normal'; // Default stacking behavior.
      }

      // Check if data labels are globally enabled and if the chart is inverted.
      var labelingEnabled = jqSheet.data( 'chart-labels-active' );
      var chartOrientationReversed = jqSheet.data( 'chart-inverted' ) === 1;

      // Process table headers to define chart series.
      var headerCells = $alias( 'thead th', currentSheet );
      var dataSeriesDefinitions = [];
      var verticalLines = [];
      var omittedColsCount = 0;
      var isChartGrouped = false; // Flag to indicate if any series are stacked.

      headerCells.each( function ( cellIndex, headerCell ) {
        var jqHeaderCell = $alias( headerCell );
        var seriesMagnitude = jqHeaderCell.data( 'chart-value-scale' );

        var seriesChartStyle = jqHeaderCell.data( 'chart-type' );
        // Use global chart type if not specified for a specific series.
        if ( $alias.inArray( seriesChartStyle, permittedChartStyles ) === -1 ) {
          seriesChartStyle = mainChartStyle;
        }

        var seriesStackGroup = jqHeaderCell.data( 'chart-stack-group' );
        if ( seriesStackGroup ) {
          isChartGrouped = true; // Mark chart as grouped if a stack group is found.
        }

        var seriesLabelingEnabled = jqHeaderCell.data( 'chart-labels-active' );
        // Inherit global labeling setting if not specified for the series.
        if ( typeof seriesLabelingEnabled === 'undefined' ) {
          seriesLabelingEnabled = labelingEnabled;
        }

        var yAxisIdentifier = jqHeaderCell.data( 'chart-y-axis' );
        // Increment Y-axis count if a second axis is indicated.
        if ( typeof yAxisIdentifier !== 'undefined' && yAxisIdentifier === '1' ) {
          yAxisQuantity = 2;
        }

        var isColumnIgnored = jqHeaderCell.data( 'chart-skip' ) === 1;
        if ( isColumnIgnored ) {
          omittedColsCount = omittedColsCount + 1;
        }

        var headerCellChartConfig = {
          labelContent:      jqHeaderCell.text(),
          ignoreEntry:       isColumnIgnored,
          dataCellIndex:     cellIndex - omittedColsCount - 1, // Adjusted index for actual data columns.
          visualColor:       jqHeaderCell.data( 'chart-color' ),
          isDisplayable:     !jqHeaderCell.data( 'chart-hidden' ),
          targetYAxis:       typeof yAxisIdentifier !== 'undefined' ? yAxisIdentifier : 0,
          linePattern:       jqHeaderCell.data( 'chart-dash-style' ) || 'Solid',
          labelsActive:      seriesLabelingEnabled === 1,
          labelsColor:       jqHeaderCell.data( 'chart-labels-color' ) || jqSheet.data( 'chart-labels-color' )
        };

        var vlineXCoord = jqHeaderCell.data( 'chart-vline-x' );
        if ( typeof vlineXCoord === 'undefined' ) { // This is a regular data series.
          headerCellChartConfig.valueScale = typeof seriesMagnitude !== 'undefined' ? parseFloat( seriesMagnitude ) : 1;
          headerCellChartConfig.visualType = seriesChartStyle === 'column' && chartOrientationReversed ? 'bar' : seriesChartStyle;
          headerCellChartConfig.stackGroup = seriesStackGroup;
          headerCellChartConfig.displayUnit = jqHeaderCell.data( 'chart-unit' );
          dataSeriesDefinitions[ cellIndex ] = headerCellChartConfig;
        } else { // This is a vertical line annotation.
          headerCellChartConfig.xCoordinate = vlineXCoord;
          headerCellChartConfig.lineHeight = jqHeaderCell.data( 'chart-vline-height' );
          headerCellChartConfig.lineName = jqHeaderCell.data( 'chart-vline-name' );
          verticalLines[ cellIndex ] = headerCellChartConfig;
        }
      } );

      var chartDataSeries = [];
      $alias( dataSeriesDefinitions ).each( function ( colIdx, dataColumn ) {
        // Skip the first column (X-axis labels) and any explicitly ignored columns.
        if ( colIdx !== 0 && !dataColumn.ignoreEntry ) {

          var dataSeriesSetting = {
            seriesName:      dataColumn.labelContent + ( dataColumn.displayUnit ? ' (' + dataColumn.displayUnit + ')' : '' ),
            seriesValues:    [], // Placeholder for actual data points.
            seriesType:      dataColumn.visualType,
            stackGroup:      dataColumn.stackGroup,
            seriesColor:     dataColumn.visualColor,
            seriesVisible:   dataColumn.isDisplayable,
            seriesYAxis:     dataColumn.targetYAxis,
            seriesDashStyle: dataColumn.linePattern,
            pointMarker:     {
                enabled: false // Markers are typically disabled for line/area charts by default.
            },
            valueLabels:     {
              enabled: dataColumn.labelsActive,
              color:   dataColumn.labelsColor,
              align:   jqSheet.data( 'chart-labels-align' ) || ( mainChartStyle === 'column' && chartOrientationReversed === 1 ? undefined : 'center' )
            }
          };

          // Apply a custom formatter for data labels if specified.
          if ( dataColumn.labelsActive ) {
            var labelFormatterCallback = retrieveCallbackFunction( currentSheet, 'chart-labels-formatter' );
            if ( labelFormatterCallback ) {
              dataSeriesSetting.valueLabels.formatter = function () {
                return labelFormatterCallback( this.y );
              };
            }
          }
          chartDataSeries.push( dataSeriesSetting );
        }
      } );

      // Add vertical line annotations to the chart series.
      $alias( verticalLines ).each( function ( vLineIdx, vertLine ) {
        if ( typeof vertLine !== 'undefined' && !vertLine.ignoreEntry ) {
          chartDataSeries.push( {
            seriesName:    vertLine.labelContent,
            seriesValues:  [ { x: vertLine.xCoordinate, y: 0, name: vertLine.lineName }, { x: vertLine.xCoordinate, y: vertLine.lineHeight, name: vertLine.lineName } ],
            seriesType:    'spline', // Vertical lines are typically rendered as splines.
            seriesColor:   vertLine.visualColor,
            seriesVisible: vertLine.isDisplayable,
            pointMarker:   {
              enabled: false
            }
          } );
        }
      } );

      var xCategoryValues = []; // Stores categories for the X-axis.
      var pointClickCallback = retrieveCallbackFunction( currentSheet, 'chart-point-action' );
      var isXAxisDateTime = jqSheet.data( 'chart-x-axis-type' ) === 'datetime';

      // Process table rows to populate series data.
      var dataRows = $alias( 'tbody:first tr', currentSheet );
      dataRows.each( function ( rowIndex, dataRow ) {
        // Skip row if marked to be ignored.
        if ( !!$alias( dataRow ).data( 'chart-skip' ) ) {
          return;
        }

        var dataCells = $alias( 'td', dataRow );
        dataCells.each( function ( cellIdx, dataCell ) {
          var cellContent;
          var dataColumn = dataSeriesDefinitions[ cellIdx ];

          if ( dataColumn.ignoreEntry ) {
            return;
          }
          var jqDataCell = $alias( dataCell );
          if ( cellIdx === 0 ) { // First column usually contains X-axis categories.
            cellContent = jqDataCell.text();
            xCategoryValues.push( cellContent );
          } else {
            var unformattedContent = jqDataCell.text();
            var currentSeries = chartDataSeries[ dataColumn.dataCellIndex ]; // Map to correct series.

            if ( unformattedContent.length === 0 ) {
              if ( !isXAxisDateTime ) {
                currentSeries.seriesValues.push( null ); // Push null for empty cells in non-datetime charts.
              }
            } else {
              var processedContent = unformattedContent.replace( /\s/g, '' ).replace( /,/, '.' );
              cellContent = Math.round( parseFloat( processedContent ) * dataColumn.valueScale * 100 ) / 100;

              var dataPointX = jqDataCell.data( 'chart-x' );

              if ( isXAxisDateTime ) {
                dataPointX = $alias( 'td', $alias( dataRow ) ).first().text();
                var parsedDateObject = interpretDateTimeString( dataPointX );
                dataPointX = parsedDateObject.getTime() - parsedDateObject.getTimezoneOffset() * 60 * 1000;
              }

              var dataPointName = jqDataCell.data( 'chart-item-name' );
              var seriesPointObject = {
                name: typeof dataPointName !== 'undefined' ? dataPointName : unformattedContent,
                y:    cellContent,
                x:    dataPointX // undefined if no explicit X value is defined in the table.
              };

              // Attach click event handler if a callback is provided.
              if ( pointClickCallback ) {
                seriesPointObject.eventHandlers = {
                  click: function () {
                      return pointClickCallback( this ); // 'this' refers to the Highcharts point object.
                    }
                };
              }

              // Special handling for pie chart slices.
              if ( dataColumn.visualType === 'pie' ) {
                if ( jqDataCell.data( 'chart-item-highlight' ) ) {
                  seriesPointObject.sliced = 1; // Mark slice as 'sliced' for emphasis.
                }
              }

              // Apply custom color for an individual data point.
              var dataPointColor = jqDataCell.data( 'chart-item-color' );
              if ( typeof dataPointColor !== 'undefined' ) {
                seriesPointObject.color = dataPointColor;
              }

              currentSeries.seriesValues.push( seriesPointObject );
            }
          }
        } );

      } );

      var yAxisConfigurations = [];
      var axisCounter;
      // Configure Y-axes based on table data attributes.
      for ( axisCounter = 1; axisCounter <= yAxisQuantity; axisCounter++ ) {
        var currentAxisSettings = {
          axisTitle: {
            titleText: typeof jqSheet.data( 'chart-y-axis-' + axisCounter + '-title-text' ) !== 'undefined' ? jqSheet.data( 'chart-y-axis-' + axisCounter + '-title-text' ) : null
          },
          maxValue:          typeof jqSheet.data( 'chart-y-axis-' + axisCounter + '-max' ) !== 'undefined' ? jqSheet.data( 'chart-y-axis-' + axisCounter + '-max' ) : null,
          minValue:          typeof jqSheet.data( 'chart-y-axis-' + axisCounter + '-min' ) !== 'undefined' ? jqSheet.data( 'chart-y-axis-' + axisCounter + '-min' ) : null,
          axisReversed:      jqSheet.data( 'chart-y-axis-' + axisCounter + '-reversed' ) === '1',
          axisOpposite:      jqSheet.data( 'chart-y-axis-' + axisCounter + '-opposite' ) === '1',
          tickSpacing:       jqSheet.data( 'chart-y-axis-' + axisCounter + '-tick-interval' ) || null,
          axisLabels: {
            labelRotation: jqSheet.data( 'chart-y-axis-' + axisCounter + '-rotation' ) || 0
          },
          startLabelOnTick:  jqSheet.data( 'chart-y-axis-' + axisCounter + '-start-on-tick' ) !== "0",
          endLabelOnTick:    jqSheet.data( 'chart-y-axis-' + axisCounter + '-end-on-tick' ) !== "0",
          stackedLabels: {
            labelsEnabled: jqSheet.data( 'chart-y-axis-' + axisCounter + '-stacklabels-enabled' ) === '1'
          },
          gridLineInterp: jqSheet.data( 'chart-y-axis-' + axisCounter + '-grid-line-interpolation' ) || null
        };

        // Assign custom Y-axis label formatter if available.
        var yAxisFormatterCallback = retrieveCallbackFunction( currentSheet, 'chart-y-axis-' + axisCounter + '-formatter-callback' );
        if ( yAxisFormatterCallback ) {
          currentAxisSettings.axisLabels.formatter = function () {
              return yAxisFormatterCallback( this.value );
          };
        }

        yAxisConfigurations.push( currentAxisSettings );
      }

      // Define standard color palette and retrieve theme/custom colors.
      var standardColors = [
        '#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE',
        '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92'
      ];
      var chartColors = [];

      var highchartsThemeColors = typeof Highcharts.theme !== 'undefined' && typeof Highcharts.theme.colors !== 'undefined' ? Highcharts.theme.colors : [];
      var seriesShadow = jqSheet.data( 'chart-line-shadow' );
      var seriesLineWidth = jqSheet.data( 'chart-line-width' ) || 2;

      // Combine default, theme, and custom colors.
      var colorCount = Math.max( standardColors.length, highchartsThemeColors.length );
      for ( var colorIndex = 0; colorIndex < colorCount; colorIndex++ ) {
        var colorPropertyName = 'chart-color-' + ( colorIndex + 1 );
        chartColors.push( typeof jqSheet.data( colorPropertyName ) !== 'undefined' ? jqSheet.data( colorPropertyName ) : typeof highchartsThemeColors[ colorIndex ] !== 'undefined' ? highchartsThemeColors[ colorIndex ] : standardColors[ colorIndex ] );
      }

      // Chart margin settings.
      var topMargin = jqSheet.data( 'chart-margin-top' );
      var rightMargin = jqSheet.data( 'chart-margin-right' );
      var bottomMargin = jqSheet.data( 'chart-margin-bottom' );
      var leftMargin = jqSheet.data( 'chart-margin-left' );

      var xLabelsActive = jqSheet.data( 'chart-x-axis-labels-enabled' );

      var xAxisLabelDisplay = {};
      var xLabelTextSize = jqSheet.data( 'chart-x-axis-labels-font-size' );

      if ( typeof xLabelTextSize !== 'undefined' ) {
        xAxisLabelDisplay.fontSize = xLabelTextSize;
      }

      // Construct the main Highcharts configuration object.
      var chartDisplayOptions = {
        customColors: chartColors,
        chartSettings: {
          renderTarget:     chartDisplayArea,
          isFlipped:        chartOrientationReversed,
          topOffset:        typeof topMargin !== 'undefined' ? topMargin : null,
          rightOffset:      typeof rightMargin !== 'undefined' ? rightMargin : null,
          bottomOffset:     typeof bottomMargin !== 'undefined' ? bottomMargin : null,
          leftOffset:       typeof leftMargin !== 'undefined' ? leftMargin : null,
          verticalSpacing:  jqSheet.data( 'chart-spacing-top' ) || 10,
          chartHeight:      jqSheet.data( 'chart-height' ) || null,
          zoomMode:         jqSheet.data( 'chart-zoom-type' ) || null,
          polarProjection:  jqSheet.data( 'chart-polar' ) || null
        },
        mainTitle: {
          titleContent: chartHeader
        },
        subHeader: {
          titleContent: jqSheet.data( 'chart-subtitle-text' ) || ''
        },
        chartLegend: {
          legendActive:      jqSheet.data( 'chart-legend-disabled' ) !== '1',
          legendArrangement: jqSheet.data( 'chart-legend-layout' ) || 'horizontal',
          symbolSize:        jqSheet.data( 'chart-legend-width' ) || 30,
          legendXPos:        jqSheet.data( 'chart-legend-x' ) || 15,
          legendYPos:        jqSheet.data( 'chart-legend-y' ) || 0
        },
        horizontalAxis: {
          axisCategories:             ( jqSheet.data( 'chart-x-axis-type' ) !== 'datetime' ) ? xCategoryValues : undefined,
          axisType:                   ( jqSheet.data( 'chart-x-axis-type' ) === 'datetime' ) ? 'datetime' : undefined,
          axisDirectionReversed:      jqSheet.data( 'chart-x-axis-reversed' ) === '1',
          axisPositionOpposite:       jqSheet.data( 'chart-x-axis-opposite' ) === '1',
          displayLastLabel:           typeof jqSheet.data( 'chart-x-axis-show-last-label' ) !== 'undefined' ? jqSheet.data( 'chart-x-axis-show-last-label' ) : true,
          axisTickInterval:           jqSheet.data( 'chart-x-axis-tick-interval' ) || null,
          dtLabelFormats:             { // Default datetime formats.
            second: '%e. %b', minute: '%e. %b', hour: '%e. %b',
            day:    '%e. %b', week:   '%e. %b', month: '%e. %b', year: '%e. %b'
          },
          axisLabelsConfig: {
            labelRotationAngle: jqSheet.data( 'chart-x-axis-rotation' ) || 0,
            labelAlignmentSetting:    jqSheet.data( 'chart-x-axis-align' ) || 'center',
            labelsDisplayEnabled: typeof xLabelsActive !== 'undefined' ? xLabelsActive : true,
            labelStyleOptions:    xAxisLabelDisplay
          },
          beginOnTick:        jqSheet.data( 'chart-x-axis-start-on-tick' ),
          endOnTick:          jqSheet.data( 'chart-x-axis-end-on-tick' ),
          minimumValue:       getHorizontalAxisBounds( currentSheet, 'min' ),
          maximumValue:       getHorizontalAxisBounds( currentSheet, 'max' ),
          altGridColor:       jqSheet.data( 'chart-x-axis-alternateGridColor' ) || null,
          axisTitleConfig: {
            titleContent: jqSheet.data( 'chart-x-axis-title-text' ) || null
          },
          gridLineThickness:  jqSheet.data( 'chart-x-axis-gridLine-width' ) || 0,
          gridLineStyle:      jqSheet.data( 'chart-x-axis-gridLine-style' ) || 'ShortDot',
          tickPositioning:    jqSheet.data( 'chart-x-axis-tickmark-placement' ) || 'between',
          axisLineThickness:  jqSheet.data( 'chart-x-axis-line-width' ) || 0
        },
        verticalAxes: yAxisConfigurations,
        hoverTooltip: {
            tooltipFormatter: function () {
              if ( jqSheet.data( 'chart-x-axis-type' ) === 'datetime' ) {
                return '<b>' + this.series.name + '</b><br/>' + Highcharts.dateFormat( '%e. %b', this.x ) + ' : ' + this.y;
              } else {
                var xDisplayValue = typeof xCategoryValues[ this.point.x ] !== 'undefined' ? xCategoryValues[ this.point.x ] : this.point.x;
                if ( mainChartStyle === 'pie' ) {
                  return '<strong>' + this.series.name + '</strong><br />' + xDisplayValue + ' : ' + this.point.y;
                }
                return '<strong>' + this.series.name + '</strong><br />' + xDisplayValue + ' : ' + this.point.name;
              }
            }
        },
        chartCredits: {
          enabled: false // Disable Highcharts credits by default.
        },
        seriesPlotOptions: {
          lineSeriesOptions: {
            valueLabels: {
              enabled: true
            },
            lineThickness: seriesLineWidth
          },
          areaSeriesOptions: {
            lineThickness:     seriesLineWidth,
            areaShadow:        typeof seriesShadow !== 'undefined' ? seriesShadow : true,
            areaFillTransparency: jqSheet.data( 'chart-area-fillOpacity' ) || 0.75
          },
          pieSeriesOptions: {
            enablePointSelection: true,
            valueLabels: {
              enabled: true
            },
            displayInLegend: jqSheet.data( 'chart-pie-show-in-legend' ) === '1',
            pieSize:         '80%'
          },
          generalSeriesOptions: {
            enableAnimation:       false,
            stickyTrackingEnabled: false,
            stackingBehavior:      isChartGrouped ? stackingOption : null,
            seriesGroupPadding:    jqSheet.data( 'chart-group-padding' ) || 0
          }
        },
        chartSeriesData: chartDataSeries,
        exportFeatures: {
            outputFilename: chartHeader.replace( / /g, '_' ),
            exportButtons: {
              exportControl: {
                menuOptions: null,
                clickAction: function () {
                  this.exportChart(); // Export the generated chart.
                }
              }
            }
          }
      };

      // Trigger a custom event before chart rendering for external modifications.
      jqSheet.trigger( 'tableChart.beforeRender', chartDisplayOptions );
      // Instantiate the Highcharts chart with the compiled options.
      new Highcharts.Chart( chartDisplayOptions );

    } );
    // Allow for jQuery method chaining.
    return this;
  };

  // Function to determine X-axis minimum or maximum values.
  var getHorizontalAxisBounds = function ( currentSheet, boundType ) {
    var boundaryValue = $alias( currentSheet ).data( 'chart-x-axis-' + boundType );
    if ( typeof boundaryValue !== 'undefined' ) {
      if ( $alias( currentSheet ).data( 'chart-x-axis-type' ) === 'datetime' ) {
        var parsedDateObject = interpretDateTimeString( boundaryValue );
        return parsedDateObject.getTime() - parsedDateObject.getTimezoneOffset() * 60 * 1000;
      }
      return boundaryValue;
    }
    return null;
  };

  // Utility function to parse a date/time string into a Date object.
  var interpretDateTimeString = function ( dtString ) {
    var dtComponents = dtString.split( ' ' );
    var dateParts = dtComponents[ 0 ].split( '-' );
    var minuteVal = null;
    var hourVal = null;
    // If time components are included in the string.
    if ( dtComponents[ 1 ] ) {
      var timeParts = dtComponents[ 1 ].split( ':' );
      minuteVal = parseInt( timeParts[ 0 ], 10 );
      hourVal = parseInt( timeParts[ 1 ], 10 );
    }
    // Note: Month is 0-indexed in JavaScript Date constructor.
    return new Date( parseInt( dateParts[ 0 ], 10 ), parseInt( dateParts[ 1 ], 10 ) - 1, parseInt( dateParts[ 2 ], 10 ), minuteVal, hourVal );
  };

} )( jQuery );