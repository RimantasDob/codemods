import { print, visit } from 'recast';

import visitors from './visitors.mjs';
import utils from '../../utils/utils.mjs';

const files = '/Users/rimantas/projects/dibs-toho/mg/pageObjects/1stdibs.com/ItemTile.js';
// const files = '/Users/rimantas/projects/dibs-toho/mg/**/*.js';

export default () => {
    const allFiles = utils.getAllFiles(files);
    for (const filePath of allFiles) {
        const ast = utils.getAST(filePath);
        const astVisitors = visitors.getVisitors(filePath);
        visit(ast, astVisitors);
        const code = print(ast).code;
        utils.updateFile(filePath, code);
    }
};
