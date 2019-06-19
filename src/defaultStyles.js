const defaultStyles = `
*[lang] {
  box-sizing: border-box;
  border: 1px solid crimson;
  padding: 5px;
  position: relative;
}
*[lang]::before {
  content: attr(lang);
  display: inline-block;
  font-family: sans-serif;
  font-weight: bold;
  background-color: crimson;
  color: white;
  padding: 5px 10px;
  margin-right: 10px;
  position: relative;
  top: -5px;
  left: -5px;
}
`;

module.exports = defaultStyles;