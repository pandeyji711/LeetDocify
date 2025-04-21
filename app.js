const express = require("express");
const bodyParser = require("body-parser");
const dayjs = require("dayjs");
const path = require("path");
const dotenv = require("dotenv");
const githubFetcher = require("./services/githubFetcher");
const wordGenerator = require("./services/wordGenerator");
const fs = require("fs").promises; // Use fs.promises for async operations

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/submit", async (req, res) => {
  const { githubUser, repoName, email, language, fromDate, toDate } = req.body;

  try {
    const data = await githubFetcher(
      githubUser,
      repoName,
      language,
      fromDate,
      toDate
    );
    if (!data || data.length === 0) {
      return res.send(
        "No submissions found for the given GitHub user and repo."
      );
    }

    // console.log("Fetched data: ", data);
    const filePath = await wordGenerator(data);

    // Ensure the file exists before serving for download
    try {
      await fs.access(filePath); // Check if file exists asynchronously
      const today = dayjs().format("YYYY-MM-DD");
      console.log(today);
      // Serve the file as a download
      res.download(filePath, `LeetCode_Report_${today}.docx`, async (err) => {
        if (err) {
          console.error("Error downloading file: ", err);
          return res.send("Failed to download the report file.");
        }

        // Delete temp file after sending it
        await fs.unlink(filePath);
        // res.render("success");
      });
    } catch (fileError) {
      return res.send("Failed to generate the report file.");
    }
  } catch (error) {
    console.error("Error during processing:", error);
    res.send(
      "Something went wrong! Please check the console for more details."
    );
  }
});
function ch() {
  const today = dayjs().format("YYYY-MM-DD");
  console.log(today);
}
ch();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
