const axios = require("axios").default;
const parse = require("parse-link-header");

class Repository {
  constructor(repoName, owner, url, token, org = null) {
    this.repo = repoName;
    this.owner = owner;
    this.org = org;
    this.axios = axios.create({
      baseURL: url,
      headers: { Authorization: `token ${token}` }
    });
  }

  async getRepositoryDescription() {
    const res = await this.axios.get(
      `/repos/${this.org || this.owner}/${this.repo}`
    );
    return res.data.description;
  }

  async createRemoteRepository(description = null) {
    try {
      const url = this.org ? `/orgs/${this.org}/repos` : "/user/repos";
      await this.axios.post(url, {
        name: this.repo,
        private: true,
        description: description
      });
    } catch (e) {
      console.log(
        `Failed to create remote repository(${e.response.data.message})`
      );
    }
  }

  async getIssues() {
    try {
      let issues = [];
      let page = 0;
      while (true) {
        const issueParams = { state: "all", direction: "asc", page: ++page };
        console.log(issueParams);
        const res = await this.axios.get(
          `/repos/${this.org || this.owner}/${this.repo}/issues`,
          {
            params: issueParams
          }
        );
        for (const issue of res.data) {
          const {
            number,
            title,
            body,
            state,
            pull_request,
            comments_url
          } = issue;
          const isPullRequest = pull_request ? true : false;
          const commentRes = await this.axios.get(comments_url);
          const comments = commentRes.data.map(comment => comment.body);
          let head = null;
          let base = null;
          if (isPullRequest) {
            const pullRequestRes = await this.axios.get(pull_request.url);
            head = pullRequestRes.data.head.label;
            base = pullRequestRes.data.base.label;
          }
          issues.push({
            number,
            title,
            body,
            state,
            comments,
            isPullRequest,
            head,
            base
          });
        }
        const link = parse(res.headers.link);
        if (!link || !link.last) break;
      }
      return issues;
    } catch (e) {
      console.log(e);
    }
  }

  async setIssues(issues) {
    // issueとcommentの作成
    for (const issue of issues) {
      try {
        const res = await this.axios.post(
          `/repos/${this.org || this.owner}/${this.repo}/issues`,
          {
            title: issue.title,
            body: issue.body
          }
        );
        console.log(`Issue ${issue.number} was created!`);
        const commentsUrl = res.data.comments_url;
        for (const comment of issue.comments) {
          try {
            await this.axios.post(commentsUrl, { body: comment });
          } catch (e) {
            console.log(
              `Failed to create comments:${issue.number}(${e.response.data.message})`
            );
          }
        }
      } catch (e) {
        console.log(
          `Failed to create issue:${issue.number}(${e.response.data.message})`
        );
      }
    }
    // issueをpull requestに変更
    for (const issue of issues) {
      if (issue.isPullRequest) {
        const { number, head, base } = issue;
        try {
          await this.axios.post(
            `/repos/${this.org || this.owner}/${this.repo}/pulls`,
            {
              issue: number,
              head,
              base: "master"
            }
          );
          console.log(`Issue ${issue.number} was to be pull request!`);
        } catch (e) {
          console.log(
            `Failed to change issue to pull request:${issue.number}(${e.response.data.message})`
          );
        }
      }
    }
    // issueを閉じる
    for (const issue of issues) {
      try {
        if (issue.state === "closed") {
          await this.axios.patch(
            `/repos/${this.org || this.owner}/${this.repo}/issues/${
              issue.number
            }`,
            {
              state: "closed"
            }
          );
          console.log(`Issue ${issue.number} was closed!`);
        }
      } catch (e) {
        console.log(
          `Failed to close issue:${issue.number}(${e.response.data.message})`
        );
      }
    }
  }

  async getHooks() {
    const res = await this.axios.get(
      `/repos/${this.org || this.owner}/${this.repo}/hooks`
    );
    return res.data;
  }

  async setHooks(hooks) {
    for (const hook of hooks) {
      try {
        const { name, config, events, active } = hook;
        const hooks = await this.axios.post(
          `/repos/${this.org || this.owner}/${this.repo}/hooks`,
          {
            name,
            config,
            events,
            active
          }
        );
        console.log(`${name} hook was created!`);
      } catch (e) {
        console.log(
          `Failed to create hook:${name}(${e.response.data.message})`
        );
      }
    }
  }
}

module.exports = Repository;
