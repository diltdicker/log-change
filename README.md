# Log-Change

`log-change` is a JavaScript cli application for those that want to manually control the Changelogs and release notes of their application, while simultaneously not wanting to deal with the headache of tracking multiple changes across various branches and merges. `log-change` solves this by keeping your individual changes with your repsective branch via tracking code changes via change files that you can merge without worry upon release.

## Install

Install `log-change` via npm to use as a cli tool

```bash
npm i -g log-change-cli
```

## Initialize Changelog

```bash
log-change init
```

## Create new Change

```bash
log-change new change -i  12 -m "a comment to describe the change" "a second comment"
```

## Update Changelog with new Release

```bash
log-change release -v x.y.z
```

```bash
log-change release -v x.y.z -d 2024-01-01 -m "notes for the release"
```