# FireJet_Interview
Install dependecies with `yarn install`.

### Thought Process
1. First parse the txt file into AST
2. Traverse the AST and append the templateLiteral nodes into the `templateLiteralNodes` array
3. Remove nodes where the comments are not prefixed as `/*tsx*/`
4. For the remaining nodes, get their expressions and guasis. This will be stored in the `results` string array
5. Then lint.


### Some tests
example 1 - both quasis[] and expressions[] have more than 1 element

example 2 - when `/*...*/` is of another value

example 4 - when there is another comment in the literal (though this correctly extracts the literal strings, it does not lint properly)
