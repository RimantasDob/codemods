import utils from '../../utils/utils.mjs';

const files = '/Users/rimantas/projects/dibs-toho/mg/**/*.js';

export default () => {
    const allFiles = utils.getAllFiles(files).filter(file => file.includes('_spec.js'));
    for (const filePath of allFiles) {
        console.log(filePath);
        const newPath = filePath.replace(/_spec\.js$/g, '.spec.js');
        utils.renameFile(filePath, newPath);
    }
};
