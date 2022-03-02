import { visit } from 'recast'

    import { getCallExpressionVisitor } from ('./src/visitors')
import utils  from    ('./src/utils')

const files = '/Users/rimantas/projects/dibs-toho/mg/index.js';
// const files = '/Users/rimantas/projects/dibs-toho/mg/**/*.js';

const main = () => {
    const allFiles = utils.getAllFiles(files);
    for (const filePath of allFiles) {
        console.log(filePath);
        const ast = utils.getAST(filePath);
        const visitor = getCallExpressionVisitor();
        visit(ast, visitor);
        utils.updateFile(filePath, ast);
    }
}

main()
