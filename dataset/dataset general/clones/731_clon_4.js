let processActive = false;
let outputCollection = [];

function manageInterfaceElements(enableFlag) {
  document.querySelectorAll('.actionControl').forEach(element => {
    element.disabled = !enableFlag;
  });
}

function executeDiscoveryProcedure(postDiscoveryAction) {
  const queryInputElement = document.getElementById('queryInput');
  const currentQueryValue = queryInputElement ? queryInputElement.value.trim() : "";

  if (!processActive && currentQueryValue !== "") {
    processActive = true;
    outputCollection = [];
    manageInterfaceElements(false);

    fetch('/index-data.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Data retrieval issue: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(sourceInformation => {
        const queryPhrases = currentQueryValue.toLowerCase().split(/\s+/);
        const termIndex = sourceInformation.termIndex;
        const documentDetails = sourceInformation.documentDetails;

        const aggregateFindings = Object.keys(termIndex).reduce((accumulatedResults, indexedTerm) => {
          const matchedQueryFragments = queryPhrases.filter(queryFragment => {
            let matchPattern = queryFragment;
            if (queryFragment.length > 2) {
              try {
                matchPattern = new RegExp(queryFragment.split('').join('\\w*').replace(/\W/, ""), 'i');
              } catch (patternError) {
                // Fall back to string comparison if regex creation fails
              }
            }
            return indexedTerm.match(matchPattern);
          });

          if (matchedQueryFragments.length > 0) {
            termIndex[indexedTerm].forEach(indexedEntry => {
              const documentIdentifier = indexedEntry.u;
              if (documentDetails[documentIdentifier]) {
                if (!accumulatedResults[documentIdentifier]) {
                  accumulatedResults[documentIdentifier] = {
                    scoreTotal: 0.0,
                    titleText: documentDetails[documentIdentifier].t,
                    resourceURL: documentDetails[documentIdentifier].u
                  };
                }
                accumulatedResults[documentIdentifier].scoreTotal += parseFloat(indexedEntry.s);
              }
            });
          }
          return accumulatedResults;
        }, {});

        const sortedIdentifiers = Object.keys(aggregateFindings).sort((firstId, secondId) => {
          const firstItem = aggregateFindings[firstId];
          const secondItem = aggregateFindings[secondId];

          const comparisonValue = secondItem.scoreTotal - firstItem.scoreTotal;
          if (comparisonValue === 0.0) {
            return firstItem.titleText.localeCompare(secondItem.titleText);
          } else {
            return comparisonValue;
          }
        });

        outputCollection = sortedIdentifiers.map(id => aggregateFindings[id]);

        postDiscoveryAction();
      })
      .catch(operationError => {
        console.error("Discovery operation failed:", operationError);
      })
      .finally(() => {
        processActive = false;
        manageInterfaceElements(true);
      });
  }
}