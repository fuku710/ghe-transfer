const got = require("got").default;
const tunnel = require("tunnel");
const parse = require("parse-link-header");

class Repository {
  constructor(
    repoName,
    owner,
    apiUrl,
    token,
    isOrg,
    { useProxy = false, proxyUrl = null }
  ) {
    this.repo = repoName;
    this.owner = owner;
    this.isOrg = isOrg;
    let agent = null;
    if (useProxy) {
      const proxy = proxyUrl || process.env["http_proxy"];
      const proxyMatchResult = proxy.match(/(https?:\/\/)?(.+):([0-9]+)/);
      agent = tunnel.httpsOverHttp({
        proxy: {
          host: proxyMatchResult[2],
          port: proxyMatchResult[3]
        }
      });
    }
    this.got = got.extend({
      prefixUrl: apiUrl,
      headers: { Authorization: `token ${token}` },
      responseType: "json",
      agent
    });
  }

  async getRepositoryDescription() {
    try {
      const res = await this.got.get(`repos/${this.owner}/${this.repo}`);
      return res.body.description;
    } catch (e) {
      console.log(`Failed to get repository description`);
      throw e;
    }
  }

  async createRemoteRepository(description = null) {
    try {
      const url = this.isOrg ? `orgs/${this.owner}/repos` : "user/repos";
      const res = await this.got.post(url, {
        json: {
          name: this.repo,
          private: true,
          description: description
        }
      });
    } catch (e) {
      console.log(`Failed to create remote repository`);
      throw e;
    }
  }

  async getIssues() {
    try {
      let issues = [];
      let page = 0;
      while (true) {
        const issueParams = new URLSearchParams([
          ["state", "all"],
          ["direction", "asc"],
          ["page", ++page]
        ]);
        const res = await this.got.get(
          `repos/${this.owner}/${this.repo}/issues`,
          {
            searchParams: issueParams
          }
        );
        for (const issue of res.body) {
          const {
            number,
            title,
            body,
            state,
            pull_request,
            comments_url,
            user,
            created_at
          } = issue;
          const isPullRequest = pull_request ? true : false;
          const commentRes = await this.got.get(comments_url, {
            prefixUrl: ""
          });
          const comments = commentRes.body.map(comment => ({
            body: comment.body,
            user: comment.user,
            created_at: comment.created_at
          }));
          let head = null;
          let base = null;
          if (isPullRequest) {
            const pullRequestRes = await this.got.get(pull_request.url, {
              prefixUrl: ""
            });
            head = pullRequestRes.body.head.label.match(/.+:(.+)/)[1];
            base = pullRequestRes.body.base.label.match(/.+:(.+)/)[1];
          }
          issues.push({
            number,
            title,
            body,
            state,
            comments,
            isPullRequest,
            head,
            base,
            user,
            created_at
          });
        }
        const link = parse(res.headers.link);
        if (!link || !link.last) break;
      }
      return issues;
    } catch (e) {
      console.log(`Failed to get issues`);
      throw e;
    }
  }

  async setIssues(issues) {
    // Create issue and comment
    for (const issue of issues) {
      try {
        const body = this.createBodyWithOriginalUserInfo(
          issue.body,
          issue.user.id,
          issue.user.login,
          issue.created_at
        );
        const res = await this.got.post(
          `repos/${this.owner}/${this.repo}/issues`,
          {
            json: {
              title: issue.title,
              body
            }
          }
        );
        try {
          const commentsUrl = res.body.comments_url;
          for (const comment of issue.comments) {
            const body = this.createBodyWithOriginalUserInfo(
              comment.body,
              comment.user.id,
              comment.user.login,
              comment.created_at
            );
            await this.got.post(commentsUrl, {
              prefixUrl: "",
              json: { body }
            });
          }
        } catch (e) {
          console.log(`Failed to create comment`);
          throw e;
        }
        console.log(`Issue ${issue.number} was created!`);
      } catch (e) {
        console.log(`Failed to create issue:${issue.number}`);
        throw e;
      }
    }
    // Change issue to PullRequest
    for (const issue of issues) {
      if (issue.isPullRequest) {
        const { number, head, base } = issue;
        try {
          await this.got.post(`repos/${this.owner}/${this.repo}/pulls`, {
            json: {
              issue: number,
              head,
              base
            }
          });
          console.log(`Issue ${issue.number} was to be pull request!`);
        } catch (e) {
          console.log(`Failed to change issue to pull request:${issue.number}`);
          throw e;
        }
      }
    }
    // Close issue
    for (const issue of issues) {
      try {
        if (issue.state === "closed") {
          await this.got.patch(
            `repos/${this.owner}/${this.repo}/issues/${issue.number}`,
            {
              state: "closed"
            }
          );
          console.log(`Issue ${issue.number} was closed!`);
        }
      } catch (e) {
        console.log(`Failed to close issue:${issue.number}`);
        throw e;
      }
    }
  }

  createBodyWithOriginalUserInfo(body, id, login, created_at) {
    return `\`\`\`\r\nOriginal-ID: ${id}\r\nOriginal-user-login: ${login}\r\nOriginal-created_at: ${created_at}\r\n\`\`\`\r\n${body}`;
  }

  async getHooks() {
    try {
      const res = await this.got.get(`repos/${this.owner}/${this.repo}/hooks`);
      return res.body;
    } catch (e) {
      console.log(`Failed to get repository hooks`);
      throw e;
    }
  }

  async setHooks(hooks) {
    for (const hook of hooks) {
      try {
        const { name, config, events, active } = hook;
        await this.got.post(`repos/${this.owner}/${this.repo}/hooks`, {
          json: {
            name,
            config,
            events,
            active
          }
        });
        console.log(`${name} hook was created!`);
      } catch (e) {
        console.log(`Failed to create hook:${name}`);
        throw e;
      }
    }
  }
}

module.exports = Repository;
