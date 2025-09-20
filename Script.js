// =================================================================
// This is the complete code for your script.js file.
// Replace everything in your file with this.
// =================================================================

// --- NEW: Import functions from the Firebase SDKs ---
// This works because we added type="module" to our script tag in the HTML.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ------------------ PASTE YOUR FIREBASE CONFIG HERE ------------------
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAoVh0pOTOGvOHDpCEs1cFE9_fNBCaaMDY",
  authDomain: "my-blog-919cd.firebaseapp.com",
  projectId: "my-blog-919cd",
  storageBucket: "my-blog-919cd.firebasestorage.app",
  messagingSenderId: "310472537443",
  appId: "1:310472537443:web:06dec925b451c67722cf56",
  measurementId: "G-98DP8M9EKD"
};
// -------------------------------------------------------------------------

// --- NEW: Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// =================================================================
// Your original code starts here. Most of it is unchanged.
// =================================================================

// --- Feather Icons ---
feather.replace();

// --- Theme Toggle (Unchanged) ---
const themeToggle = document.getElementById('theme-toggle');
const themeIconSun = document.getElementById('theme-icon-sun');
const themeIconMoon = document.getElementById('theme-icon-moon');
const html = document.documentElement;

const applyTheme = (theme) => {
    if (theme === 'dark') {
        html.classList.add('dark');
        themeIconSun.classList.add('hidden');
        themeIconMoon.classList.remove('hidden');
    } else {
        html.classList.remove('dark');
        themeIconSun.classList.remove('hidden');
        themeIconMoon.classList.add('hidden');
    }
};

const currentTheme = localStorage.getItem('theme') || 'light';
applyTheme(currentTheme);

themeToggle.addEventListener('click', () => {
    const newTheme = html.classList.contains('dark') ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
});

// --- Dynamic Year in Footer (Unchanged) ---
document.getElementById('year').textContent = new Date().getFullYear();

// --- Blog Post Data & Rendering (MODIFIED SECTION) ---
// The hardcoded 'posts' array is now gone.
const postsContainer = document.getElementById('posts-container');
const noResults = document.getElementById('no-results');
let allPosts = []; // This empty array will be filled with posts from Firebase.

// Your renderPosts function is perfect, it just renders whatever data it receives. (Unchanged)
const renderPosts = (filteredPosts) => {
    postsContainer.innerHTML = '';
    if (filteredPosts.length === 0) {
        noResults.classList.remove('hidden');
        postsContainer.classList.add('hidden');
    } else {
        noResults.classList.add('hidden');
        postsContainer.classList.remove('hidden');
    }

    filteredPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-card bg-white/5 dark:bg-black/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-emerald-500/20 transform hover:-translate-y-2 transition-all duration-300';
        postElement.innerHTML = `
            <img src="${post.image}" alt="${post.title}" class="w-full h-48 object-cover">
            <div class="p-6">
                <div class="flex flex-wrap gap-2 mb-2">
                    ${post.tags.map(tag => `<span class="bg-emerald-500/10 text-emerald-500 text-xs font-semibold px-2.5 py-1 rounded-full">${tag}</span>`).join('')}
                </div>
                <h3 class="text-xl font-bold mb-2 text-custom-light">${post.title}</h3>
                <p class="text-custom-light/70 text-sm mb-4">${post.excerpt}</p>
                <a href="#" class="font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-2">
                    Read More <i data-feather="arrow-right" class="w-4 h-4"></i>
                </a>
            </div>
        `;
        postsContainer.appendChild(postElement);
    });
    feather.replace(); // Re-initialize icons for new elements
};

// --- NEW: Function to fetch posts from Firebase ---
async function fetchAndRenderPosts() {
    try {
        // Create a query to get documents from the "posts" collection, ordered by creation date (newest first).
        const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(postsQuery);
        
        // Convert the query result to an array and store it in our global 'allPosts' variable.
        allPosts = querySnapshot.docs.map(doc => doc.data());
        
        // Now that we have the data, render the posts for the first time.
        renderPosts(allPosts); 
    } catch (error) {
        console.error("Error fetching posts:", error);
        postsContainer.innerHTML = `<p class="text-red-500 text-center col-span-full">Failed to load blog posts. Please try again later.</p>`;
    }
}

// --- Filtering and Searching (MODIFIED) ---
// This section is the same, but it now relies on the `allPosts` variable which is populated from Firebase.
const searchBarDesktop = document.getElementById('search-bar-desktop');
const searchBarMobile = document.getElementById('search-bar-mobile');
const tagFilterBtns = document.querySelectorAll('.tag-filter-btn');
let activeTag = 'all';
let searchTerm = '';

const filterAndRender = () => {
    let filteredPosts = allPosts; // Start with all posts from Firebase

    // Filter by tag
    if (activeTag !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.tags.includes(activeTag));
    }

    // Filter by search term
    if (searchTerm) {
        filteredPosts = filteredPosts.filter(post =>
            post.title.toLowerCase().includes(searchTerm) ||
            post.excerpt.toLowerCase().includes(searchTerm)
        );
    }
    
    renderPosts(filteredPosts);
};

searchBarDesktop.addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase();
    filterAndRender();
});

searchBarMobile.addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase();
    filterAndRender();
});

tagFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tagFilterBtns.forEach(b => b.classList.remove('active-tag', 'bg-emerald-600', 'text-white'));
        btn.classList.add('active-tag', 'bg-emerald-600', 'text-white');
        activeTag = btn.dataset.tag;
        filterAndRender();
    });
});

// --- Initial Page Load ---
// Instead of rendering the old hardcoded array, we now call our new function
// to fetch the posts from the database when the page loads.
fetchAndRenderPosts();