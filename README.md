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
  // Duplicates xml:lang into lang
  langChecker.handleXMLLang();

  // Tries to infer the main language of the doc
  langChecker.checkMainLang();

  // Finds all other languages in the document
  langChecker.checkOtherLangs();

  // Enables visual aid for checking langs visually
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