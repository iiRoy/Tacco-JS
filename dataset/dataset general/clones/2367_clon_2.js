/*
 * This file constructs the primary tabbed interface for the application.
 * It manages the creation and arrangement of multiple distinct views.
 */
function MainTabContainer() {
  // Variable to hold our styling module reference.
  let Themer;

  // Dynamically load the theme management utility for mobile devices.
  Themer = require('screens/mobile/ThemeManager');


  // Create the root tab group element.
  var mainGroup = Ti.UI.createTabGroup();

  // Apply predefined styling to the main tab group.
  Themer.setTabGroupStyle(mainGroup);


  // Load references to the individual screen modules.
  var FirstViewScreen = require('screens/mobile/ScreenOne');
  var SecondViewScreen = require('screens/mobile/ScreenTwo');
  var ThirdViewScreen = require('screens/mobile/ScreenThree');
  var FourthViewScreen = require('screens/mobile/ScreenFour');
  var FifthViewScreen = require('screens/mobile/ScreenFive');


  // Instantiate each of the primary windows with localized titles.
  var screenOne = new FirstViewScreen(L('first_label'));
  var screenTwo = new SecondViewScreen(L('second_label'));
  var screenThree = new ThirdViewScreen(L('third_label'));
  var screenFour = new FourthViewScreen(L('fourth_label'));
  var screenFive = new FifthViewScreen(L('fifth_label'));


  // Define the first tab and associate it with its respective window.
  var firstTab = Ti.UI.createTab(
  {
    activeIcon : 'assets/icons/one_active.png',  // Icon for active state
    icon       : '/assets/icons/one_inactive.png', // Icon for inactive state
    window     : screenOne                        // The window associated with this tab
  });
  // Establish a bidirectional link between the window and its containing tab.
  screenOne.parentTab = firstTab;


  // Define the second tab and link it to its window.
  var secondTab = Ti.UI.createTab({
    activeIcon : 'assets/icons/two_active.png',
    icon       : '/assets/icons/two_inactive.png',
    window     : screenTwo
  });
  screenTwo.parentTab = secondTab;


  // Define the third tab.
  var thirdTab = Ti.UI.createTab({
    activeIcon : 'assets/icons/three_active.png',
    icon       : '/assets/icons/three_inactive.png',
    window     : screenThree
  });
  screenThree.parentTab = thirdTab;


  // Define the fourth tab.
  var fourthTab = Ti.UI.createTab({
    activeIcon : 'assets/icons/four_active.png',
    icon       : '/assets/icons/four_inactive.png',
    window     : screenFour
  });
  screenFour.parentTab = fourthTab;


  // Define the fifth tab.
  var fifthTab = Ti.UI.createTab({
    activeIcon : 'assets/icons/five_active.png',
    icon       : '/assets/icons/five_inactive.png',
    window     : screenFive
  });
  screenFive.parentTab = fifthTab;


  // Add all created tabs to the main tab group.
  mainGroup.addTab(firstTab);
  mainGroup.addTab(secondTab);
  mainGroup.addTab(thirdTab);
  mainGroup.addTab(fourthTab);
  mainGroup.addTab(fifthTab);


  // Return the fully configured tab group.
  return mainGroup;
};


// Export the tab container function for external use.
module.exports = MainTabContainer;