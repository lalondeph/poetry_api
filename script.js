// Script for PoetryDB 
// Author: Philip Lalonde

/********************************************************************************************
 ***************************************API USER GUIDE***************************************
 ******************************************************************************************** 
 *  Use fields in front to specify search criteria                                          * 
 *  Use fields after search term to limit data returned                                     *     
 *  (/author returns only author of matching poem)                                          * 
 *  when used to limit return data can be combined with commas (/author,title)              *         
 *  when no limiter present or '/all', all data returned.                                   *
 *                                                                                          *             
 *  General URL format:                                                                     *     
 *  /author[/<author>][/<output field>][,<output field>]                                    *                 
 ********************************************************************************************/

// URL TOOLKIT
const baseURL = "https://poetrydb.org"
// author: The name, or part of the name, of the author of a poem
const a = "author"
// title: The title, or part of the title, of a poem
const t = "title"
// lines: Part of a line or lines of a poem
const l = "lines"
// linecount: The number of lines of a poem, including section headings, but excluding empty lines
const lc = "linecount"
// poemcount: The number of poems to return (cannot be used in combination with random)
const pc = "poemcount"
// get all fields from a random poem
const r = "random"

// INPUT
const author = document.getElementById("author")
const title = document.getElementById("title")
const lines = document.getElementById("lines")
const form = document.getElementById("searchForm")
// OUTPUT
const invalid = document.getElementById("invalid")
const data = document.getElementById("data")
const blockData = document.getElementById("blockData")
const display = document.getElementById("display")
const count = document.getElementById("count")


window.onload = () => {
    document.getElementById("submit").onclick = getPoems
    document.getElementById("btnAuthors").onclick = getAuthors
    document.getElementById("btnTitles").onclick = getTitles
    document.getElementById("btnRandom").onclick = getRandom
    document.getElementById("sampleData").onclick = fillSampleSearch
    document.getElementById("clearSample").onclick = clearForm
}

/**
 * getPoem responds to values in the search form.
 * Handles empty input and 'no item found' searches.
 * Prints results to a series of cards.
 */
function getPoems() {
    let resultCtr = 0
    clearOutput()

    // empty form - display error and clear display
    if (author.value === "" && title.value === "" && lines.value === "") {
        updateSearchTitle("clear");
        updateCount(resultCtr);
        invalid.innerHTML = "You must include at least one search parameter."
    }
    else {
        invalid.innerHTML = ""
        inputArray = []
        inputField = ""
        searchArray = []
        searchTerm = ""

        if (author.value !== "") {
            inputArray.push(a)
            searchArray.push(author.value)
        }

        if (title.value !== "") {
            inputArray.push(t)
            searchArray.push(title.value)
        }

        if (lines.value !== "") {
            inputArray.push(l)
            searchArray.push(lines.value)
        }

        inputField = inputArray.join()
        searchTerm = searchArray.join(';')

        updateSearchTitle()
        // build url to match API standards
        let url = baseURL
        url += "/" + inputField + "/" + searchTerm
        // async fetch response from url
        fetch(url)
            .then(response => { return response.json() })
            .then(json => {
                clearOutput()
                JSON.stringify(json)
                if (json.length > 0) {
                    json.forEach((item) => {
                        data.innerHTML += buildOutput(item)
                        resultCtr++
                    })
                }
                updateCount(resultCtr)
            })
            .catch(error => alert(error))
        clearForm()
    }
}

/**
 * onClick method for retrieving all authors.
 * Displayed in columns alphabetically with letter headings.
 */
function getAuthors() {
    let authorCtr = 0
    invalid.innerHTML = ""
    display.innerHTML = "All Authors"
    url = baseURL + "/" + a
    fetch(url)
        .then(response => { return response.json() })
        .then(json => {
            clearOutput()
            JSON.stringify(json)
            var headingChar
            var authorList = ""
            json.authors.forEach((item) => {
                firstChar = item.trim().charCodeAt(0)
                if (firstChar != headingChar) {
                    headingChar = firstChar
                    if (headingChar != 65) {
                        authorList += "</ul>"
                    }
                    authorList += "<div class=\"lead\">" + String.fromCharCode(headingChar) + "</div>"
                    authorList += "<ul class=\"list-inline\">"
                }
                authorList += "<li class=\"list-inline-item\">" + item + "</li>"
                authorCtr++
            })
            updateCount(authorCtr, capitalizeTitle(a))
            data.innerHTML = authorList
        })
        .catch(error => alert(error))
}

/**
 * onClick method for retrieving all Titles.
 * Displayed alphabetically with letter headings.
 */
function getTitles() {
    let titleCtr = 0
    invalid.innerHTML = ""
    display.innerHTML = "All Titles"
    url = baseURL + "/" + t
    fetch(url)
        .then(response => { return response.json() })
        .then(json => {
            JSON.stringify(json)
            clearOutput()
            var headingChar
            var titleList = ""
            json.titles.forEach((item) => {
                firstChar = item.trim().charCodeAt(0)
                if (firstChar != headingChar) {
                    headingChar = firstChar
                    titleList += "<div class=\"lead\">" + String.fromCharCode(headingChar) + "</div>"
                }
                titleList += "<p>" + item + "</p>"
                titleCtr++
            })

            updateCount(titleCtr, capitalizeTitle(t))
            blockData.innerHTML = titleList
        })
        .catch(error => alert(error))
}

/**
 * onClick method for retrieving a random poem.
 */
function getRandom() {
    invalid.innerHTML = ""
    display.innerHTML = "Random Poem"
    url = baseURL + "/" + r
    fetch(url)
        .then(response => { return response.json() })
        .then(json => {
            JSON.stringify(json)
            clearOutput()

            let random = "<div><h5>"
            random += json[0].title
            random += "</h5><small class=\"text-muted\">"
            random += json[0].author
            random += "</small></div><div>"
            json[0].lines.forEach((line) => { random += line + "</br>" })
            random += "</div><small class=\"text-muted\">"
            random += "line count: " + json[0].linecount
            random += "</small></div></div>"

            blockData.innerHTML = random
            updateCount(json.length)
        })
        .catch(error => alert(error))
}

/**
 * Builds a heading to display what the user is searching for
 */
function updateSearchTitle(cmd = "") {
    var searchTitle
    if (cmd == "clear") {
        searchTitle = ""
    }
    else {
        searchTitle = "Search ";
        for (i = 0; i < inputArray.length; i++) {
            if (i > 0) { searchTitle += " & " }
            searchTitle += capitalizeTitle(inputArray[i]) + " for "
            searchTitle += searchArray[i]
        }
    }
    display.innerHTML = searchTitle
}

/**
 * Capitalizes the first letter of a string passed to it.
 * @param {*} string
 * @returns 
 */
function capitalizeTitle(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Display a json item in a bootstrap card.
 * @param {*} item 
 * @returns 
 */
function buildOutput(item) {

    card = "<div class=\"card\"><div class=\"card-body\"><div class=\"card-title\"><h5>"
    card += item.title
    card += "</h5><small class=\"text-muted\">"
    card += item.author
    card += "</small></div><div class=\"card-text\">"
    item.lines.forEach((line) => { card += line + "</br>" })
    card += "</div><div class=\"card-footer text-muted\">"
    card += "line count: " + item.linecount
    card += "</div></div>"

    return card
}

/**
 * Builds a heading to show how many results are showing.
 * @param {*} noItems 
 * @param {*} itemType 
 */
function updateCount(noItems, itemType = "Poem") {
    count.innerHTML = ""
    if (noItems < 1) {
        count.innerHTML = "No " + itemType + "s found"
    }
    else if (noItems >= 1) {
        count.innerHTML = "Showing " + noItems + " " + itemType
        if (noItems != 1) {
            count.innerHTML += "s"
        }
    }
}

/**
 * Provides a sample search for testing purposes
 */
function fillSampleSearch() {
    author.value = "shakespeare"
    title.value = "Sonnet"
    lines.value = "turn'd"
}

function clearForm() {
    searchForm.reset()
}

function clearOutput() {
    data.innerHTML = ""
    blockData.innerHTML = ""
}