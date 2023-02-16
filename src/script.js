// global var
let books = [];
function getBookById(id) {
  return books.find((item) => item.id === id) || null;
}

// constant
const BOOK_LIST_KEY = 'book-list';
const FORM_SESSION_KEY = 'form-input-session';

// constant event key
const ON_BOOK_SAVED = 'onBookSaved';
const ON_BOOK_MOVE = 'onBookMove';
const ON_BOOK_SEARCH = 'onBookSearch';
const ON_BOOK_DELETE = 'onBookDelete';
const ON_BOOK_LOAD = 'onBookLoad';
const ON_FORM_LOAD = 'onFormLoad';

// constant DOM
const DOM_BOOK_FORM = document.getElementById('_book-form');
const DOM_NOT_COMPLETED_BOOKS = document.getElementById(
  '_not-completed-container'
);
const DOM_COMPLETED_BOOKS = document.getElementById('_completed-container');
const DOM_JUDUL_INPUT = document.getElementById('_judul-input');
const DOM_PENULIS_INPUT = document.getElementById('_penulis-input');
const DOM_TAHUN_INPUT = document.getElementById('_tahun-input');
const DOM_ISCOMPLETE_INPUT = document.getElementById('_iscomplete-input');
const DOM_SEARCH_INPUT = document.getElementById('_search-input');

const DOM_PRESENTATION_LAYER = document.getElementById('presentation');

// DOM mutate
function createDOMBook({ id, title, author, year, isComplete }) {
  const bookContainer = document.createElement('div');
  bookContainer.classList.add('book-item');

  const bookInfo = document.createElement('div');
  bookInfo.classList.add('book-info');

  const bookInfoTitle = document.createElement('h5');
  bookInfoTitle.innerText = `${title} (${year})`;

  const bookInfoSubtitle = document.createElement('p');
  bookInfoSubtitle.innerText = `penulis: ${author}`;

  bookInfo.appendChild(bookInfoTitle);
  bookInfo.appendChild(bookInfoSubtitle);

  bookContainer.appendChild(bookInfo);

  const bookAction = document.createElement('div');
  bookAction.classList.add('book-action');

  const buttonSuccess = document.createElement('button');
  buttonSuccess.classList.add('btn', 'btn-success', 'inverse', 'ml-2', 'px-2');
  buttonSuccess.innerText = isComplete
    ? 'Belum selesai dibaca'
    : 'Selesai dibaca';
  buttonSuccess.addEventListener('click', function (e) {
    moveBook(id);
  });

  const buttonDanger = document.createElement('button');
  buttonDanger.classList.add('btn', 'btn-danger', 'inverse', 'ml-2', 'px-2');
  buttonDanger.innerText = 'Hapus Buku';
  buttonDanger.addEventListener('click', function (e) {
    openDeleteDialog({ id, author, title, year });
  });

  bookAction.appendChild(buttonSuccess);
  bookAction.appendChild(buttonDanger);

  bookContainer.appendChild(bookAction);

  bookContainer.setAttribute('data-id', id);

  isComplete
    ? DOM_COMPLETED_BOOKS.appendChild(bookContainer)
    : DOM_NOT_COMPLETED_BOOKS.appendChild(bookContainer);
}

function deleteDOMAllBook() {
  DOM_COMPLETED_BOOKS.innerHTML = '';
  DOM_NOT_COMPLETED_BOOKS.innerHTML = '';
}

function deleteDOMBookById(id) {
  document.querySelector(`.book-item[data-id='${id}']`).remove();
}

function openDeleteDialog(book) {
  document.body.classList.add('disable-scroll');

  const modalContainer = document.createElement('div');
  modalContainer.classList.add('modal');
  modalContainer.id = 'delete-dialog-container';

  const modalCard = document.createElement('div');
  modalCard.classList.add('modal-card', 'slide-in');

  const modalTitle = document.createElement('h2');
  modalTitle.classList.add('mb-2');
  modalTitle.innerText = 'Delete Item';

  const modalContent = document.createElement('div');
  modalContent.classList.add('mb-2');

  const modalContentTitle = document.createElement('h2');
  modalContentTitle.innerText = `${book.title} (${book.year})`;

  const modalContentSubTitle = document.createElement('p');
  modalContentSubTitle.innerText = `Penulis: ${book.author}`;

  const modalAction = document.createElement('div');
  modalAction.classList.add('flex', 'justify-start');

  const modalActionCancel = document.createElement('button');
  modalActionCancel.classList.add('btn', 'btn-success', 'px-4', 'inverse');
  modalActionCancel.innerText = 'No';
  modalActionCancel.addEventListener('click', function () {
    closeDeleteDialog();
  });

  const modalActionDelete = document.createElement('button');
  modalActionDelete.classList.add(
    'btn',
    'btn-danger',
    'ml-2',
    'px-4',
    'inverse'
  );
  modalActionDelete.innerText = 'Yes';
  modalActionDelete.addEventListener('click', function () {
    deleteBook(book.id);
    closeDeleteDialog();
  });

  modalContent.appendChild(modalContentTitle);
  modalContent.appendChild(modalContentSubTitle);

  modalAction.appendChild(modalActionCancel);
  modalAction.appendChild(modalActionDelete);

  modalCard.appendChild(modalTitle);
  modalCard.appendChild(modalContent);
  modalCard.appendChild(modalAction);

  modalContainer.appendChild(modalCard);

  DOM_PRESENTATION_LAYER.append(modalContainer);
}

function closeDeleteDialog() {
  document.querySelector('#delete-dialog-container').remove();
  document.body.classList.remove('disable-scroll');
}

function rebuildOnSearch() {}

document.addEventListener('DOMContentLoaded', function () {
  loadBookFromStorage();
  loadFormFromSession();

  DOM_SEARCH_INPUT.addEventListener('input', function (e) {
    searchDebounce(e.target.value);
  });

  DOM_BOOK_FORM.addEventListener('input', function (e) {
    saveFormToSession();
  });

  DOM_BOOK_FORM.addEventListener('submit', function (e) {
    e.preventDefault();

    const book = [...new FormData(e.target).entries()].reduce(
      (prev, val) => {
        if (val[0] === 'is_complete' && val[1] === 'on') {
          prev['isComplete'] = true;
        } else {
          prev[val[0]] = val[1];
        }
        return prev;
      },
      { isComplete: false }
    );

    addBook(newBook(book));

    formReset();
  });
});

document.addEventListener(ON_BOOK_SAVED, function (e) {
  const book = e.detail;
  createDOMBook(book);
});

document.addEventListener(ON_BOOK_MOVE, function (e) {
  const book = e.detail;
  deleteDOMBookById(book.id);
  createDOMBook(book);
});

document.addEventListener(ON_BOOK_DELETE, function (e) {
  const id = e.detail;
  deleteDOMBookById(id);
});

document.addEventListener(ON_BOOK_LOAD, function () {
  books.forEach((book) => {
    createDOMBook(book);
  });
});

document.addEventListener(ON_BOOK_SEARCH, function (e) {
  const searchedBooks = e.detail;
  deleteDOMAllBook();

  searchedBooks.forEach((book) => {
    createDOMBook(book);
  });
});

document.addEventListener(ON_FORM_LOAD, function ({ detail }) {
  const { title, author, year, isComplete } = detail || {};
  DOM_JUDUL_INPUT.value = title || '';
  DOM_PENULIS_INPUT.value = author || '';
  DOM_TAHUN_INPUT.value = year;
  DOM_ISCOMPLETE_INPUT.checked = isComplete;
});

// object
function newBook({ title, author, year, isComplete }) {
  return {
    id: +new Date(),
    title,
    author,
    year,
    isComplete,
  };
}

// storage
function StorageExist() {
  if (typeof Storage === undefined || Storage === null) {
    alert('Browser tidak mendukung fitur storage');
    return false;
  }
  return true;
}

function addBook(book) {
  books.push(book);
  if (StorageExist()) {
    const jsoned = JSON.stringify(books);
    localStorage.setItem(BOOK_LIST_KEY, jsoned);
  }
  document.dispatchEvent(
    new CustomEvent(ON_BOOK_SAVED, {
      detail: book,
    })
  );
}

function moveBook(id) {
  const book = getBookById(id);
  book.isComplete = !book.isComplete;
  document.dispatchEvent(
    new CustomEvent(ON_BOOK_MOVE, {
      detail: book,
    })
  );
}

function deleteBook(id) {
  books = books.filter((item) => item.id !== id);
  if (StorageExist()) {
    const jsoned = JSON.stringify(books);
    localStorage.setItem(BOOK_LIST_KEY, jsoned);
  }
  document.dispatchEvent(
    new CustomEvent(ON_BOOK_DELETE, {
      detail: id,
    })
  );
}

function loadBookFromStorage() {
  books = JSON.parse(localStorage.getItem(BOOK_LIST_KEY)) || [];
  document.dispatchEvent(new Event(ON_BOOK_LOAD));
}

const searchDebounce = debounce(function (val = '') {
  let searched_books = [];
  if (!val) {
    searched_books = books;
  } else {
    searched_books = books.filter((item) => item.title.includes(val));
  }

  document.dispatchEvent(
    new CustomEvent(ON_BOOK_SEARCH, {
      detail: searched_books,
    })
  );
}, 500);

const saveFormToSession = debounce(function () {
  if (StorageExist()) {
    const jsoned = JSON.stringify(
      Array.from(new FormData(DOM_BOOK_FORM).entries()).reduce(
        (prev, val) => {
          if (val[0] === 'is_complete' && val[1] === 'on') {
            prev['isComplete'] = true;
          } else {
            prev[val[0]] = val[1];
          }
          return prev;
        },
        { isComplete: false }
      )
    );

    sessionStorage.setItem(FORM_SESSION_KEY, jsoned);
  }
}, 500);

function loadFormFromSession() {
  const data = JSON.parse(sessionStorage.getItem(FORM_SESSION_KEY) || '{}');
  document.dispatchEvent(
    new CustomEvent(ON_FORM_LOAD, {
      detail: data,
    })
  );
}

function formReset() {
  DOM_BOOK_FORM.reset();
  sessionStorage.removeItem(FORM_SESSION_KEY);
}

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}
