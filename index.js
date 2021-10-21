const core = require('@actions/core');
const github = require('@actions/github');

const context = github.context;
const token = core.getInput('token');
const repository = core.getInput('repository');


/// run
async function run() {
    console.log('entered run');

    const octokit = github.getOctokit(token)
    var owner = core.getInput('owner');
    var repo = core.getInput('repo');
    var excludes = core.getInput('excludes').trim().split(",");

    try {
        if (repository) {
            [owner, repo] = repository.split("/");
        }
        if (!owner) {
            owner = context.repo.owner;
        }
        if (!repo) {
            repo = context.repo.repo;
        }

        console.log('owner: %s', owner);
        console.log('repo: %s', repo);

        console.log('at REST query');
        var releases = await octokit.rest.repos.listReleases({
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
            core.setOutput('release', releases[0]);
            core.setOutput('releaseAssets', releases[0].assets);
        }
        else {
            core.setFailed("No valid releases");
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

run()
