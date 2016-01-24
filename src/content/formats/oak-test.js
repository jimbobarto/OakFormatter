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
  return formatCommands(testCase.commands); 
}

/**
 * Format an array of commands to the snippet of source.
 * Used to copy the source into the clipboard.
 *
 * @param The array of commands to sort.
 */
function formatCommands(commands) {
  var result = '[';
  for (var i = 0; i < commands.length; i++) {
    var command = commands[i];
    var element = '{';
    element = buildElement(element, command);
    element += '}';

    result = addToStringList(result, '[', element)
  }
  result += ']';
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

function buildElement(jsonString, command) {
  jsonString = addJsonPair(jsonString, 'interaction', command.command);

  if (command.target.indexOf('=') > -1) {
    var interactionData = command.target.split('=');
    jsonString = addJsonPair(jsonString, 'identifierType', interactionData[0]);
    jsonString = addJsonPair(jsonString, 'identifier', interactionData[1]);
  }
  else {
    jsonString = addJsonPair(jsonString, 'identifier', command.target);
  }

  if (command.value) {
    jsonString = addJsonPair(jsonString, 'value', command.value);
  }

  return jsonString;
}

function addJsonPair(jsonString, key, value) {
  var pairString = createJsonPair(key, value);
  jsonString = addToStringList(jsonString, '{', pairString);

  return jsonString;
}

function createJsonPair(key, value) {
  var jsonPair = '"' + key + '": "' + value + '"';
  return jsonPair;
}

function test() {
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

  alert("Final: " + formatCommands(commands));
}
