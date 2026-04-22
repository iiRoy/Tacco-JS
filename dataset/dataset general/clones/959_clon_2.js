// Module for participant entry view

var entryScreen = Titanium.UI.createWindow({
	backgroundSource: 'visuals/pattern.jpg' ,
	viewTitle:'New Participant Form'
});


// Configure a control to navigate back
var backNavigationBtn = Titanium.UI.createButton({
	label: 'Return' ,
	style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN
});

entryScreen.setLeftNavButton(backNavigationBtn);
backNavigationBtn.addEventListener('click', function() {
	entryScreen.close();
});


// Output information text

var displayMessageLabel = Titanium.UI.createLabel(
	{
		textColor: '#BBBBBB',
		content: 'Current Display: Four',
		font: {
			size: 19,
			fontName: 'Roboto'
		},
		textAlign: 'center',
		width: 'auto'
	}
);

entryScreen.add(displayMessageLabel);

entryScreen.open({ modal:true });