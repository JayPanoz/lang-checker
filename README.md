# Lang checker

JS utils to check your langs in (X)HTML files.

This will primarily throw logs, warning and errors in the console. In addition, it can be used to duplicate `xml:lang` attributes into `lang` attributes.

From gist: https://gist.github.com/gregoriopellegrino/c94c46933d660a3db233e7a1c9c6f5e6

## Usage

```
<script type="application/javascript" src="lang-checker.js"></script>
```

```
<script type="application/javascript">
  // Duplicates xml:lang into lang
  langChecker.handleXMLLang();

  // Tries to infer the main language of the doc
  langChecker.checkMainLang();

  // Finds all other languages in the document
  langChecker.checkOtherLangs();
</script>
```

## Compile and build

To bundle for browsers:

```
npm run build
```

This will compile (ES5) and bundle `src` into `bundle/` (via webpack).

To compile for node.js: 

```
npm run compile
```

This will compile `src` in `dist` (via babel) so that it’s usable with node.js.

## Notes

- `dist` is meant for node.js (require/import) but you’ll need a DOM (e.g. JSDOM) to make it work.
- `bundle` is meant for browsers, see usage.