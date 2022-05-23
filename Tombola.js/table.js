var orig;        // origin: '1','2',...'90'
var hist;        // history: extracted

function init() {
    hist = new Array();
    orig = new Array();
    for(var i = 1; i <= 90; i++) {
        orig.push(i);
    }
}

function BlinkNode(celnode, times, millis) {
    this.celnode = celnode;
    this.times = times;
    this.millis = millis;
    var self = this;

    // blink the node
    this.blink = function() {
        if (self.times % 2 == 0) {
            self.celnode.className = 'on';
        } else {
            self.celnode.className = 'blink';
        }

	    if (self.times > 0) {
            self.times--;
            setTimeout(self.blink,self.millis);
        } else {
            self=null;
        }
    }
}

function selectNr(n) {
    var celnode = document.getElementById("nr" + n);
    celnode.className = 'on';

    var idx = searchNr(orig, n);
    if (idx >= 0) { orig.splice(idx, 1); }

    idx = searchNr(hist, n);
    if (idx == -1){ hist.push(n); }

    var cc = new BlinkNode(celnode, 9, 300);
    cc.blink();
}

function resetNr(n) {
    var celnode = document.getElementById("nr" + n);
    celnode.className = '';

    var idx = searchNr(hist, n);
    if (idx >= 0) { hist.splice(idx, 1); }

    idx = searchNr(orig, n);
    if (idx == -1) { orig.push(n); }

    dumpHist();
}

function searchNr(a, n) {
    for(var i = 0; i < a.length; i++) {
        if (a[i] == n) { return i; }
    }
    return -1;
}

function choseMe(anode) {
    var id = anode.id;
    var n = id.match(/\d+/)[0];

    if (searchNr(hist, n) == -1) {
        selectNr(n);
    } else {
	    resetNr(n);
    }
}

function extractRandom() {
    var dbg;
    var r = 1;

    if (orig.length <= 0) { return; }
    while(r >= 1) { r = Math.random(); }

    var idx = Math.floor(r * orig.length);
    var n = orig[idx];
    
    if (searchNr(hist, n) == -1) { selectNr(n); }
}

function manageKeyb() {
    var cc = String.fromCharCode(event.keyCode).toUpperCase();
    if (cc == ' ') { extractRandom(); }
}

function chgname() {
    var name = prompt("Nome tombola", "TOMBOLATA");
    if (name) { document.getElementById("tombtit").innerHTML = name; }
}

function tombola() {
    var x, y, nr;
    for(y = 0; y < 9; y++) {
        document.writeln('<tr>');
        for(x = 0; x < 10; x++) {
            nr = y * 10 + x + 1;
            document.writeln('<td id="nr'+nr+'" onclick="choseMe(this)">'+nr+'</td>');
        }
        document.writeln('</tr>');
    }
}

init();
document.onkeypress = manageKeyb;
tombola();