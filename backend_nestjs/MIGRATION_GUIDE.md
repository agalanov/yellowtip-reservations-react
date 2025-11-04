# Руководство по миграции на NestJS

Этот документ описывает процесс конвертации Express.js бэкенда в NestJS.

## Структура

Базовая структура NestJS создана. Осталось мигрировать следующие модули:

### ✅ Завершено

1. ✅ Базовая структура проекта
2. ✅ Prisma модуль
3. ✅ Auth модуль (авторизация и аутентификация)
4. ✅ Общие компоненты (guards, decorators, filters, interceptors)
5. ✅ Admin модуль (контроллер создан, нужен сервис)

### ⏳ В процессе / TODO

1. ⏳ Admin Service - полная реализация всех методов
2. ⏳ Bookings Module
3. ⏳ Rooms Module  
4. ⏳ Services Module
5. ⏳ Guests Module
6. ⏳ Therapists Module
7. ⏳ Reservations Module

## Паттерн миграции

Для каждого модуля следуйте этому паттерну:

### 1. Создайте DTOs

```typescript
// src/[module]/dto/[name].dto.ts
import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEntityDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}
```

### 2. Создайте Service

```typescript
// src/[module]/[module].service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EntityService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: any) {
    // Implement logic from Express route
  }
}
```

### 3. Создайте Controller

```typescript
// src/[module]/[module].controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EntityService } from './entity.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Entity')
@Controller('entity')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EntityController {
  constructor(private readonly entityService: EntityService) {}

  @Get()
  @ApiOperation({ summary: 'Get all entities' })
  async findAll(@Query() filters: any) {
    return this.entityService.findAll(filters);
  }
}
```

### 4. Создайте Module

```typescript
// src/[module]/[module].module.ts
import { Module } from '@nestjs/common';
import { EntityController } from './entity.controller';
import { EntityService } from './entity.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EntityController],
  providers: [EntityService],
  exports: [EntityService],
})
export class EntityModule {}
```

### 5. Добавьте в AppModule

```typescript
// src/app.module.ts
import { EntityModule } from './entity/entity.module';

@Module({
  imports: [
    // ... other modules
    EntityModule,
  ],
})
export class AppModule {}
```

## Ключевые отличия от Express

1. **Middleware → Guards**: `authenticate` → `JwtAuthGuard`, `authorize` → `RolesGuard`
2. **Routes → Controllers**: Express routes → NestJS controllers с декораторами
3. **Error Handling**: Express error handler → Exception filters
4. **Validation**: express-validator → class-validator
5. **Response Format**: Ручной формат → TransformInterceptor автоматически оборачивает

## Следующие шаги

1. Реализовать AdminService со всеми методами из `admin.ts` роута
2. Мигрировать остальные модули по паттерну выше
3. Добавить unit тесты для сервисов
4. Обновить документацию API


