# bloglist-backend

Упражнения 4.1 - 4.23

Бэкенд для списка блогов на Node.js, Express и MongoDB. Есть пользователи, вход по токену (JWT) и тесты. Сервер работает на порту 3003.

## Запуск

1. npm install
2. Скопировать .env.example в .env и вписать любую длинную строку в SECRET
3. npm run db - запускает MongoDB локально (как в части 3, через mongodb-memory-server). Данные хранятся в папке mongo-data
4. В другом терминале npm start или npm run dev

Для тестов база тоже должна быть запущена, тесты используют отдельную базу из TEST_MONGODB_URI. Запуск тестов npm test, линтер npm run lint.

## Структура

- index.js - только запуск сервера
- app.js - подключение к базе, middleware и роутеры
- controllers/ - роутеры blogs, users, login
- models/ - схемы Blog и User
- utils/config.js - переменные из .env
- utils/logger.js - вывод в консоль (во время тестов ничего не печатает)
- utils/middleware.js - логгер запросов, tokenExtractor, userExtractor, обработка ошибок
- utils/list_helper.js - функции для упражнений 4.3 - 4.7
- tests/ - тесты на node:test и supertest

## Маршруты

- GET /api/blogs - все блоги вместе с данными пользователя, который добавил блог
- GET /api/blogs/:id - один блог
- POST /api/blogs - добавить блог, нужен токен. Без title или url ответ 400, если likes нет то будет 0
- DELETE /api/blogs/:id - удалить блог, нужен токен. Удалить может только тот, кто добавил блог, иначе 403
- PUT /api/blogs/:id - изменить блог (например количество лайков)
- GET /api/users - все пользователи с их блогами, хеш пароля не показывается
- POST /api/users - создать пользователя. username и пароль должны быть не короче 3 символов, username уникальный
- POST /api/login - вход, возвращает токен. Токен действует 1 час

Токен передаётся в заголовке Authorization: Bearer токен. tokenExtractor достаёт токен из заголовка, а userExtractor находит по нему пользователя и кладёт в request.user. userExtractor подключён только к POST и DELETE блогов.

## Тесты

- list_helper.test.js - dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
- blog_api.test.js - получение, добавление, удаление и изменение блогов, проверки токена
- user_api.test.js - создание пользователей, проверки username и пароля, вход

Тесты запускаются по одному файлу (--test-concurrency=1), потому что все файлы работают с одной тестовой базой.

Вместо bcrypt использую bcryptjs, он работает так же, но не требует сборки при установке.

В папке requests лежат запросы для REST Client в VS Code.
