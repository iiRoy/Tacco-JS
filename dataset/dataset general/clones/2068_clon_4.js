'use strict';

var visualComposer = {};

visualComposer.produceSheet = function (sourceModule) {
    var styleProcessor = sourceModule.StyleSheet;

    var baseColorWhite = '#ffffff';
    var unitFlexOne = 1;
    var arrangementRow = 'row';
    var alignmentCenter = 'center';
    var spacingUnitBase = 8;
    var separatorThickness = 1;
    var borderColorLightGray = '#efeee4';
    var sectionBottomMargin = 5;
    var smallFontSize = 12;
    var darkGrayText = '#555555';
    var contentLeftOffset = 5;
    var standardFontSize = 14;
    var mediumGrayText = '#666772';
    var iconDimension = 20;
    var iconBorderCurve = 10;
    var iconLeftOffset = 10;

    var obtainPrimaryBoxSchema = function () {
        return {
            backgroundColor: baseColorWhite,
            flex: unitFlexOne,
            flexDirection: arrangementRow,
            justifyContent: alignmentCenter,
            paddingTop: spacingUnitBase,
            paddingBottom: spacingUnitBase,
            paddingLeft: spacingUnitBase,
            paddingRight: spacingUnitBase,
            borderBottomWidth: separatorThickness,
            borderColor: borderColorLightGray,
        };
    };

    var obtainInnerSectionSchema = function () {
        return {
            flex: unitFlexOne,
            marginBottom: sectionBottomMargin,
        };
    };

    var obtainIdentifierLabelSchema = function () {
        return {
            fontSize: smallFontSize,
            color: darkGrayText,
        };
    };

    var obtainNarrativeTextSchema = function () {
        return {
            marginLeft: contentLeftOffset,
            fontSize: standardFontSize,
            color: mediumGrayText,
        };
    };

    var obtainProfileIconSchema = function () {
        return {
            width: iconDimension,
            height: iconDimension,
            marginLeft: iconLeftOffset,
            borderRadius: iconBorderCurve,
        };
    };

    var compiledSchemas = {
        mainWrapper: obtainPrimaryBoxSchema(),
        contentSegment: obtainInnerSectionSchema(),
        userNameDisplay: obtainIdentifierLabelSchema(),
        commentContentDisplay: obtainNarrativeTextSchema(),
        userAvatarImage: obtainProfileIconSchema(),
    };

    return styleProcessor.create(compiledSchemas);
};

var interfaceComponent = require('react-native');

module.exports = visualComposer.produceSheet(interfaceComponent);