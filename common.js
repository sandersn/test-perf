const readline = require('readline')

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
    return lines.slice(2, lines.length - 2).map(line => line.split("|")[0].trim())
}

/**
 * @param {import('simple-git/promise').SimpleGit} git
 * @param {string} from
 * @param {string} to
 * @param {(files: string[]) => void} update
 */
module.exports.collectCommits = async function(git, from, to, update) {
    let i = 0
    for (const commit of (await git.log({ from, to })).all) {
        i++
        if (isMergeCommit(commit.message) || isSquashMergeMessage(commit.message)) {
            readline.clearLine(process.stdout, /*left*/ -1)
            readline.cursorTo(process.stdout, 0)
            process.stdout.write(i + ": " + commit.date)
            const files = parseFiles(await git.show([commit.hash, "--stat=1000,960,40", "--pretty=oneline"]))
            update(files)
        }
    }
}

