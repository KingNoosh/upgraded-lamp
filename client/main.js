// I can easily re-write all of this in ES6 if need be ;)


var timeStarted,
    cacheWindowSize,
    timeout;

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

function postEvent(payload) {
  return fetch(
    'http://localhost:5000',
    {
      'method': 'POST',
      'body': JSON.stringify(payload),
      'headers': {
        'Content-Type': 'application/json'
      }
    }
  ).then(function(res) { console.log(res); })
  .catch(function(res) { console.log(res); });
}

function postResize() {
  var payload = {
      'eventType': 'windowResize',
      'websiteUrl': window.location.href,
      'sessionId': sessionStorage.getItem('id'),
      'resizeFrom': cacheWindowSize,
      'resizeTo': {x: window.innerWidth, y: window.innerHeight}
    };

  cacheWindowSize = undefined;
  postEvent(payload);
}

function onResize() {
  if (!cacheWindowSize) {
    cacheWindowSize = {x: window.innerWidth, y: window.innerHeight};
  }

  var context = this, args = arguments,
      later = function() {
        timeout = null;
        postResize.apply(this, args);
      };

  clearTimeout(timeout);
  timeout = setTimeout(later, 250);
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

  var payload = {
    'eventType': 'timeTaken',
    'websiteUrl': window.location.href,
    'sessionId': sessionStorage.getItem('id'),
    'time': Math.floor((Date.now() / 1000) - timeStarted)
  };

  timeStarted = undefined;
  postEvent(payload);
}

function onCopy() {
  var inputId = document.activeElement.id;

  // If we don't have an id, there's no point continuing.
  if(!inputId) {
    return;
  }

  var payload = {
    'eventType': 'copyAndPaste',
    'websiteUrl': window.location.href,
    'sessionId': sessionStorage.getItem('id'),
    'pasted': false,
    'formId': document.activeElement.id
  };

  postEvent(payload);
}

function onPaste() {
  var inputId = document.activeElement.id;

  // If we don't have an id, there's no point continuing.
  if(!inputId) {
    return;
  }

  var payload = {
    'eventType': 'copyAndPaste',
    'websiteUrl': window.location.href,
    'sessionId': sessionStorage.getItem('id'),
    'pasted': true,
    'formId': document.activeElement.id
  };

  postEvent(payload);
}

function addInputListeners(item) {
  item.addEventListener('copy', onCopy, false);
  item.addEventListener('paste', onPaste, false);
  item.addEventListener('input', startTimeTaken, false);
}

function onDOMReady() {
  // If we already have a session id, there's no point generating another
  if (!sessionStorage.getItem('id')) {
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

document.addEventListener('DOMContentLoaded', onDOMReady);
