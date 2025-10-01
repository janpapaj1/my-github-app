// GitHub App Main Entry Point
const { App } = require('@octokit/app');
const { createNodeMiddleware } = require('@octokit/webhooks');

// Initialize the GitHub App
const app = new App({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_PRIVATE_KEY,
  webhooks: {
    secret: process.env.GITHUB_WEBHOOK_SECRET
  }
});

// Handle webhook events
app.webhooks.on('issues.opened', async ({ octokit, payload }) => {
  console.log('New issue opened:', payload.issue.title);
  
  // Example: Add a comment to new issues
  await octokit.rest.issues.createComment({
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    issue_number: payload.issue.number,
    body: 'Thanks for opening this issue! 🎉'
  });
});

// Handle pull request events  
app.webhooks.on('pull_request.opened', async ({ octokit, payload }) => {
  console.log('New PR opened:', payload.pull_request.title);
  
  // Example: Add a label to new PRs
  await octokit.rest.issues.addLabels({
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    issue_number: payload.pull_request.number,
    labels: ['needs-review']
  });
});

// Start the server
const port = process.env.PORT || 3000;
const middleware = createNodeMiddleware(app.webhooks, { path: '/api/github/webhooks' });

require('http').createServer(middleware).listen(port, () => {
  console.log(`GitHub App server listening on port ${port}`);
});

module.exports = app;