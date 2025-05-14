export function generateHtmlReport(data, outputPath) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>AU Site Performance Report</title>
  <style>
    body { font-family: Arial; padding: 20px; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 40px; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background: #f4f4f4; }
    img { width: 100%; border: 1px solid #ddd; margin-top: 10px; }
  </style>
</head>
<body>
  <h1>Forbes AU Site Performance Report</h1>
  ${data
    .map(
      page => `
      <h2>${page.page}</h2>
      <p><strong>URL:</strong> <a href="${page.url}">${page.url}</a></p>
      <p><strong>Load Time:</strong> ${page.loadTime} ms</p>
      <p><strong>Top 5 Slowest Resources:</strong></p>
      <ul>
        ${page.topResources
          .map(resource => `<li>${resource.url} - ${resource.duration}ms</li>`) 
          .join('')}
      </ul>
      <img src="../${page.screenshot}" alt="${page.page} Screenshot" />
    `
    )
    .join('<hr />')}
</body>
</html>`;

  fs.writeFileSync(outputPath, html);
}

