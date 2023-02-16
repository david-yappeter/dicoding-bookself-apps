// global var
let books = [];

// constant
const BOOK_LIST_KEY = 'book-list';

// constant event key
const ON_BOOK_SAVED = 'onBookSaved';
const ON_BOOK_DELETE = 'onBookDelete';
const ON_BOOK_LOAD = 'onBookLoad';

// constant DOM
const DOM_BOOK_FORM = document.getElementById('_book-form');
const DOM_NOT_COMPLETED_BOOKS = document.getElementById(
  '_not-completed-container'
);
const DOM_COMPLETED_BOOKS = document.getElementById('_completed-container');

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

  const buttonDanger = document.createElement('button');
  buttonDanger.classList.add('btn', 'btn-danger', 'inverse', 'ml-2', 'px-2');
  buttonDanger.innerText = 'Hapus Buku';
  buttonDanger.addEventListener('click', function (e) {
    deleteBook(id);
  });

  bookAction.appendChild(buttonSuccess);
  bookAction.appendChild(buttonDanger);

  bookContainer.appendChild(bookAction);

  bookContainer.setAttribute('data-id', id);

  isComplete
    ? DOM_COMPLETED_BOOKS.appendChild(bookContainer)
    : DOM_NOT_COMPLETED_BOOKS.appendChild(bookContainer);
}

function deleteDOMBookById(id) {
  document.querySelector(`.book-item[data-id='${id}']`).remove();
}

document.addEventListener('DOMContentLoaded', function () {
  loadBookFromStorage();

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

    DOM_BOOK_FORM.reset();
  });
});

document.addEventListener(ON_BOOK_SAVED, function (e) {
  const book = e.detail;
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
