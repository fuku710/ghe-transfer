const dotenv = require("dotenv");

const Repository = require("./lib/repository");
const transferRepository = require("./lib/utils").transferRepository;

dotenv.config();

const SOURCE_GH_TOKEN = process.env["SOURCE_GH_TOKEN"];
const SOURCE_REPO_URL = process.env["SOURCE_REPO_URL"];
const SOURCE_API_URL = process.env["SOURCE_API_URL"];
const SOURCE_REPO_OWNER = process.env["SOURCE_REPO_OWNER"];
const SOURCE_REPO_NAME = process.env["SOURCE_REPO_NAME"];

const TARGET_GH_TOKEN = process.env["TARGET_GH_TOKEN"];
const TARGET_REPO_URL = process.env["TARGET_REPO_URL"];
const TARGET_API_URL = process.env["TARGET_API_URL"];
const TARGET_REPO_OWNER = process.env["TARGET_REPO_OWNER"];
const TARGET_REPO_NAME = process.env["TARGET_REPO_NAME"];

(async () => {
  const sourceRepo = new Repository(
    SOURCE_REPO_NAME,
    SOURCE_REPO_OWNER,
    SOURCE_API_URL,
    SOURCE_GH_TOKEN
  );
  const targetRepo = new Repository(
    TARGET_REPO_NAME,
    TARGET_REPO_OWNER,
    TARGET_API_URL,
    TARGET_GH_TOKEN
  );
  const desc = await sourceRepo.getRepositoryDescription();
  await targetRepo.createRemoteRepository(desc);
  transferRepository(SOURCE_REPO_URL, TARGET_REPO_URL);
  const issues = await sourceRepo.getIssues();
  console.log(issues);
  await targetRepo.setIssues(issues);
  const hooks = await sourceRepo.getHooks();
  console.log(hooks);
  await targetRepo.setHooks(hooks);
})();
