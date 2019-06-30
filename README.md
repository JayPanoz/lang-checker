# Lang checker

JS utils to check your langs in (X)HTML files.

This will primarily throw logs, warning and errors in the console. In addition, it can be used to duplicate `xml:lang` attributes into `lang` attributes.

From gist: https://gist.github.com/gregoriopellegrino/c94c46933d660a3db233e7a1c9c6f5e6

## Usage

Either download the entire repository or the [lang-checker.js file](dist/lang-checker.js) (right-click on “Raw” then download).

The lib has been primarily designed for usage in browsers as it’s extensively relying on the console (in dev tools) and will report logs, warnings and errors there.

Then load the lib in your doc:

```
<script type="application/javascript" src="lang-checker.js"></script>
```

Finally you can use its public methods:

```
<script type="application/javascript">
  // Handles xhtml and makes it behave nicely with methods below
  langChecker.handleXMLLang();

  // Tries to infer the main language of the doc
  langChecker.checkMainLang();

  // Finds all hreflangs in the document
  langChecker.checkHrefLangs();

  // Finds all other languages in the document
  langChecker.checkOtherLangs();

  // Enables visual aid for checking langs visually (e.g. in a browser)
  langChecker.visualAid();
</script>
```

Check [example.xhtml](example.xhtml) for a practical example.

## Methods and their parameters

Although methods can be used AS-IS, you can also pass arguments if needed.

### handleXMLLang(ctx)

`ctx` is the context in which the function must run and transform `xml:lang` to `lang`. It expects an element.

Default is `document`.

### checkMainLang(root, body)

`root` is the root element – default is `document.documentElement`.

`body` is the body element – default is `document.body`.

### checkHrefLangs(ctx)

`ctx` is the context in which the function must run and check `hreflang`. It expects an element.

Default is `document` (to account for `link` elements in `head`).

### checkOtherLangs(ctx, sorted)

`ctx` is the context in which the function must run and check `lang`. It expects an element. Default is `document.body`.

`sorted` is a boolean that enables the sorting of languages depending on their weight in the document. Default is `false`.

### visualAid(customStylesheet)

`customStylesheet` is the path to a custom stylesheet for the visual aid (as a string). There is no default. See section below for further details.

## Customizing Visual Aid Styles

You can pass a custom stylesheet as an argument in `langChecker.visualAid("../path/to/custom.css")` if you want to apply your own styles. 

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

## Dev

### Install

You can either fork the repo if you aim to help improve the lib via PRs. Or you can clone it directly if you don’t.

```
git clone https://github.com/JayPanoz/lang-checker.git
```

Then cd into the lang-checker folder and: 

```
npm install
```

This will install all dependencies automatically, and set up build (webpack, babel) + automated tests (mocha, chai, sinon, JSDOM).

### Build

To build the dist script/lib after making changes to `src` files:

```
npm run build
```

This will transpile and bundle `src` into `dist/` (using webpack + babel).

### Test

To run automated tests: 

```
npm test
```

This will run unit tests with mocha. Note the `console` usage of the script will be output.