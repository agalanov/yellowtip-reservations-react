# Admin Module Migration Plan

Документ описывает процесс миграции PHP admin модуля в React приложение.

## ✅ Реализовано

### Backend API Endpoints

1. **User Management** (`/api/admin/users`)
   - ✅ GET `/admin/users` - список пользователей
   - ✅ GET `/admin/users/:id` - детали пользователя
   - ✅ POST `/admin/users` - создание пользователя
   - ✅ PUT `/admin/users/:id` - обновление пользователя
   - ✅ DELETE `/admin/users/:id` - удаление пользователя

2. **Categories** (`/api/admin/categories`)
   - ✅ GET `/admin/categories` - список категорий
   - ✅ GET `/admin/categories/:id` - детали категории
   - ✅ POST `/admin/categories` - создание категории
   - ✅ PUT `/admin/categories/:id` - обновление категории
   - ✅ DELETE `/admin/categories/:id` - удаление категории

3. **Currency** (`/api/admin/currencies`)
   - ✅ GET `/admin/currencies` - список валют
   - ✅ GET `/admin/currencies/:id` - детали валюты
   - ✅ POST `/admin/currencies` - создание валюты
   - ✅ PUT `/admin/currencies/:id` - обновление валюты
   - ✅ DELETE `/admin/currencies/:id` - удаление валюты

4. **Colors** (`/api/admin/colors`)
   - ✅ GET `/admin/colors` - список цветов для категорий

5. **Dashboard & Config**
   - ✅ GET `/admin/dashboard` - статистика
   - ✅ GET `/admin/config` - конфигурация системы
   - ✅ PUT `/admin/config` - обновление конфигурации

### Frontend Pages

1. **Admin Dashboard** (`/admin`)
   - ✅ Главная страница админ-панели
   - ✅ Навигация по разделам
   - ✅ Quick Actions

2. **Users Management** (`/admin/users`)
   - ✅ Таблица пользователей
   - ✅ Поиск пользователей
   - ✅ Создание/редактирование/удаление пользователей
   - ✅ Просмотр деталей пользователя

3. **Categories** (`/admin/categories`)
   - ✅ Таблица категорий
   - ✅ Поиск категорий
   - ✅ Создание/редактирование/удаление категорий
   - ✅ Выбор цвета для категории
   - ✅ Просмотр деталей категории

4. **Currencies** (`/admin/currencies`)
   - ✅ Таблица валют
   - ✅ Поиск валют
   - ✅ Создание/редактирование/удаление валют
   - ✅ Установка базовой валюты
   - ✅ Просмотр деталей валюты

## 🔄 В процессе / TODO

### Backend API Endpoints (требуются)

1. **Roles & Permissions**
   - ⏳ GET `/admin/roles` - список ролей
   - ⏳ POST `/admin/roles` - создание роли
   - ⏳ PUT `/admin/roles/:id` - обновление роли
   - ⏳ DELETE `/admin/roles/:id` - удаление роли
   - ⏳ GET `/admin/permissions` - список прав доступа

2. **Regional Settings**
   - ⏳ GET `/admin/cities` - список городов
   - ⏳ POST `/admin/cities` - создание города
   - ⏳ GET `/admin/countries` - список стран
   - ⏳ POST `/admin/countries` - создание страны
   - ⏳ GET `/admin/regions` - список регионов

3. **Language Management**
   - ⏳ GET `/admin/languages` - список языков
   - ⏳ POST `/admin/languages` - создание языка
   - ⏳ PUT `/admin/languages/:id` - обновление языка

4. **Opening Hours**
   - ⏳ GET `/admin/opening-hours` - часы работы
   - ⏳ PUT `/admin/opening-hours` - обновление часов работы

5. **Taxes**
   - ⏳ GET `/admin/taxes` - список налогов
   - ⏳ POST `/admin/taxes` - создание налога
   - ⏳ PUT `/admin/taxes/:id` - обновление налога

6. **Titles**
   - ⏳ GET `/admin/titles` - список титулов
   - ⏳ POST `/admin/titles` - создание титула

7. **Applications**
   - ⏳ GET `/admin/applications` - список приложений
   - ⏳ POST `/admin/applications` - создание приложения

8. **Workstations**
   - ⏳ GET `/admin/workstations` - список рабочих станций
   - ⏳ POST `/admin/workstations` - создание рабочей станции

9. **Logs**
   - ⏳ GET `/admin/logs/access` - логи доступа
   - ⏳ GET `/admin/logs/application` - логи приложений
   - ⏳ GET `/admin/logs/current-users` - текущие пользователи

10. **Configuration**
    - ⏳ GET `/admin/mailer-config` - конфигурация почты
    - ⏳ PUT `/admin/mailer-config` - обновление почты
    - ⏳ GET `/admin/media-config` - конфигурация медиа
    - ⏳ PUT `/admin/media-config` - обновление медиа
    - ⏳ GET `/admin/printer-config` - конфигурация принтера

### Frontend Pages (требуются)

1. **Roles & Permissions** (`/admin/roles`)
   - ⏳ Управление ролями
   - ⏳ Назначение прав доступа

2. **Regional Settings** (`/admin/regions`)
   - ⏳ Управление странами
   - ⏳ Управление городами
   - ⏳ Региональные настройки

3. **Languages** (`/admin/languages`)
   - ⏳ Управление языками
   - ⏳ Редактирование переводов

4. **Opening Hours** (`/admin/opening-hours`)
   - ⏳ Настройка часов работы
   - ⏳ Настройка по дням недели

5. **Taxes** (`/admin/taxes`)
   - ⏳ Управление налогами

6. **Titles** (`/admin/titles`)
   - ⏳ Управление титулами

7. **Applications** (`/admin/applications`)
   - ⏳ Управление приложениями

8. **Workstations** (`/admin/workstations`)
   - ⏳ Управление рабочими станциями

9. **System Configuration** (`/admin/config`)
   - ⏳ Общие настройки системы
   - ⏳ Настройки почты
   - ⏳ Настройки медиа
   - ⏳ Настройки принтера

10. **Logs** (`/admin/logs`)
    - ⏳ Просмотр логов доступа
    - ⏳ Просмотр логов приложений
    - ⏳ Текущие активные пользователи

## 📋 Структура Admin модуля

```
admin/
├── index.php              → /admin (AdminDashboard.tsx) ✅
├── accounts.php          → /admin/users (Users.tsx) ✅
├── categories.php        → /admin/categories (Categories.tsx) ✅
├── currency.php          → /admin/currencies (Currencies.tsx) ✅
├── regions.php           → /admin/regions (Regions.tsx) ⏳
├── cities.php            → /admin/cities (Cities.tsx) ⏳
├── countries.php         → /admin/countries (Countries.tsx) ⏳
├── language.php           → /admin/languages (Languages.tsx) ⏳
├── openinghours.php      → /admin/opening-hours (OpeningHours.tsx) ⏳
├── taxes.php             → /admin/taxes (Taxes.tsx) ⏳
├── titles.php            → /admin/titles (Titles.tsx) ⏳
├── applications.php      → /admin/applications (Applications.tsx) ⏳
├── workstations.php      → /admin/workstations (Workstations.tsx) ⏳
├── configcomp.php        → /admin/config (SystemConfig.tsx) ⏳
├── accesslog.php         → /admin/logs/access (AccessLog.tsx) ⏳
├── applog.php            → /admin/logs/application (AppLog.tsx) ⏳
└── currentusers.php      → /admin/logs/current-users (CurrentUsers.tsx) ⏳
```

## 🎯 Приоритеты миграции

### Высокий приоритет (Core functionality)
1. ✅ User Management - DONE
2. ✅ Categories - DONE
3. ✅ Currencies - DONE
4. ⏳ Roles & Permissions
5. ⏳ System Configuration

### Средний приоритет (Business settings)
6. ⏳ Regional Settings (Cities, Countries)
7. ⏳ Languages
8. ⏳ Opening Hours
9. ⏳ Taxes

### Низкий приоритет (Advanced features)
10. ⏳ Titles
11. ⏳ Applications
12. ⏳ Workstations
13. ⏳ Logs viewing

## 📝 Заметки по миграции

### Отличия от PHP версии

1. **Аутентификация**: JWT токены вместо PHP сессий
2. **API**: RESTful API вместо прямых SQL запросов
3. **Валидация**: Express Validator на backend, React формами на frontend
4. **UI**: Material-UI компоненты вместо custom HTML/CSS
5. **State Management**: React Query для серверного состояния

### Преимущества новой версии

1. **Type Safety**: TypeScript на всем стеке
2. **Real-time Updates**: React Query автоматически обновляет данные
3. **Better UX**: Современный Material-UI интерфейс
4. **Scalability**: REST API позволяет использовать разные клиенты
5. **Maintainability**: Модульная структура React компонентов

## 🚀 Следующие шаги

1. Добавить остальные API endpoints в `backend/src/routes/admin.ts`
2. Создать соответствующие React страницы
3. Добавить роуты в `App.tsx`
4. Обновить Layout для полной навигации
5. Протестировать все функции
6. Добавить права доступа (authorize middleware)

