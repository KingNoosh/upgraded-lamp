// I can easily re-write all of this in ES6 if need be ;)

// This is pretty much the same thing as a ObjectId which I thought was great
// for a session id
function generateSessionId() {
  var m = Math,
      d = Date,
      h = 16,
      s = function(s) { return m.floor(s).toString(h); };
  return s(d.now() / 1000)+
    ' '.repeat(h).replace(/./g, function() { return s(m.random() * h); });
}
function onResize() {
  // TODO: Reminder to self to debounce the resize event so I don't spam myself
  var obj = {
    'eventType': 'windowResize',
    'websiteUrl': window.location.href,
    'sessionId': sessionStorage.getItem('id'),
    'resizeFrom': {x: 1, y: 1},
    'resizeTo': {x: 2, y: 2}
  };
  console.log(obj);
}
function startTimeTaken() {
  if(!timeStarted) {
    timeStarted = Date.now() / 1000;
  }
}
function endTimeTaken() {
  if(!timeStarted) {
    return;
  }

  var obj = {
    'eventType': 'timeTaken',
    'websiteUrl': window.location.href,
    'sessionId': sessionStorage.getItem('id'),
    'time': Math.floor((Date.now() / 1000) - timeStarted)
  };

  timeStarted = undefined;
  console.log(obj);
}
function onCopy() {
  var inputId = document.activeElement.id;

  // If we don't have an id, there's no point continuing.
  if(!inputId) {
    return;
  }

  var obj = {
    'eventType': 'copyAndPaste',
    'websiteUrl': window.location.href,
    'sessionId': sessionStorage.getItem('id'),
    'pasted': false,
    'formId': document.activeElement.id
  };
  console.log(obj);
}
function onPaste() {
  var inputId = document.activeElement.id;

  // If we don't have an id, there's no point continuing.
  if(!inputId) {
    return;
  }

  var obj = {
    'eventType': 'copyAndPaste',
    'websiteUrl': window.location.href,
    'sessionId': sessionStorage.getItem('id'),
    'pasted': true,
    'formId': document.activeElement.id
  };
  console.log(obj);
}

function addInputListeners(item) {
  item.addEventListener('copy', onCopy, false);
  item.addEventListener('paste', onPaste, false);
  item.addEventListener('input', startTimeTaken, false);
}

function initialise() {
  // If we already have a session id, there's no point generating another'
  if (sessionStorage.getItem('id')) {
    sessionStorage.setItem('id', generateSessionId());
  }

  // Get all inputs and textareas to apply event listeners for copy, paste and
  // startTimeTaken.
  //
  // Merging an HTMLCollection would mean turning them into actual arrays but then
  // that'd make this code seem slightly more complicated than it is.
  var inputs = document.getElementsByTagName('input'),
      textareas = document.getElementsByTagName('textarea'),
      forms = document.getElementsByTagName('form');

  for (var i = inputs.length - 1; i >= 0; i--) {
    addInputListeners(inputs[i]);
  }
  for (i = textareas.length - 1; i >= 0; i--) {
    addInputListeners(textareas[i]);
  }

  forms[0].addEventListener('submit', endTimeTaken, false);
  window.addEventListener('resize', onResize, false);
}

var timeStarted;
initialise();
