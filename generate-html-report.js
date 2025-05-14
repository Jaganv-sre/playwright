const fs = require('fs');
const path = require('path');

const site = process.env.SITE || 'AU'; // Default to AU
const csvFilename = `performance-metrics-${site}.csv`;
const htmlFilename = `performance-report-${site}.html`;

const csvPath = path.join(__dirname, 'reports', csvFilename);
const htmlPath = path.join(__dirname, 'reports', htmlFilename);

if (!fs.existsSync(csvPath)) {
  console.error(`❌ CSV not found at: ${csvPath}`);
  process.exit(1);
}

const csv = fs.readFileSync(csvPath, 'utf-8').trim();
const lines = csv.split('\n');
const headers = lines[0].split(',');
const rows = lines.slice(1).map(line => line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/));

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Performance Report - ${site}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; }
    h1 {
      color: #0057a0;
      border-bottom: 2px solid #0057a0;
      padding-bottom: 10px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-top: 20px;
      background-color: #fff;
    }
    th {
      background-color: #444;
      color: #fff;
      padding: 12px;
      text-align: left;
    }
    td {
      border: 1px solid #ccc;
      padding: 10px;
      vertical-align: top;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    ol { margin: 0; padding-left: 20px; }
    li { margin-bottom: 4px; }
    a { color: #0073e6; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Forbes ${site} Site Performance Report</h1>
  <table>
    <thead>
      <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${rows.map(row => {
        const topResourcesRaw = row[3].replace(/^"|"$/g, '');
        const topResourcesList = topResourcesRaw
          .split('; ')
          .map(item => `<li>${item}</li>`)
          .join('');
        return `
        <tr>
          <td>${row[0]}</td>
          <td><a href="${row[1]}" target="_blank">${row[1]}</a></td>
          <td>${row[2]}</td>
          <td><ol>${topResourcesList}</ol></td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
</body>
</html>
`;

fs.writeFileSync(htmlPath, html, 'utf-8');
console.log(`✅ HTML report generated at ${htmlPath}`);
