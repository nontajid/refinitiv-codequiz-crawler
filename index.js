const puppeteer = require('puppeteer');

const getNavData = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://codequiz.azurewebsites.net/');
    await page.click('input[value=Accept]');
    await page.waitForSelector('table')

    const tableHeader = await page.evaluate(() => {
        const headerCols = document.querySelectorAll('table tr th');
        return Array.from(headerCols, headerCol => headerCol.innerHTML);
    });

    const fundNameIndex = tableHeader.findIndex(headerText => headerText.trim() === 'Fund Name');
    const navIndex = tableHeader.findIndex(headerText => headerText.trim() === 'Nav');

    const tableData = await page.evaluate(() => {
        const rows = document.querySelectorAll('table tr');
        // Get Data Row
        const dataRows = Array.from(rows, row => {
            const columns = row.querySelectorAll('td');
            return Array.from(columns, column => column.innerText);
        });

        return dataRows;
    });

    await browser.close();

    return tableData
        .filter(data => !!data[fundNameIndex] && !!data[navIndex])
        .map(data => {
            return {
                fundName: data[fundNameIndex],
                nav: data[navIndex],
            };
        });
}

const getRequestedFundName = () => {
    const arg = process.argv.slice(2);
    return arg[0];
}

(async () => {
    const fundDataList = await getNavData();
    const requestNavName = getRequestedFundName();
    const targetedFund = fundDataList.find(data => data.fundName === requestNavName);

    console.log(targetedFund ? targetedFund.nav : 'Fund not found');
})();
