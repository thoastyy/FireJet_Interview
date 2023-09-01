import { parse } from '@babel/parser';
import * as fs from 'fs';
import prettier from 'prettier';
import _traverse from "@babel/traverse";
const traverse = _traverse.default; // from "@babel/traverse"
// Parsing the sample file to get AST
const pathExhibitA = "./exhibitA.txt";
const file = fs.readFileSync(pathExhibitA, 'utf-8');
const ast = parse(file, {
    sourceType: "module",
    plugins: ["typescript"],
});
// Note: Only TemplateLiterals have quasis
const getQuasi = (node) => {
    // console.log("++ first quasi",node.quasis[0]);
    // TODO: consider the event when quasis[] > 1
    return node.quasis[0].value.cooked; // TODO: consider raw or cooked (whats the diff even LOL)
};
const checkTsxPrefix = (node) => {
    if (node.leadingComments) {
        const tsxPrefix = node.leadingComments[0].value; // TODO: Iterate throught the leadingComments
        // console.log(tsxPrefix)
        return true;
    }
    return false;
};
// async function to be used for linting text
async function lint(code) {
    return prettier.format(code, { "parser": "babel" });
}
;
async function main(ast) {
    // Traverse to find all the template literals prefixed with /*tsx*/
    let templateLiteralNodes = []; // store all the nodes of type TemplateLiteral here
    let result = [];
    traverse(ast, {
        enter(path) {
            //   console.log(path.node);
            if (path.isTemplateLiteral()) {
                templateLiteralNodes.push(path.node);
            }
        }
    });
    // Filter out nodes that do NOT have /*tsx*/ prefix
    templateLiteralNodes = templateLiteralNodes.filter((node) => checkTsxPrefix(node));
    // Append the strings to result[]
    for (let i = 0; i < templateLiteralNodes.length; i++) {
        result.push(getQuasi(templateLiteralNodes[i]));
    }
    ;
    for (let i = 0; i < result.length; i++) {
        const linted = await lint(result[i]);
        console.log("++ linted: ", linted);
    }
}
;
main(ast);
//# sourceMappingURL=index.js.map