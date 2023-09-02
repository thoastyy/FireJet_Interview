# FireJet_Interview
### Run
Install dependecies with `yarn install`.

`npm run build`

`node .\dist\index.js`

### Thought Process
1. First parse the txt file into AST
2. Traverse the AST and append the templateLiteral nodes into the `templateLiteralNodes` array
3. Remove nodes where the comments are not prefixed as `/*tsx*/`
4. For the remaining nodes, get their expressions and guasis. This will be stored in the `results` string array
5. Then lint.
```
export default function App() {
  return (
    <div
      style={{
        width: "100%",
        height: "90vh",
        overflow: "none",
        display: "grid",
        placeItems: "center",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="72px"
        height="72px"
        viewBox="0 0 100 100"
        enableBackground="new 0 0 0 0"
      >
        <path
          fill="#24252C"
          d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            dur="1s"
            from="0 50 50"
            to="360 50 50"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
}

import "./styles.css";

export default function App() {
  return (
    <div className="flex gap-2 w-[300px] h-[400px] bg-slate-500 p-4">
      <p>This text is big Hmm</p>
      <div className="bg-blue-400 w-8 h-8" />
      <div className="bg-red-400 w-8 h-8" />
      <div className="bg-green-400 w-8 h-8" />
    </div>
  );
}

export default function HelloWorld() {
  return (
    <p>
      Test Test 123
      <br />
      Test 2 1245
      <br />
      <b>
        <u>Wowzer</u>
      </b>
      <div>Testing</div>
      <div>
        <b style={{ textDecorationLine: "underline" }}>Hee </b>
        <i>ha ha</i>
      </div>
    </p>
  );
}
```
### Some tests
example 1 - both quasis[] and expressions[] have more than 1 element

example 2 - when `/*...*/` is of another value

example 4 - when there is another comment in the literal (though this correctly extracts the literal strings, it does not lint properly)
