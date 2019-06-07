const assert = require('assert')
const fs = require('fs')
const tsPath = "../../ts"
const git = require('simple-git/promise')(tsPath)
assert(fs.existsSync(tsPath), "Can't find Typescript at " + tsPath)
async function main() {
    const commits = await git.log({ from: "f617d1641b00366ff9c5684fec06cec7f1c26d2e", to: "master" })
    /** @type {Map<string, Set<string>>} */
    const map = new Map()
    for (const commit of commits.all) {
        if (isMergeCommit(commit.message) || isSquashMergeMessage(commit.message)) {
            const files = parseFiles(await git.show([commit.hash, "--stat=1000,960,40", "--pretty=oneline"]))
            fillMap(files, map)
        }
    }
}

/**
 * @param {string} s
 */
function isSquashMergeMessage(s) {
    return /\(#[0-9]+\)$/.test(s)
}

/**
 * @param {string} s
 */
function isMergeCommit(s) {
    return /Merge pull request #[0-9]+/.test(s)
}

/**
 * @param {string} s
 */
function parseFiles(s) {
    const lines = s.split('\n')
    // Note that slice(2) only works for merge commits, which have an empty newline after the title
    return new Set(lines.slice(2, lines.length - 2).map(line => line.split("|")[0].trim()))
}

/**
 * @param {Set<string>} files
 * @param {Map<string, Set<string>>} map
 */
function fillMap(files, map) {
    for (const f of files) {
        if (/^src\/compiler/.test(f)) {

        }
    }
}

main().catch(e => { console.log(e); process.exit(1) })
