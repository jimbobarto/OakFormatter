/**
 * Parse source and update TestCase. Throw an exception if any error occurs.
 *
 * @param testCase TestCase to update
 * @param source The source to parse
 */
function parse(testCase, source) {
  var commands = parseCommandFromSource(source);
  testCase.setCommands(commands);
}

function parseCommandFromSource(source) {
  var doc = source;
  var commands = [];
  while (doc.length > 0) {
    var line = /(.*)(\r\n|[\r\n])?/.exec(doc);
    var array = line[1].split(/,/);
    if (array.length >= 3) {
      var command = new Command();
      command.command = array[0];
      command.target = array[1];
      command.value = array[2];
      commands.push(command);
    }
    doc = doc.substr(line[0].length);
  }

  return commands;
}

/**
 * Format TestCase and return the source.
 *
 * @param testCase TestCase to format
 * @param name The name of the test case, if any. It may be used to embed title into the source.
 */
function format(testCase, name) {
  var overallTest = buildTest(testCase, name);

  return JSON.stringify(overallTest);
}

function buildTest(testCase, name) {
  var overallTest = {};

  overallTest.name = new Date().getTime();
  if (name) {
    overallTest.name = name;
  }

  if (testCase.baseURL) {
    overallTest.url = testCase.baseURL;
  }
  overallTest.pages = [];

  var allElements = formatCommands(testCase.commands);

  var newPage = createNewPage(1);
  if (allElements[0].interaction == 'open') {
    newPage.uri = allElements[0].identifier;
    allElements.splice(0, 1);
  }

  var elementCounter = 1;
  for (var i = 0; i < allElements.length; i++) {
    allElements[i].name = newPage.name + '_' + elementCounter;
    elementCounter++;
    newPage.elements.push(allElements[i]);

    if (allElements[i].interaction == 'clickAndWait') {
      overallTest.pages.push(newPage);

      newPage = createNewPage(newPage.name + 1);
      elementCounter = 1;
    }
  }

  if (newPage.elements.length > 0 || newPage.hasOwnProperty("uri")) {
    overallTest.pages.push(newPage);
  }

  return overallTest;
}

function createNewPage(newPageName) {
  var newPage = {name: newPageName, elements: []};
  return newPage;
}

/**
 * Format an array of commands to the snippet of source.
 * Used to copy the source into the clipboard.
 *
 * @param The array of commands to sort.
 */
function formatCommands(commands) {
  var result = [];
  for (var i = 0; i < commands.length; i++) {
    var command = commands[i];
    var element = {};
    element = buildElement(element, command);
    result.push(element);
  }
  return result; 
}

function addToStringList(existingString, startString, newString) {
  if (existingString == startString) {
    existingString += newString;
  }
  else {
    existingString += ',' + newString;
  }

  return existingString;
}

function buildElement(elementJson, command) {
  elementJson = addJsonPair(elementJson, 'interaction', command.command);
  elementJson = addJsonPair(elementJson, 'type', getType(command.command));

  if (command.target.indexOf('=') > -1) {
    var interactionData = splitString(command.target);
    elementJson = addJsonPair(elementJson, 'identifierType', interactionData[0]);
    elementJson = addJsonPair(elementJson, 'identifier', interactionData[1]);
  }
  else {
    elementJson = addJsonPair(elementJson, 'identifier', command.target);
  }

  if (command.value) {
    if (command.command == 'select') {
      var valueData = splitString(command.value);
      elementJson = addJsonPair(elementJson, 'value', valueData[1]);
      elementJson = addJsonPair(elementJson, 'selectBy', valueData[0]);
    }
    else {
      elementJson = addJsonPair(elementJson, 'value', command.value);
    }
  }

  return elementJson;
}

function splitString(string) {
  var firstEqualsLocation = string.indexOf('=');
  return [string.substring(0, firstEqualsLocation), string.substring(firstEqualsLocation + 1)];
}

function addJsonPair(jsonParent, key, value) {
  jsonParent[key] = value;

  return jsonParent;
}

function getType(command) {
  if (command == 'open') {
    return 'browser';
  }
  if (command == 'clickAndWait') {
    return 'generic';
  }
  if (command == 'select') {
    return 'select';
  }

  return 'generic';
}

/*
function createJsonPair(key, value) {
  var jsonPair = '"' + key + '": "' + value + '"';
  return jsonPair;
}
*/

function localTest() {
  var commands = [];
  var firstCommand = {};
  firstCommand.command = 'open';
  firstCommand.target = '/news';
  commands.push(firstCommand);

  var secondCommand = {};
  secondCommand.command = 'clickAndWait';
  secondCommand.target = 'css=span.title-link__title-text';
  commands.push(secondCommand);

  var thirdCommand = {};
  thirdCommand.command = 'clickAndWait';
  thirdCommand.target = 'link=Sport';
  commands.push(thirdCommand);

  var testObject = {};
  testObject.name = 'test';
  //var jsonObject = JSON.parse(testObject);
  alert("Json: " + JSON.stringify(testObject));

  alert("Final: " + JSON.stringify(formatCommands(commands)));
}

this.options = {
  defaultExtension: "json"
};
