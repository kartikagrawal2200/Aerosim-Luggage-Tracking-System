// =====================================================
//  contact.js - code for the Contact page only
//
//  It uses two things from simple-script.js (loaded first):
//     getLoggedInUser()  -> the logged in user (or null)
//     showMessage(text, isSuccess) -> green / red message
//
//  Queries are saved in localStorage under the name "queries".
// =====================================================

const contactForm = document.getElementById("contactForm");

// ---------- Helper functions ----------

// Get all saved queries
function getQueries() {
    const savedText = localStorage.getItem("queries");
    if (savedText === null) {
        return [];
    }
    return JSON.parse(savedText);
}

// Show the saved queries (newest first, maximum 5) under the form
function showSavedQueries() {
    const listBox = document.getElementById("queryList");
    const queries = getQueries();

    listBox.innerHTML = "";                       // clear old list

    if (queries.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "No queries sent yet.";
        listBox.appendChild(empty);
        return;
    }

    // go from the newest to the oldest, stop after 5
    let shown = 0;
    for (let i = queries.length - 1; i >= 0 && shown < 5; i--) {
        const q = queries[i];

        const item = document.createElement("div");
        item.className = "query-item";

        const title = document.createElement("strong");
        title.textContent = q.subject;

        const text = document.createElement("div");
        text.textContent = q.message;

        const meta = document.createElement("div");
        meta.className = "meta";
        meta.textContent = q.name + " (" + q.email + ") • " + q.sentOn;

        item.appendChild(title);
        item.appendChild(text);
        item.appendChild(meta);
        listBox.appendChild(item);
        shown++;
    }
}

// ---------- Main code ----------

if (contactForm) {

    // 1. If the user is logged in, fill name and email automatically
    const loggedUser = getLoggedInUser();
    if (loggedUser !== null) {
        document.getElementById("contactName").value = loggedUser.name;
        document.getElementById("contactEmail").value = loggedUser.email;
    }

    // 2. Show the old queries
    showSavedQueries();

    // 3. When the form is submitted, save the query
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const newQuery = {
            name: document.getElementById("contactName").value.trim(),
            email: document.getElementById("contactEmail").value.trim().toLowerCase(),
            subject: document.getElementById("contactSubject").value,
            bagTag: document.getElementById("contactBagTag").value.trim().toUpperCase(),
            message: document.getElementById("contactMessage").value.trim(),
            sentOn: new Date().toLocaleString()
        };

        const queries = getQueries();
        queries.push(newQuery);
        localStorage.setItem("queries", JSON.stringify(queries));

        showMessage("Thank you, " + newQuery.name + "! Your query has been saved.", true);
        document.getElementById("contactSubject").value = "";
        document.getElementById("contactBagTag").value = "";
        document.getElementById("contactMessage").value = "";
        showSavedQueries();
    });
}
