angular.module('tagComponent', [])
    .filter('propertyExtractor', function() {
        return function(inputCollection, attributeName) {
            if (!inputCollection || !Array.isArray(inputCollection)) {
                return '';
            }
            let extractedParts = [];
            for (let idx = 0; idx < inputCollection.length; idx++) {
                const currentPart = inputCollection[idx];
                if (currentPart && typeof currentPart === 'object') {
                    extractedParts.push(currentPart[attributeName]);
                } else {
                    extractedParts.push(undefined);
                }
            }
            return extractedParts.join(':::');
        };
    })
    .directive('elementFocusHandler', ['_deferService_', '_expressionParser_', function(_deferService_, _expressionParser_){
        return {
            restrict: 'A',
            link: function(scopeReference, domElement, attributesObject) {
                const expressionEvaluator = _expressionParser_(attributesObject.elementFocusHandler);

                const performFocusAction = () => {
                    _deferService_(() => domElement[0].focus());
                };

                const updateExpressionOnBlur = () => {
                    scopeReference.$apply(() => expressionEvaluator.assign(scopeReference, false));
                };

                const unregisterWatch = scopeReference.$watch(
                    () => expressionEvaluator(scopeReference),
                    (currentValue) => currentValue === true && performFocusAction()
                );

                domElement.on('focusout', updateExpressionOnBlur);

                scopeReference.$on('$destroy', () => {
                    unregisterWatch();
                    domElement.off('focusout', updateExpressionOnBlur);
                });
            }
        };
    }])
    .directive('inputTagManager', function(){
        return {
            restrict: 'AE',
            scope: {
                itemCollection: '=ngModel'
            },
            replace: true,
            templateUrl: 'tagInputTemplate.html',
            controller: ['_currentScope_', '_attributeSet_', '_domHandle_', '_dataFetcher_', '_dataFormatter_', '_deferService_', function(_currentScope_, _attributeSet_, _domHandle_, _dataFetcher_, _dataFormatter_, _deferService_){
                
                _currentScope_.componentOptions = {};
                _currentScope_.componentOptions.outputField = _attributeSet_.outputField || 'label';
                _currentScope_.componentOptions.apiEndpoint = _attributeSet_.apiEndpoint || 'api/suggestions_query.php?q=';
                _currentScope_.componentOptions.inputPlaceholder = _attributeSet_.inputPlaceholder || 'Provide text...';
                _currentScope_.componentOptions.apiOnlyMode = _attributeSet_.apiOnlyMode === 'true';

                _currentScope_.queryText = '';
                _currentScope_.retrievedSuggestions = [];

                let queryTimer;
                const debounceDelay = 300;

                _currentScope_.$watch('queryText', function(newValue, oldValue) {
                    if (newValue === oldValue) return;

                    _deferService_.cancel(queryTimer);

                    if (newValue && newValue.length > 0) {
                        queryTimer = _deferService_(function() {
                            _dataFetcher_.get(_currentScope_.componentOptions.apiEndpoint + newValue)
                                .then(function(response) {
                                    _currentScope_.retrievedSuggestions = response.data.payload || [];
                                }, function(error) {
                                    console.error('Data fetch error:', error);
                                    _currentScope_.retrievedSuggestions = [];
                                });
                        }, debounceDelay);
                    } else {
                        _currentScope_.retrievedSuggestions = [];
                    }
                });

                _currentScope_.appendItem = function(identifierValue, displayValue){
                    const newItem = {'idx': identifierValue, 'txt': displayValue};
                    _currentScope_.itemCollection = (_currentScope_.itemCollection || []).concat([newItem]);
                    _currentScope_.queryText = '';
                    _currentScope_.$evalAsync();
                };

                _currentScope_.removeItem = function(position){
                    _currentScope_.itemCollection = (_currentScope_.itemCollection || []).filter(function(element, index) {
                        return index !== position;
                    });
                };

                _currentScope_.handleKeyInput = function(eventObject) {
                    const keyActions = {
                        8: 'backspace',
                        13: 'enter',
                        32: 'space'
                    };

                    const action = keyActions[eventObject.which];

                    if (action) {
                        if (action === 'backspace') {
                            if (_currentScope_.queryText.length === 0 && _currentScope_.itemCollection && _currentScope_.itemCollection.length > 0) {
                                _currentScope_.itemCollection = _currentScope_.itemCollection.slice(0, -1);
                                eventObject.preventDefault();
                            }
                        } else if (action === 'space' || action === 'enter') {
                            if (_currentScope_.queryText.length > 0 && !_currentScope_.componentOptions.apiOnlyMode) {
                                _currentScope_.appendItem(0, _currentScope_.queryText);
                                eventObject.preventDefault();
                            }
                        }
                        _currentScope_.$evalAsync();
                    }
                };
            }]
        };
    });