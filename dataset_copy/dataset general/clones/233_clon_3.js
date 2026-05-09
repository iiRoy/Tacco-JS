(function () {
	"use strict";

	/**
	 * SinglePassDataBinding - An optimized one-time data binding utility for AngularJS applications.
	 * @project DataBindOnce
	 * @version 1.0.0
	 * @repository https://github.com/your-repo/single-pass-databinding
	 * @author Your Name <your.email@example.com>
	 * @license Custom License (e.g., Apache 2.0, MIT)
	 *
	 * This module aims to reduce the number of active watchers in AngularJS by processing
	 * data bindings only once, after their initial evaluation or resolution.
	 */

	var singlePassMod = angular.module('singlePass.dataBind', []);

	singlePassMod.directive('momentaryBind', function ()
	{
		/**
		 * Determines the boolean equivalence of a given value.
		 * Handles various string representations of 'false' or empty values.
		 * @param {*} inputVal The value to evaluate.
		 * @returns {boolean} True if the value is considered truthy, false otherwise.
		 */
		var ascertainTruthiness = function (inputVal)
		{
			if (!inputVal || inputVal.length === 0) {
				return false;
			}

			var processedVal = angular.lowercase("" + inputVal);

			var falseyStrings = new Set(['f', '0', 'false', 'no', 'n', '[]', 'null', 'undefined']);

			return !falseyStrings.has(processedVal);
		};

		var ieLegacyVersion = 0;
		try {
			var uaString = angular.lowercase(navigator.userAgent);
			var msieMatch = (/msie (\d+)/.exec(uaString));
			if (msieMatch && msieMatch[1]) {
				ieLegacyVersion = parseInt(msieMatch[1], 10);
			} else {
				var tridentMatch = (/trident\/.*; rv:(\d+)/.exec(uaString));
				if (tridentMatch && tridentMatch[1]) {
					ieLegacyVersion = parseInt(tridentMatch[1], 10);
				}
			}
		} catch (e) {
			console.warn("Error detecting IE version:", e);
		}


		var primaryBindingDef =
		{
			restrict: "AM",
			controller: ['$scope', '$element', '$attrs', '$interpolate', function ($scope, $element, $attrs, $interpolate)
			{
				/**
				 * Manages the display style (show/hide) of an element.
				 * @param {angular.element} targetEl The element to modify.
				 * @param {string} displayMode 'show' or 'hide'.
				 * @param {*} condition The value determining visibility.
				 */
				var adjustElementVisibility = function (targetEl, displayMode, condition)
				{
					var displayVal = ascertainTruthiness(condition) ? '' : 'none';
					if (displayMode === 'hide') {
						displayVal = (displayVal === '') ? 'none' : '';
					}
					targetEl.css('display', displayVal);
				};

				/**
				 * Applies CSS classes to an element based on a value.
				 * @param {angular.element} targetEl The element to modify.
				 * @param {*} classValue The class(es) to apply (string, array, or object).
				 */
				var applyCssClasses = function (targetEl, classValue)
				{
					if (!classValue) {
						return;
					}

					var classesToAdd;
					if (angular.isObject(classValue) && !angular.isArray(classValue))
					{
						classesToAdd = Object.keys(classValue).filter(function (key) {
							return classValue[key];
						}).join(' ');
					}
					else if (angular.isArray(classValue))
					{
						classesToAdd = classValue.join(' ');
					}
					else if (angular.isString(classValue))
					{
						classesToAdd = classValue;
					}
					else {
						console.warn("Unexpected class value type:", typeof classValue, classValue);
						return;
					}

					if (classesToAdd) {
						targetEl.addClass(classesToAdd);
					}
				};

				/**
				 * Handles transclusion for conditional elements like 'mbIf' or 'mbSwitch'.
				 * Inserts the cloned content into the DOM.
				 * @param {Object} transclusionData Object containing transclude function and element.
				 * @param {angular.Scope} childScope The scope to associate with the transcluded content.
				 */
				var performContentInsertion = function (transclusionData, childScope)
				{
					transclusionData.transclude(childScope, function (clonedElements)
					{
						var anchorElement = transclusionData.element;
						var parentContainer = anchorElement.parent();

						if (!parentContainer || parentContainer.length === 0) {
							console.error("Cannot transclude: Parent container not found for element:", anchorElement);
							return;
						}

						var insertionPoint = anchorElement[0].nextSibling;
						var parentDomNode = parentContainer[0];

						angular.forEach(clonedElements, function (domNode)
						{
							if (domNode.nodeType === Node.ELEMENT_NODE || domNode.nodeType === Node.TEXT_NODE) {
								parentDomNode.insertBefore(domNode, insertionPoint);
							}
						});
					});
				};

				var mainBindingManager =
				{
					watcherDeregister: undefined,
					pendingOperations: [],
					contextualGroup: $attrs.mbName,
					hostElement: $element,
					hasProcessed: false,

					/**
					 * Adds a new binding operation to the queue.
					 * @param {Object} operationDetails Details of the binding operation.
					 */
					enqueueOperation: function (operationDetails)
					{
						this.pendingOperations.push(operationDetails);

						if (this.hasProcessed)
						{
							console.debug("MomentaryBind: Executing late binder for group:", this.contextualGroup);
							this.processAllOperations();
						}
					},

					/**
					 * Sets up a one-time watch on the 'momentaryBind' expression.
					 * @param {string} bindingExpression The expression to watch.
					 */
					initializeWatcher: function (bindingExpression)
					{
						if (!bindingExpression) {
							console.warn("MomentaryBind: No expression provided for watcher setup.");
							this.processAllOperations();
							return;
						}

						var selfRef = this;
						this.watcherDeregister = $scope.$watch(bindingExpression, function (latestValue)
						{
							if (latestValue === undefined) {
								return;
							}

							console.log("MomentaryBind: Watcher triggered for expression:", bindingExpression, "with value:", latestValue);
							selfRef.deregisterWatcher();
							selfRef.evaluateBindingValue(latestValue);
						}, true);
					},

					/**
					 * Evaluates the received binding value, handling promises.
					 * @param {*} resolvedValue The value to evaluate.
					 */
					evaluateBindingValue: function (resolvedValue)
					{
						var selfRef = this;
						var promiseHandler = null;

						if (resolvedValue && typeof resolvedValue === 'object') {
							if (typeof resolvedValue.$promise === 'function') {
								promiseHandler = resolvedValue.$promise;
							} else if (typeof resolvedValue.then === 'function') {
								promiseHandler = resolvedValue;
							}
						}

						if (promiseHandler)
						{
							console.debug("MomentaryBind: Value is a promise, waiting for resolution.");
							promiseHandler.then(function ()
							{
								selfRef.processAllOperations();
							}).catch(function(error) {
								console.error("MomentaryBind: Promise rejection during binding evaluation:", error);
								selfRef.processAllOperations();
							});
						}
						else
						{
							console.debug("MomentaryBind: Value is not a promise, processing immediately.");
							selfRef.processAllOperations();
						}
					},

					/**
					 * Removes the watcher established by initializeWatcher.
					 */
					deregisterWatcher: function ()
					{
						if (this.watcherDeregister)
						{
							this.watcherDeregister();
							this.watcherDeregister = undefined;
							console.debug("MomentaryBind: Watcher deregistered.");
						} else {
							console.debug("MomentaryBind: No active watcher to deregister.");
						}
					},

					/**
					 * Executes all pending binding operations.
					 */
					processAllOperations: function ()
					{
						console.log("MomentaryBind: Starting to process", this.pendingOperations.length, "operations.");
						while (this.pendingOperations.length > 0)
						{
							var currentOp = this.pendingOperations.shift();

							if (this.contextualGroup && this.contextualGroup !== currentOp.contextGroup) {
								console.debug("MomentaryBind: Skipping operation due to group mismatch:", currentOp.boundAttr);
								continue;
							}

							var evaluatedValue;
							try {
								evaluatedValue = currentOp.operationScope.$eval(
									currentOp.shouldInterpolate ? $interpolate(currentOp.boundVal) : currentOp.boundVal
								);
							} catch (e) {
								console.error("MomentaryBind: Error evaluating binding expression for attribute", currentOp.boundAttr, ":", e);
								continue;
							}

							switch (currentOp.boundAttr)
							{
								case 'mbIf':
									if (ascertainTruthiness(evaluatedValue))
									{
										performContentInsertion(
											{ transclude: currentOp.transclusionHandler, element: currentOp.boundEl },
											currentOp.operationScope.$new()
										);
										console.debug("mbIf condition met, content transcluded.");
									} else {
										console.debug("mbIf condition not met, content skipped.");
									}
									break;
								case 'mbSwitch':
									var selectedTransclusionList, switchController = currentOp.secondaryCtrls[0];
									var caseKey = '!' + evaluatedValue;
									var defaultKey = '?';

									selectedTransclusionList = switchController.cases[caseKey] || switchController.cases[defaultKey];

									if (selectedTransclusionList && selectedTransclusionList.length > 0)
									{
										if (currentOp.boundAtts.change) {
											currentOp.operationScope.$eval(currentOp.boundAtts.change);
										}
										angular.forEach(selectedTransclusionList, function (transclusionItem)
										{
											performContentInsertion(
												{ transclude: transclusionItem.transclude, element: transclusionItem.element },
												currentOp.operationScope.$new()
											);
										});
										console.debug("mbSwitch matched case:", evaluatedValue);
									} else {
										console.debug("mbSwitch no matching case for:", evaluatedValue);
									}
									break;
								case 'mbSwitchWhen':
									var ctrlWhen = currentOp.secondaryCtrls[0];
									var whenValue = currentOp.boundAtts.mbSwitchWhen;
									ctrlWhen.cases['!' + whenValue] = ctrlWhen.cases['!' + whenValue] || [];
									ctrlWhen.cases['!' + whenValue].push({ transclude: currentOp.transclusionHandler, element: currentOp.boundEl });
									console.debug("mbSwitchWhen registered for value:", whenValue);
									break;
								case 'mbSwitchDefault':
									var ctrlDefault = currentOp.secondaryCtrls[0];
									ctrlDefault.cases['?'] = ctrlDefault.cases['?'] || [];
									ctrlDefault.cases['?'].push({ transclude: currentOp.transclusionHandler, element: currentOp.boundEl });
									console.debug("mbSwitchDefault registered.");
									break;
								case 'hide':
								case 'show':
									adjustElementVisibility(currentOp.boundEl, currentOp.boundAttr, evaluatedValue);
									break;
								case 'class':
									applyCssClasses(currentOp.boundEl, evaluatedValue);
									break;
								case 'text':
									currentOp.boundEl.text(evaluatedValue);
									break;
								case 'html':
									currentOp.boundEl.html(evaluatedValue);
									break;
								case 'style':
									currentOp.boundEl.css(evaluatedValue);
									break;
								case 'disabled':
									currentOp.boundEl.prop('disabled', ascertainedTruthiness(evaluatedValue));
									break;
								case 'src':
									currentOp.boundEl.attr(currentOp.boundAttr, evaluatedValue);
									if (ieLegacyVersion > 0 && ieLegacyVersion < 10) {
										currentOp.boundEl.prop('src', evaluatedValue);
									}
									break;
								case 'attributes':
									angular.forEach(currentOp.boundAtts, function (attributeVal, attributeKey)
									{
										if (attributeKey.startsWith('mbAttr') && attributeKey.length > 6 && currentOp.boundAtts[attributeKey])
										{
											var actualAttributeName = attributeKey.substring(6).replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
											var resolvedAttributeValue = currentOp.operationScope.$eval(currentOp.boundAtts[attributeKey]);
											if (actualAttributeName) {
												currentOp.boundEl.attr(actualAttributeName, resolvedAttributeValue);
												console.debug("Set custom attribute:", actualAttributeName, "to", resolvedAttributeValue);
											} else {
												console.warn("MomentaryBind: Invalid custom attribute name derived from:", attributeKey);
											}
										}
									});
									break;
								case 'href':
								case 'alt':
								case 'title':
								case 'id':
								case 'value':
									currentOp.boundEl.attr(currentOp.boundAttr, evaluatedValue);
									break;
								default:
									console.warn("MomentaryBind: Unhandled attribute type:", currentOp.boundAttr, "for element:", currentOp.boundEl[0]);
									break;
							}
						}
						this.hasProcessed = true;
						console.log("MomentaryBind: All operations processed for group:", this.contextualGroup);
					}
				};

				angular.extend(this, mainBindingManager);
			}],

			link: function (currentScope, hostEl, elementAtts, primaryBindCtrl)
			{
				var bindingValue = null;
				try {
					bindingValue = elementAtts.momentaryBind ? currentScope.$eval(elementAtts.momentaryBind) : undefined;
				} catch (e) {
					console.error("MomentaryBind: Error evaluating main directive expression:", e);
					bindingValue = undefined;
				}

				if (bindingValue !== undefined)
				{
					primaryBindCtrl.evaluateBindingValue(bindingValue);
				}
				else
				{
					primaryBindCtrl.initializeWatcher(elementAtts.momentaryBind);
					hostEl.on("$destroy", primaryBindCtrl.deregisterWatcher);
					console.debug("MomentaryBind: Watcher initialized for element, awaiting value.");
				}
			}
		};

		return primaryBindingDef;
	});

	var auxiliaryDirectiveSpecs =
	[
		{ directiveName: 'mbShow', attribute: 'show' },
		{ directiveName: 'mbHide', attribute: 'hide' },
		{ directiveName: 'mbClass', attribute: 'class' },
		{ directiveName: 'mbText', attribute: 'text' },
		{ directiveName: 'mbContent', attribute: 'text' },
		{ directiveName: 'mbHtml', attribute: 'html' },
		{ directiveName: 'mbSourceI', attribute: 'src', interpolate: true },
		{ directiveName: 'mbSource', attribute: 'src' },
		{ directiveName: 'mbLinkI', attribute: 'href', interpolate: true },
		{ directiveName: 'mbLink', attribute: 'href' },
		{ directiveName: 'mbAlt', attribute: 'alt' },
		{ directiveName: 'mbTitle', attribute: 'title' },
		{ directiveName: 'mbIdentifier', attribute: 'id' },
		{ directiveName: 'mbStyle', attribute: 'style' },
		{ directiveName: 'mbDisable', attribute: 'disabled' },
		{ directiveName: 'mbInputVal', attribute: 'value' },
		{ directiveName: 'mbAttributes', attribute: 'attributes' },

		{ directiveName: 'mbIf', transclude: 'element', terminal: true, priority: 1000 },
		{ directiveName: 'mbSwitch', require: 'mbSwitch', controller: function () { this.cases = {}; } },
		{ directiveName: 'mbSwitchWhen', transclude: 'element', priority: 800, require: '^mbSwitch' },
		{ directiveName: 'mbSwitchDefault', transclude: 'element', priority: 800, require: '^mbSwitch' }
	];

	angular.forEach(auxiliaryDirectiveSpecs, function (currentSpec)
	{
		var defaultChildPriority = 200;

		singlePassMod.directive(currentSpec.directiveName, function ()
		{
			var childDirectiveDefinition =
			{
				priority: currentSpec.priority || defaultChildPriority,
				transclude: currentSpec.transclude || false,
				terminal: currentSpec.terminal || false,
				require: ['^momentaryBind'].concat(currentSpec.require || []),
				controller: currentSpec.controller,

				compile: function (templateEl, templateAtts, transclusionFn)
				{
					return function (currentScope, targetEl, elementAtts, ctrlInstances)
					{
						var primaryBindCtrl = ctrlInstances[0];
						var parentReferenceName = elementAtts.mbParent;

						if (parentReferenceName && primaryBindCtrl.contextualGroup !== parentReferenceName)
						{
							var searchElement = primaryBindCtrl.hostElement.parent();
							var locatedController = null;

							while (searchElement.length && searchElement[0].nodeType !== Node.DOCUMENT_NODE)
							{
								var cachedControllerValue = searchElement.data('$momentaryBindController');
								if (cachedControllerValue && cachedControllerValue.contextualGroup === parentReferenceName)
								{
									locatedController = cachedControllerValue;
									break;
								}
								searchElement = searchElement.parent();
							}

							if (!locatedController)
							{
								throw new Error("SinglePassDataBind: Could not locate parent momentaryBind controller with name: " + parentReferenceName);
							}
							primaryBindCtrl = locatedController;
						}

						primaryBindCtrl.enqueueOperation(
						{
							boundEl: targetEl,
							boundAttr: currentSpec.attribute || currentSpec.directiveName,
							boundAtts: elementAtts,
							boundVal: elementAtts[currentSpec.directiveName],
							shouldInterpolate: currentSpec.interpolate,
							contextGroup: parentReferenceName,
							transclusionHandler: transclusionFn,
							secondaryCtrls: ctrlInstances.slice(1),
							operationScope: currentScope
						});
					};
				}
			};

			return childDirectiveDefinition;
		});
	});
})();