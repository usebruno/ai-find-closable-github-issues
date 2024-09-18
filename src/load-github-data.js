const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const GITHUB_API_URL = 'https://api.github.com';
const REPO_OWNER = 'usebruno';
const REPO_NAME = 'bruno';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function getGithubData(endpoint) {
  const response = await axios.get(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/${endpoint}`, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  return response.data;
}

async function saveJsonToFile(data, filename) {
    const dirPath = path.join(__dirname, '..', 'data');
    const filePath = path.join(dirPath, filename);
  
    // Create the directory if it doesn't exist
    await fs.mkdir(dirPath, { recursive: true });
  
    // Write the JSON data to the file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function loadAllGithubData() {
  try {
    console.log('Fetching open issues...');
    const issues = await getGithubData('issues?state=open');
    await saveJsonToFile(issues, 'issues.json');
    console.log('Issues saved to data/issues.json');

    console.log('Fetching closed pull requests...');
    const closedPrs = await getGithubData('pulls?state=closed');
    await saveJsonToFile(closedPrs, 'prs.json');
    console.log('Closed PRs saved to data/prs.json');

    console.log('Fetching releases...');
    const releases = await getGithubData('releases');
    await saveJsonToFile(releases, 'releases.json');
    console.log('Releases saved to data/releases.json');

    console.log('All GitHub data loaded and saved successfully.');
  } catch (error) {
    console.error('Error loading GitHub data:', error.message);
    throw error;
  }
}

loadAllGithubData();