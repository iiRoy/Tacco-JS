! function() {


    var ControlPanelConfig = function(hostElement, initialConfiguration, renderUpdateFunctions) {
        hostElement.append("<div id='standardOptionsContainer' class='controlGroup'></div>");
        $("#standardOptionsContainer").append("<input class='controlField' id='enableProcessing' type='checkbox' onchange='ControlPanelConfig.onEnableProcessingChange()'>enable processing</input>");
        $("#standardOptionsContainer").append("<input class='controlField' id='monotonicInterpolation' type='checkbox' onchange='ControlPanelConfig.onMonotonicInterpolationChange()'>monotonic interpolation</input>");
        $("#standardOptionsContainer").append("<input class='controlField' id='curveTension' type='range' min='0' max='1' step='0.1' onchange='ControlPanelConfig.onCurveTensionChange()'>curve tension /in [0,1]</input>");
        $("#standardOptionsContainer").append("<input class='controlField' id='splinePointCount' type='text' onchange='ControlPanelConfig.onSplinePointCountChange()'># spline points</input>");

        hostElement.append("<div id='legacyOptionsContainer' class='controlGroup'></div>");
        $("#legacyOptionsContainer").append("<input class='controlField' id='useCompatibilityMode' type='checkbox' onchange='ControlPanelConfig.onUseCompatibilityModeChange()'>use compatibility options</input>");
        $("#legacyOptionsContainer").append("<input class='controlField' id='compatibilityFit' type='checkbox' onchange='ControlPanelConfig.onCompatibilityFitChange()'>compatibility fit</input>");
        $("#legacyOptionsContainer").append("<input class='controlField' id='compatibilityPointFactor' type='text' onchange='ControlPanelConfig.onCompatibilityPointFactorChange()'>point factor</input>");
        $("#legacyOptionsContainer").append("<input class='controlField' id='compatibilityFitPointDistance' type='text' onchange='ControlPanelConfig.onCompatibilityFitPointDistanceChange()'>fit point dist</input>");

        function refreshAllVisuals() {
            var currentSettings = {
                enableProcessing: $("#enableProcessing").prop("checked"),
                monotonicInterpolation: $("#monotonicInterpolation").prop("checked"),
                curveTension: $("#curveTension").val(),
                splinePointCount: $("#splinePointCount").val(),
                compatSettingsOverride: undefined
            };

            if ($("#useCompatibilityMode").prop("checked")) {
                var distanceVal = $("#compatibilityFitPointDistance").val();

                currentSettings.compatSettingsOverride = {
                    fittingMethod: $("#compatibilityFit").prop("checked"),
                    interpolationCurveFactor: $("#compatibilityPointFactor").val(),
                    fittingPointGap: (distanceVal === '') ? undefined : distanceVal,
                };
            }

            for (var idx = 0; idx < renderUpdateFunctions.length; idx++) {
                renderUpdateFunctions[idx](currentSettings);
            }
        }

        function initializePanel(inputOptions) {

            var defaultSettingsObject = {
                isActiveState: false,
                enableProcessing: false,
                monotonicInterpolation: false,
                curveTension: 0.0,
                splinePointCount: 20,
                compatSettingsOverride: undefined
            };

            var defaultCompatOptions = {
                fittingMethod: false,
                interpolationCurveFactor: 20,
                fittingPointGap: undefined
            };

            if (typeof inputOptions.compatSettingsOverride !== 'undefined') {
                defaultSettingsObject.compatSettingsOverride = defaultCompatOptions;
                if (inputOptions.compatSettingsOverride === true) {
                    inputOptions.compatSettingsOverride = defaultCompatOptions;
                }
            }

            var mergedSettings = jQuery.extend(true, defaultSettingsObject, inputOptions);

            $("#enableProcessing").prop("checked", mergedSettings.enableProcessing);

            var isCompatModeActive = (typeof mergedSettings.compatSettingsOverride !== 'undefined');
            var fittingStatus = mergedSettings.compatSettingsOverride.fittingMethod;
            var pointFactorValue = mergedSettings.compatSettingsOverride.interpolationCurveFactor;
            var fitGapValue = mergedSettings.compatSettingsOverride.fittingPointGap;
            var isMonotonicEnabled = mergedSettings.monotonicInterpolation;
            var tensionLevel = mergedSettings.curveTension;
            var numberOfSplinePoints = mergedSettings.splinePointCount;

            $("#useCompatibilityMode").prop("checked", isCompatModeActive);
            $("#compatibilityFit").prop("checked", fittingStatus);
            $("#compatibilityPointFactor").val(pointFactorValue);
            $("#compatibilityFitPointDistance").val(fitGapValue);
            $("#monotonicInterpolation").prop("checked", isMonotonicEnabled);
            $("#curveTension").val(tensionLevel);
            $("#splinePointCount").val(numberOfSplinePoints);

            refreshAllVisuals(inputOptions, renderUpdateFunctions);
        }


        ControlPanelConfig.onEnableProcessingChange = function() {
            refreshAllVisuals();
        };

        ControlPanelConfig.onUseCompatibilityModeChange = function() {
            refreshAllVisuals();
        };

        ControlPanelConfig.onCompatibilityFitChange = function() {
            if ($("#useCompatibilityMode").prop("checked")) {
                refreshAllVisuals();
            }
        };

        ControlPanelConfig.onCompatibilityPointFactorChange = function() {
            if ($("#useCompatibilityMode").prop("checked")) {
                refreshAllVisuals();
            }
        };

        ControlPanelConfig.onCompatibilityFitPointDistanceChange = function() {
            if ($("#useCompatibilityMode").prop("checked")) {
                refreshAllVisuals();
            }
        };

        ControlPanelConfig.onMonotonicInterpolationChange = function() {
            $("#useCompatibilityMode").prop("checked", false);
            refreshAllVisuals();
        };

        ControlPanelConfig.onCurveTensionChange = function() {
            $("#useCompatibilityMode").prop("checked", false);
            refreshAllVisuals();
        };

        ControlPanelConfig.onSplinePointCountChange = function() {
            $("#useCompatibilityMode").prop("checked", false);
            refreshAllVisuals();
        };

        initializePanel(initialConfiguration);
    };

    this.ControlPanelConfig = ControlPanelConfig;
}();