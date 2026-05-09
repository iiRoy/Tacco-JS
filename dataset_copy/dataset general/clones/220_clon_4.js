const DocumentCreator = require('../lib/fluentReports').Report;

const sourceRecords = [
    { id: '67993bdd-f7d9-48a6-93d9-8026b657041a',
      person: '',
      name: 'Building #1',
      state: '1ab9f74b-d4af-4e88-8216-d2c2329f6318',
      'state.abbr': 'TX',
      add1: 'Building 1',
      add2: '123 Nowhere Street',
      city: 'Pittsburg',
      zip: '75686',
      'sale.no': '00125102',
      'sale.invoice_date': '04-16-2012',
      'sale.balance_due': '$ 327.10',
      current: '$ 0.00',
      thirty: '$ 0.00',
      sixty: '$ 0.00',
      ninety: '$ 327.10',
      hundredtwenty: '$ 0.00',
      'sale.invoice_date_original': '2012-04-16',
      'sale.balance_due_original': 327.1,
      current_original: 0,
      thirty_original: 0,
      sixty_original: 0,
      ninety_original: 327.1,
      hundredtwenty_original: 0 },
    { id: '4f4c4782-7ab5-4793-907c-4d0a99e4ef5b',
      name: 'Building #2',
      person: 'John Smith',
      'state.abbr': 'OK',
      add1: '345 Nowhere St',
      add2: '',
      city: 'Coalgate',
      zip: '74538-2844',
      'sale.no': '00125464',
      'sale.invoice_date': '07-02-2012',
      'sale.balance_due': '$ 4,746.05',
      'sale.purchase_order': '1234',
      current: '$ 4,746.05',
      thirty: '$ 0.00',
      sixty: '$ 0.00',
      ninety: '$ 0.00',
      hundredtwenty: '$ 0.00',
      'sale.invoice_date_original': '2012-07-02',
      'sale.balance_due_original': 4746.05,
      current_original: 4746.05,
      thirty_original: 0,
      sixty_original: 0,
      ninety_original: 0,
      hundredtwenty_original: 0 },
    { id: '4f4c4782-7ab5-4793-907c-4d0a99e4ef5b',
      name: 'Building #2',
      person: 'John White',
      'state.abbr': 'OK',
      add1: '345 Nowhere St',
      add2: '',
      city: 'Coalgate',
      zip: '74538-2844',
      'sale.no': '00125463',
      'sale.invoice_date': '07-02-2012',
      'sale.balance_due': '$ 10,945.00',
      'sale.purchase_order': '',
      current: '$ 10,945.00',
      thirty: '$ 0.00',
      sixty: '$ 0.00',
      ninety: '$ 0.00',
      hundredtwenty: '$ 0.00',
      'sale.invoice_date_original': '2012-07-02',
      'sale.balance_due_original': 10945,
      current_original: 10945,
      thirty_original: 0,
      sixty_original: 0,
      ninety_original: 0,
      hundredtwenty_original: 0 },
    { id: '4137113f-6828-4365-a8fc-a9096b4e68e7',
      name: 'Building #3',
      person: 'James Black',
      state: '1001379b-3799-4cd5-9f81-8efc12a0ef79',
      'state.abbr': 'OK',
      add1: '567 Nowhere St',
      add2: '',
      city: 'Coalgate',
      zip: '74538',
      'sale.no': '00125465',
      'sale.invoice_date': '07-02-2012',
      'sale.balance_due': '$ 1,050.00',
      'sale.purchase_order': '',
      current: '$ 1,050.00',
      thirty: '$ 0.00',
      sixty: '$ 0.00',
      ninety: '$ 0.00',
      hundredtwenty: '$ 0.00',
      'sale.invoice_date_original': '2012-07-02',
      'sale.balance_due_original': 1050,
      current_original: 1050,
      thirty_original: 0,
      sixty_original: 0,
      ninety_original: 0,
      hundredtwenty_original: 0 }
];

const addressBlockRenderer = (documentContext, recordDatum) => {
    documentContext.print([
        recordDatum.name,
        recordDatum.add1,
        recordDatum.add2,
        [recordDatum.city, recordDatum['state.abbr'], recordDatum.zip].join(' ')
    ], {x:80});
};

const notificationComposer = (documentContext, recordDatum) => {
    const communicationLines = [
        `Dear ${recordDatum.person || 'Valued Customer'},`,
        '',
        'Our records indicate that you have invoices that have not been paid and are overdue or you have credits that have not been applied.',
        ' You are receiving this statement as a reminder of invoices or credits that haven\'t been resolved.',
        ' If you have questions or comments concerning your statement please call 555-1212 and speak to someone in our billing department.',
        '',
        'Thank you in advance for your cooperation in this matter.'
    ];

    communicationLines.forEach(line => {
        if (line) {
            documentContext.print(line, {textColor: 'blue'});
        } else {
            documentContext.newLine();
        }
    });
};

const groupIntroSection = (documentContext, recordDatum) => {
    if (!recordDatum.id) { return; }

    documentContext.fontSize(9);
    documentContext.print(new Date().toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}));

    documentContext.print('ACCOUNT STATEMENT', {fontBold: true, fontSize: 16, align: 'right'});

    addressBlockRenderer(documentContext, recordDatum);

    documentContext.newline();
    documentContext.newline();
    documentContext.newline();

    notificationComposer(documentContext, recordDatum);

    documentContext.newline();
    documentContext.newline();
    documentContext.newline();

    documentContext.fontBold();
    documentContext.band([
        {info: 'Invoice #', width: 60},
        {info: 'Cust PO'},
        {info: 'Invoice Date', width: 60},
        {info: 'Current', align: 3, width: 60},
        {info: '31-60 Days', width: 60, align: 3},
        {info: '61-90 Days', width: 60, align: 3},
        {info: '91-120 Days', width: 65, align: 3},
        {info: '>120 Days', width: 60, align: 3},
        {info: 'Total Due', width: 60, align: 3}
    ]);
    documentContext.fontNormal();
    documentContext.bandLine();
};

const itemLineDisplay = (documentContext, recordDatum) => {
    documentContext.band([
        {value: recordDatum['sale.no'], width: 60, align: 1},
        {value: recordDatum['sale.purchase_order']},
        {value: recordDatum['sale.invoice_date'], width: 60},
        {value: recordDatum.current, align: 3, width: 60},
        {value: recordDatum.thirty, width: 60, align: 3},
        {value: recordDatum.sixty, width: 60, align: 3},
        {value: recordDatum.ninety, width: 65, align: 3},
        {value: recordDatum.hundredtwenty, width: 60, align: 3},
        {value: recordDatum['sale.balance_due'], width: 60, align: 3}
    ], {border: 1, width: 0});
};

const groupOutroSection = (documentContext, recordDatum) => {
    documentContext.standardFooter([
        {field: 'sale.no', col: 1, alignment: 3},
        {field: 'current', col: 4, alignment: 3},
        {field: 'thirty', col: 5, alignment: 3},
        {field: 'sixty', col: 6, alignment: 3},
        {field: 'ninety', col: 7, alignment: 3},
        {field: 'hundredtwenty', col: 8, alignment: 3},
        {field: 'sale.balance_due', col: 9, alignment: 3}
    ]);
    documentContext.newline();
    documentContext.newline();
    documentContext.print('Thank You for Choosing us!', {align: 'right'});
};

const currencyValueAdjuster = (inputValues, completionCallback) => {
    for (const dataKey of Object.keys(inputValues)) {
        if (dataKey === 'sale.no') { continue; }
        if (Object.prototype.hasOwnProperty.call(inputValues, dataKey)) {
            let currentVal = String(inputValues[dataKey]);
            currentVal = '$ ' + currentVal;
            const decimalPosition = currentVal.indexOf('.');
            if (decimalPosition < 0) {
                currentVal += '.00';
            } else if (decimalPosition < currentVal.length - 1) {
                currentVal += '0';
            }
            inputValues[dataKey] = currentVal;
        }
    }
    completionCallback(null, inputValues);
};

const documentBlueprint = {
    outputFile: "statement_output.pdf",
    documentSettings: {
        baseFontSize: 9,
        pageMargins: 40
    },
    dataSource: sourceRecords,
    valueFormatProcessor: currencyValueAdjuster,
    structure: {
        detailRenderer: itemLineDisplay,
        groupingKey: 'id',
        summaryCalculations: {
            sumFields: ['current', 'thirty', 'sixty', 'ninety', 'hundredtwenty', 'sale.balance_due'],
            countFields: ['sale.no']
        },
        groupFooterRenderer: groupOutroSection,
        groupHeaderRenderer: groupIntroSection,
        headerOptions: {
            startNewPage: true
        }
    }
};

function produceDocument() {
    'use strict';

    const reportInstance = new DocumentCreator(documentBlueprint.outputFile);

    reportInstance.data(documentBlueprint.dataSource);
    reportInstance.totalFormatter(documentBlueprint.valueFormatProcessor);

    reportInstance.fontsize(documentBlueprint.documentSettings.baseFontSize);
    reportInstance.margins(documentBlueprint.documentSettings.pageMargins);

    reportInstance.detail(documentBlueprint.structure.detailRenderer);
    reportInstance.groupBy(documentBlueprint.structure.groupingKey);

    documentBlueprint.structure.summaryCalculations.sumFields.forEach(field => {
        reportInstance.sum(field);
    });
    documentBlueprint.structure.summaryCalculations.countFields.forEach(field => {
        reportInstance.count(field);
    });

    reportInstance.footer(documentBlueprint.structure.groupFooterRenderer);
    reportInstance.header(documentBlueprint.structure.groupHeaderRenderer, {
        pageBreakBefore: documentBlueprint.structure.headerOptions.startNewPage
    });

    reportInstance.printStructure();

    console.time("DocumentRendering");
    reportInstance.render((errorStatus, outputName) => {
        console.timeEnd("DocumentRendering");
        if (errorStatus) {
            console.error("Processing error:", errorStatus);
        } else {
            console.log("Generated document name:", outputName);
        }
    });
}

produceDocument();