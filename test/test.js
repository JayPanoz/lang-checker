const expect = require("chai").expect;
const assert = require("chai").assert;
const sinon = require("sinon");
const jsdom = require ("jsdom");
const { JSDOM } = jsdom;

const utils = require("../src/utils");
const checker = require("../src/index");

describe("# Utils", () => {
  const xhtml = `<?xml version="1.0" encoding="utf-8"?>
  <!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>Test</title>
  </head>
  <body>
  </body>
  </html>`;

  const { window } = new JSDOM(xhtml, {
    contentType: "application/xhtml+xml"
  }); 

  global.document = window.document;
  global.window = window;

  it("should return a lang is specified", () => {
    let lang = utils.langIsSpecified("en");
    expect(lang).to.be.true;

    lang = utils.langIsSpecified("");
    expect(lang).to.be.false;
  });

  it("should find whitespaces", () => {
    let lang = utils.hasWhitespace("en");
    expect(lang).to.be.false;

    lang = utils.hasWhitespace("en ");
    expect(lang).to.be.true;
  });

  it("should validate the lang against BCP47", () => {
    let lang = utils.isValidBCP47("en");
    expect(lang).to.be.true;

    lang = utils.isValidBCP47("en-US");
    expect(lang).to.be.true;

    lang = utils.isValidBCP47("i-yolo");
    expect(lang).to.be.false;
  });

  it("should report the lang for an element if it is specified and valid", () => {
    const valid = document.createElement("p");
    valid.setAttribute("lang", "en");

    let lang = utils.findLangForEl(valid);
    expect(lang).to.equal("en");

    const invalidSpace = document.createElement("p");
    invalidSpace.setAttribute("lang", " en");

    lang = utils.findLangForEl(invalidSpace);
    expect(lang).to.be.undefined;

    const invalidBCP = document.createElement("p");
    invalidBCP.setAttribute("lang", "i-yolo");

    lang = utils.findLangForEl(invalidBCP);
    expect(lang).to.be.undefined;

    const doesntExist = document.createElement("p");

    lang = utils.findLangForEl(doesntExist);
    expect(lang).to.be.undefined;
  });

  it("should check xml:lang and lang values match", () => {
    let el = document.createElement("p");
    el.setAttribute("xml:lang", "en");
    el.setAttribute("lang", "en");

    let match = utils.xmlAndLangMatch(el);
    
    expect(match).to.be.true;

    el.setAttribute("lang", "");
    match = utils.xmlAndLangMatch(el);

    expect(match).to.be.false;
  });

  it("should duplicate xml:lang to lang", () => {
    const el = document.createElement("p");
    el.setAttribute("xml:lang", "en");

    utils.xmlToLang(el);

    expect(el.getAttribute("lang")).to.equal("en");
  });
});

describe("# Methods", () => {
  let logSpy;
  let warnSpy;
  let errorSpy;

  beforeEach( () => {
    logSpy = sinon.spy(console, "log");
    warnSpy = sinon.spy(console, "warn");
    errorSpy = sinon.spy(console, "error");
  });

  afterEach( () => {
    logSpy.restore();
    warnSpy.restore();
    errorSpy.restore();
  })

  it("should be able to handle xml:lang", () => {
    const { window } = new JSDOM(`<?xml version="1.0" encoding="utf-8"?>
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
    <head>
      <title>Test</title>
    </head>
    <body xml:lang="en" lang="en ">
    </body>
    </html>`, {
      contentType: "application/xhtml+xml"
    }); 
    
    global.document = window.document;
    global.window = window;

    checker.handleXMLLang();

    const html = document.documentElement;
    expect(html.getAttribute("lang")).to.equal("en");

    assert(errorSpy.calledWith("Langs don’t match for element:"));
  });

  describe("## Main lang", () => {
    it("should report no lang is specified", () => {
      const { window } = new JSDOM(`<?xml version="1.0" encoding="utf-8"?>
      <!DOCTYPE html>
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Test</title>
      </head>
      <body>
      </body>
      </html>`, {
        contentType: "application/xhtml+xml"
      }); 
    
      global.document = window.document;
      global.window = window;
      global.navigator = window.navigator;

      checker.handleXMLLang();
      checker.checkMainLang();

      assert(warnSpy.calledWith("No lang is set, it will default to the navigator’s: en-US."));
    });

    it("should report lang is only specified for body", () => {
      const { window } = new JSDOM(`<?xml version="1.0" encoding="utf-8"?>
      <!DOCTYPE html>
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Test</title>
      </head>
      <body xml:lang="en">
      </body>
      </html>`, {
        contentType: "application/xhtml+xml"
      }); 
    
      global.document = window.document;
      global.window = window;

      checker.handleXMLLang();
      checker.checkMainLang();

      assert(warnSpy.calledWith("Main lang is 'en' but only set on BODY. Elements such as <title> consequently don’t inherit a specified lang and could inherit the navigator’s default."));
    });

    it("should report there is a mismatch between html and body", () => {
      const { window } = new JSDOM(`<?xml version="1.0" encoding="utf-8"?>
      <!DOCTYPE html>
      <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="fr">
      <head>
        <title>Test</title>
      </head>
      <body xml:lang="en">
      </body>
      </html>`, {
        contentType: "application/xhtml+xml"
      }); 
    
      global.document = window.document;
      global.window = window;

      checker.handleXMLLang();
      checker.checkMainLang();

      assert(warnSpy.calledWith("HTML and BODY langs don’t match. HTML is 'fr' while BODY is 'en'. Main lang will be 'en'."));
    });

    it("should report html if it’s the only one defined", () => {
      const { window } = new JSDOM(`<?xml version="1.0" encoding="utf-8"?>
      <!DOCTYPE html>
      <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="fr">
      <head>
        <title>Test</title>
      </head>
      <body>
      </body>
      </html>`, {
        contentType: "application/xhtml+xml"
      }); 
    
      global.document = window.document;
      global.window = window;

      checker.handleXMLLang();
      checker.checkMainLang();

      assert(logSpy.calledWith("Main lang is 'fr'."));
    });

    it("should report html if html and body match", () => {
      const { window } = new JSDOM(`<?xml version="1.0" encoding="utf-8"?>
      <!DOCTYPE html>
      <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="es">
      <head>
        <title>Test</title>
      </head>
      <body xml:lang="es">
      </body>
      </html>`, {
        contentType: "application/xhtml+xml"
      }); 
    
      global.document = window.document;
      global.window = window;

      checker.handleXMLLang();
      checker.checkMainLang();

      assert(logSpy.calledWith("Main lang is 'es'."));
    });
  });

  it("should be able to find other valid langs in the doc", () => {
    const { window } = new JSDOM(`<?xml version="1.0" encoding="utf-8"?>
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
    <head>
      <title>Test</title>
      <script type="application/javascript" src="../dist/lang-checker.js"></script>
    </head>
    <body xml:lang="fr">
      <p id="no-match" xml:lang="es" lang="en">Test</p>
      <p id="match" xml:lang="ca" lang="ca">Test</p>
      <p id="ascii-match" xml:lang="it" lang="IT">Test</p>
      
      <p id="xml-only" xml:lang="es">Test</p>
      <p id="space" xml:lang="it ">Test</p>
      
      <p id="no-bcp-1" xml:lang="fr-x">Test</p>
      <p id="no-bcp-2" xml:lang="ca-US1">Test</p>
      <p id="no-bcp-3" xml:lang="i-yolo">Test</p>
    </body>
    </html>`, {
      contentType: "application/xhtml+xml"
    }); 
    
    global.document = window.document;
    global.window = window;

    checker.handleXMLLang();
    checker.checkOtherLangs();

    assert(logSpy.calledWith("Other languages found: en, ca, it, es"));
  });

  describe("## Visual aid", () => {
    beforeEach( () => {
      const xhtml = `<?xml version="1.0" encoding="utf-8"?>
      <!DOCTYPE html>
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Test</title>
      </head>
      <body xml:lang="fr">
      </body>
      </html>`;

      const { window } = new JSDOM(xhtml, {
        contentType: "application/xhtml+xml"
      }); 

      global.document = window.document;
      global.window = window;
    });

    it("should add a switcher when the method is called", () => {
      checker.handleXMLLang();
      checker.visualAid();

      const input = document.querySelector("input");
      expect(input.id).to.equal("langChecker-aid-input");
    });

    it("should add internal styles on enable by default", () => {
      checker.handleXMLLang();
      checker.visualAid();

      const input = document.querySelector("input");
      input.click();

      const stylesheet = document.head.querySelector("style");
      expect(stylesheet.id).to.equal("langChecker-visual-aid");
      expect(stylesheet.textContent).to.contain("*[lang]::before");
    });

    it("should inject an external stylesheet on enable if an argument is passed", () => {
      checker.handleXMLLang();
      checker.visualAid("custom-styles.css");

      const input = document.querySelector("input");
      input.click();

      const stylesheet = document.head.querySelector("link");
      expect(stylesheet.id).to.equal("langChecker-visual-aid");
      expect(stylesheet.rel).to.equal("stylesheet");
      expect(stylesheet.href).to.equal("custom-styles.css");
    });

    it("should apply visual aid styles", async () => {
      // We can’t check pseudo element,cf. https://github.com/jsdom/jsdom/issues/1928, so…

      checker.handleXMLLang();
      checker.visualAid();

      const input = document.querySelector("input");
      input.click();

      const stylesApplied = window.getComputedStyle(document.body).getPropertyValue("border");
      expect(stylesApplied).to.equal("1px solid crimson");
    });
  });
})