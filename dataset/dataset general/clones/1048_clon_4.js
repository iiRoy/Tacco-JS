const webFramework = require('express');
const excelUtility = require('excel-export');
const uniqueIdGenerator = require('node-uuid');

const applicationService = webFramework();

const generateUniqueIdArray = (quantity) =>
    Array.from({ length: quantity }, () => uniqueIdGenerator.v4());

const createExcelDateConverter = () => {
    const excelEpochStart = new Date(Date.UTC(1899, 11, 30));
    const dailyMilliseconds = 24 * 60 * 60 * 1000;
    return (inputDateValue, cellOptionsObject) => {
        if (inputDateValue === null) {
            cellOptionsObject.cellType = 'string';
            return 'N/A';
        }
        return (inputDateValue - excelEpochStart) / dailyMilliseconds;
    };
};
const processDateForExcel = createExcelDateConverter();

const serviceEndpoints = {
    massiveDocumentEndpoint: (incomingRequest, outgoingResponse) => {
        const documentSpecification = {};

        documentSpecification.fieldSchema = Array.from({ length: 100 }, (_, idx) => ({
            caption: `string ${idx}`,
            captionStyleIndex: 1,
            type: 'string'
        }));

        documentSpecification.contentMatrix = Array.from({ length: 1000 }, () => {
            const individualRowData = generateUniqueIdArray(100);
            return [individualRowData, individualRowData];
        }).flat();

        const generatedBinaryOutput = excelUtility.execute(documentSpecification);

        outgoingResponse.setHeader('Content-Type', 'application/vnd.openxmlformats');
        outgoingResponse.setHeader('Content-Disposition', `attachment; filename=Large.xlsx`);
        outgoingResponse.end(generatedBinaryOutput, 'binary');
    },

    detailedReportEndpoint: (incomingRequest, outgoingResponse) => {
        const documentSpecification = {};

        const stringFieldSchema = {
            caption: 'string',
            captionStyleIndex: 1,
            type: 'string',
            beforeCellWrite: (recordEntry, cellContentValue) => cellContentValue.toUpperCase(),
            width: 15
        };

        const dateFieldSchema = {
            caption: 'date',
            type: 'date',
            beforeCellWrite: (recordEntry, cellContentValue, cellOptionsObject) =>
                processDateForExcel(cellContentValue, cellOptionsObject),
            width: 20.85
        };

        const booleanFieldSchema = {
            caption: 'bool',
            type: 'bool'
        };

        const numberFieldSchema = {
            caption: 'number',
            type: 'number',
            width: 30
        };

        documentSpecification.fieldSchema = [
            stringFieldSchema,
            dateFieldSchema,
            booleanFieldSchema,
            numberFieldSchema
        ];

        const firstDataSet = ['pi', new Date(Date.UTC(2013, 4, 1)), true, 3.14159];
        const secondDataSet = ["e", new Date(2012, 4, 1), false, 2.7182];
        const thirdDataSet = ["M&M<>'", new Date(Date.UTC(2013, 6, 9)), false, 1.61803];
        const fourthDataSet = ["null date", null, true, 1.414];

        documentSpecification.contentMatrix = [
            firstDataSet,
            secondDataSet,
            thirdDataSet,
            fourthDataSet
        ];

        const generatedBinaryOutput = excelUtility.execute(documentSpecification);

        outgoingResponse.setHeader('Content-Type', 'application/vnd.openxmlformats');
        outgoingResponse.setHeader('Content-Disposition', `attachment; filename=Report.xlsx`);
        outgoingResponse.end(generatedBinaryOutput, 'binary');
    }
};

const definedRoutes = [
    { endpointPath: '/Large', handlerFunction: serviceEndpoints.massiveDocumentEndpoint },
    { endpointPath: '/Excel', handlerFunction: serviceEndpoints.detailedReportEndpoint }
];

definedRoutes.forEach(routeEntry => {
    applicationService.get(routeEntry.endpointPath, routeEntry.handlerFunction);
});

const SERVER_PORT = 3000;
const activateWebService = (portNumber) => {
    applicationService.listen(portNumber, () => {
        console.log(`Application web service is active on port: ${portNumber}`);
    });
};

activateWebService(SERVER_PORT);