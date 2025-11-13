# GLOBALCODE API Документация

## Базовый URL

```
http://localhost:3001/api
```

## Аутентификация

Большинство endpoints требуют аутентификации через JWT токен в заголовке:

```
Authorization: Bearer <token>
```

## Общие форматы ответов

### Успешный ответ
```json
{
  "success": true,
  "data": { ... }
}
```

### Ошибка
```json
{
  "success": false,
  "error": {
    "message": "Описание ошибки",
    "code": "ERROR_CODE"
  }
}
```

## Endpoints

### Аутентификация

#### POST /auth/register
Регистрация нового пользователя

**Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

#### POST /auth/login
Вход в систему

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": { ... }
  }
}
```

### Проекты

#### GET /projects
Получить список проектов

**Query параметры:**
- `page` - номер страницы (default: 1)
- `limit` - количество на странице (default: 20)
- `search` - поисковый запрос
- `tags` - фильтр по тегам (через запятую)
- `author` - фильтр по автору

#### GET /projects/:id
Получить детали проекта

#### POST /projects
Создать новый проект

**Body:**
```json
{
  "title": "Название проекта",
  "description": "Описание",
  "license": "MIT",
  "tags": ["react", "typescript"],
  "isPublic": true
}
```

### Форум

#### GET /forum/categories
Получить список категорий

#### GET /forum/topics
Получить список тем

**Query параметры:**
- `category` - ID категории
- `page` - номер страницы
- `limit` - количество на странице

#### GET /forum/topics/:id
Получить детали темы

#### POST /forum/topics
Создать новую тему

**Body:**
```json
{
  "title": "Заголовок темы",
  "content": "Содержание",
  "categoryId": "category_id"
}
```

### Видеотека

#### GET /videos
Получить список видео (1-100)

**Query параметры:**
- `page` - номер страницы
- `limit` - количество на странице

#### GET /videos/:id
Получить детали видео

#### GET /videos/:id/stream
Получить поток видео

**Query параметры:**
- `quality` - качество (360p, 480p, 720p, 1080p)

---

*Документация будет дополняться по мере разработки*

