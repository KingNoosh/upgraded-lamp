// This is pretty much the same thing as a ObjectId
function generateSessionId() {
    var m = Math,
        d = Date,
        h = 16,
        s = function(s) { return m.floor(s).toString(h); };
    return s(d.now() / 1000)+
        ' '.repeat(h).replace(/./g, function() { return s(m.random() * h); });
}

if (sessionStorage.getItem('id')) {
    sessionStorage.setItem('id', generateSessionId());
}

