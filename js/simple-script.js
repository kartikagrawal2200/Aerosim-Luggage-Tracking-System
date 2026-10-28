// =====================================================
//  AeroSim - simple-script.js  (beginner friendly)
//
//  How data is stored:
//  We use localStorage (small storage inside the browser).
//  It only saves TEXT, so we use:
//     JSON.stringify(...)  -> turn data into text (to save)
//     JSON.parse(...)      -> turn text back into data (to read)
//
//  We save these things:
//     "users"        -> list of all registered users
//     "loggedInUser" -> the user who is logged in right now
//     "loginCount"   -> how many times someone has logged in
//     "currentBag"   -> the bag shown on the Tracking page
// =====================================================


// ---------- PART 1: Small helper functions ----------

// Get the list of all users from storage
function getUsers() {
    const savedText = localStorage.getItem("users");
    if (savedText === null) {
        return [];                      // nobody registered yet
    }
    return JSON.parse(savedText);
}

// Save the list of users into storage
function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

// Get the user who is logged in (or null if nobody)
function getLoggedInUser() {
    const savedText = localStorage.getItem("loggedInUser");
    if (savedText === null) {
        return null;
    }
    return JSON.parse(savedText);
}

// Show a message to the user (green for success, red for error)
function showMessage(text, isSuccess) {
    const box = document.getElementById("message");
    box.textContent = text;
    box.style.padding = "10px";
    box.style.marginTop = "10px";
    box.style.borderRadius = "6px";
    box.style.background = "white";
    box.style.fontWeight = "bold";
    if (isSuccess) {
        box.style.color = "green";
    } else {
        box.style.color = "red";
    }
}


// ---------- PART 2: The list of bags (our demo "database") ----------
// "stage" tells how far the bag has travelled (1 to 6):
//   1 Check-in, 2 Handling, 3 Aircraft loading,
//   4 In flight, 5 Arrival, 6 Claim stage

const allBags = [
    {
        tag: "AS3310",
        airline: "Airline-EK512",
        route: "DXB (Dubai International Airport) → DEL (Indira Gandhi International Airport)",
        passenger: "M*** T. • 21.0 kg (Red)",
        gate: "Gate C15 → Carousel Belt 6",
        status: "● Being Handled",
        stage: 2
    },
    {
        tag: "AS2045",
        airline: "Airline-AI101",
        route: "DEL (Indira Gandhi International Airport) → BOM (Chhatrapati Shivaji Maharaj International Airport)",
        passenger: "A*** K. • 18.2 kg (Black)",
        gate: "Gate A07 → Carousel Belt 2",
        status: "✈ In Flight",
        stage: 4
    },
    {
        tag: "AS5567",
        airline: "Airline-SG808",
        route: "BLR (Kempegowda International Airport) → DEL (Indira Gandhi International Airport)",
        passenger: "S*** P. • 15.8 kg (Green)",
        gate: "Gate D03 → Carousel Belt 1",
        status: "● Arrived at Airport",
        stage: 5
    },
    {
        tag: "AS1092",
        airline: "Airline-LH2055",
        route: "BOM ( Chhatrapati Shivaji Maharaj International Airport) → DEL (Indira Gandhi International Airport)",
        passenger: "R*** S. • 23.5 kg (Navy Blue)",
        gate: "Gate B22 → Carousel Belt 4",
        status: "✓ Ready for Collection",
        stage: 6
    }
];

// Save the bag that should be shown on the Tracking page
function saveCurrentBag(bag) {
    localStorage.setItem("currentBag", JSON.stringify(bag));
}

// Get the bag to show (if nothing saved yet, use the first bag)
function getCurrentBag() {
    const savedText = localStorage.getItem("currentBag");
    if (savedText === null) {
        return allBags[0];
    }
    return JSON.parse(savedText);
}


// ---------- PART 3: REGISTER page ----------

const registerForm = document.getElementById("registerForm");

if (registerForm) {                      // runs only on the Register page
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();          // stop the page from reloading

        // 1. Read what the user typed
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;

        // 2. Check if this email is already registered
        const users = getUsers();
        for (let i = 0; i < users.length; i++) {
            if (users[i].email === email) {
                showMessage("This email is already registered. Please login.", false);
                return;                  // stop here
            }
        }

        // 3. Create the new user and save it
        const newUser = {
            name: name,
            email: email,
            password: password,
            registeredOn: new Date().toLocaleDateString()
        };
        users.push(newUser);
        saveUsers(users);

        // 4. Log the user in and open the Profile page
        localStorage.setItem("loggedInUser", JSON.stringify(newUser));
        showMessage("Registered successfully! Opening your profile...", true);

        setTimeout(function () {
            const nextPage = new URLSearchParams(window.location.search).get("next");
            const destination = nextPage === "tracking"
                ? "../Tracking_Page/Track.html"
                : "../Profile_Page/Profile.html";
            window.location.href = destination;
        }, 1500);                        // wait 1.5 seconds
    });
}


// ---------- PART 4: LOGIN page ----------

const loginForm = document.getElementById("loginForm");

if (loginForm) {                         // runs only on the Login page
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;

        // Look for a user with the same email AND password
        const users = getUsers();
        let foundUser = null;
        for (let i = 0; i < users.length; i++) {
            if (users[i].email === email && users[i].password === password) {
                foundUser = users[i];
            }
        }

        if (foundUser === null) {
            showMessage("Wrong email or password. Please try again.", false);
            return;
        }

        // Login is correct -> remember the user
        localStorage.setItem("loggedInUser", JSON.stringify(foundUser));

        // ---- Pick a DIFFERENT bag on every login ----
        // loginCount: 0, 1, 2, 3, 4 ...   (saved in the browser)
        // "% allBags.length" makes it go 0,1,2,3,0,1,2,3 ... (repeat)
        let loginCount = Number(localStorage.getItem("loginCount"));
        const bagForThisLogin = allBags[loginCount % allBags.length];
        saveCurrentBag(bagForThisLogin);
        localStorage.setItem("loginCount", loginCount + 1);

        showMessage("Login successful! Showing bag " + bagForThisLogin.tag + "...", true);
        setTimeout(function () {
            window.location.href = "../Tracking_Page/Track.html";
        }, 1200);
    });
}


// ---------- PART 5: PROFILE page ----------

const profileName = document.getElementById("profileName");

if (profileName) {                       // runs only on the Profile page
    const user = getLoggedInUser();

    if (user === null) {
        // Nobody is logged in -> send to the Login page
        window.location.href = "../Login_Page/Login_index_page.html";
    } else {
        // Show the saved details on the page
        document.getElementById("profileName").textContent = user.name;
        document.getElementById("profileEmail").textContent = user.email;
        document.getElementById("profileDate").textContent = user.registeredOn;
    }

    // Logout button
    document.getElementById("logoutBtn").addEventListener("click", function () {
        localStorage.removeItem("loggedInUser");   // forget who is logged in
        window.location.href = "../Main_Page/index.html";
    });
}


// ---------- PART 6: HOME page (bag tracker form) ----------

const trackForm = document.getElementById("trackForm");

if (trackForm) {                         // runs only on the Home page
    trackForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (getLoggedInUser() === null) {
            window.location.href = "../Login_Page/Login_index_page.html?next=tracking";
            return;
        }

        const tag = document.getElementById("bagTag").value.trim().toUpperCase();

        // Look for this tag in our list of bags
        let foundBag = null;
        for (let i = 0; i < allBags.length; i++) {
            if (allBags[i].tag === tag) {
                foundBag = allBags[i];
            }
        }

        if (foundBag === null) {
            showMessage("Bag not found. Try: AS3310, AS2045, AS5567 or AS1092", false);
        } else {
            saveCurrentBag(foundBag);
            window.location.href = "../Tracking_Page/Track.html";
        }
    });
}


// ---------- PART 7: TRACKING page ----------

const userNameBox = document.getElementById("userName");
const timeline = document.getElementById("timeline");

if (timeline && getLoggedInUser() === null) {
    window.location.replace("../Login_Page/Login_index_page.html?next=tracking");
}

if (userNameBox && getLoggedInUser() !== null) {

    // 7a. Show the logged in user (if any)
    const user = getLoggedInUser();
    userNameBox.textContent = user.name;
    document.getElementById("userEmail").textContent = user.email;

    // 7b. Show the bag details
    const bag = getCurrentBag();
    document.getElementById("bagTitle").textContent = bag.tag;
    document.getElementById("bagTag").textContent = bag.tag;
    document.getElementById("bagAirline").textContent = bag.airline;
    document.getElementById("bagRoute").textContent = bag.route;
    document.getElementById("bagPassenger").textContent = bag.passenger;
    document.getElementById("bagGate").textContent = bag.gate;
    document.getElementById("bagStatus").textContent = bag.status;

    // 7c. Update the Baggage Journey (timeline)
    const steps = document.querySelectorAll("#timeline .step");

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepNumber = i + 1;                    // 1, 2, 3 ...
        const badge = step.querySelector(".badge");
        const icon = step.querySelector(".step-icon");

        // First clear the old look
        step.classList.remove("current");
        badge.classList.remove("active");
        step.style.opacity = "1";

        if (stepNumber < bag.stage) {
            // Step already finished
            badge.textContent = "✓ Completed";
            icon.textContent = "✓";
        } else if (stepNumber === bag.stage) {
            // The step happening right now
            step.classList.add("current");
            badge.classList.add("active");
            badge.textContent = "In Progress";
            icon.textContent = "✓";
        } else {
            // Step not reached yet
            badge.textContent = "Pending";
            icon.textContent = "○";
            step.style.opacity = "0.5";              // make it look faded
        }
    }
}


// ---------- PART 8: NAVBAR (all pages) ----------
// If someone is logged in: change "Login" to "Logout" and hide "Register"

const nextPage = new URLSearchParams(window.location.search).get("next");
const authNotice = document.getElementById("authNotice");

if (authNotice && nextPage === "tracking") {
    authNotice.textContent = window.location.pathname.includes("Register_Page")
        ? "Create an account to continue to baggage tracking."
        : "Please log in or create an account to view baggage tracking.";
    authNotice.hidden = false;
}

if (nextPage === "tracking") {
    const registerLink = document.querySelector('nav a[href*="Register_index_page"]');
    const createAccountLink = document.querySelector(".auth-switch a[href*='Register_index_page']");
    const loginLink = document.querySelector('nav a[href*="Login_index_page"]');
    const signInLink = document.querySelector(".auth-switch a[href*='Login_index_page']");

    if (registerLink) {
        registerLink.href = "../Register_Page/Register_index_page.html?next=tracking";
    }

    if (createAccountLink) {
        createAccountLink.href = "../Register_Page/Register_index_page.html?next=tracking";
    }

    if (loginLink) {
        loginLink.href = "../Login_Page/Login_index_page.html?next=tracking";
    }

    if (signInLink) {
        signInLink.href = "../Login_Page/Login_index_page.html?next=tracking";
    }
}

if (getLoggedInUser() !== null) {
    const links = document.querySelectorAll("nav a");

    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const address = link.getAttribute("href");

        if (address.includes("Login_index_page")) {
            link.textContent = "Logout";
            link.addEventListener("click", function (event) {
                event.preventDefault();
                localStorage.removeItem("loggedInUser");
                window.location.href = "../Main_Page/index.html";
            });
        }

        if (address.includes("Register_index_page")) {
            link.parentElement.style.display = "none";   // hide the <li>
        }
    }
} else {
    const trackingLinks = document.querySelectorAll('nav a[href*="Tracking_Page/Track.html"]');

    for (let i = 0; i < trackingLinks.length; i++) {
        trackingLinks[i].href = "../Login_Page/Login_index_page.html?next=tracking";
    }
}
