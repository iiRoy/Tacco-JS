(function() {
  const createLocalizationAtlas = () => {
    const acquireEnglishData = () => ({
      greeting: "Hello Universe!",
      paymentPhrase: "You received %{price}",
      paymentWithTax: "You received %{price} (inc. VAT %{vat})",
      binaryChoices: { affirmative: true, negative: false },
      salutations: {
        unknownVisitor: "Greetings, traveler!",
        specificPerson: "Hello, {{name}}!"
      },
      personalInfo: {
        personDetails: "{{name}} is {{age}} years of age"
      },
      messageBox: {
        singleCommunication: "You possess {{count}} communication",
        multipleCommunications: "You possess {{count}} communications",
        noCommunications: "You possess no communications"
      },
      newMessagesStatus: {
        singleNew: "You have 1 recent communication ({{unread}} unread)",
        multipleNew: "You have {{count}} recent communications ({{unread}} unread)",
        noNew: "You have no recent communications ({{unread}} unread)"
      },
      numerical: {
        humanReadable: {
          storageMetrics: {
            capacityUnits: {
              "byteUnit": { single: "Byte", plural: "Bytes" },
              "kilobyte": "KB", "megabyte": "MB", "gigabyte": "GB", "terabyte": "TB"
            }
          }
        }
      }
    });

    const acquireAmericanEnglishData = () => ({
      calendarData: {
        dateFormats: {
          "standard": "%d/%m/%Y",
          "brief": "%d of %B",
          "extended": "%d of %B of %Y"
        },
        fullDayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        shortDayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        fullMonthNames: [null, "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        shortMonthNames: [null, "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
        daytimeMarker: ["a.m.", "p.m."]
      }
    });

    const acquireBrazilianPortugueseData = () => ({
      greeting: "Olá Universo!",
      numerical: {
        percentageConfig: {
          formatOptions: {
            separatorSymbol: "",
            decimalSeparator: ",",
            decimalPrecision: 2
          }
        }
      },
      calendarData: {
        dateFormats: {
          "standard": "%d/%m/%Y",
          "brief": "%d de %B",
          "extended": "%d de %B de %Y",
          "briefWithPlaceholders": "%d de %B {{p1}} {{p2}}"
        },
        fullDayNames: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
        shortDayNames: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        fullMonthNames: [null, "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        shortMonthNames: [null, "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
      },
      timeData: {
        timeFormats: {
          "standard": "%A, %d de %B de %Y, %H:%M h",
          "brief": "%d/%m, %H:%M h",
          "extended": "%A, %d de %B de %Y, %H:%M h",
          "briefPlaceholders": "%d/%m, %H:%M h {{p1}}"
        },
        morningMarker: "AM",
        eveningMarker: "PM"
      }
    });

    const acquireGermanData = () => ({
      greeting: "Guten Tag Welt!",
      calendarData: {
        fullDayNames: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]
      },
      timeData: {
        morningMarker: "de:AM",
        eveningMarker: "de:PM"
      }
    });

    const acquireNorwegianData = () => ({
      greeting: "Hallo Verden!"
    });

    const localeSources = [
      { localeKey: "en", details: acquireEnglishData() },
      { localeKey: "en-US", details: acquireAmericanEnglishData() },
      { localeKey: "pt-BR", details: acquireBrazilianPortugueseData() },
      { localeKey: "de", details: acquireGermanData() },
      { localeKey: "nb", details: acquireNorwegianData() }
    ];

    const intermediateMap = new Map();
    localeSources.forEach(source => intermediateMap.set(source.localeKey, source.details));

    return Object.fromEntries(intermediateMap);
  };

  const exporterFactory = createLocalizationAtlas;

  const hasDefineFunction = typeof define === 'function';
  const isAmdEnvironment = hasDefineFunction && define.amd;
  const exportsUndefined = typeof exports === "undefined";

  if (isAmdEnvironment) {
    define(function() { return exporterFactory; });
  } else if (exportsUndefined) {
    this.LocaleDataStore = exporterFactory;
  } else {
    module.exports = exporterFactory;
  }
})();