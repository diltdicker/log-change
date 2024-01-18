const fs = require('fs')
const TOML = require('@iarna/toml')
const ejs = require('ejs');
const { exit } = require('process');

// CONST VALUES
const CHANGELOG_MD = "./CHANGELOG.md"
const CHANGELOGS_DIR = "./CHANGELOGS"
const CHANGELOG_CONFIG = "config.toml"
const EXAMPLE_CHANGE = "example.toml"
const SAFE_FILES = [CHANGELOG_CONFIG, EXAMPLE_CHANGE]

const HEADER_TEMPLATE = fs.readFileSync(__dirname.concat("/res/header_template.ejs"), {encoding: "utf-8"})
const RELEASE_TEMPLATE = fs.readFileSync(__dirname.concat("/res/release_template.ejs"), {encoding: "utf-8"})
const HIDE_RELEASE_TEMPLATE = fs.readFileSync(__dirname.concat("/res/release_hide_template.ejs"), {encoding: "utf-8"})

// const EJS_TEST = fs.readFileSync("./src/res/ejs_test.ejs", {encoding: "utf-8"})

function initChangelog() {
    // check if CHANGELOG.md exists
    if (!fs.existsSync(CHANGELOG_MD)) {

        // create file using template
        const header_str = ejs.compile(HEADER_TEMPLATE)
        fs.writeFileSync(CHANGELOG_MD, ejs.render(HEADER_TEMPLATE, {}))

    } else {
        console.warn("File: [%s] already exists", CHANGELOG_MD)
    }

    // check if CHANGELOGS/ exists
    if (!fs.existsSync(CHANGELOGS_DIR)) {

        // create directory
        fs.mkdirSync(CHANGELOGS_DIR)

        // create example change
        const tomlData = TOML.stringify({
            issue: "0",
            comments: ["example comment here"]
        })
        fs.writeFileSync(CHANGELOGS_DIR.concat("/", EXAMPLE_CHANGE), tomlData, {encoding: "utf-8"})

    } else {
        console.warn("Directory: [%s] already exists", CHANGELOGS_DIR)
    }
}

function readConfig() {
    // check if CHANGELOGS/ exists
    if (fs.existsSync(CHANGELOGS_DIR)) {

        // check if config exists
        if (fs.existsSync(CHANGELOG_CONFIG)) {

        } else {
            return null;
        }
        
    } else {
        console.error('Error: directory [%s] not found', CHANGELOGS_DIR)
        exit(1)
    }
    
}

function writeConfigFile(configObj) {
    // check if CHANGELOGS/ exists
    if (fs.existsSync(CHANGELOGS_DIR)) {

        
    } else {
        console.error('Error: directory [%s] not found', CHANGELOGS_DIR)
    }
}

function readChangeLogs() {
    // check if CHANGELOGS/ exists
    if (fs.existsSync(CHANGELOGS_DIR)) {

        // get list of changes (filter out safe files)
        let changeFiles = fs.readdirSync(CHANGELOGS_DIR, {encoding: "utf-8"})
        changeFiles = changeFiles.filter((fileName) => fileName.endsWith(".toml") && !SAFE_FILES.includes(fileName))
        changeFiles = changeFiles.map((fileName) => CHANGELOGS_DIR.concat("/", fileName))

        // capture list of changes
        let changeList = []
        let newList = []
        let fixList = []
        let breakList = []
        changeFiles.forEach((changeFile) => {
            try {
                const tomlStr = fs.readFileSync(changeFile, {encoding: "utf-8"})
                const tomlObj = TOML.parse(tomlStr)
                switch (tomlObj["changeType"]) {
                    case "new":
                        newList.push(tomlObj)
                        break;
                    case "change":
                        changeList.push(tomlObj)
                        break;
                    case "fix":
                        fixList.push(tomlObj)
                        break;
                    case "break":
                        breakList.push(tomlObj)
                }

            } catch (err) {
                console.error("Error trying to read file: [%s]", changeFile, err)
            }
        })

        return {
            newList,
            changeList,
            fixList,
            breakList
        }
        
    } else {
        console.error('Error: directory [%s] not found', CHANGELOGS_DIR)
        exit(1)
    }
}

function createChangelog(changeObj) {
    // check if CHANGELOGS/ exists
    if (fs.existsSync(CHANGELOGS_DIR)) {

        const tomlData = TOML.stringify(changeObj)
        const filePath = CHANGELOGS_DIR.concat("/", changeObj["changeType"], "-", changeObj["issue"], '.toml')

        // check if file exists
        if (fs.existsSync(filePath)) {
            console.error("Error file exists with name: [%s]", filePath)
            return
        }

        // write toml file
        try {

            console.info(tomlData)
            fs.writeFileSync(filePath, tomlData, {encoding: "utf-8"})

        } catch (err) {
            console.error("Error trying to create .toml file", err)
        }
        
    } else {
        console.error('Error: directory [%s] not found', CHANGELOGS_DIR)
    }
}

function clearChanges() {
    // check if CHANGELOGS/ exists
    if (fs.existsSync(CHANGELOGS_DIR)) {

        // get list of changes (filter out safe files)
        let changeFiles = fs.readdirSync(CHANGELOGS_DIR, {encoding: "utf-8"})
        changeFiles = changeFiles.filter((fileName) => fileName.endsWith(".toml") && !SAFE_FILES.includes(fileName))
        changeFiles = changeFiles.map((fileName) => CHANGELOGS_DIR.concat("/", fileName))

        // delete list of changes
        changeFiles.forEach((changeFile) => {
            try {
                fs.rmSync(changeFile)
            } catch (err) {
                console.error("Error trying to delete file: [%s]", changeFile, err)
            }
        })
        
    } else {
        console.error('Error: directory [%s] not found', CHANGELOGS_DIR)
    }
}

function appendRelease(releaseObj) {
    // check if CHANGELOG.md exists
    if (fs.existsSync(CHANGELOG_MD)) {

        // read old changelog
        const oldChangeLog = fs.readFileSync(CHANGELOG_MD).toString().split("\n").slice(2).join('\n');

        // write header
        fs.writeFileSync(CHANGELOG_MD, ejs.render(HEADER_TEMPLATE), {encoding: "utf-8"})

        // write new release
        const reelaseData = Object.assign({}, releaseObj, readChangeLogs());
        let releaseStr;
        if (releaseObj.show) {
            releaseStr = ejs.render(RELEASE_TEMPLATE, reelaseData)
        } else {
            releaseStr = ejs.render(HIDE_RELEASE_TEMPLATE, reelaseData)
        }

        fs.appendFileSync(CHANGELOG_MD, releaseStr, {encoding: "utf-8"})

        // append old releases
        fs.appendFileSync(CHANGELOG_MD, oldChangeLog, {encoding: "utf-8"})

        // delete old changeslogs
        if (!releaseObj["noDelete"]) {
            clearChanges()
        }

    } else {
        console.error("File: [%s] not found. Use `log-change init` to generate file", CHANGELOG_MD)
    }
}

module.exports = {
    initChangelog,
    readConfig,
    writeConfigFile,
    createChangelog,
    readChangeLogs,
    clearChanges,
    appendRelease
};