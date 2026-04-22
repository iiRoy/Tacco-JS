'use strict';

const transferAttributes = (originObject, destinationObject, targetKeys) => {
  targetKeys.forEach(attributeKey => {
    if (originObject.hasOwnProperty(attributeKey)) {
      destinationObject[attributeKey] = originObject[attributeKey];
    }
  });
};

const periodConfigurations = new Map();

periodConfigurations.set('day', {
  keysToCopy: ['vitals', 'results', 'symptoms', 'pain', 'mood', 'energy', 'conditions', 'levels'],
  additionalOperations: (retrievedPayload, viewContext) => {
    viewContext.medicaments = retrievedPayload.timeline_medications;
    viewContext.displayFormat = 'yyyy/d/MM';
  }
});

periodConfigurations.set('week', {
  keysToCopy: ['vitals', 'symptoms', 'levels', 'conditions', 'observations', 'start_date', 'end_date'],
  additionalOperations: null
});

periodConfigurations.set('month', {
  keysToCopy: ['vitals', 'symptoms', 'medications', 'conditions', 'encounters', 'start_date', 'end_date'],
  additionalOperations: null
});

periodConfigurations.set('year', { 
  keysToCopy: ['vitals', 'symptoms', 'conditions', 'treatments', 'start_date', 'end_date'],
  additionalOperations: null
});

periodConfigurations.set('decade', {
  keysToCopy: ['vitals', 'symptoms', 'conditions', 'levels', 'start_date', 'end_date'],
  additionalOperations: (retrievedPayload, viewContext) => {
    viewContext.numericToolkit = window.Math;
    viewContext.computeDateOffset = (dataEntry) => {
      const offsetValue = (dataEntry.date * 1000 - (1.01e+12)) / (315569259747 / 460);
      return { 'left' : offsetValue + 'px' };
    };
  }
});

const initializeTimelineViewer = (viewContext, apiGateway, periodIdentifier) => {
  const currentConfig = periodConfigurations.get(periodIdentifier);
  if (!currentConfig) {
    console.error(`No configuration found for period: ${periodIdentifier}`);
    return;
  }

  const endpointPath = `http://hreader.local/timeline.json?page=${periodIdentifier}`;

  apiGateway.retrieveResource(endpointPath, { noCache: true })
    .then(dataPayload => {
      transferAttributes(dataPayload, viewContext, currentConfig.keysToCopy);
      if (currentConfig.additionalOperations) {
        currentConfig.additionalOperations(dataPayload, viewContext);
      }
    })
    .catch(errorResult => {
      console.error(`Failed to load data for ${periodIdentifier}:`, errorResult);
    });
};

function DayPresenter(contextState, networkClient) {
  initializeTimelineViewer(contextState, networkClient, 'day');
}

function WeekPresenter(contextState, networkClient) {
  initializeTimelineViewer(contextState, networkClient, 'week');
}

function MonthPresenter(contextState, networkClient) {
  initializeTimelineViewer(contextState, networkClient, 'month');
}

function YearPresenter(contextState, networkClient) { 
  initializeTimelineViewer(contextState, networkClient, 'year');
}

function DecadePresenter(contextState, networkClient) {
  initializeTimelineViewer(contextState, networkClient, 'decade');
}