const bcp47validate = require("bcp47-validate");

/** Strips leading or trailing spaces from string */
const trimmer = (string) => {
  return string.trim();
}

/** Converts an array to string and makes it more readable for logs */
const arrayToLog = (array) => {
  // array.toString() will separate items with a comma
  // so we make a regex to add a space to improve readability
  return array.toString().replace(/,/g, ", ");
}

/** Converts the langs object to string and makes it more readable for logs */
const langsObjectToLog = (obj, sorted) => {
  // Converting lang to an array of langObject (lang: weight)
  obj = Object.keys(obj).map(key => {
    const langObj = {};
    langObj.lang = key;
    langObj.weight = obj[key];
    return langObj;
  });

  // If sortable is true
  if (sorted) {
    obj.sort((a, b) => b.weight - a.weight);
  }

  // We create an empty string
  let string = "";
  for (let i = 0; i < obj.length; i++) {
    const prop = obj[i].lang;
    // for each prop we transform the value to a percentage
    const percentage = (obj[i].weight * 100) + "%";
    
    // We add the lang (prop) and its percentage to the existing string
    string += `${prop} (${percentage}), `;
  }
  // We return the string w/o the coma and space we added for the last item
  return string.substring(0, string.length - 2);
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
  // In XML, leading and trailing spaces must be trimmed by UA
  const xmlValue = trimmer(el.getAttribute("xml:lang"));
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
    // We check every child node of the one we want to clean
    var child = node.childNodes[i];
    if (child.nodeType === 8 || child.nodeType === 4 || (child.nodeType === 3 && !/\S/.test(child.nodeValue))) {
      // If the childnode is a comment, a cdata, or a empty text node, we remove it and update the loop
      node.removeChild(child);
      i--;
    } else if (child.nodeType === 1) {
      // If it’s an element node, we run the function recursively
      cleanNode(child);
    }
  }
}

/** Removes scripts and styles from a node */
const sanitizeNode = (node) => {
  // We want to remove inline scripts and styles, and the visual aid switch the lib is adding
  const elementsToRemove = node.querySelectorAll("script, style, #langChecker-aid-label");
  for (let i = 0; i < elementsToRemove.length; i++) {
    const elementToRemove = elementsToRemove[i];
    elementToRemove.parentElement.removeChild(elementToRemove);
  }
}

/** Returns the text content of a node w/o scripts, styles, comments, etc. */
const getTextContent = (node) => {
  // We clone the node so that the real one is left untouched in the DOM
  const clone = cloneNode(node);
  // We remove comments, cdata, and normalize whitespace
  cleanNode(clone);
  // We remove inline scripts and styles
  sanitizeNode(clone);
  // We return the textContent of this modified clone
  return clone.textContent;
}

/** Computes the weight of text for a language in a given reference (textContent) */
const getWeight = (node, referenceText = getTextContent(document.body)) => {
  // We get the text content of the node
  const nodeContent = getTextContent(node);
  // We return the division of the two params as a three digits number
  return parseFloat((nodeContent.length / referenceText.length).toFixed(3));
}

module.exports = {
  arrayToLog: arrayToLog,
  langsObjectToLog: langsObjectToLog,
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
  getTextContent: getTextContent,
  getWeight: getWeight
}