const assert = require("chai").assert;
const sinon = require("sinon");
const jsdom = require ("jsdom");
const { JSDOM } = jsdom;

const xhtml = `<?xml version="1.0" encoding="utf-8"?>
  <!DOCTYPE html>
  
  <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
  <head>
    <title>Test file</title>
  </head>
  <body xml:lang="fr">
     <p id="no-match" xml:lang="es" lang="en">Test</p>
     <p id="match" xml:lang="ca" lang="ca">Test</p>
     <p id="ascii-match" xml:lang="it" lang="IT">Test</p>
  
     <p id="xml-only" xml:lang="es">Test</p>
     <p id="space" xml:lang="it ">Test</p>
  
     <p id="no-bcp-1" xml:lang="fr-x-million-made-man">Test</p>
     <p id="no-bcp-2" xml:lang="ca-US1">Test</p>
     <p id="no-bcp-3" xml:lang="i-yolo">Test</p>
  </body>
  </html>`;

const { window } = new JSDOM(xhtml, {
  contentType: "application/xhtml+xml"
});

global.document = window.document;
global.window = window;

it("should be OK", () => {
  let spy = sinon.spy(console, "warn");

  assert(spy.calledWith("HTML and BODY langs don’t match. HTML is 'en' while BODY is 'fr'. Main lang will be 'fr'."));

  spy.restore();
});