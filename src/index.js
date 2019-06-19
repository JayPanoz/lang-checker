var utils = require("./utils");

/** Handles XHTML (xml namespace) */
const handleXMLLang = () => {
  // Query all elements in the DOM
  const domEls = document.querySelectorAll("*");

  // For each, check if there is an xml:lang
  for (let i = 0; i < domEls.length; i++) {
    const el = domEls[i];

    if (el.hasAttribute("xml:lang") && el.hasAttribute("lang")) {
      // if there is, and there’s also a lang, make sure their values match:
      const xmlValue = el.getAttribute("xml:lang");
      const langValue = el.getAttribute("lang");
      if (xmlValue.toLowerCase() !== langValue.toLowerCase()) {
        // If value is different then it’s an error
        console.error(`Langs don’t match for element:`, el);
      }
    } else if (el.hasAttribute("xml:lang") && !el.hasAttribute("lang")) {
      // if there is xml:lang but not lang, then add it 
      // Note: this function must be called first so that code below takes over
      utils.xmlToLang(el);
    }
  }
};

/** Tries to infer what the main lang will be */
const checkMainLang = () => {
  // Checking if lang specified for html and body 
  const docLang = utils.findLangForEl(document.documentElement);
  const bodyLang = utils.findLangForEl(document.body);

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
};

/** Tries to find all other langs in the doc */
const checkOtherLangs = () => {
  // Other languages start here, with an empty array
  let langs = [];
  // We check all elements in body with a lang attribute
  const els = document.body.querySelectorAll(`*[lang]`);

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
  console.log(`Other languages found: ${langs.toString().replace(/,/g, ", ")}`);
};

module.exports = {
  handleXMLLang: handleXMLLang,
  checkMainLang: checkMainLang,
  checkOtherLangs: checkOtherLangs
}