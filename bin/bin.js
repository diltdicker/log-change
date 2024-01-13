#!/usr/bin/env node
const {version} = require('../package.json');
const logChange = require('../src/lib')
const dayjs = require('dayjs');
const { Command } = require('commander');
const { exit } = require('process');
const program = new Command();

// check for custom config file

program
  .name('log-change')
  .description('TOML-based CLI for CHANGELOG branch-compatible tracking')
  .version(version);

program.command('init')
    // .description('Initializes current directory with a new CHANGELOG.md and CHANGELOGS dir')
    .option('-g --github-url', "Sets the link for the Github repo so that new releases contain hyperlinks to issues tracked in Github: (https://github.com/<user>/<repoName>)")
    .action(() => {
        logChange.initChangelog()
    });

// program.command('config')
//     .description("Saves a custom config for log-change cli")
//     .option("-g --github-url <repoLink>", "Sets the link for the Github repo so that new releases contain hyperlinks to issues tracked in Github: (https://github.com/<user>/<repoName>")
//     .option("--link-remove", "Removes link to Github", false)
//     .option('--delete-config', 'Deletes custom config', false)
//     .action((options) => {
//         console.log('config', options)
//     })

program.command('new')
    .description('Creates a new TOML file for tracking a change on branch')
    .requiredOption('-i --issue <issueNumber>', "Github issue number: (1337)")
    .argument('<changeType>', "Type of change [new | change | fix | break]")
    .requiredOption('-m --comment <comment...>', "description of the change")
    .action((changeType, options) => {
        // console.log("new", issueNumber, options)

        // if (!Number.isInteger(Number(issueNumber))) {
        //     console.error("Error: issueNumber value is not a Integer")
        //     exit(1)
        // }
        const changeTypes = ['new', 'change', 'fix', 'break']
        if (!changeTypes.includes(changeType)) {
            console.error("Error: [%s] not a valid changeType. Needs to be: [new | change | fix | break]", changeType)
            exit(1)
        }

        logChange.createChangelog({
            issue: options.issue,
            changeType: changeType,
            comments: options.comment
        })
    });

program.command('clear')
    .description("Deletes all TOML files in CHANGELOGS dir")
    .action(() => {
        logChange.clearChanges()
    });

program.command('release')
    .description('Reads all TOML files, records a new release, and appends it to the top of CHANGELOG.md')
    .requiredOption('-v, --version <releaseVersion>', "Version number for release: (x.y.z)")
    .option('-d --date <releaseDate>', "Date text for relase", dayjs().format('MMM DD, YYYY'))
    .option('-m --summary <releaseSummary>', 'Addtional description text for release', null)
    .option('-x --no-delete', "Does not delete TOML files after appending release to CAHNGELOG.md", false)
    // .option("-l --release-link <releaseLink>", "Link to release page or release artifacts")
    // .option("-h --hide-num", "Hide issue numbers in release", false)
    .action((options) => {

        logChange.appendRelease({
            releaseVer: options.version,
            releaseDate: options.date,
            releaseSummary: options.summary,
            noDelete: options.delete
        })
    });

program.parse();