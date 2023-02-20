const btnBrand = document.querySelector('#btn-brand');
const btnAddBook = document.querySelector('#btn-add-book');
const btnTrash = document.querySelector('#btn-trash');
const btnAddBookMobile = document.querySelector('#btn-add-book-mobile');
const btnTrashMobile = document.querySelector('#btn-trash-mobile');
const btnCancel = document.querySelector('#btn-cancel');
const btnSrc = document.querySelector('#btn-src');
const displaySrc = document.querySelector('#display-src');
const src = document.querySelector('#src');
const btnSearch = document.querySelector('#btn-search');

const formAddBook = document.querySelector('#form-add-book');
const formAddNewBook = document.querySelector('#form-add-new-book');

const inputBookId = document.querySelector('#book-id');
const inputYear = document.querySelector('#input-book-year');
const inputTitle = document.querySelector('#input-book-title');
const inputAuthor = document.querySelector('#input-book-author');
const inputIsComplete = document.querySelector('#input-book-isComplete');

let bookItems = [];
let bookDeleted = [];
let filteredBookItems = null;
let filteredBookDeleted = null;



function toggleMobileMenu(menu) {
    menu.classList.toggle('open');
}

function removeBook(id) {
    if (confirm("Are you sure to delete this book?")) {
        const bookIndex = bookItems.findIndex(book => book.id === id);
        const book = bookItems[bookIndex];
        const idDel = book.id;
        const bookTitleDel = book.title;
        const bookAuthorDel = book.author;
        const bookYearDel = book.year;
        const bookIsCompleteDel = book.isComplete;

        bookItems.splice(bookIndex, 1);

        const bookDel = {
            idDel: idDel,
            titleDel: bookTitleDel,
            authorDel: bookAuthorDel,
            yearDel: bookYearDel,
            isCompleteDel: bookIsCompleteDel
        }
        bookDeleted.push(bookDel);
    saveDateToStorage();
    saveDateTotrash();
    render();
    } else {
        return false;
    }
}

function removeTrash(idDel) {
    if (confirm("Are you sure to delete this book?")) {
        const bookIndexDel = bookDeleted.findIndex(Trash => Trash.idDel === idDel);
        bookDeleted.splice(bookIndexDel, 1);

        saveDateTotrash();
        renderTrash();
    } else {
        return false;
    }
}

function recycleTrash(idDel) {
    if (confirm("Are you sure to Recycle this Trash?")) {
        const bookIndexDel = bookDeleted.findIndex(Trash => Trash.idDel === idDel);
        const Trash = bookDeleted[bookIndexDel];
        const id = Trash.idDel;
        const bookTitle = Trash.titleDel;
        const bookAuthor = Trash.authorDel;
        const bookYear = Trash.yearDel;
        const bookIsComplete = Trash.isCompleteDel;

        bookDeleted.splice(bookIndexDel, 1);

        const book = {
            id: id,
            title: bookTitle,
            author: bookAuthor,
            year: bookYear,
            isComplete: bookIsComplete
        }
        bookItems.push(book);
    saveDateToStorage();
    saveDateTotrash();
    renderTrash();
    } else {
        return false;
    }
}



function moveBook(id) {
    const bookIndex = bookItems.findIndex(book => book.id === id);
    bookItems[bookIndex].isComplete = !bookItems[bookIndex].isComplete;

    saveDateToStorage();
    render();
}

function saveDateToStorage() {
    const serializedData = JSON.stringify(bookItems);
    localStorage.setItem('book-items', serializedData);
}

function saveDateTotrash() {
    const serializedDataTrash = JSON.stringify(bookDeleted);
    localStorage.setItem('book-deleted', serializedDataTrash);
}

function clearBooksElement() {
    const booksElement = document.getElementsByTagName('article');
    while (booksElement.length > 0) {
        booksElement[0].parentNode.removeChild(booksElement[0]);
    }
}

function clearBooksElementTrash() {
    const booksElementTrash = document.getElementsByTagName('aside');
    while (booksElementTrash.length > 0) {
        booksElementTrash[0].parentNode.removeChild(booksElementTrash[0]);
    }
}

function checkEmptyList(items, bookListCompletedElement, bookListNotCompletedElement) {
    const completed404 = bookListCompletedElement.querySelector('.card-404');
    const notCompleted404 = bookListNotCompletedElement.querySelector('.card-404');

    const isAvailableCompleted = items.some(book => book.isComplete);
    const isAvailableNotCompleted = items.some(book => !book.isComplete);

    if (!isAvailableCompleted) {
        completed404.classList.remove('hide')
    } else {
        completed404.classList.add('hide')
    }

    if (!isAvailableNotCompleted) {
        notCompleted404.classList.remove('hide')
    } else {
        notCompleted404.classList.add('hide')
    }
}

function checkEmptyListTrash(itemsTrash, TrashListCompletedElement, TrashListNotCompletedElement) {
    const Trashcompleted404 = TrashListCompletedElement.querySelector('.card-404-trash');
    const TrashnotCompleted404 = TrashListNotCompletedElement.querySelector('.card-404-trash');

    const TrashisAvailableCompleted = itemsTrash.some(Trash => Trash.isCompleteDel);
    const TrashisAvailableNotCompleted = itemsTrash.some(Trash => !Trash.isCompleteDel);

    if (!TrashisAvailableCompleted) {
        Trashcompleted404.classList.remove('hide')
    } else {
        Trashcompleted404.classList.add('hide')
    }

    if (!TrashisAvailableNotCompleted) {
        TrashnotCompleted404.classList.remove('hide')
    } else {
        TrashnotCompleted404.classList.add('hide')
    }
}

function render() {
    clearBooksElement();
    const items = (filteredBookItems || bookItems);
    const bookListCompletedElement = document.querySelector('#is-completed');
    const bookListNotCompletedElement = document.querySelector('#is-not-completed');

    checkEmptyList(items, bookListCompletedElement, bookListNotCompletedElement);

    items.forEach((book) => {
        const bookElement = document.createElement('article');
        bookElement.classList.add('card');
        bookElement.id = book.id;
        bookElement.innerHTML = `
            <div>
                <h3>${book.title}</h3>
                <small>Author: ${book.author} | Year: ${book.year}</small>
            </div>
            <div>
                <button class="btn btn-edit" onclick="updateBook(${book.id})">Edit</button>
                <button class="btn btn-delete" onclick="removeBook(${book.id})">Delete</button>
                <button class="btn btn-move" onclick="moveBook(${book.id})">Set to ${!book.isComplete ? '' : 'Not'} Finished</button>
            </div>
        `;

        if (book.isComplete) {
            bookListCompletedElement.append(bookElement);
        } else {
            bookListNotCompletedElement.append(bookElement);
        }
    });
}

function renderTrash() {
    clearBooksElementTrash();
    const itemsTrash= (filteredBookDeleted || bookDeleted);
    const TrashListCompletedElement = document.querySelector('#is-completed-trash');
    const TrashListNotCompletedElement = document.querySelector('#is-not-completed-trash');

    checkEmptyListTrash(itemsTrash, TrashListCompletedElement, TrashListNotCompletedElement);

    itemsTrash.forEach((Trash) => {
        const TrashElement = document.createElement('aside');
        TrashElement.classList.add('card-trash');
        TrashElement.idDel = Trash.idDel;
        TrashElement.innerHTML = `
            <div>
                <h3>${Trash.titleDel}</h3>
                <small>Author: ${Trash.authorDel} | Year: ${Trash.yearDel}</small>
            </div>
            <div>
                <button class="btn btn-recycle" onclick="recycleTrash(${Trash.idDel})"><img src="./assets/icon/loop.png" alt="" />Receycle</button>
                <button class="btn btn-delete" onclick="removeTrash(${Trash.idDel})">Delete</button>
            </div>
        `;

        if (Trash.isCompleteDel) {
            TrashListCompletedElement.append(TrashElement);
        } else {
            TrashListNotCompletedElement.append(TrashElement);
        }
    });
}

function updateBook(id) {
    const bookIndex = bookItems.findIndex(book => book.id === id);
    const book = bookItems[bookIndex];

    inputBookId.value = book.id;
    inputTitle.value = book.title;
    inputAuthor.value = book.author;
    inputYear.value = book.year;
    inputIsComplete.checked = book.isComplete;

    formAddBook.classList.remove('hide');
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}





btnBrand.addEventListener('click', () => {
    location.href = "index.html"; 
    btn-add-book.classList.remove('hide');
    render();
})

btnAddBook.addEventListener('click', () => {
    formAddBook.classList.remove('hide');
})

btnTrash.addEventListener('click', () => {
    add.classList.add('hide');
    booklist.classList.add('hide');
    del.classList.remove('hide');
    src.classList.add('hide');
    renderTrash();
})

btnAddBookMobile.addEventListener('click', () => {
    formAddBook.classList.remove('hide');
})

btnTrashMobile.addEventListener('click', () => {
    add.classList.add('hide');
    booklist.classList.add('hide');
    del.classList.remove('hide');
    src.classList.add('hide');
    renderTrash();
})

btnCancel.addEventListener('click', () => {
    formAddBook.classList.add('hide');
})

btnSrc.addEventListener('click', () => {
    displaySrc.classList.remove('display__none');
    src.classList.add('hide');
})

btnSearch.addEventListener('click', () => {
    const inputSearch = document.querySelector('#search-query');
    const searchQuery = inputSearch.value.toLowerCase();

    if (searchQuery) {
        const filtered = bookItems.filter((bookItem) => {
            return bookItem.title.toLowerCase().includes(searchQuery);
        });

        filteredBookItems = filtered;
    } else {
        filteredBookItems = null
    }
    render();
    displaySrc.classList.add('display__none');
    src.classList.remove('hide');
})


formAddNewBook.addEventListener('submit', () => {
    const id = +inputBookId.value;
    const bookTitle = inputTitle.value;
    const bookAuthor = inputAuthor.value;
    const bookYear = inputYear.value;
    const bookIsComplete = inputIsComplete.checked;

    const bookItem = {
        id: id || +new Date(),
        title: bookTitle,
        author: bookAuthor,
        year: bookYear,
        isComplete: bookIsComplete
    }
    if (id) {
        const bookIndex = bookItems.findIndex(book => book.id === id);
        bookItems[bookIndex] = bookItem;

        formAddBook.classList.add('hide');
    } else {
        bookItems.push(bookItem);
    }
    inputBookId.value = '';
    inputTitle.value = '';
    inputAuthor.value = '';
    inputYear.value = '';
    inputIsComplete.checked = false;
    saveDateToStorage();
    formAddBook.classList.add('hide');
    render();
});


window.addEventListener('load', () => {
    const serializedData = localStorage.getItem('book-items');
    const data = JSON.parse(serializedData) || [];
    bookItems = data;
    const serializedDataTrash = localStorage.getItem('book-deleted');
    const datadeleted = JSON.parse(serializedDataTrash) || [];
    bookDeleted = datadeleted;

    render();
    renderTrash();
})