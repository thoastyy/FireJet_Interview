import { parse } from '@babel/parser';
import * as fs from 'fs';
import prettier from 'prettier';
import * as t from "@babel/types";
import _traverse from "@babel/traverse";
import _generate from "@babel/generator";

const traverse = _traverse.default; // from "@babel/traverse"
const generate = _generate.default; // from "@babel/generate"

// NIU
// Note: Only TemplateLiterals have quasis
// Need to handle expressions and quasis such that they are in order --> generally: quasi, expression, quasi ...
// Expression needs to use Babel generator to convert back to code
const getQuasi = (node : t.TemplateLiteral, storeLiterals: string[]) => {
    const tempStoreExp: string[] = [];
    const tempStoreQuasi: string[] = [];
    const merge: string[] = [];

    // if there are both expressions and quasis:
    if (node.expressions.length > 0) {
        for (let i=0; i<node.quasis.length; i++) {
            tempStoreQuasi.push(node.quasis[i].value.cooked)
        }
        for (let i=0; i<node.expressions.length; i++) {
            tempStoreExp.push(generate(node.expressions[i]).code)
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

    } else {
        // only 1 quasi (and therefore no expressions)
        storeLiterals.push(node.quasis[0].value.cooked);
    }
    
}

const checkTsxPrefix = (node:  t.TemplateLiteral) : boolean => {
    if (node.leadingComments && node.leadingComments[0].value == "tsx") {
        return true;
    }
    return false;
}

// async function to be used for linting text
async function lint(code: string) {
    return prettier.format(code, {"parser" : "babel"});
};


async function main() {

    // 1. Parsing the sample file to get AST
    const pathExhibitA = "./texts/exhibitA.txt";
    let file = fs.readFileSync(pathExhibitA, 'utf-8');

    const ast = parse(file, {
        sourceType: "module",
        plugins: ["typescript"],
    });

    // 2. Traverse to find all the template literals prefixed with /*tsx*/
    let templateLiteralNodes : t.TemplateLiteral[] = []; // store all the nodes of type TemplateLiteral here
    
    traverse(ast, {
        enter(path) {
            if (path.isTemplateLiteral()) {
                templateLiteralNodes.push(path.node);
            }
        }
    });
    
    // 3. Filter out nodes that do NOT have /*tsx*/ prefix
    templateLiteralNodes = templateLiteralNodes.filter((node) => checkTsxPrefix(node))
    
    // 4. Extract original code, lint and swap. Output in output.txt
    interface pair { 
        originalCode: string,
        postLinted: string
    }
    let pairs : pair[] = []; // need to store both original and linted code for replacement after iteration completion

    for (const node of templateLiteralNodes) {

        // Get string location using node.start and node.end 
        // https://stackoverflow.com/questions/61325886/how-to-get-code-as-a-string-from-babel-node-during-traverse
        
        const originalCodeChunk = file.slice(node.start +1, node.end -1)    
        
        const postLint = await lint(originalCodeChunk);

        pairs.push(
            {
                originalCode: originalCodeChunk,
                postLinted: postLint
            }
        );
    }
    
    for (let i =0; i< pairs.length; i++){
        file = file.replace(pairs[i].originalCode, pairs[i].postLinted)
    }
    
    fs.writeFileSync("output/output.txt", file)
    
};

main();