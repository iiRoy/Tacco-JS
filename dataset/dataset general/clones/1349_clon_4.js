const constructPerformanceOverview = (
  projectDataServiceAgent,
  momentFormatter,
  navigationRouter,
  tableManagementSystemFactory
) => {
  let activeProjectRecords = [];
  let areaGraphConfiguration = {};
  let pieChartConfiguration = {};

  const gridHandler = tableManagementSystemFactory(
    {
      pageIndex: 1,
      itemCapacity: 10,
      sortOrder: {
        projectLabel: 'ascending'
      }
    }
  );

  const determineSuccessRatio = (outcomeList) => {
    if (!outcomeList || outcomeList.length === 0) return 0;
    const successfulCount = outcomeList.filter(
      (individualOutcome) => individualOutcome.status === 'Success'
    ).length;
    return Math.floor((successfulCount / outcomeList.length) * 100);
  };

  const transformProjectData = (sourceData) => {
    const enrichedRecords = sourceData.map((originalEntry) => {
      const successMetric = determineSuccessRatio(originalEntry.results);
      return {
        uniqueIdentifier: originalEntry.id,
        projectLabel: originalEntry.name,
        creationTimestamp: new Date(originalEntry.created_date),
        successPercentage: successMetric,
        detailedOutcomes: originalEntry.results
      };
    });

    const totalSuccessSum = enrichedRecords.reduce(
      (accumulator, record) => accumulator + record.successPercentage,
      0
    );
    const overallAverageSuccess =
      enrichedRecords.length > 0
        ? Math.floor(totalSuccessSum / enrichedRecords.length)
        : 0;

    return { enrichedRecords, overallAverageSuccess };
  };

  const generateAreaChartSettings = (dataPoints) => {
    return {
      visualOptions: {
        chartType: 'area',
        interactiveZoom: 'x'
      },
      infoDisplay: {
        contentFormatter: (pointInfo) => {
          const projectTitle = pointInfo.projectLabel;
          const successValue = pointInfo.successPercentage;
          const creationMoment = momentFormatter(pointInfo.creationTimestamp, 'medium');
          return `Project: ${projectTitle}<br/>Success Rate: ${successValue}%<br/>Start Date: ${creationMoment}`;
        },
        styleAttributes: {
          paddingSize: 10,
          fontWeight: 'bold'
        }
      },
      seriesConfiguration: {
        seriesDefaults: {
          interactionPointer: 'pointer',
          pointInteraction: {
            actionTriggers: {
              clickEvent: (eventContext) => {
                navigationRouter.navigateTo(`/campaigns/${eventContext.uniqueIdentifier}`);
              }
            }
          }
        }
      },
      horizontalAxisSettings: {
        axisType: 'datetime',
        maxValue: Date.now(),
        axisLabel: {
          displayText: 'Timeline'
        }
      },
      dataSeries: [
        {
          seriesName: 'Project Performance',
          dataValues: dataPoints
        }
      ],
      chartTitle: {
        textValue: 'Project Success Overview'
      },
      chartDimensions: {
        heightInPixels: 300
      },
      creditDisplay: {
        enabledState: false
      },
      loadingIndicator: false
    };
  };

  const generatePieChartSettings = (averageValue) => {
    return {
      visualOptions: {
        chartType: 'pie'
      },
      infoDisplay: {
        contentFormatter: (pointInfo) => `${pointInfo.valuePercentage}%`,
        styleAttributes: {
          paddingSize: 10,
          fontWeight: 'bold'
        }
      },
      seriesConfiguration: {
        pieSliceDefaults: {
          innerRadius: '60%',
          selectable: true,
          interactionPointer: 'pointer',
          labelVisibility: {
            enabledState: false
          },
          showInLegend: true
        }
      },
      dataSeries: [
        {
          dataValues: [
            {
              label: 'Successful Activities',
              colorCode: '#e74c3c',
              valuePercentage: averageValue
            },
            {
              label: 'Unsuccessful Activities',
              colorCode: '#7cb5ec',
              valuePercentage: 100 - averageValue
            }
          ]
        }
      ],
      chartTitle: {
        textValue: 'Average Project Results'
      },
      chartDimensions: {
        heightInPixels: 300
      },
      creditDisplay: {
        enabledState: false
      },
      loadingIndicator: false
    };
  };

  const loadAndPrepareDashboardData = (tableDataResolver, tableRequestParameters) => {
    projectDataServiceAgent.retrieveCampaigns((rawCampaigns) => {
      const { enrichedRecords, overallAverageSuccess } = transformProjectData(rawCampaigns);

      activeProjectRecords = enrichedRecords;

      areaGraphConfiguration = generateAreaChartSettings(
        enrichedRecords.map(record => ({
            uniqueIdentifier: record.uniqueIdentifier,
            projectLabel: record.projectLabel,
            creationTimestamp: record.creationTimestamp,
            successPercentage: record.successPercentage
        }))
      );
      pieChartConfiguration = generatePieChartSettings(overallAverageSuccess);

      gridHandler.ingestDataSource(enrichedRecords);
      gridHandler.processPagedData(tableDataResolver, tableRequestParameters, enrichedRecords.length);
    });
  };

  return {
    initializeDataDisplay: loadAndPrepareDashboardData,
    getCurrentProjectList: () => activeProjectRecords,
    getAreaGraphConfig: () => areaGraphConfiguration,
    getPieChartConfig: () => pieChartConfiguration,
    getGridSystem: () => gridHandler
  };
};

const createTableManagementSystem = (initialState) => {
    let currentPageIndex = initialState.pageIndex;
    let currentItemCapacity = initialState.itemCapacity;
    let currentSortingCriteria = initialState.sortOrder;
    let fullDataSource = [];

    const setPageIndex = (newPageIndex) => { currentPageIndex = newPageIndex; };
    const setItemCapacity = (newItemCapacity) => { currentItemCapacity = newItemCapacity; };
    const setSorting = (newSorting) => { currentSortingCriteria = newSorting; };

    return {
        ingestDataSource: (data) => {
            fullDataSource = data;
        },
        processPagedData: (resolver, options, actualTotalLength) => {
            setPageIndex(options.queryPageIndex());
            setItemCapacity(options.queryItemCount());

            const effectiveTotalForDisplay = Math.min(actualTotalLength, 5);
            options.setTotalItems(effectiveTotalForDisplay);

            let dataToResolve = [...fullDataSource];
            if (currentSortingCriteria && currentSortingCriteria.projectLabel) {
                const sortKey = 'projectLabel';
                const sortDirection = currentSortingCriteria.projectLabel === 'ascending' ? 1 : -1;
                dataToResolve.sort((a, b) => {
                    const valA = a[sortKey] || '';
                    const valB = b[sortKey] || '';
                    if (valA < valB) return -1 * sortDirection;
                    if (valA > valB) return 1 * sortDirection;
                    return 0;
                });
            }
            dataToResolve = dataToResolve.slice(0, effectiveTotalForDisplay);

            resolver.fulfillWithData(dataToResolve);
        },
        queryParameters: () => ({
            queryPageIndex: () => currentPageIndex,
            queryItemCount: () => currentItemCapacity,
            querySorting: () => currentSortingCriteria,
            // setTotalItems is expected to be provided by the consumer (mimicking params.total)
            setTotalItems: (total) => { console.warn("setTotalItems should be provided by the consumer (e.g., UI component)."); }
        }),
    };
};