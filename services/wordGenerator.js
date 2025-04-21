const fs = require("fs");
const path = require("path");
const htmlToDocx = require("html-to-docx");

module.exports = async function generateDoc(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      "Invalid data passed to generateDoc. Data should be an array of items."
    );
  }

  const escapeHtml = (str) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const formatCode = (code) => {
    const escaped = escapeHtml(code);
    return escaped
      .split("\n")
      .map(
        (line) =>
          `<p style="font-family: Courier New, monospace; margin: 0; padding: 2px 5px;">${line.replace(
            / /g,
            "&nbsp;"
          )}</p>`
      )
      .join("");
  };

  const now = new Date();
  const timestamp = now.toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  });

  // Create table rows manually for TOC
  let tocRows = "";
  data.forEach((item, index) => {
    const estimatedPage = 2 + index * 2; // TOC on page 1, first Q on page 2
    tocRows += `
      <tr>
        <td style="padding: 6px 10px;">${index + 1}. ${item.title}</td>
        <td style="padding: 6px 10px;">Page ${estimatedPage}</td>
      </tr>`;
  });

  // Begin HTML
  let htmlContent = `
    <html>
      <head></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #121212; color: #f5f5f5;"> 

        <!-- Cover Page -->
        <div style="text-align: center; margin-top: 100px;">
          <h1 style="color: #00e676;">LeetCode Report</h1>
          <p><strong>Generated:</strong> ${timestamp}</p>
        </div>

        <!-- TOC -->
        <h2 style="color: #00e676;">📚 Table of Contents</h2>
        <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
          <thead>
            <tr>
              <th style="border: 1px solid #444; text-align: left; padding: 8px; background-color: #212121; color: #90caf9;">Problem Title</th>
              <th style="border: 1px solid #444; text-align: left; padding: 8px; background-color: #212121; color: #90caf9;">Page</th>
            </tr>
          </thead>
          <tbody>
            ${tocRows}
          </tbody>
        </table>

        <div style="page-break-before: always;"></div> 
  `;

  // Add questions & solutions
  data.forEach((item, i) => {
    const formattedCode = formatCode(item.solution);
    htmlContent += `
      <h2 style="color: #00e676;">${i + 1}. ${item.title}</h2>
      <h3 style="color: #90caf9;">📘 Question:</h3>
      <div style="color: #f5f5f5;">${item.question}</div>

      <div style="page-break-before: always;"></div>

      <h3 style="color: #90caf9;">💻 Solution:</h3>
      <div style="background: #1e1e1e; padding: 10px; border-radius: 5px; color: #dcdcdc;">
        ${formattedCode}
      </div>

      <div style="page-break-before: always;"></div>
    `;
  });

  htmlContent += `</body></html>`;

  // Create DOCX buffer
  const buffer = await htmlToDocx(htmlContent, null, {
    table: { row: { cantSplit: true } },
    footer: true,
    pageNumber: true,
  });

  const filePath = path.join(__dirname, `../report-${Date.now()}.docx`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
};
