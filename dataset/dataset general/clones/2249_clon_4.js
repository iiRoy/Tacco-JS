const displayElementFactory = (() => {
    let internalCounter = 0;
    let rowIndices = {
        titleSectionOne: 2,
        inputSectionOne: 3,
        titleSectionTwo: 4,
        inputSectionTwo: 5
    };
    let isFirstCall = true;

    const generateCellContent = (type, currentEntryNumber) => {
        const contentMap = {
            'H1_0': '<th bgcolor="#7b68ee">番号</th>',
            'H1_1': '<th bgcolor="#7b68ee">表示項目名称</th>',
            'H1_2': '<th bgcolor="#7b68ee">画面部品種類</th>',
            'H1_3': '<th bgcolor="#7b68ee" colspan="2">ア</th>',
            'H1_4': '<th bgcolor="#7b68ee" colspan="2">アノテーション</th>',
            'H1_5': '<th bgcolor="#7b68ee">表示桁数</th>',
            'H1_6': '<th bgcolor="#7b68ee">必須条件</th>',
            'H1_7': '<th bgcolor="#7b68ee">検索条件区分</th>',
            'I1_0': `${currentEntryNumber}<input type="text" value = "${currentEntryNumber}" name= "display[${currentEntryNumber}].itemNo">`,
            'I1_1': `<input type="String" name="display[${currentEntryNumber}].itemNmJa"/>`,
            'I1_2': `<input type="String" name="display[${currentEntryNumber}].component"/>`,
            'I1_3': `<a href="Annotation.html" target="_blank" name="display[${currentEntryNumber}].annotationSel${currentEntryNumber}">選択</a/>`,
            'I1_4': `<input type="String" name="display[${currentEntryNumber}].annotationCd"/>`,
            'I1_5': `<input type="String" name="display[${currentEntryNumber}].displayDigit"/>`,
            'I1_6': `<select type="String" name="display[${currentEntryNumber}].requiredKb"><option value="ブランク"></option><option value="不要">-</option><option value="必須">必須</option></select>`,
            'I1_7': `<select type="String" name="display[${currentEntryNumber}].searchConditionKb" ><option value="ブランク"></option><option value="--">--</option><option value="=">=</option><option value="<>"><></option></select>`,
            'H2_0': '<th>アクションID</th>',
            'H2_1': '<th>アクション名</th>',
            'H2_2': '<th>遷移先画面</th>',
            'H2_3': '<th>エラー時遷移先</th>',
            'I2_0': `<input type="String" name="display[${currentEntryNumber}].actionID"/>`,
            'I2_1': `<input type="String" name="display[${currentEntryNumber}].actionNm"/>`,
            'I2_2': `<input type="String" name="display[${currentEntryNumber}].forwardScreenId"/>`,
            'I2_3': `<input type="String" name="display[${currentEntryNumber}].errorScreenId"/>`
        };
        return contentMap[type];
    };

    const getCellClasses = (type) => {
        const classMap = {
            'H1_0': 'itemNo', 'H1_1': 'itemNmJa', 'H1_2': 'component', 'H1_3': 'annotationCd',
            'H1_4': 'annotationCd', 'H1_5': 'displayDigit', 'H1_6': 'requiredKb', 'H1_7': 'searchConditionKb',
            'I1_0': 'itemNo', 'I1_1': 'itemNmJa', 'I1_2': 'component', 'I1_3': 'annotationSel',
            'I1_4': 'annotationCd', 'I1_5': 'displayDigit', 'I1_6': 'requiredKb', 'I1_7': 'searchConditionKb',
            'H2_0': 'actionId', 'H2_1': 'actionNm', 'H2_2': 'forwardScreenId', 'H2_3': 'errorScreenId',
            'I2_0': 'actionId', 'I2_1': 'actionNm', 'I2_2': 'forwardScreenId', 'I2_3': 'errorScreenId'
        };
        return classMap[type];
    };

    const createAndAttachEntry = () => {
        internalCounter++;

        if (isFirstCall) {
            rowIndices.titleSectionOne = 3;
            rowIndices.inputSectionOne = 4;
            rowIndices.titleSectionTwo = 5;
            rowIndices.inputSectionTwo = 6;
            isFirstCall = false;
        } else {
            rowIndices.titleSectionOne += 4;
            rowIndices.inputSectionOne += 4;
            rowIndices.titleSectionTwo += 4;
            rowIndices.inputSectionTwo += 4;
        }

        const targetGrid = document.getElementById("DispTable");

        const rowConfigs = [
            { count: 8, index: rowIndices.titleSectionOne, baseKey: 'H1' },
            { count: 8, index: rowIndices.inputSectionOne, baseKey: 'I1' },
            { count: 4, index: rowIndices.titleSectionTwo, baseKey: 'H2' },
            { count: 4, index: rowIndices.inputSectionTwo, baseKey: 'I2' }
        ];

        rowConfigs.forEach(config => {
            const newRow = targetGrid.insertRow(config.index);
            for (let i = 0; i < config.count; i++) {
                const newCell = newRow.insertCell(i);
                const cellTypeKey = `${config.baseKey}_${i}`;
                const cellClass = getCellClasses(cellTypeKey);
                const cellHTML = generateCellContent(cellTypeKey, internalCounter);

                newCell.setAttribute("class", cellClass);
                newCell.className = cellClass;
                newCell.innerHTML = cellHTML;
            }
        });
    };

    return createAndAttachEntry;
})();

const annotationEntryFactory = (() => {
    let entryIdentifier = 0;

    const annotationCellData = [
        { key: 'C1_0', className: 'check', html: (id) => `<input type="checkbox" name="annotation[${id}].check" value="">` },
        { key: 'C1_1', className: 'annotationCd', html: (id) => `<input type="text" name="annotation[${id}].annotationCd">` },
        { key: 'C1_2', className: 'annotationNmEn', html: (id) => `<input type="text" name="annotation[${id}].annotationNmEn">` },
        { key: 'C1_3', className: 'argumentType', html: (id) => `<select name="annotation[${id}].argumentType"><option value="brank"></option><option value="int">int</option><option value="String">String</option><option value="Long">Long</option></select>` },
        { key: 'C1_4', className: 'argument1', html: (id) => `<input type="text" name="annotation[${id}].argument1">` },
        { key: 'C1_5', className: 'argument2', html: (id) => `<input type="text" name="annotation[${id}].argument2">` },
        { key: 'C1_6', className: 'argument3', html: (id) => `<input type="text" name="annotation[${id}].argument3">` },
        { key: 'C1_7', className: 'classpathStr', html: (id) => `<input type="text" name="annotation[${id}].classpathStr">` }
    ];

    const generateAnnotationElement = () => {
        entryIdentifier++;

        const annotationGrid = document.getElementById("AnnotationTable");
        const newRow = annotationGrid.insertRow(entryIdentifier);

        annotationCellData.forEach((cellConfig, index) => {
            const newCell = newRow.insertCell(index);
            const cellClass = cellConfig.className;
            const cellHTML = cellConfig.html(entryIdentifier);

            newCell.setAttribute("class", cellClass);
            newCell.className = cellClass;
            newCell.innerHTML = cellHTML;
        });
    };

    return generateAnnotationElement;
})();

const appendDisplayElements = displayElementFactory;
const appendAnnotationEntry = annotationEntryFactory;