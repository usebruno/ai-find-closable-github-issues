const dotenv = require('dotenv');
const fs = require('fs').promises;
const path = require('path');
const { Anthropic } = require('@anthropic-ai/sdk');

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function analyzeIssue(issue, closedPrs, releases) {
  // Combine relevant information
  const context = `Issue: ${issue.title}\n${issue.body}\n\n` +
    `Closed PRs:\n${closedPrs.map(pr => `- ${pr.title}`).join('\n')}\n\n` +
    `Releases:\n${releases.map(release => `- ${release.name}`).join('\n')}`;

  // Use Anthropic to analyze
  const response = await anthropic.completions.create({
    model: "claude-2",
    prompt: `Human: You are an AI assistant that analyzes GitHub issues, closed pull requests, and releases to determine if an issue can be closed. Based on the following information, should this issue be closed? Respond with 'Yes' or 'No' and a brief explanation.\n\n${context}\n\nAssistant: I'll analyze the provided information and determine if the issue should be closed. I'll respond with 'Yes' or 'No' followed by a brief explanation.\n\nHuman: Great, please proceed with the analysis.\n\nAssistant:`,
    max_tokens_to_sample: 300,
  });

  return response.completion;
}

async function loadJsonFile(filename) {
  const filePath = path.join(__dirname, '..', 'data', filename);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('Loading data from JSON files...');
    const issues = await loadJsonFile('issues.json');
    const closedPrs = await loadJsonFile('prs.json');
    const releases = await loadJsonFile('releases.json');
    console.log('Data loaded successfully.');

    const issuesToClose = [];

    console.log('Analyzing issues...');
    for (const issue of issues) {
      console.log(`Analyzing issue #${issue.number}...`);
      const result = await analyzeIssue(issue, closedPrs, releases);
      console.log(result);
      if (result.toLowerCase().startsWith('yes')) {
        issuesToClose.push({ number: issue.number, title: issue.title, reason: result });
      }
    }

    console.log("\nIssues that can potentially be closed:");
    issuesToClose.forEach(({ number, title, reason }) => {
      console.log(`#${number}: ${title}`);
      console.log(`Reason: ${reason}\n`);
    });

    console.log('Saving analysis results...');
    await fs.writeFile(
      path.join(__dirname, '..', 'data', 'analysis_results.json'),
      JSON.stringify(issuesToClose, null, 2)
    );
    console.log('Analysis results saved to data/analysis_results.json');

  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

main();