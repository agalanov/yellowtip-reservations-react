import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import {
  CreateUserDto,
  UpdateUserDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateCurrencyDto,
  UpdateCurrencyDto,
  CreateRoleDto,
  UpdateRoleDto,
  CreateAccessRightDto,
  UpdateAccessRightDto,
  CreateCountryDto,
  UpdateCountryDto,
  CreateCityDto,
  UpdateCityDto,
  CreateLanguageDto,
  UpdateLanguageDto,
  CreateTaxDto,
  UpdateTaxDto,
  UpdateOpeningHoursDto,
} from './dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // Dashboard
  async getDashboard() {
    const today = Math.floor(Date.now() / 1000);
    const startOfDay = today - (today % 86400);
    const endOfDay = startOfDay + 86400;

    const [todayBookings, totalActiveBookings, totalGuests, totalTherapists, totalRooms, totalServices, recentBookings] =
      await Promise.all([
        this.prisma.booking.count({
          where: {
            date: { gte: startOfDay, lt: endOfDay },
            cancelled: false,
          },
        }),
        this.prisma.booking.count({
          where: {
            cancelled: false,
            date: { gte: today },
          },
        }),
        this.prisma.guest.count(),
        this.prisma.therapist.count(),
        this.prisma.room.count({ where: { deleted: false } }),
        this.prisma.service.count({ where: { deleted: false } }),
        this.prisma.booking.findMany({
          where: { cancelled: false },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            service: { select: { name: true } },
            room: { select: { name: true } },
            guest: { select: { firstName: true, lastName: true } },
            therapist: { select: { firstName: true, lastName: true } },
          },
        }),
      ]);

    return {
      success: true,
      data: {
        todayBookings,
        totalActiveBookings,
        totalGuests,
        totalTherapists,
        totalRooms,
        totalServices,
        recentBookings,
      },
    };
  }

  // Configuration
  async getConfig(grouped: boolean = false) {
    const config = await this.prisma.configuration.findMany({
      orderBy: [{ app: 'asc' }, { name: 'asc' }],
    });

    if (grouped) {
      const groupedConfig: Record<string, any[]> = {};
      config.forEach((item) => {
        const appKey = item.app || 'general';
        if (!groupedConfig[appKey]) {
          groupedConfig[appKey] = [];
        }
        groupedConfig[appKey].push({
          name: item.name,
          value: item.value,
          app: item.app,
        });
      });
      return { success: true, data: groupedConfig };
    }

    const configObject = config.reduce((acc: Record<string, string>, item) => {
      acc[item.name] = item.value || '';
      return acc;
    }, {});

    return { success: true, data: configObject };
  }

  async getConfigItem(name: string) {
    const config = await this.prisma.configuration.findUnique({
      where: { name },
    });
    if (!config) {
      throw new NotFoundException('Configuration not found');
    }
    return { success: true, data: config };
  }

  async updateConfig(config: Record<string, any>) {
    for (const [key, value] of Object.entries(config)) {
      await this.prisma.configuration.upsert({
        where: { name: key },
        update: { value: String(value) },
        create: { name: key, value: String(value) },
      });
    }
    return { success: true, message: 'Configuration updated successfully' };
  }

  async createConfigItem(dto: any) {
    const existing = await this.prisma.configuration.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new BadRequestException('Configuration with this name already exists');
    }
    const config = await this.prisma.configuration.create({
      data: {
        name: dto.name,
        value: dto.value || '',
        app: dto.app || null,
      },
    });
    return { success: true, data: config };
  }

  async updateConfigItem(name: string, dto: any) {
    const config = await this.prisma.configuration.update({
      where: { name },
      data: {
        value: dto.value !== undefined ? String(dto.value) : undefined,
        app: dto.app !== undefined ? dto.app : undefined,
      },
    });
    return { success: true, data: config };
  }

  async deleteConfigItem(name: string) {
    await this.prisma.configuration.delete({ where: { name } });
    return { success: true, message: 'Configuration deleted successfully' };
  }

  // Users
  async getUsers(filters: any) {
    const { page = 1, limit = 20, search, sortBy = 'loginId', sortOrder = 'asc' } = filters;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (search) {
      where.OR = [
        { loginId: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      this.prisma.account.count({ where }),
      this.prisma.account.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          loginId: true,
          firstName: true,
          lastName: true,
          status: true,
          lastLogin: true,
          lastLoginFrom: true,
          createdAt: true,
          updatedAt: true,
          roles: {
            include: {
              role: { select: { id: true, name: true } },
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.prisma.account.findUnique({
      where: { loginId: dto.loginId },
    });
    if (existing) {
      throw new BadRequestException('User with this login ID already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.account.create({
      data: {
        loginId: dto.loginId,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        status: dto.status || 'ACTIVE',
        roles: {
          create: (dto.roleIds || []).map((roleId) => ({ roleId })),
        },
      },
      select: {
        id: true,
        loginId: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, data: user };
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const { roleIds, password, ...updateData } = dto;
    const existing = await this.prisma.account.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (password) {
      updateData['password'] = await bcrypt.hash(password, 12);
    }

    const user = await this.prisma.account.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        loginId: true,
        firstName: true,
        lastName: true,
        status: true,
        lastLogin: true,
        lastLoginFrom: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (roleIds !== undefined) {
      await this.prisma.accountRole.deleteMany({ where: { accountId: id } });
      if (roleIds.length > 0) {
        await this.prisma.accountRole.createMany({
          data: roleIds.map((roleId) => ({ accountId: id, roleId })),
        });
      }
    }

    return { success: true, data: user };
  }

  async deleteUser(id: number, currentUserId?: number) {
    const user = await this.prisma.account.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Don't allow deleting the current user
    if (currentUserId && user.id === currentUserId) {
      throw new BadRequestException('Cannot delete your own account');
    }
    
    await this.prisma.account.delete({ where: { id } });
    return { success: true, message: 'User deleted successfully' };
  }

  // ============ Categories ============
  async getCategories(filters: any) {
    const {
      page = 1,
      limit = 100,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filters;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [total, categories] = await Promise.all([
      this.prisma.serviceCategory.count({ where }),
      this.prisma.serviceCategory.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          color: {
            select: {
              id: true,
              name: true,
              hexCode: true,
              textColor: true,
            },
          },
          _count: {
            select: {
              services: true,
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: categories,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getCategory(id: number) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        color: true,
        services: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return { success: true, data: category };
  }

  async createCategory(dto: CreateCategoryDto) {
    const { name, parentId = 0, status = false, colorId = 1 } = dto;

    const category = await this.prisma.serviceCategory.create({
      data: {
        name,
        parentId,
        status,
        colorId,
      },
      include: {
        color: true,
      },
    });

    return { success: true, data: category };
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    const category = await this.prisma.serviceCategory.update({
      where: { id },
      data: dto,
      include: {
        color: true,
      },
    });

    return { success: true, data: category };
  }

  async deleteCategory(id: number) {
    await this.prisma.serviceCategory.delete({
      where: { id },
    });

    return { success: true, message: 'Category deleted successfully' };
  }

  // ============ Currencies ============
  async getCurrencies(filters: any) {
    const {
      page = 1,
      limit = 100,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filters;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, currencies] = await Promise.all([
      this.prisma.currency.count({ where }),
      this.prisma.currency.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              services: true,
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: currencies,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getCurrency(id: number) {
    const currency = await this.prisma.currency.findUnique({
      where: { id },
      include: {
        services: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!currency) {
      throw new NotFoundException('Currency not found');
    }

    return { success: true, data: currency };
  }

  async createCurrency(dto: CreateCurrencyDto) {
    const { code, name, symbol, isBase = false } = dto;

    const currency = await this.prisma.currency.create({
      data: {
        code,
        name,
        symbol,
        isBase,
      },
    });

    return { success: true, data: currency };
  }

  async updateCurrency(id: number, dto: UpdateCurrencyDto) {
    const currency = await this.prisma.currency.update({
      where: { id },
      data: dto,
    });

    return { success: true, data: currency };
  }

  async deleteCurrency(id: number) {
    await this.prisma.currency.delete({
      where: { id },
    });

    return { success: true, message: 'Currency deleted successfully' };
  }

  // ============ Roles ============
  async getRoles(filters: any) {
    const {
      page = 1,
      limit = 100,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filters;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [total, roles] = await Promise.all([
      this.prisma.role.count({ where }),
      this.prisma.role.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              accounts: true,
              rights: true,
            },
          },
          rights: {
            include: {
              right: {
                select: {
                  id: true,
                  name: true,
                  appName: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: roles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getRole(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        accounts: {
          include: {
            account: {
              select: {
                id: true,
                loginId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        rights: {
          include: {
            right: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return { success: true, data: role };
  }

  async createRole(dto: CreateRoleDto) {
    const { name, rightIds = [] } = dto;

    const existingRole = await this.prisma.role.findFirst({
      where: { name },
    });

    if (existingRole) {
      throw new BadRequestException('Role with this name already exists');
    }

    const role = await this.prisma.role.create({
      data: {
        name,
        rights: {
          create: rightIds.map((rightId: number) => ({
            rightId,
          })),
        },
      },
      include: {
        rights: {
          include: {
            right: true,
          },
        },
      },
    });

    return { success: true, data: role };
  }

  async updateRole(id: number, dto: UpdateRoleDto) {
    const { name, rightIds } = dto;

    const existingRole = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    const updateData: any = {};
    if (name) {
      updateData.name = name;
    }

    const role = await this.prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        rights: {
          include: {
            right: true,
          },
        },
      },
    });

    if (Array.isArray(rightIds)) {
      await this.prisma.roleRight.deleteMany({
        where: { roleId: id },
      });

      if (rightIds.length > 0) {
        await this.prisma.roleRight.createMany({
          data: rightIds.map((rightId: number) => ({
            roleId: id,
            rightId,
          })),
        });
      }

      const updatedRole = await this.prisma.role.findUnique({
        where: { id },
        include: {
          rights: {
            include: {
              right: true,
            },
          },
        },
      });

      return { success: true, data: updatedRole };
    }

    return { success: true, data: role };
  }

  async deleteRole(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            accounts: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role._count.accounts > 0) {
      throw new BadRequestException('Cannot delete role that is assigned to accounts');
    }

    await this.prisma.role.delete({
      where: { id },
    });

    return { success: true, message: 'Role deleted successfully' };
  }

  // ============ Access Rights ============
  async getAccessRights(filters: any) {
    const {
      page = 1,
      limit = 100,
      search,
      appName,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filters;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { appName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (appName) {
      where.appName = appName;
    }

    const [total, rights] = await Promise.all([
      this.prisma.accessRight.count({ where }),
      this.prisma.accessRight.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              roles: true,
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: rights,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getAccessRight(id: number) {
    const right = await this.prisma.accessRight.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!right) {
      throw new NotFoundException('Access right not found');
    }

    return { success: true, data: right };
  }

  async createAccessRight(dto: CreateAccessRightDto) {
    const { name, appName } = dto;

    const existingRight = await this.prisma.accessRight.findFirst({
      where: { name, appName },
    });

    if (existingRight) {
      throw new BadRequestException('Access right with this name and app already exists');
    }

    const right = await this.prisma.accessRight.create({
      data: {
        name,
        appName,
      },
    });

    return { success: true, data: right };
  }

  async updateAccessRight(id: number, dto: UpdateAccessRightDto) {
    const right = await this.prisma.accessRight.update({
      where: { id },
      data: dto,
    });

    return { success: true, data: right };
  }

  async deleteAccessRight(id: number) {
    await this.prisma.accessRight.delete({
      where: { id },
    });

    return { success: true, message: 'Access right deleted successfully' };
  }

  // ============ Countries ============
  async getCountries(filters: any) {
    const {
      page = 1,
      limit = 100,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filters;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, countries] = await Promise.all([
      this.prisma.country.count({ where }),
      this.prisma.country.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              cities: true,
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: countries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getCountry(id: number) {
    const country = await this.prisma.country.findUnique({
      where: { id },
      include: {
        cities: true,
      },
    });

    if (!country) {
      throw new NotFoundException('Country not found');
    }

    return { success: true, data: country };
  }

  async createCountry(dto: CreateCountryDto) {
    const { name, code, topPulldown = 'N', isDefault = 'N' } = dto;

    if (isDefault === 'Y') {
      await this.prisma.country.updateMany({
        where: { isDefault: 'Y' },
        data: { isDefault: 'N' },
      });
    }

    try {
      const country = await this.prisma.country.create({
        data: {
          name,
          code,
          topPulldown: topPulldown || 'N',
          isDefault: isDefault || 'N',
        },
      });

      return { success: true, data: country };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Country with this code already exists');
      }
      throw error;
    }
  }

  async updateCountry(id: number, dto: UpdateCountryDto) {
    const { isDefault, ...updateData } = dto;

    if (isDefault === 'Y') {
      await this.prisma.country.updateMany({
        where: { isDefault: 'Y' },
        data: { isDefault: 'N' },
      });
      updateData['isDefault'] = 'Y';
    }

    try {
      const country = await this.prisma.country.update({
        where: { id },
        data: updateData,
      });

      return { success: true, data: country };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Country not found');
      }
      throw error;
    }
  }

  async deleteCountry(id: number) {
    const cityCount = await this.prisma.city.count({
      where: { country: id },
    });

    if (cityCount > 0) {
      throw new BadRequestException('Cannot delete country with cities');
    }

    try {
      await this.prisma.country.delete({
        where: { id },
      });

      return { success: true, message: 'Country deleted successfully' };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Country not found');
      }
      throw error;
    }
  }

  // ============ Cities ============
  async getCities(filters: any) {
    const {
      page = 1,
      limit = 100,
      search,
      country,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filters;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (country) {
      where.country = Number(country);
    }

    const [total, cities] = await Promise.all([
      this.prisma.city.count({ where }),
      this.prisma.city.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          countryRef: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: cities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getCity(id: number) {
    const city = await this.prisma.city.findUnique({
      where: { id },
      include: {
        countryRef: true,
      },
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    return { success: true, data: city };
  }

  async createCity(dto: CreateCityDto) {
    const { name, country, isDefault = 'N' } = dto;

    if (isDefault === 'Y') {
      await this.prisma.city.updateMany({
        where: { country: Number(country), isDefault: 'Y' },
        data: { isDefault: 'N' },
      });
    }

    const city = await this.prisma.city.create({
      data: {
        name,
        country: Number(country),
        isDefault: isDefault || 'N',
      },
      include: {
        countryRef: true,
      },
    });

    return { success: true, data: city };
  }

  async updateCity(id: number, dto: UpdateCityDto) {
    const { isDefault, country, ...updateData } = dto;

    const updatePayload: any = { ...updateData };
    if (country !== undefined) {
      updatePayload.country = Number(country);
    }

    if (isDefault === 'Y') {
      const city = await this.prisma.city.findUnique({ where: { id } });
      const countryId = country !== undefined ? Number(country) : city?.country;
      if (countryId) {
        await this.prisma.city.updateMany({
          where: { country: countryId, isDefault: 'Y' },
          data: { isDefault: 'N' },
        });
        updatePayload.isDefault = 'Y';
      }
    }

    try {
      const updatedCity = await this.prisma.city.update({
        where: { id },
        data: updatePayload,
        include: {
          countryRef: true,
        },
      });

      return { success: true, data: updatedCity };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('City not found');
      }
      throw error;
    }
  }

  async deleteCity(id: number) {
    try {
      await this.prisma.city.delete({
        where: { id },
      });

      return { success: true, message: 'City deleted successfully' };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('City not found');
      }
      throw error;
    }
  }

  // ============ Languages ============
  async getLanguages(filters: any) {
    const {
      page = 1,
      limit = 100,
      search,
      available,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filters;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (available !== undefined) {
      where.available = available === 'true' || available === true;
    }

    const [total, languages] = await Promise.all([
      this.prisma.language.count({ where }),
      this.prisma.language.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return {
      success: true,
      data: languages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getLanguage(id: string) {
    const language = await this.prisma.language.findUnique({
      where: { id },
    });

    if (!language) {
      throw new NotFoundException('Language not found');
    }

    return { success: true, data: language };
  }

  async createLanguage(dto: CreateLanguageDto) {
    const {
      id,
      name,
      available = false,
      availableGuests = false,
      availableReservations = false,
      isDefault = false,
    } = dto;

    if (isDefault) {
      await this.prisma.language.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    try {
      const language = await this.prisma.language.create({
        data: {
          id,
          name,
          available: available || false,
          availableGuests: availableGuests || false,
          availableReservations: availableReservations || false,
          isDefault: isDefault || false,
        },
      });

      return { success: true, data: language };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Language with this ID already exists');
      }
      throw error;
    }
  }

  async updateLanguage(id: string, dto: UpdateLanguageDto) {
    const { isDefault, ...updateData } = dto;

    if (isDefault === true) {
      await this.prisma.language.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
      updateData['isDefault'] = true;
    }

    try {
      const language = await this.prisma.language.update({
        where: { id },
        data: updateData,
      });

      return { success: true, data: language };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Language not found');
      }
      throw error;
    }
  }

  async deleteLanguage(id: string) {
    try {
      await this.prisma.language.delete({
        where: { id },
      });

      return { success: true, message: 'Language deleted successfully' };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Language not found');
      }
      throw error;
    }
  }

  // ============ Taxes ============
  async getTaxes(filters: any) {
    const {
      page = 1,
      limit = 100,
      search,
      sortBy = 'code',
      sortOrder = 'asc',
    } = filters;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, taxes] = await Promise.all([
      this.prisma.tax.count({ where }),
      this.prisma.tax.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return {
      success: true,
      data: taxes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getTax(id: number) {
    const tax = await this.prisma.tax.findUnique({
      where: { id },
    });

    if (!tax) {
      throw new NotFoundException('Tax not found');
    }

    return { success: true, data: tax };
  }

  async createTax(dto: CreateTaxDto) {
    const {
      code,
      description,
      tax1,
      tax1Text,
      tax2,
      tax2Text,
      tax2On1 = false,
      real = false,
    } = dto;

    try {
      const tax = await this.prisma.tax.create({
        data: {
          code,
          description: description || null,
          tax1: tax1 ? Number(tax1) : null,
          tax1Text: tax1Text || null,
          tax2: tax2 ? Number(tax2) : null,
          tax2Text: tax2Text || null,
          tax2On1: tax2On1 || false,
          real: real || false,
        },
      });

      return { success: true, data: tax };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Tax with this code already exists');
      }
      throw error;
    }
  }

  async updateTax(id: number, dto: UpdateTaxDto) {
    const updateData: any = {};

    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.tax1 !== undefined) updateData.tax1 = dto.tax1 ? Number(dto.tax1) : null;
    if (dto.tax1Text !== undefined) updateData.tax1Text = dto.tax1Text || null;
    if (dto.tax2 !== undefined) updateData.tax2 = dto.tax2 ? Number(dto.tax2) : null;
    if (dto.tax2Text !== undefined) updateData.tax2Text = dto.tax2Text || null;
    if (dto.tax2On1 !== undefined) updateData.tax2On1 = dto.tax2On1;
    if (dto.real !== undefined) updateData.real = dto.real;

    try {
      const tax = await this.prisma.tax.update({
        where: { id },
        data: updateData,
      });

      return { success: true, data: tax };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Tax not found');
      }
      throw error;
    }
  }

  async deleteTax(id: number) {
    try {
      await this.prisma.tax.delete({
        where: { id },
      });

      return { success: true, message: 'Tax deleted successfully' };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Tax not found');
      }
      throw error;
    }
  }

  async getOpeningHours() {
    const days = await this.prisma.workTimeDay.findMany({
      orderBy: { weekday: 'asc' },
    });

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = days.find((d) => d.weekday === i);
      return (
        day || {
          weekday: i,
          startTime: 28800, // 8:00 AM
          endTime: 64800, // 6:00 PM
        }
      );
    });

    return { success: true, data: weekDays };
  }

  async getOpeningHoursDates(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate && endDate) {
      where.workDate = {
        gte: Number(startDate),
        lte: Number(endDate),
      };
    }

    const dates = await this.prisma.workTimeDate.findMany({
      where,
      orderBy: { workDate: 'asc' },
    });

    return { success: true, data: dates };
  }

  async updateOpeningHours(dto: UpdateOpeningHoursDto) {
    await this.prisma.workTimeDay.deleteMany({});

    const enabledDays = dto.days.filter((d) => d.enabled);
    if (enabledDays.length > 0) {
      await this.prisma.workTimeDay.createMany({
        data: enabledDays.map((d) => ({
          weekday: Number(d.weekday),
          startTime: Number(d.startTime),
          endTime: Number(d.endTime),
        })),
      });
    }

    const updatedDays = await this.prisma.workTimeDay.findMany({
      orderBy: { weekday: 'asc' },
    });

    return {
      success: true,
      data: updatedDays,
      message: 'Opening hours updated successfully',
    };
  }

  // ============ Colors (for category color selection) ============
  async getColors() {
    const colors = await this.prisma.colorTable.findMany({
      orderBy: { name: 'asc' },
    });

    return { success: true, data: colors };
  }
}

