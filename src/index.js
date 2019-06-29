const utils = require("./utils");
const defaultStyles = require("./defaultStyles");

/** Handles XHTML (xml namespace) */
const handleXMLLang = (ctx = document) => {
  // Query all elements in the DOM
  const domEls = ctx.querySelectorAll("*");

  // For each, check if there is an xml:lang
  for (let i = 0; i < domEls.length; i++) {
    const el = domEls[i];

    if (el.hasAttribute("xml:lang") && el.hasAttribute("lang")) {
      // if there is, and there’s also a lang, make sure their values match:
      if (!utils.xmlAndLangMatch(el)) {
        // If values are different then it’s an error
        console.error(`Langs don’t match for element:`, el);
      }
    } else if (el.hasAttribute("xml:lang") && !el.hasAttribute("lang")) {
      // if there is xml:lang but no lang, then add it 
      // Note: this function must be called first so that code below takes over
      utils.xmlToLang(el);
    }
  }
}

/** Tries to infer what the main lang will be */
const checkMainLang = (root = document.documentElement, body = document.body) => {
  // Checking if lang specified for html and body 
  const docLang = utils.findLangForEl(root);
  const bodyLang = utils.findLangForEl(body);

  if (docLang && bodyLang) {
    // If both HTML and BODY langs are specified

    if (docLang !== bodyLang) {
      // We check if they match, and warn if they don’t
      console.warn(
        `HTML and BODY langs don’t match. HTML is '${docLang}' while BODY is '${bodyLang}'. Main lang will be '${bodyLang}'.`
      );
    } else {
      // Else we use html’s
      console.log(`Main lang is '${docLang}'.`);
    }
  } else if (docLang && !bodyLang) {
    // If it’s specified for html
    console.log(`Main lang is '${docLang}'.`);
  } else if (bodyLang && !docLang) {
    // If it’s specified for body
    console.warn(`Main lang is '${bodyLang}' but only set on BODY. Elements such as <title> consequently don’t inherit a specified lang and could inherit the navigator’s default.`);
  } else {
    // Else we warn no lang is set and the navigator’s default will be used
    console.warn(`No lang is set, it will default to the navigator’s: ${navigator.language}.`)
  }
}

/** Tries to find all hreflangs in the doc */
const checkHrefLangs = (ctx = document.documentElement) => {
  let hrefLangs = [];
  const links = ctx.querySelectorAll(`link[hreflang], a[hreflang]`);
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const hrefLangToAdd = utils.findHreflangForLink(link);

    if (hrefLangToAdd && hrefLangs.indexOf(hrefLangToAdd.toLowerCase()) === -1) {
      hrefLangs.push(hrefLangToAdd.toLowerCase());
    }
  }
  console.log(`hreflangs found: ${utils.arrayToLog(hrefLangs)}`);
}

/** Tries to find all other langs in the doc */
const checkOtherLangs = (ctx = document.body, hreflangCheck = false) => {
  // Other languages start here, with an empty array
  let langs = [];
  // We check all elements in body with a lang attribute
  const els = ctx.querySelectorAll(`*[lang]`);

  // For each, we check if we must add the lang to the array
  for (let i = 0; i < els.length; i++) {
    const el = els[i];
    const langToAdd = utils.findLangForEl(el);

    // If there’s a lang and it isn’t in the array yet, we add it
    if (langToAdd && langs.indexOf(langToAdd.toLowerCase()) === -1) {
      langs.push(langToAdd.toLowerCase());
    }
  }
  // Finally we log all the other languages found.
  console.log(`Other languages found: ${utils.arrayToLog(langs)}`);

  if (hreflangCheck) {
    checkHrefLangs();
  }
}

const visualAid = (customStylesheet) => {
  const label = document.createElement("label");
  label.setAttribute("style", `position: fixed;
    top: 10px;
    right: 10px;
    z-index: 10;
    font-family: sans-serif;`);
  label.id = "langChecker-aid-label";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = "langChecker-aid-input";
  input.name = "langChecker-aid-input";

  label.appendChild(input);
  label.innerHTML += "\nEnable visual aid";

  document.body.insertBefore(label, document.body.firstChild);

  const switcher = document.querySelector("#langChecker-aid-input");

  switcher.addEventListener("change", () => {
    let stylesheet;

    if (customStylesheet) {
      stylesheet = document.createElement("link");
      stylesheet.type = "text/css";
      stylesheet.id = "langChecker-visual-aid";
      stylesheet.href = customStylesheet;
      stylesheet.rel = "stylesheet";
    } else {
      stylesheet = document.createElement("style");
      stylesheet.type = "text/css";
      stylesheet.id = "langChecker-visual-aid";
      stylesheet.textContent = defaultStyles;
    }

    if (switcher.checked) {
      document.head.appendChild(stylesheet);
    } else {
      document.head.removeChild(document.head.querySelector("#langChecker-visual-aid"));
    }
  });
}

module.exports = {
  handleXMLLang: handleXMLLang,
  checkMainLang: checkMainLang,
  checkHrefLangs: checkHrefLangs,
  checkOtherLangs: checkOtherLangs,
  visualAid: visualAid
}