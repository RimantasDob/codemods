export default code =>
    code
        .split('\n')
        .filter(line => !line.includes("navigateHelper');"))
        .filter(line => !line.includes("spinnerHelper');"))
        .filter(line => !line.includes('Spinner({ page });'))
        .filter(line => !line.includes('Navigate({ page });'))
        .filter(line => !line.includes("Spinner');"))
        .filter(line => !line.includes("Navigate');"))
        .join('\n');
