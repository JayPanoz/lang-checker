import { validate } from "bcp47-validate";

/** Strips leading or trailing spaces from string */
const trimmer = (string) => {
  return string.trim();
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

/** Checks if string contains leading or trailing spaces */
const hasWhitespace = (string) => {
  return string.length > trimmer(string).length;
}

/** Checks if string is valid BCP47 */
const isValidBCP47 = (string) => {
  return validate(string);
}

/** Finds and checks validity of the lang for the given element */
export const findLangForEl = (el) => {
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
  }
  return undefined;
}