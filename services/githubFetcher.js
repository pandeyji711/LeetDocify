const axios = require("axios");
const dayjs = require("dayjs");
require("dotenv").config();
const GITHUB_TOKEN = process.env.API_KEY;

module.exports = async function fetchSubmissionsInRange(
  username,
  repo,
  language,
  fromDate,
  toDate
) {
  const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/`;

  const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
  };

  const folders = (await axios.get(apiUrl, { headers })).data;
  const filteredData = [];

  const from = dayjs(fromDate, "YYYY-MM-DD").startOf("day");
  const to = dayjs(toDate, "YYYY-MM-DD").endOf("day");

  for (const folder of folders) {
    if (folder.type === "dir") {
      const folderPath = `${apiUrl}${folder.name}`;
      const files = (await axios.get(folderPath, { headers })).data;

      const readme = files.find((f) => f.name.toLowerCase().includes("readme"));
      const ext = files.find((f) => f.name.endsWith(`${language}`));

      if (readme && ext) {
        const readmeData = await axios.get(readme.download_url, { headers });
        const codeData = await axios.get(ext.download_url, { headers });

        const commitInfo = await axios.get(
          `https://api.github.com/repos/${username}/${repo}/commits?path=${folder.name}/${ext.name}`,
          { headers }
        );

        const latestCommitDate = commitInfo.data[0]?.commit?.committer?.date;
        const commitDay = dayjs(latestCommitDate);

        if (
          (commitDay.isAfter(from) && commitDay.isBefore(to)) ||
          commitDay.isSame(from, "day") ||
          commitDay.isSame(to, "day")
        ) {
          filteredData.push({
            title: folder.name,
            question: readmeData.data,
            solution: codeData.data,
          });
        }
      }
    }
  }

  return filteredData;
};
