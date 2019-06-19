# Lang checker

JS utils to check your langs in (X)HTML files.

This will primarily throw logs, warning and errors in the console. In addition, it can be used to duplicate `xml:lang` attributes into `lang` attributes.

From gist: https://gist.github.com/gregoriopellegrino/c94c46933d660a3db233e7a1c9c6f5e6

## Usage

In browsers, first load the lib:

```
<script type="application/javascript" src="lang-checker.js"></script>
```

Then use its methods:

```
<script type="application/javascript">
  // Handles xhtml and makes it behave nicely with methods below
  langChecker.handleXMLLang();

  // Tries to infer the main language of the doc
  langChecker.checkMainLang();

  // Finds all other languages in the document
  langChecker.checkOtherLangs();

  // Enables visual aid for checking langs visually (e.g. in a browser)
  langChecker.visualAid();
</script>
```

Check [example.xhtml](example.xhtml) for a practical example.

## Build and test

To build the dist script/lib:

```
npm run build
```

This will transpile (ES5) and bundle `src` into `bundle/` (via webpack).

To test: 

```
npm test
```

This will run unit tests with mocha.

## Customizing Visual Aid Styles

You can pass a custom stylesheet as an argument in `langChecker.visualAid("../relative-path-to-custom.css")` if you want to apply your own styles. 

If you don’t and just use `langChecker.visualAid()` – without passing any argument –, then default styles will be used.

Default styles are: 

```
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
```