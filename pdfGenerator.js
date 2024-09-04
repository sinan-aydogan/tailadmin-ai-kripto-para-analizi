import puppeteer from 'puppeteer';
import ExcelJS from "exceljs";

export default async function convertExcelToPDF(filePath, outputPdfPath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const browser = await puppeteer.launch({
        headless: true, // Run in background
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 960 })

    let fullHtmlContent = '<!DOCTYPE html><html><head><style>body, html { margin: 0; padding: 0; } table, th, td { border: 1px solid black; border-collapse: collapse; } th, td { padding: 10px; } @page { size: A4; margin: 10mm; }</style></head><body>';

    for (const sheet of workbook.worksheets) {
        fullHtmlContent += `<h2>${sheet.name}</h2><table>`;

        sheet.eachRow(row => {
            fullHtmlContent += '<tr>';
            row.eachCell(cell => {
                fullHtmlContent += `<td>${cell.value}</td>`;
            });
            fullHtmlContent += '</tr>';
        });

        fullHtmlContent += '</table><div style="page-break-after: always;"></div>';
    }

    fullHtmlContent += '</body></html>';


    await page.setContent(fullHtmlContent, { timeout: 0, waitUntil: 'networkidle0' });
    await page.pdf({
        path: outputPdfPath,
        format: 'A4',
        compress: true,
        scale: 0.75,
        timeout: 0
    });
    await browser.close().then(() => {
        console.log(filePath + ' dosyası ' + outputPdfPath + ' dosyasına dönüştürüldü.');
    });
}