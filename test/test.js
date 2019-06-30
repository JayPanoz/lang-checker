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

  it("should transform an array into a readable log", () => {
    const array = ["de","fr","es"];
    const log = utils.arrayToLog(array);

    expect(log).to.equal("de, fr, es");
  });

  it("should transform an object into a readable log", () => {
    const obj = {
      "de": 0.09,
      "fr": 0.36,
      "es": 0.18
    };
    const log = utils.langsObjectToLog(obj);

    expect(log).to.equal("de (9%), fr (36%), es (18%)");
  });

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

    // We must trim xml:lang in XML
    el.setAttribute("xml:lang", "en ");
    match = utils.xmlAndLangMatch(el);

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

  it("should deep clone a node", () => {
    const node = document.createElement("div");
    node.innerHTML = `<style>*{}</style><p><span class="drop-cap">C</span>all me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.</p><script>console.log("Hello")</script>`;

    const clone = utils.cloneNode(node);

    // What we care about is the markup so we check outerHTML and not deep equality
    expect(clone.outerHTML).to.equal(`<div xmlns="http://www.w3.org/1999/xhtml"><style>*{}</style><p><span class="drop-cap">C</span>all me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.</p><script>console.log("Hello")</script></div>`);
  });

  it("should normalize and clean a node by removing comments and cdata", () => {
    const node = document.createElement("div");
    node.innerHTML = `<!-- This is a comment that should be removed -->This is some text.<script><![CDATA[if (document.body.length > 1) {console.log("Hello")}]]></script>`;

    utils.cleanNode(node);
    expect(node.outerHTML).to.equal(`<div xmlns="http://www.w3.org/1999/xhtml">This is some text.<script></script></div>`);
  });

  it("should sanitize a node by removing scripts and styles", () => {
    const node = document.createElement("div");
    node.innerHTML = `<style>*{font-size: 100%}</style>This is some text.<script>console.log("hello")</script>`;

    utils.sanitizeNode(node);
    expect(node.outerHTML).to.equal(`<div xmlns="http://www.w3.org/1999/xhtml">This is some text.</div>`);
  });

  it("should return the “real” text content of a node", () => {
    const node = document.createElement("div");
    node.innerHTML = `<!-- This is a comment that should be removed -->This is some text followed by an empty element<span> </span> we ignore.<style>*{font-size: 100%}</style>This is some other text.<script>console.log("hello")</script>`;

    const text = utils.getTextContent(node);
    expect(text).to.equal("This is some text followed by an empty element we ignore.This is some other text.");
  });

  it("should return the weight of a node in a reference text", () => {
    const referenceText = `This is some text followed by an empty element we ignore.This is some other text.C’est une phrase en français.`;

    const node = document.createElement("div");
    node.textContent = `C’est une phrase en français.`;

    const result = utils.getWeight(node, referenceText);
    expect(result).to.equal(0.264);
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

  it("should be able to find valid hreflangs in the doc", () => {
    const { window } = new JSDOM(`<?xml version="1.0" encoding="utf-8"?>
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
    <head>
      <title>Test</title>
      <script type="application/javascript" src="../dist/lang-checker.js"></script>
      <link href="fr.xhtml" hreflang="fr " />
    </head>
    <body xml:lang="fr">
      <p id="no-match" xml:lang="es" lang="en">Test <a href="#" hreflang="de">with a link</a></p>
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

    checker.checkHrefLangs();

    assert(errorSpy.calledWith("There is a space in 'fr ' therefore it isn’t a valid BCP47 language tag for link:"));
    assert(logSpy.calledWith("hreflangs found: de"));
  });

  it("should be able to find other valid langs in the doc", () => {
    const { window } = new JSDOM(`<?xml version="1.0" encoding="utf-8"?>
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
    <head>
      <title>Test</title>
      <script type="application/javascript" src="../dist/lang-checker.js"></script>
      <link href="fr.xhtml" hreflang="fr " />
    </head>
    <body xml:lang="fr">
      <p id="no-match" xml:lang="es" lang="en">Test <a href="#" hreflang="de">with a link</a></p>
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

    assert(logSpy.calledWith("Other languages found: en (36.4%), ca (9.1%), it (18.2%), es (9.1%)"));

    checker.checkOtherLangs(document.body, true);

    assert(logSpy.calledWith("Other languages found: en (36.4%), ca (9.1%), it (18.2%), es (9.1%)"));
    assert(logSpy.calledWith("hreflangs found: de"));
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