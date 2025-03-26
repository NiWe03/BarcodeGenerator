//var allTypes = ['auspost', 'azteccode', 'aztecrune', 'bc412', 'coop2of5', 'channelcode', 'rationalizedCodabar', 'codablockf', 'code11', 'code128', 'code16k', 'code2of5', 'code39', 'code39ext', 'code49', 'code93', 'code93ext', 'codeone', 'azteccodecompact', 'pdf417compact', 'raw', 'daft', 'datamatrix', 'datamatrixrectangular', 'datamatrixrectangularextension', 'datalogic2of5', 'identcode', 'leitcode', 'dotcode', 'ean13', 'ean13composite', 'ean2', 'ean5', 'ean8', 'ean8composite', 'flattermarken', 'gs1-cc', 'gs1datamatrix', 'gs1datamatrixrectangular', 'databarexpanded', 'databarexpandedcomposite', 'databarexpandedstacked', 'databarexpandedstackedcomposite', 'databarlimited', 'databarlimitedcomposite', 'databaromni', 'databaromnicomposite', 'databarstacked', 'databarstackedcomposite', 'databarstackedomni', 'databarstackedomnicomposite', 'databartruncated', 'databartruncatedcomposite', 'gs1dldatamatrix', 'gs1dlqrcode', 'gs1dotcode', 'gs1northamericancoupon', 'gs1qrcode', 'gs1-128', 'gs1-128composite', 'ean14', 'hibcazteccode', 'hibccodablockf', 'hibccode128', 'hibccode39', 'hibcdatamatrix', 'hibcdatamatrixrectangular', 'hibcmicropdf417', 'hibcpdf417', 'hibcqrcode', 'hanxin', 'iata2of5', 'isbn', 'ismn', 'issn', 'itf14', 'industrial2of5', 'interleaved2of5', 'code32', 'japanpost', 'msi', 'mands', 'matrix2of5', 'maxicode', 'microqrcode', 'micropdf417', 'symbol', 'pdf417', 'pharmacode', 'pzn', 'plessey', 'posicode', 'qrcode', 'rectangularmicroqrcode', 'kix', 'royalmail', 'mailmark', 'sscc18', 'swissqrcode', 'telepen', 'telepennumeric', 'pharmacode2', 'upca', 'upcacomposite', 'upce', 'upcecomposite', 'onecode', 'planet', 'postnet', 'ultracode'];
var textSizeExponent = 0.4;

window.addEventListener('load', function() {
    var allowedTypes = ['code128', 'ean13', 'qrcode', 'interleaved2of5', 'code39', 'pdf417', 'datamatrix', 'ean8', 'code93', 'upce'];

    var sel = document.getElementById('symbol');
    var opts = [];
    for (var id in symdesc) {
        if (allowedTypes.indexOf(symdesc[id].sym) === -1) {
            continue;
        }
        opts.push(symdesc[id]);
    }
    opts.sort(function(a, b) { return a.desc < b.desc ? -1 : 1; });
    for (var i = 0, l = opts.length; i < l; i++) {
        var elt = document.createElement('option');
        elt.textContent = opts[i].desc;
        elt.value = opts[i].sym;
        sel.appendChild(elt);
    }

    sel.addEventListener('change', function() {
        var eltDesc = symdesc[sel.value];
        document.getElementById('example').textContent = "Beispiel: " + (eltDesc && eltDesc.text ? eltDesc.text : '');
        //document.getElementById('symaltx').value = '';
        document.getElementById('output').textContent = '';
        document.getElementById('canvas').style.display = 'none';
        render();
    });

    sel.value = "datamatrix";
    sel.dispatchEvent(new Event("change"));

    // Live-Update des Barcodes während der Eingabe
    var symtext = document.getElementById('symtext');
    symtext.addEventListener('input', function() {
        render();
    });

    // Live-Update des Barcodes während der Titel Eingabe
    var titleInput = document.getElementById('symaltx');
    titleInput.addEventListener('input', function() {
        render(); 
    });

    updateScale();
    // Barcode direkt beim Laden generieren (mit leerem Text)
    render();
});

// Escape-Sequenzen umwandeln
function processInputText(text) {
    return text
        .replace(/\\n/g, '\n')  // Benutzer gibt "\n" ein → echtes Enter
        .replace(/\\t/g, '\t'); // Benutzer gibt "\t" ein → echtes Tab
}

// Barcode generieren
function render() {
    var elt = symdesc[document.getElementById('symbol').value];
    var rawText = document.getElementById('symtext').value.trim();
    var alttext = document.getElementById('symaltx').value.trim();
    var scale = +document.getElementById('scaleInhalt').value || 3;
    var scaleTitel = +document.getElementById('scaleTitel').value || 3;

    var textSize = (Math.pow(scale, textSizeExponent) * scaleTitel);

    document.getElementById('output').textContent = '';

    var canvas = document.getElementById('canvas');
    canvas.height = 1;
    canvas.width = 1;
    canvas.style.display = 'none';

    // Falls Eingabe leer ist, Barcode ausblenden
    if (!rawText) {
        return;
    }

    var processedText = processInputText(rawText);

    let opts = {
        text: processedText,
        bcid: elt.sym,
        scale: scale,
        rotate: 'N',
        textsize: textSize
    };
    if (alttext) {
        opts.alttext = alttext;
    }

    try {
        let ts0 = new Date();
        bwipjs.toCanvas(canvas, opts);
        showCVS(ts0, new Date());
    } catch (e) {
        var msg = ('' + e).trim();
        document.getElementById('output').textContent = msg.indexOf("bwipp.") >= 0 ? msg : e.stack || msg;
        return;
    }
}

function showCVS(ts0, ts1) {
    var canvas = document.getElementById('canvas');
    canvas.style.display = '';
    var elt = symdesc[document.getElementById('symbol').value];
    saveCanvas.basename = elt.sym + '-' + document.getElementById('symtext').value.replace(/[^a-zA-Z0-9._]+/g, '-');

    canvas.style.zoom = window.devicePixelRatio ? 1 / window.devicePixelRatio : 1;
}

function saveCanvas(type, ext) {
    var canvas = document.getElementById('canvas');
    canvas.toBlob(function(blob) {
        saveAs(blob, saveCanvas.basename + ext);
    }, type, 1);
}

function printBarcode() {
    var canvas = document.getElementById('canvas');
    var dataUrl = canvas.toDataURL('image/png');
    var printWindow = window.open('', '_blank');
    printWindow.document.write('<html><body style="margin:10; padding:10;">');
    printWindow.document.write('<img src="' + dataUrl + '" onload="window.print(); window.close();">');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
}

function updateScale() {
  var scaleInhaltInput = document.getElementById('scaleInhalt');
  var scaleInhaltOutput = document.getElementById('wertInhalt');

  var scaleTitelInput = document.getElementById('scaleTitel');
  var scaleTitelOutput = document.getElementById('wertTitel');

  scaleInhaltInput.addEventListener('input', function() {
    scaleInhaltOutput.textContent = scaleInhaltInput.value; // Wert in UI aktualisieren
      render(); // Barcode neu rendern
  });

  scaleTitelInput.addEventListener('input', function() {
    scaleTitelOutput.textContent = scaleTitelInput.value; // Wert in UI aktualisieren
      render(); // Barcode neu rendern
  });

}