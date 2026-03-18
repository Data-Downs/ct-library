(function () {
  "use strict";

  const STORAGE_KEY = "ct-library-books";

  const App = {
    books: [],
    editingId: null,
    deletingId: null,
    filters: { search: "", status: "all", genre: "all", sort: "title-asc" }
  };

  // --- Utilities ---

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function generateId() {
    return crypto.randomUUID();
  }

  // --- Storage ---

  function loadBooks() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        App.books = JSON.parse(data);
        return;
      }
    } catch (e) {
      // fall through to seed
    }
    App.books = SEED_BOOKS.map(function (b) { return Object.assign({}, b); });
    saveBooks();
  }

  function saveBooks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(App.books));
  }

  // --- Genre List ---

  function getGenres() {
    const set = new Set();
    App.books.forEach(function (b) {
      if (b.genre) set.add(b.genre);
    });
    return Array.from(set).sort();
  }

  function populateGenreFilter() {
    var sel = document.getElementById("filter-genre");
    var current = sel.value;
    sel.innerHTML = '<option value="all">All Genres</option>';
    getGenres().forEach(function (g) {
      var opt = document.createElement("option");
      opt.value = g;
      opt.textContent = g;
      sel.appendChild(opt);
    });
    sel.value = current;

    // Also update the datalist in the form
    var dl = document.getElementById("genre-list");
    dl.innerHTML = "";
    getGenres().forEach(function (g) {
      var opt = document.createElement("option");
      opt.value = g;
      dl.appendChild(opt);
    });
  }

  // --- Rendering ---

  function renderStars(rating, interactive) {
    var html = "";
    for (var i = 1; i <= 5; i++) {
      if (interactive) {
        html += '<span class="star ' + (i <= rating ? "filled" : "") + '" data-value="' + i + '">&#9733;</span>';
      } else {
        html += '<span class="' + (i <= rating ? "" : "empty") + '">&#9733;</span>';
      }
    }
    return html;
  }

  function renderBookCard(book) {
    var statusLabel = book.status.charAt(0).toUpperCase() + book.status.slice(1);
    var notesHtml = book.notes ? '<p class="book-notes">' + escapeHtml(book.notes) + "</p>" : "";
    var authorHtml = book.author ? '<p class="book-author">' + escapeHtml(book.author) + "</p>" : "";
    var genreHtml = book.genre ? '<p class="book-genre">' + escapeHtml(book.genre) + "</p>" : "";
    var ratingHtml = book.rating > 0 ? '<div class="book-rating">' + renderStars(book.rating, false) + "</div>" : "";

    return (
      '<div class="book-card" data-id="' + book.id + '">' +
        '<div class="book-card-header">' +
          '<span class="book-status-badge status-' + book.status + '">' + statusLabel + "</span>" +
          '<div class="book-actions">' +
            '<button class="btn-edit" title="Edit">&#9998;</button>' +
            '<button class="btn-delete" title="Delete">&#128465;</button>' +
          "</div>" +
        "</div>" +
        '<h3 class="book-title">' + escapeHtml(book.title) + "</h3>" +
        authorHtml +
        genreHtml +
        ratingHtml +
        notesHtml +
      "</div>"
    );
  }

  function render() {
    var books = App.books.slice();
    var f = App.filters;

    // Filter by search
    if (f.search) {
      var term = f.search.toLowerCase();
      books = books.filter(function (b) {
        return b.title.toLowerCase().indexOf(term) !== -1 ||
               b.author.toLowerCase().indexOf(term) !== -1;
      });
    }

    // Filter by status
    if (f.status !== "all") {
      books = books.filter(function (b) { return b.status === f.status; });
    }

    // Filter by genre
    if (f.genre !== "all") {
      books = books.filter(function (b) { return b.genre === f.genre; });
    }

    // Sort
    books.sort(function (a, b) {
      switch (f.sort) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "author-asc":
          return (a.author || "").localeCompare(b.author || "");
        case "rating-desc":
          return (b.rating || 0) - (a.rating || 0) || a.title.localeCompare(b.title);
        case "rating-asc":
          var ra = a.rating || 999, rb = b.rating || 999;
          return ra - rb || a.title.localeCompare(b.title);
        case "date-desc":
          return (b.dateAdded || "").localeCompare(a.dateAdded || "");
        case "status":
          var order = { unread: 0, reading: 1, read: 2 };
          return (order[a.status] || 0) - (order[b.status] || 0) || a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    var grid = document.getElementById("book-grid");
    var empty = document.getElementById("empty-state");

    if (books.length === 0) {
      grid.innerHTML = "";
      empty.classList.remove("hidden");
    } else {
      empty.classList.add("hidden");
      grid.innerHTML = books.map(renderBookCard).join("");
    }

    document.getElementById("book-count").textContent = App.books.length;
    populateGenreFilter();
  }

  // --- Modal Helpers ---

  function openModal(id) {
    document.getElementById(id).classList.remove("hidden");
  }

  function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
  }

  function openBookModal(book) {
    var form = document.getElementById("book-form");
    var title = document.getElementById("modal-title");

    if (book) {
      App.editingId = book.id;
      title.textContent = "Edit Book";
      form.elements.title.value = book.title;
      form.elements.author.value = book.author;
      form.elements.genre.value = book.genre;
      form.elements.status.value = book.status;
      form.elements.rating.value = book.rating;
      form.elements.notes.value = book.notes;
    } else {
      App.editingId = null;
      title.textContent = "Add Book";
      form.reset();
      form.elements.rating.value = "0";
    }

    updateStarDisplay(parseInt(form.elements.rating.value, 10));
    openModal("book-modal");
    form.elements.title.focus();
  }

  function updateStarDisplay(rating) {
    var stars = document.querySelectorAll("#rating-input .star");
    stars.forEach(function (s) {
      var val = parseInt(s.getAttribute("data-value"), 10);
      if (val <= rating) {
        s.classList.add("filled");
      } else {
        s.classList.remove("filled");
      }
    });
  }

  // --- Event Handlers ---

  function onFormSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var data = {
      title: form.elements.title.value.trim(),
      author: form.elements.author.value.trim(),
      genre: form.elements.genre.value.trim(),
      status: form.elements.status.value,
      rating: parseInt(form.elements.rating.value, 10) || 0,
      notes: form.elements.notes.value.trim()
    };

    if (App.editingId) {
      var book = App.books.find(function (b) { return b.id === App.editingId; });
      if (book) {
        Object.assign(book, data);
      }
    } else {
      data.id = generateId();
      data.dateAdded = new Date().toISOString().slice(0, 10);
      App.books.push(data);
    }

    saveBooks();
    render();
    closeModal("book-modal");
  }

  function onGridClick(e) {
    var editBtn = e.target.closest(".btn-edit");
    var deleteBtn = e.target.closest(".btn-delete");
    if (!editBtn && !deleteBtn) return;

    var card = e.target.closest(".book-card");
    if (!card) return;
    var id = card.getAttribute("data-id");
    var book = App.books.find(function (b) { return b.id === id; });
    if (!book) return;

    if (editBtn) {
      openBookModal(book);
    } else if (deleteBtn) {
      App.deletingId = id;
      document.getElementById("delete-book-title").textContent = book.title;
      openModal("delete-modal");
    }
  }

  function onConfirmDelete() {
    App.books = App.books.filter(function (b) { return b.id !== App.deletingId; });
    App.deletingId = null;
    saveBooks();
    render();
    closeModal("delete-modal");
  }

  function onExport() {
    var json = JSON.stringify(App.books, null, 2);
    var blob = new Blob([json], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "my-library-backup.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function onImport(e) {
    var file = e.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var data = JSON.parse(ev.target.result);
        if (!Array.isArray(data) || !data.every(function (b) { return b && typeof b.title === "string"; })) {
          alert("Invalid library file. Expected an array of books with titles.");
          return;
        }
        App.books = data;
        saveBooks();
        render();
        alert("Library imported successfully! " + data.length + " books loaded.");
      } catch (err) {
        alert("Could not read file: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // --- Star Rating Interaction ---

  function setupStarRating() {
    var container = document.getElementById("rating-input");
    var hiddenInput = document.querySelector('input[name="rating"]');

    container.addEventListener("click", function (e) {
      var star = e.target.closest(".star");
      if (!star) return;
      var val = parseInt(star.getAttribute("data-value"), 10);
      hiddenInput.value = val;
      updateStarDisplay(val);
    });

    container.addEventListener("mouseover", function (e) {
      var star = e.target.closest(".star");
      if (!star) return;
      var val = parseInt(star.getAttribute("data-value"), 10);
      updateStarDisplay(val);
    });

    container.addEventListener("mouseleave", function () {
      updateStarDisplay(parseInt(hiddenInput.value, 10));
    });

    document.getElementById("rating-clear").addEventListener("click", function () {
      hiddenInput.value = "0";
      updateStarDisplay(0);
    });
  }

  // --- Init ---

  document.addEventListener("DOMContentLoaded", function () {
    loadBooks();
    render();
    setupStarRating();

    // Filters
    document.getElementById("filter-search").addEventListener(
      "input",
      debounce(function (e) {
        App.filters.search = e.target.value;
        render();
      }, 200)
    );

    document.getElementById("filter-status").addEventListener("change", function (e) {
      App.filters.status = e.target.value;
      render();
    });

    document.getElementById("filter-genre").addEventListener("change", function (e) {
      App.filters.genre = e.target.value;
      render();
    });

    document.getElementById("filter-sort").addEventListener("change", function (e) {
      App.filters.sort = e.target.value;
      render();
    });

    // Add book
    document.getElementById("btn-add").addEventListener("click", function () {
      openBookModal(null);
    });

    // Book grid events (delegated)
    document.getElementById("book-grid").addEventListener("click", onGridClick);

    // Form submit
    document.getElementById("book-form").addEventListener("submit", onFormSubmit);

    // Delete confirm
    document.getElementById("btn-confirm-delete").addEventListener("click", onConfirmDelete);

    // Export / Import
    document.getElementById("btn-export").addEventListener("click", onExport);
    document.getElementById("btn-import").addEventListener("change", onImport);

    // Close modals
    document.querySelectorAll(".modal-overlay, .btn-cancel").forEach(function (el) {
      el.addEventListener("click", function () {
        closeModal("book-modal");
        closeModal("delete-modal");
      });
    });

    // Escape key closes modals
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeModal("book-modal");
        closeModal("delete-modal");
      }
    });
  });
})();
