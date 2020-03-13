const exec = require("child_process").execSync;

function transferRepository(sourceRepoUrl, targetRepoUrl) {
  try {
    const sourceRepoName = sourceRepoUrl.match(/\/([^/]+)$/)[1];
    exec(`./transfer.sh ${sourceRepoUrl} ${targetRepoUrl} ${sourceRepoName}`);
  } catch (e) {
    console.log(`Failed to transfer repository`);
    throw e
  }
}

module.exports = { transferRepository: transferRepository };
