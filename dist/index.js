import { parse } from '@babel/parser';
import * as fs from 'fs';
import prettier from 'prettier';
import _traverse from "@babel/traverse";
import _generate from "@babel/generator";
const traverse = _traverse.default; // from "@babel/traverse"
const generate = _generate.default; // from "@babel/generate"
// Note: Only TemplateLiterals have quasis
// Need to handle expressions and quasis such that they are in order --> generally: quasi, expression, quasi ...
// Expression needs to use Babel generator to convert back to code
const getQuasi = (node, storeLiterals) => {
    const tempStoreExp = [];
    const tempStoreQuasi = [];
    const merge = [];
    // if there are both expressions and quasis:
    if (node.expressions.length > 0) {
        for (let i = 0; i < node.quasis.length; i++) {
            tempStoreQuasi.push(node.quasis[i].value.cooked);
        }
        for (let i = 0; i < node.expressions.length; i++) {
            tempStoreExp.push(generate(node.expressions[i]).code);
        }
        const maxLength = Math.max(tempStoreExp.length, tempStoreQuasi.length);
        for (let i = 0; i < maxLength; i++) {
            if (i < tempStoreQuasi.length) {
                merge.push(tempStoreQuasi[i]);
            }
            if (i < tempStoreExp.length) {
                merge.push(tempStoreExp[i]);
            }
        }
        storeLiterals.push(merge.join(""));
        merge.length = 0; // Clear the array
    }
    else {
        // only 1 quasi (and therefore no expressions)
        storeLiterals.push(node.quasis[0].value.cooked);
    }
};
const checkTsxPrefix = (node) => {
    if (node.leadingComments && node.leadingComments[0].value == "tsx") {
        // TODO: Iterate throught the leadingComments
        // console.log("++ Check tsxPrefix: ", node.leadingComments[0].value)
        return true;
    }
    return false;
};
// async function to be used for linting text
async function lint(code) {
    return prettier.format(code, { "parser": "babel" });
}
;
async function main() {
    // Parsing the sample file to get AST
    const pathExhibitA = "./texts/exhibitA.txt";
    const file = fs.readFileSync(pathExhibitA, 'utf-8');
    const ast = parse(file, {
        sourceType: "module",
        plugins: ["typescript"],
    });
    // Traverse to find all the template literals prefixed with /*tsx*/
    let templateLiteralNodes = []; // store all the nodes of type TemplateLiteral here
    let result = []; // store all the strings
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
        getQuasi(templateLiteralNodes[i], result);
    }
    ;
    console.log(result);
    for (let i = 0; i < result.length; i++) {
        const postLint = await lint(result[i]); // TODO: Need to replace original code
        console.log(postLint);
    }
}
;
main();
//# sourceMappingURL=index.js.map