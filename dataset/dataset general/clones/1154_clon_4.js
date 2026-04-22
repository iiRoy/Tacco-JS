(function(lib) {

  const permittedChartTypes = ['column', 'line', 'area', 'spline', 'pie'];

  const resolveFunctionPath = (rootObj, pathStr) => {
    if (typeof pathStr !== 'string' || !pathStr) return undefined;
    const pathParts = pathStr.split('.');
    return pathParts.reduce((current, part) => (current && current[part] !== undefined) ? current[part] : undefined, rootObj);
  };

  const convertDateStringToTimestamp = (dtString) => {
    if (!dtString) return null;
    const dtSegments = dtString.split(' ');
    const dateParts = dtSegments[0].split('-').map(Number);
    let timeParts = [0, 0];

    if (dtSegments[1]) {
      timeParts = dtSegments[1].split(':').map(Number);
    }
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1]);
    return dateObj.getTime() - dateObj.getTimezoneOffset() * 60 * 1000;
  };

  const extractDataAttributes = (element, prefix = 'chart-') => {
    const attributes = {};
    lib.each(element[0].attributes, (idx, attr) => {
      if (attr.name.startsWith('data-' + prefix)) {
        const key = attr.name.substring(5 + prefix.length).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        let value = attr.value;
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (value === 'null') value = null;
        else if (!isNaN(Number(value)) && !isNaN(parseFloat(value))) value = Number(value);
        attributes[key] = value;
      }
    });
    return attributes;
  };

  const obtainAxisLimit = (sourceElement, limitType) => {
    const rawVal = sourceElement.data('chart-x-axis-' + limitType);
    if (rawVal !== undefined) {
      if (sourceElement.data('chart-x-axis-type') === 'datetime') {
        return convertDateStringToTimestamp(rawVal);
      }
      return Number(rawVal);
    }
    return null;
  };

  lib.fn.chartGenerator = function() {

    this.each(function() {
      const currElement = lib(this);
      const tableConfig = extractDataAttributes(currElement);

      let targetDisplayArea;
      const placeBeforeElement = tableConfig.renderBeforeTarget === 1;

      if (placeBeforeElement) {
        currElement.before('<div></div>');
        targetDisplayArea = currElement.prev()[0];
      } else {
        const areaLocator = tableConfig.renderTarget;
        if (!areaLocator) {
          throw new Error("chart-render-target data attribute is required");
        }

        let resolvedArea;
        if (areaLocator.startsWith('#') || !areaLocator.includes('..')) {
          resolvedArea = lib(areaLocator);
        } else {
          let contextNode = currElement;
          let relativeLocator = areaLocator;

          while (relativeLocator.startsWith('.. ')) {
            relativeLocator = relativeLocator.substring(3);
            contextNode = contextNode.parent();
          }
          resolvedArea = lib(relativeLocator, contextNode);
        }

        if (resolvedArea.length !== 1) {
          throw new Error("Target display area not found or multiple elements match selector.");
        }
        targetDisplayArea = resolvedArea[0];
      }

      const chartTitle = lib('caption', currElement).first().text() || '';
      const defaultChartType = tableConfig.type;
      if (!defaultChartType || !permittedChartTypes.includes(defaultChartType)) {
        throw new Error("chart-type data attribute is mandatory and must be one of " + permittedChartTypes.join(', '));
      }
      const stackMode = tableConfig.stacking || 'normal';
      const dataLabelsActive = tableConfig.datalabelsEnabled;
      const chartInverted = tableConfig.inverted === 1;

      let axisYCount = 1;

      const headerCells = lib('thead th', currElement);
      let seriesDefinitions = [];
      let verticalLineMarkers = [];
      let hiddenColumnCount = 0;
      let chartIsStacked = false;

      headerCells.each(function(headerIndex, headerElem) {
        const headerJ = lib(headerElem);
        const headerProps = extractDataAttributes(headerJ);

        const isHeaderHidden = headerProps.skip === 1;
        if (isHeaderHidden) {
          hiddenColumnCount++;
          return;
        }

        const effectiveChartType = permittedChartTypes.includes(headerProps.type) ? headerProps.type : defaultChartType;
        const effectiveDataLabelsActive = headerProps.datalabelsEnabled !== undefined ? headerProps.datalabelsEnabled : dataLabelsActive;
        const effectiveYAxis = headerProps.yaxis !== undefined ? headerProps.yaxis : 0;

        if (effectiveYAxis === 1) {
          axisYCount = 2;
        }

        if (headerProps.stackGroup) {
          chartIsStacked = true;
        }

        if (headerProps.vlineX !== undefined) {
          verticalLineMarkers.push({
            label: headerJ.text(),
            xCoord: headerProps.vlineX,
            lineHeight: headerProps.vlineHeight,
            lineName: headerProps.vlineName,
            lineColor: headerProps.color,
            lineVisible: !headerProps.hidden
          });
        } else {
          seriesDefinitions.push({
            headerText: headerJ.text(),
            originalIndex: headerIndex,
            computedIndex: headerIndex - hiddenColumnCount - 1,
            seriesColor: headerProps.color,
            seriesVisible: !headerProps.hidden,
            seriesYAxis: effectiveYAxis,
            seriesDashStyle: headerProps.dashStyle || 'solid',
            seriesDataLabelsEnabled: effectiveDataLabelsActive,
            seriesDataLabelsColor: headerProps.datalabelsColor || tableConfig.datalabelsColor,
            valueScale: headerProps.valueScale !== undefined ? Number(headerProps.valueScale) : 1,
            seriesChartType: effectiveChartType === 'column' && chartInverted ? 'bar' : effectiveChartType,
            seriesStack: headerProps.stackGroup,
            seriesUnit: headerProps.unit,
            seriesData: []
          });
        }
      });

      const chartSeries = seriesDefinitions
        .filter(sDef => sDef.computedIndex >= 0)
        .map(sDef => {
          const itemConfig = {
            name: sDef.headerText + (sDef.seriesUnit ? ' (' + sDef.seriesUnit + ')' : ''),
            data: sDef.seriesData,
            type: sDef.seriesChartType,
            stack: sDef.seriesStack,
            color: sDef.seriesColor,
            visible: sDef.seriesVisible,
            yAxis: sDef.seriesYAxis,
            dashStyle: sDef.seriesDashStyle,
            marker: { enabled: false },
            dataLabels: {
              enabled: sDef.seriesDataLabelsEnabled,
              color: sDef.seriesDataLabelsColor,
              align: tableConfig.datalabelsAlign || (defaultChartType === 'column' && chartInverted ? undefined : 'center')
            }
          };

          if (sDef.seriesDataLabelsEnabled) {
            const labelFormatter = resolveFunctionPath(window, tableConfig.datalabelsFormatter);
            if (labelFormatter) {
              itemConfig.dataLabels.formatter = function() { return labelFormatter(this.y); };
            }
          }
          return itemConfig;
        });

      verticalLineMarkers.forEach(vLine => {
        chartSeries.push({
          name: vLine.label,
          data: [{ x: vLine.xCoord, y: 0, name: vLine.lineName }, { x: vLine.xCoord, y: vLine.lineHeight, name: vLine.lineName }],
          type: 'spline',
          color: vLine.lineColor,
          visible: vLine.lineVisible,
          marker: { enabled: false }
        });
      });

      const xCategories = [];
      const pointCallbackFn = resolveFunctionPath(window, tableConfig.pointCallback);
      const xAxisIsDatetime = tableConfig.xaxisType === 'datetime';

      lib('tbody:first tr', currElement).each(function(rowIndex, rowElem) {
        const rowJ = lib(rowElem);
        if (rowJ.data('chart-skip')) {
          return;
        }

        const dataCells = lib('td', rowElem);
        dataCells.each(function(cellIndex, cellElem) {
          const cellJ = lib(cellElem);
          const cellProps = extractDataAttributes(cellJ);

          const correspondingSeriesDef = seriesDefinitions.find(sd => sd.originalIndex === cellIndex);

          if (!correspondingSeriesDef) { // This cell might correspond to a skipped or vline header
            return;
          }

          if (cellIndex === 0) {
            xCategories.push(cellJ.text());
          } else {
            const targetSeriesObj = chartSeries[correspondingSeriesDef.computedIndex];

            if (!targetSeriesObj) return;

            const rawCellValue = cellJ.text();
            if (rawCellValue.length === 0) {
              if (!xAxisIsDatetime) {
                targetSeriesObj.data.push(null);
              }
            } else {
              const cleanedVal = rawCellValue.replace(/\s/g, '').replace(/,/, '.');
              const numericVal = Math.round(Number(cleanedVal) * correspondingSeriesDef.valueScale * 100) / 100;

              let pointXValue = cellProps.x;
              if (xAxisIsDatetime) {
                pointXValue = convertDateStringToTimestamp(lib('td', rowJ).first().text());
              }

              const pointObj = {
                name: cellProps.name !== undefined ? cellProps.name : rawCellValue,
                y: numericVal,
                x: pointXValue
              };

              if (pointCallbackFn) {
                pointObj.events = {
                  click: function() { return pointCallbackFn(this); }
                };
              }

              if (correspondingSeriesDef.seriesChartType === 'pie' && cellProps.itemHighlight) {
                pointObj.sliced = true;
              }

              if (cellProps.itemColor !== undefined) {
                pointObj.color = cellProps.itemColor;
              }

              targetSeriesObj.data.push(pointObj);
            }
          }
        });
      });

      const yAxisConfigurations = [];
      for (let i = 0; i < axisYCount; i++) {
        const axisId = i + 1;
        const axisSpecificConfig = {
          title: {
            text: tableConfig['yaxis' + axisId + 'TitleText'] !== undefined ? tableConfig['yaxis' + axisId + 'TitleText'] : null
          },
          max: tableConfig['yaxis' + axisId + 'Max'] !== undefined ? tableConfig['yaxis' + axisId + 'Max'] : null,
          min: tableConfig['yaxis' + axisId + 'Min'] !== undefined ? tableConfig['yaxis' + axisId + 'Min'] : null,
          reversed: tableConfig['yaxis' + axisId + 'Reversed'] === 1,
          opposite: tableConfig['yaxis' + axisId + 'Opposite'] === 1,
          tickInterval: tableConfig['yaxis' + axisId + 'TickInterval'] || null,
          labels: {
            rotation: tableConfig['yaxis' + axisId + 'Rotation'] || 0
          },
          startOnTick: tableConfig['yaxis' + axisId + 'StartOnTick'] !== 0,
          endOnTick: tableConfig['yaxis' + axisId + 'EndOnTick'] !== 0,
          stackLabels: {
            enabled: tableConfig['yaxis' + axisId + 'StacklabelsEnabled'] === 1
          },
          gridLineInterpolation: tableConfig['yaxis' + axisId + 'GridLineInterpolation'] || null
        };

        const axisLabelFormatter = resolveFunctionPath(window, tableConfig['yaxis' + axisId + 'FormatterCallback']);
        if (axisLabelFormatter) {
          axisSpecificConfig.labels.formatter = function() { return axisLabelFormatter(this.value); };
        }
        yAxisConfigurations.push(axisSpecificConfig);
      }

      const baseColors = [
        '#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE',
        '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92'
      ];
      const chartColors = [];

      const highchartsThemeColors = (typeof Highcharts !== 'undefined' && Highcharts.theme && Highcharts.theme.colors) ? Highcharts.theme.colors : [];
      const colorCount = Math.max(baseColors.length, highchartsThemeColors.length);

      for (let i = 0; i < colorCount; i++) {
        const customColorKey = 'color' + (i + 1);
        chartColors.push(
          tableConfig[customColorKey] !== undefined ? tableConfig[customColorKey] :
          highchartsThemeColors[i] !== undefined ? highchartsThemeColors[i] :
          baseColors[i]
        );
      }

      const xAxisLabelStyleOptions = {};
      if (tableConfig.xaxisLabelsFontSize !== undefined) {
        xAxisLabelStyleOptions.fontSize = tableConfig.xaxisLabelsFontSize;
      }

      const finalChartSettings = {
        colors: chartColors,
        chart: {
          renderTo: targetDisplayArea,
          inverted: chartInverted,
          marginTop: tableConfig.marginTop !== undefined ? tableConfig.marginTop : null,
          marginRight: tableConfig.marginRight !== undefined ? tableConfig.marginRight : null,
          marginBottom: tableConfig.marginBottom !== undefined ? tableConfig.marginBottom : null,
          marginLeft: tableConfig.marginLeft !== undefined ? tableConfig.marginLeft : null,
          spacingTop: tableConfig.spacingTop || 10,
          height: tableConfig.height || null,
          zoomType: tableConfig.zoomType || null,
          polar: tableConfig.polar || null
        },
        title: {
          text: chartTitle
        },
        subtitle: {
          text: tableConfig.subtitleText || ''
        },
        legend: {
          enabled: tableConfig.legendDisabled !== 1,
          layout: tableConfig.legendLayout || 'horizontal',
          symbolWidth: tableConfig.legendWidth || 30,
          x: tableConfig.legendX || 15,
          y: tableConfig.legendY || 0
        },
        xAxis: {
          categories: xAxisIsDatetime ? undefined : xCategories,
          type: xAxisIsDatetime ? 'datetime' : undefined,
          reversed: tableConfig.xaxisReversed === 1,
          opposite: tableConfig.xaxisOpposite === 1,
          showLastLabel: tableConfig.xaxisShowLastLabel !== undefined ? tableConfig.xaxisShowLastLabel : true,
          tickInterval: tableConfig.xaxisTickInterval || null,
          dateTimeLabelFormats: {
            second: '%e. %b', minute: '%e. %b', hour: '%e. %b',
            day: '%e. %b', week: '%e. %b', month: '%e. %b', year: '%e. %b'
          },
          labels: {
            rotation: tableConfig.xaxisRotation || 0,
            align: tableConfig.xaxisAlign || 'center',
            enabled: tableConfig.xaxisLabelsEnabled !== undefined ? tableConfig.xaxisLabelsEnabled : true,
            style: xAxisLabelStyleOptions
          },
          startOnTick: tableConfig.xaxisStartOnTick,
          endOnTick: tableConfig.xaxisEndOnTick,
          min: obtainAxisLimit(currElement, 'min'),
          max: obtainAxisLimit(currElement, 'max'),
          alternateGridColor: tableConfig.xaxisAlternateGridColor || null,
          title: {
            text: tableConfig.xaxisTitleText || null
          },
          gridLineWidth: tableConfig.xaxisGridLineWidth || 0,
          gridLineDashStyle: tableConfig.xaxisGridLineStyle || 'ShortDot',
          tickmarkPlacement: tableConfig.xaxisTickmarkPlacement || 'between',
          lineWidth: tableConfig.xaxisLineWidth || 0
        },
        yAxis: yAxisConfigurations,
        tooltip: {
          formatter: function() {
            if (xAxisIsDatetime) {
              return '<b>' + this.series.name + '</b><br/>' + Highcharts.dateFormat('%e. %b', this.x) + ' : ' + this.y;
            } else {
              const displayXValue = xCategories[this.point.x] !== undefined ? xCategories[this.point.x] : this.point.x;
              if (defaultChartType === 'pie') {
                return '<strong>' + this.series.name + '</strong><br />' + displayXValue + ' : ' + this.point.y;
              }
              return '<strong>' + this.series.name + '</strong><br />' + displayXValue + ' : ' + this.point.name;
            }
          }
        },
        credits: {
          enabled: false
        },
        plotOptions: {
          line: {
            dataLabels: { enabled: true },
            lineWidth: tableConfig.lineWidth || 2
          },
          area: {
            lineWidth: tableConfig.lineWidth || 2,
            shadow: tableConfig.lineShadow !== undefined ? tableConfig.lineShadow : true,
            fillOpacity: tableConfig.areaFillOpacity || 0.75
          },
          pie: {
            allowPointSelect: true,
            dataLabels: { enabled: true },
            showInLegend: tableConfig.pieShowInLegend === 1,
            size: '80%'
          },
          series: {
            animation: false,
            stickyTracking: false,
            stacking: chartIsStacked ? stackMode : null,
            groupPadding: tableConfig.groupPadding || 0
          }
        },
        series: chartSeries,
        exporting: {
          filename: chartTitle.replace(/ /g, '_'),
          buttons: {
            exportButton: {
              menuItems: null,
              onclick: function() {
                this.exportChart();
              }
            }
          }
        }
      };

      currElement.trigger('chartGenerator.beforeRender', finalChartSettings);
      new Highcharts.Chart(finalChartSettings);
    });
    return this;
  };

})(jQuery);