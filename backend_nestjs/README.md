# YellowTip Reservations Backend (NestJS)

Это миграция Express.js бэкенда на NestJS фреймворк.

## Структура проекта

```
src/
├── auth/                    # Модуль аутентификации
│   ├── auth.controller.ts   # Контроллер
│   ├── auth.service.ts      # Сервис
│   ├── auth.module.ts       # Модуль
│   ├── dto/                 # DTO для валидации
│   └── strategies/          # Passport стратегии
├── common/                  # Общие модули
│   ├── decorators/         # Кастомные декораторы (@GetUser, @Roles)
│   ├── filters/            # Exception filters
│   ├── guards/             # Guards (JWT, Roles)
│   └── interceptors/       # Interceptors
├── prisma/                 # Prisma модуль
│   ├── prisma.service.ts   # Prisma сервис
│   └── prisma.module.ts    # Prisma модуль
└── main.ts                 # Точка входа

```

## Установка

```bash
npm install
```

## Настройка окружения

Создайте файл `.env` в корне проекта:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/yellowtip_reservations?schema=public"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
```

## Запуск

```bash
# Разработка
npm run start:dev

# Продакшн
npm run build
npm run start:prod
```

## Prisma

```bash
# Генерация Prisma Client
npm run prisma:generate

# Миграции
npm run prisma:migrate

# Prisma Studio
npm run prisma:studio
```

## API документация

После запуска приложения, Swagger документация доступна по адресу:
http://localhost:3001/api/docs

## Миграция модулей

Следующие модули еще нужно мигрировать из Express.js версии:

- [ ] Admin Module (частично готов)
- [ ] Bookings Module
- [ ] Rooms Module
- [ ] Services Module
- [ ] Guests Module
- [ ] Therapists Module
- [ ] Reservations Module

## Особенности

- Использование NestJS модульной архитектуры
- JWT аутентификация через Passport
- Ролевая авторизация через Guards
- Валидация через class-validator
- Swagger документация
- Глобальная обработка ошибок
- Rate limiting через Throttler


