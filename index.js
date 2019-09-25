const dotenv = require("dotenv");
const inquirer = require("inquirer");

const Repository = require("./lib/repository");
const transferRepository = require("./lib/utils").transferRepository;

dotenv.config();

(async () => {
  const sourceQuestions = [
    {
      type: "input",
      name: "sourceGhToken",
      message: "GitHub Personal Access Token(Source)",
      default: process.env["SOURCE_GH_TOKEN"]
    },
    {
      type: "input",
      name: "sourceDomain",
      message: "GitHub Domain(Source)",
      default: process.env["SOURCE_DOMAIN"] || "github.com"
    },
    {
      type: "input",
      name: "sourceRepoName",
      message: "Repository Name(Source)",
      default: process.env["SOURCE_REPO_NAME"]
    },
    {
      type: "input",
      name: "sourceRepoOwner",
      message: "Repositry Owner(Source)",
      default: process.env["SOURCE_REPO_OWNER"]
    },
    {
      type: "confirm",
      name: "sourceIsOrganization",
      message: "Is repository owner organization?(Source)",
      default: process.env["SOURCE_IS_ORGANIZATION"] === "true"
    },
    {
      type: "list",
      name: "sourceCloneType",
      message: "How do clone?(Source)",
      choices: ["https", "ssh"],
      default: process.env["SOURCE_CLONE_TYPE"]
    }
  ];

  const sourceAnswers = await inquirer.prompt(sourceQuestions);
  const {
    sourceGhToken,
    sourceDomain,
    sourceRepoName,
    sourceRepoOwner,
    sourceIsOrganization,
    sourceCloneType
  } = sourceAnswers;
  const sourceApiUrl =
    sourceDomain === "github.com"
      ? "https//api.github.com"
      : `https://${sourceDomain}/api/v3`;
  const sourceRepoUrl =
    sourceCloneType === "https"
      ? `https://${sourceDomain}/${sourceRepoOwner}/${sourceRepoName}.git`
      : `git@${sourceDomain}:${sourceRepoOwner}/${sourceRepoName}.git`;

  const targetQuestions = [
    {
      type: "input",
      name: "targetGhToken",
      message: "GitHub Personal Access Token(Target)",
      default: process.env["TARGET_GH_TOKEN"]
    },
    {
      type: "input",
      name: "targetDomain",
      message: "GitHub Domain(Target)",
      default: process.env["TARGET_DOMAIN"] || "github.com"
    },
    {
      type: "input",
      name: "targetRepoName",
      message: "Repository Name(Target)",
      default: process.env["TARGET_REPO_NAME"] || sourceRepoName
    },
    {
      type: "input",
      name: "targetRepoOwner",
      message: "Repositry Owner(Target)",
      default: process.env["TARGET_REPO_OWNER"]
    },
    {
      type: "confirm",
      name: "targetIsOrganization",
      message: "Is repository owner organization?(Target)",
      default: process.env["TARGET_IS_ORGANIZATION"] === "true"
    },
    {
      type: "list",
      name: "targetCloneType",
      message: "How do clone?(Target)",
      choices: ["https", "ssh"],
      default: process.env["TARGET_CLONE_TYPE"]
    }
  ];

  const targetAnswers = await inquirer.prompt(targetQuestions);
  const {
    targetGhToken,
    targetDomain,
    targetRepoName,
    targetRepoOwner,
    targetIsOrganization,
    targetCloneType
  } = targetAnswers;
  const targetApiUrl =
    targetDomain === "github.com"
      ? "https://api.github.com"
      : `https://${targetDomain}/api/v3`;
  const targetRepoUrl =
    targetCloneType === "https"
      ? `https://${targetDomain}/${targetRepoOwner}/${targetRepoName}.git`
      : `git@${targetDomain}:${targetRepoOwner}/${targetRepoName}.git`;

  const sourceRepo = new Repository(
    sourceRepoName,
    sourceRepoOwner,
    sourceApiUrl,
    sourceGhToken,
    sourceIsOrganization
  );
  const targetRepo = new Repository(
    targetRepoName,
    targetRepoOwner,
    targetApiUrl,
    targetGhToken,
    targetIsOrganization
  );
  const desc = await sourceRepo.getRepositoryDescription();
  await targetRepo.createRemoteRepository(desc);
  transferRepository(sourceRepoUrl, targetRepoUrl);
  const issues = await sourceRepo.getIssues();
  console.log(`${issues.length} issues`);
  await targetRepo.setIssues(issues);
  const hooks = await sourceRepo.getHooks();
  console.log(`${hooks.length} hooks`);
  await targetRepo.setHooks(hooks);
})();
