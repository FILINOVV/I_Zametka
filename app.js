// ===== ГЛОБАЛЬНОЕ СОСТОЯНИЕ =====
let notes = [];

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    loadNotesFromStorage();
    renderNotes();
    setupEventListeners();
});

// ===== РАБОТА С LOCALSTORAGE =====
function loadNotesFromStorage() {
    const stored = localStorage.getItem('notes');
    if (stored) {
        notes = JSON.parse(stored);
    }
}

function saveNotesToStorage() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// ===== СОЗДАНИЕ ЗАМЕТКИ =====
function createNote(text, color = '#fff') {
    return {
        id: Date.now(), // Уникальный ID на основе времени
        text: text,
        color: color,
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

function addNote(text, color) {
    if (!text.trim()) {
        alert('Введите текст заметки!');
        return;
    }

    const note = createNote(text, color);
    notes.unshift(note); // Добавляем в начало массива
    saveNotesToStorage();
    renderNotes();
}

// ===== УДАЛЕНИЕ ЗАМЕТКИ =====
function deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    saveNotesToStorage();
    renderNotes();
}

// ===== ЗАКРЕПЛЕНИЕ ЗАМЕТКИ =====
function togglePin(id) {
    const note = notes.find(n => n.id === id);
    if (note) {
        note.isPinned = !note.isPinned;
        saveNotesToStorage();
        renderNotes();
    }
}

// ===== ОТРИСОВКА ЗАМЕТОК =====
function renderNotes() {
    const container = document.getElementById('notesContainer');
    container.innerHTML = '';

    // Сортировка: закрепленные сверху
    const sortedNotes = [...notes].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    sortedNotes.forEach(note => {
        const noteElement = createNoteElement(note);
        container.appendChild(noteElement);
    });
}

function createNoteElement(note) {
    const div = document.createElement('div');
    div.className = `note-card ${note.isPinned ? 'pinned' : ''}`;
    div.style.backgroundColor = note.color;

    const date = new Date(note.createdAt).toLocaleString('ru-RU');

    div.innerHTML = `
        <div class="note-text">${escapeHtml(note.text)}</div>
        <div class="note-actions">
            <button class="pin-btn" data-id="${note.id}">
                ${note.isPinned ? '📌 Открепить' : '📍 Закрепить'}
            </button>
            <button class="delete-btn" data-id="${note.id}">🗑️ Удалить</button>
        </div>
        <div class="note-date">Создано: ${date}</div>
    `;

    return div;
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
function setupEventListeners() {
    // Добавление заметки
    document.getElementById('addBtn').addEventListener('click', () => {
        const input = document.getElementById('noteInput');
        const colorSelect = document.getElementById('colorSelect');
        addNote(input.value, colorSelect.value);
        input.value = '';
        input.focus();
    });

    // Добавление по Enter
    document.getElementById('noteInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const input = document.getElementById('noteInput');
            const colorSelect = document.getElementById('colorSelect');
            addNote(input.value, colorSelect.value);
            input.value = '';
        }
    });

    // Делегирование событий для кнопок (удаление и закрепление)
    document.getElementById('notesContainer').addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const id = Number(button.dataset.id);

        if (button.classList.contains('delete-btn')) {
            deleteNote(id);
        } else if (button.classList.contains('pin-btn')) {
            togglePin(id);
        }
    });
}