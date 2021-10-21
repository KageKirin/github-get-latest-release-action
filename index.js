const core = require('@actions/core');
const github = require('@actions/github');


async function run() {
    const token = core.getInput('token');
    const repository = core.getInput('repository');

    const octokit = github.getOctokit(token)
    const context = github.context;

    var owner = core.getInput('owner');
    var repo = core.getInput('repo');
    var excludes = core.getInput('excludes').trim().split(",");

    try {
        if (repository) {
            [owner, repo] = repository.split("/");
        }
        else if (!owner && !repo) {
            [owner, repo] = context.repo;
        }
        var releases  = await octokit.repos.listReleases({
            owner: owner,
            repo: repo,
            });
        releases = releases.data;
        if (excludes.includes('prerelease')) {
            releases = releases.filter(x => x.prerelease != true);
        }
        if (excludes.includes('draft')) {
            releases = releases.filter(x => x.draft != true);
        }
        if (releases.length) {
            core.setOutput('release', releases[0].tag_name)
        } else {
            core.setFailed("No valid releases");
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

run()
