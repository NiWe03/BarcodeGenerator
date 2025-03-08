//var allTypes = ['auspost', 'azteccode', 'aztecrune', 'bc412', 'coop2of5', 'channelcode', 'rationalizedCodabar', 'codablockf', 'code11', 'code128', 'code16k', 'code2of5', 'code39', 'code39ext', 'code49', 'code93', 'code93ext', 'codeone', 'azteccodecompact', 'pdf417compact', 'raw', 'daft', 'datamatrix', 'datamatrixrectangular', 'datamatrixrectangularextension', 'datalogic2of5', 'identcode', 'leitcode', 'dotcode', 'ean13', 'ean13composite', 'ean2', 'ean5', 'ean8', 'ean8composite', 'flattermarken', 'gs1-cc', 'gs1datamatrix', 'gs1datamatrixrectangular', 'databarexpanded', 'databarexpandedcomposite', 'databarexpandedstacked', 'databarexpandedstackedcomposite', 'databarlimited', 'databarlimitedcomposite', 'databaromni', 'databaromnicomposite', 'databarstacked', 'databarstackedcomposite', 'databarstackedomni', 'databarstackedomnicomposite', 'databartruncated', 'databartruncatedcomposite', 'gs1dldatamatrix', 'gs1dlqrcode', 'gs1dotcode', 'gs1northamericancoupon', 'gs1qrcode', 'gs1-128', 'gs1-128composite', 'ean14', 'hibcazteccode', 'hibccodablockf', 'hibccode128', 'hibccode39', 'hibcdatamatrix', 'hibcdatamatrixrectangular', 'hibcmicropdf417', 'hibcpdf417', 'hibcqrcode', 'hanxin', 'iata2of5', 'isbn', 'ismn', 'issn', 'itf14', 'industrial2of5', 'interleaved2of5', 'code32', 'japanpost', 'msi', 'mands', 'matrix2of5', 'maxicode', 'microqrcode', 'micropdf417', 'symbol', 'pdf417', 'pharmacode', 'pzn', 'plessey', 'posicode', 'qrcode', 'rectangularmicroqrcode', 'kix', 'royalmail', 'mailmark', 'sscc18', 'swissqrcode', 'telepen', 'telepennumeric', 'pharmacode2', 'upca', 'upcacomposite', 'upce', 'upcecomposite', 'onecode', 'planet', 'postnet', 'ultracode'];
var textSizeExponent = 0.4;

window.addEventListener('load', function() {
  // Definierte Barcode-Typen, die in der Auswahlliste angezeigt werden sollen
  var allowedTypes = ['code128', 'ean13', 'qrcode', 'upca', 'code39', 'pdf417', 'datamatrix', 'ean8', 'code93', 'upce'];

  // Auswahlliste der Barcode-Typen initialisieren
  var sel = document.getElementById('symbol');
  var opts = [];
  for (var id in symdesc) {
      if (allowedTypes && allowedTypes.length && allowedTypes.indexOf(symdesc[id].sym) === -1) {
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

  // Listener, der bei einer Änderung der Auswahl ausgeführt wird
  sel.addEventListener('change', function(ev) {
      var eltDesc = symdesc[sel.value];
      document.getElementById('example').textContent = "Beispiel: " + (eltDesc && eltDesc.text ? eltDesc.text : '');
      document.getElementById('symaltx').value = '';
      document.getElementById('output').textContent = '';
      document.getElementById('canvas').style.display = 'none';
      document.getElementById('saveas').style.visibility = 'hidden';
      document.getElementById('printas').style.visibility = 'hidden';
  });

  // Standardmäßig qrcode auswählen und einen Change-Event auslösen
  sel.value = "qrcode";
  const evt = new Event("change", { bubbles: false, cancelable: true });
  sel.dispatchEvent(evt);

  // Klick-Event zum Rendern des Barcodes
  document.getElementById('render').addEventListener('click', render);

  // Erlaube, den Barcode auch durch Drücken der Enter-Taste zu rendern
  document.getElementById('params').addEventListener('keypress', function(ev) {
    if (ev.key === "Enter") {
        render();
        ev.stopPropagation();
        ev.preventDefault();
    }
});


  // Lade die Schriftart Inconsolata für den Barcode
  bwipjs.loadFont("Inconsolata", 95, 105, Inconsolata);

  // Slider für "Größe Inhalt" initialisieren
  var scaleInhaltSlider = document.getElementById('scaleInhalt');
  var scaleInhaltOutput = document.getElementById('wertInhalt');
  scaleInhaltOutput.textContent = scaleInhaltSlider.value;
  scaleInhaltSlider.addEventListener('input', function() {
    scaleInhaltOutput.textContent = scaleInhaltSlider.value;
  });

  // Slider für "Größe Titel" initialisieren
  var scaleTitelSlider = document.getElementById('scaleTitel');
  var scaleTitelOutput = document.getElementById('wertTitel');
  scaleTitelOutput.textContent = scaleTitelSlider.value;
  scaleTitelSlider.addEventListener('input', function() {
    scaleTitelOutput.textContent = scaleTitelSlider.value;
  });
});

function render() {
  // Ausgewählter Barcode-Typ und Texte aus den Eingabefeldern
  var elt  = symdesc[document.getElementById('symbol').value];
  var text = document.getElementById('symtext').value.trim();
  var alttext = document.getElementById('symaltx').value.trim();
  var scale = +document.getElementById('scaleInhalt').value || 3;
  var scaleTitel = +document.getElementById('scaleTitel').value || 3;
  
  // Dynamische Berechnung der Textgröße basierend auf dem Skalierungswert
  var textSize = (Math.pow(scale, textSizeExponent) * scaleTitel);

  // Zurücksetzen der Ausgaben
  document.getElementById('output').textContent = '';

  var canvas = document.getElementById('canvas');
  canvas.height = 1;
  canvas.width  = 1;
  canvas.style.display = 'none';

  // Optionen für den Barcode inkl. dynamischer Textgröße
  let opts = {
      text: text,
      bcid: elt.sym,
      scale: scale,
      rotate: 'N',
      textsize: textSize
  };
  if (alttext) {
      opts.alttext = alttext;
  }

  // Barcode auf dem Canvas zeichnen und eventuelle Fehler abfangen
  try {
      let ts0 = new Date();
      bwipjs.toCanvas(canvas, opts);
      showCVS(ts0, new Date());
  } catch (e) {
      var msg = ('' + e).trim();
      if (msg.indexOf("bwipp.") >= 0) {
          document.getElementById('output').textContent = msg;
      } else if (e.stack) {
          document.getElementById('output').textContent =
              (e.stack.indexOf(msg) === -1 ? msg + '\n' : '') + e.stack;
      } else {
          document.getElementById('output').textContent = msg;
      }
      return;
  }
}

function showCVS(ts0, ts1) {
  // Anzeige des Canvas und der Buttons
  var canvas = document.getElementById('canvas');
  canvas.style.display = '';
  document.getElementById('saveas').style.visibility = 'visible';
  document.getElementById('printas').style.visibility = 'visible';

  // Erstelle einen Basisnamen für den Dateispeicher- bzw. Druckvorgang
  var elt = symdesc[document.getElementById('symbol').value];
  saveCanvas.basename = elt.sym + '-' + document.getElementById('symtext').value.replace(/[^a-zA-Z0-9._]+/g, '-');
  
  // Korrigiere die Anzeige des Canvas bei Geräten mit hohem Pixeldichtefaktor
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
  printWindow.document.write('<html><head><title>Print Barcode</title></head><body style="margin:0; padding:0;">');
  printWindow.document.write('<img src="' + dataUrl + '" onload="window.print(); window.close();">');
  printWindow.document.write('</body></html>');
  printWindow.document.close();
}
