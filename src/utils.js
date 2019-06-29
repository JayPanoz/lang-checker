const bcp47validate = require("bcp47-validate");

/** Strips leading or trailing spaces from string */
const trimmer = (string) => {
  return string.trim();
}

const arrayToLog = (array) => {
  return array.toString().replace(/,/g, ", ")
}

/** Checks if lang is specified */
const langIsSpecified = (string) => {
  string = trimmer(string);
  if (string.length > 0) {
    return true;
  } else {
    return false;
  }
}

/** Checks if string contains whitespace */
const hasWhitespace = (string) => {
  return (/\s/g).test(string)
}

/** Checks if string is valid BCP47 */
const isValidBCP47 = (string) => {
  return bcp47validate.validate(string);
}

/** Finds and checks validity of the lang for the given element */
const findLangForEl = (el) => {
  const langValue = el.lang;
  if (langIsSpecified(langValue)) {
    // If lang is specified

    if (!hasWhitespace(langValue)) {
      if (isValidBCP47(langValue)) {
        // If value is valid, return value
        return langValue;
      } else {
        console.error(`'${langValue}' isn’t a valid BCP47 language tag for element:`, el);
      }
    } else {
      // If lang specified for el have a space, then it’s invalid BCP47 so we throw an error
      console.error(`There is a space in '${langValue}' therefore it isn’t a valid BCP47 language tag for element:`, el);
    }
  } else {
    console.log(`There is no lang attribute for:`, el);
  }
  return undefined;
}

/** Finds and checks validity of the hreflang for a link */
const findHreflangForLink = (link) => {
  const hreflangValue = link.hreflang;
  if (langIsSpecified(hreflangValue)) {
    // If lang is specified

    if (!hasWhitespace(hreflangValue)) {
      if (isValidBCP47(hreflangValue)) {
        // If value is valid, return value
        return hreflangValue;
      } else {
        console.error(`'${hreflangValue}' isn’t a valid BCP47 language tag for link:`, link);
      }
    } else {
      // If lang specified for el have a space, then it’s invalid BCP47 so we throw an error
      console.error(`There is a space in '${hreflangValue}' therefore it isn’t a valid BCP47 language tag for link:`, link);
    }
  } else {
    console.log(`There is no hreflang attribute for:`, link);
  }
  return undefined;
}

/** Checks if xml:lang and lang values match */
const xmlAndLangMatch = (el) => {
  const xmlValue = el.getAttribute("xml:lang");
  const langValue = el.getAttribute("lang");
  return (xmlValue.toLowerCase() === langValue.toLowerCase());
}

/** Duplicates xml:lang in a lang attribute */
const xmlToLang = (el) => {
  // In XML, leading and trailing spaces must be trimmed by UA
  // we consequently do it when setting lang so that
  // we don’t get false positives later
  const xmlValue = el.getAttribute("xml:lang");
  const langValue = trimmer(xmlValue);
  el.setAttribute("lang", langValue);
}

/** Clones a node */
const cloneNode = (node) => {
  return node.cloneNode(true);
}

/** Recursively removes comments and CDATA, and normalizes whitespace */
const cleanNode = (node) => {
  for (let i = 0; i < node.childNodes.length; i++) {
    var child = node.childNodes[i];
    if (child.nodeType === 8 || child.nodeType === 4 || (child.nodeType === 3 && !/\S/.test(child.nodeValue))) {
      node.removeChild(child);
      i--;
    } else if (child.nodeType === 1) {
      cleanNode(child);
    }
  }
}

/** Removes scripts and styles from a node */
const sanitizeNode = (node) => {
  const elementsToRemove = node.querySelectorAll("script, style, #langChecker-aid-label");
  for (let i = 0; i < elementsToRemove.length; i++) {
    const elementToRemove = elementsToRemove[i];
    elementToRemove.parentElement.removeChild(elementToRemove);
  }
}

/** Returns the text content of a node w/o scripts, styles, comments, etc. */
const getTextContent = (node) => {
  const clone = cloneNode(node);
  cleanNode(clone);
  sanitizeNode(clone);
  return clone.textContent;
}

module.exports = {
  arrayToLog: arrayToLog,
  langIsSpecified: langIsSpecified,
  hasWhitespace: hasWhitespace,
  isValidBCP47: isValidBCP47,
  findLangForEl: findLangForEl,
  findHreflangForLink: findHreflangForLink,
  xmlAndLangMatch: xmlAndLangMatch,
  xmlToLang: xmlToLang,
  cloneNode: cloneNode,
  cleanNode: cleanNode,
  sanitizeNode: sanitizeNode,
  getTextContent: getTextContent
}