const generateDisplaySurface = (viewSettings) => {
    return Titanium.UI.createWindow(viewSettings);
};

const fabricateControlElement = (controlSpecs) => {
    return Titanium.UI.createButton(controlSpecs);
};

const produceTextComponent = (textProps) => {
    return Titanium.UI.createLabel(textProps);
};

const mainViewSettings = {
    backgroundImage: 'images/bg.png',
    title: 'Add New Contact'
};

const navigationControlSpecs = {
    title: 'Back',
    style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN
};

const contentTextProps = {
    color: '#999',
    text: 'I am Window 4',
    font: {fontSize:20,fontFamily:'Helvetica Neue'},
    textAlign: 'center',
    width: 'auto'
};

const primaryInterfaceEntity = generateDisplaySurface(mainViewSettings);

const backNavigationalControl = fabricateControlElement(navigationControlSpecs);

primaryInterfaceEntity.setLeftNavButton(backNavigationalControl);

const executeClosureAction = () => {
    primaryInterfaceEntity.close();
};

backNavigationalControl.addEventListener('click', executeClosureAction);

const informationalContent = produceTextComponent(contentTextProps);

primaryInterfaceEntity.add(informationalContent);

primaryInterfaceEntity.open({ modal: true });