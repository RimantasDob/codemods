import { visit } from 'recast';

import visitors from './visitors.mjs';
import utils from '../../utils/utils.mjs';

// const files = '/Users/rimantas/projects/dibs-toho/mg/pageObjects/1stdibs.com/AccountInfo.js';
const files = '/Users/rimantas/projects/dibs-toho/mg/**/*.js';

export default funcNames => {
    const allFiles = utils.getAllFiles(files);
    for (const filePath of allFiles) {
        let code = utils.getFile(filePath);
        const ast = utils.getAST(code);
        const astVisitors = visitors.getVisitors(filePath, funcNames);
        visit(ast, astVisitors);
    }
};
