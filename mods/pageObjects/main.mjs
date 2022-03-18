import { print, visit } from 'recast';

import addStuff from './addStuff.mjs';
import addVarDeclarations from './addVarDeclarations.mjs';
import pageObjectVisitors from './pageObjectVisitors.mjs';
import specVisitors from './specVisitors.mjs';
import commentOut from './commentOut.mjs';
import updateConstructor from './updateConstructor.mjs';
import replace from './replace.mjs';
import utils from '../../utils/utils.mjs';
import filterOutLine from './filterOutLine.mjs';

const files = '/Users/rimantas/projects/dibs-toho/mg/**/*.js';
// const files =
//     '/Users/rimantas/projects/dibs-toho/mg/tests/user/seller/dealerInventoryManagement/dim_logistics_coordinator_spec.js';

const exec1 = false;
const exec2 = true;

export default () => {
    const allFiles = utils.getAllFiles(files);
    if (exec1) {
        const pageObjectFiles = allFiles.filter(
            filePath => filePath.includes('pageObjects') && !filePath.includes('iOS')
        );
        for (const filePath of pageObjectFiles) {
            console.log(filePath);
            let code = utils.getFile(filePath);
            code = commentOut(code);
            const ast = utils.getAST(code);
            const astVisitors = pageObjectVisitors.getVisitors(filePath);
            visit(ast, astVisitors);
            code = updateConstructor(print(ast).code);
            const newPath = filePath.replace(/\.js$/g, '.js');
            utils.renameFile(filePath, newPath);
            utils.updateFile(newPath, code);
        }
    }
    if (exec2) {
        const specFiles = allFiles.filter(
            filePath => filePath.includes('_spec') && !filePath.includes('iOS')
        );
        for (const filePath of specFiles) {
            console.log(filePath);
            specVisitors.resetImports();
            let oldCode = utils.getFile(filePath);
            oldCode = addStuff(oldCode);
            oldCode = commentOut(oldCode);
            oldCode = filterOutLine(oldCode);
            const ast = utils.getAST(oldCode);
            const astVisitors = specVisitors.getVisitors(filePath);
            visit(ast, astVisitors);
            const imports = specVisitors.getImports();
            let code = updateConstructor(print(ast).code);
            code = replace(code);
            code = addVarDeclarations(code, imports);
            const newPath = filePath; //.replace(/_spec/, '.spec').replace(/\.js$/g, '.js');
            // utils.renameFile(filePath, newPath);
            utils.updateFile(newPath, code);
        }
    }
};
