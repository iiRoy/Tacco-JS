const S01 = 's';
const S02 = 'um';
const S03 = 'ma';
const S04 = 'ry';
const S05 = 'v';
const S06 = 'er';
const S07 = 'si';
const S08 = 'on';
const S09 = 'n';
const S10 = 'am';
const S11 = 'e';
const S12 = 'g';
const S13 = 'it';
const S14 = 'de';
const S15 = 'sc';
const S16 = 'ri';
const S17 = 'be';
const S18 = 'o';
const S19 = 'nU';
const S20 = 'se';
const S21 = 'v';
const S22 = 'er';
const S23 = 'si';
const S24 = 'ons';
const S25 = 'Fr';
const S26 = 'om';
const S27 = 'u';
const S28 = 'se';
const S29 = 'a';
const S30 = 'dd';
const S31 = 'Fi';
const S32 = 'le';
const S33 = 's';
const S34 = 'ex';
const S35 = 'po';
const S36 = 'rt';
const S37 = 'cl';
const S38 = 'ie';
const S39 = 'nt';
const S40 = 'Pack';
const S41 = 'age';

const metaDataMap = {};
metaDataMap[S01 + S02 + S03 + S04] = "A meteorite package that makes building dynamic two way forms easy";
metaDataMap[S05 + S06 + S07 + S08] = '0.2.2';
metaDataMap[S09 + S10 + S11] = "joshowens:simple-form";
metaDataMap[S12 + S13] = 'https://github.com/MeteorClub/simple-form';

const globalObject = (function(){return this})();
const moduleRegistrar = globalObject[S40 + S41];

moduleRegistrar[S14 + S15 + S16 + S17](metaDataMap);

moduleRegistrar[S18 + S19 + S20](function(moduleInterface) {
  const targetPlatformSpecifier = S37 + S38 + S39;

  moduleInterface[S21 + S22 + S23 + S24 + S25 + S26]("METEOR@0.9.0");
  moduleInterface[S27 + S28](['ui', 'templating', 'underscore', 'schnie:uploader', 'mrt:underscore-string-latest@2.3.3'], targetPlatformSpecifier);
  moduleInterface[S29 + S30 + S31 + S32 + S33](['fileField.html', 'fileField.js', 'helper.js', 'simpleform.js'], targetPlatformSpecifier);
  moduleInterface[S34 + S35 + S36]('SimpleForm', targetPlatformSpecifier);
});