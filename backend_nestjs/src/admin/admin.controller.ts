import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser, UserPayload } from '../common/decorators/get-user.decorator';
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

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard
  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  // System Configuration
  @Get('config')
  @ApiOperation({ summary: 'Get system configuration' })
  @ApiQuery({ name: 'grouped', required: false, type: Boolean })
  async getConfig(@Query('grouped') grouped?: string) {
    return this.adminService.getConfig(grouped === 'true');
  }

  @Get('config/:name')
  @ApiOperation({ summary: 'Get single configuration item' })
  async getConfigItem(@Param('name') name: string) {
    return this.adminService.getConfigItem(name);
  }

  @Put('config')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update system configuration (bulk)' })
  async updateConfig(@Body('config') config: Record<string, any>) {
    return this.adminService.updateConfig(config);
  }

  @Post('config')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create configuration item' })
  async createConfigItem(@Body() dto: any) {
    return this.adminService.createConfigItem(dto);
  }

  @Put('config/:name')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update single configuration item' })
  async updateConfigItem(@Param('name') name: string, @Body() dto: any) {
    return this.adminService.updateConfigItem(name, dto);
  }

  @Delete('config/:name')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete configuration item' })
  async deleteConfigItem(@Param('name') name: string) {
    return this.adminService.deleteConfigItem(name);
  }

  // Users
  @Get('users')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users' })
  async getUsers(@Query() filters: any) {
    return this.adminService.getUsers(filters);
  }

  @Post('users')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create user' })
  async createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Put('users/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update user' })
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete user' })
  async deleteUser(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserPayload) {
    return this.adminService.deleteUser(id, user.id);
  }

  // Categories
  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  async getCategories(@Query() filters: any) {
    return this.adminService.getCategories(filters);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category by ID' })
  async getCategory(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getCategory(id);
  }

  @Post('categories')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create category' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(dto);
  }

  @Put('categories/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update category' })
  async updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.adminService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete category' })
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCategory(id);
  }

  // Currencies
  @Get('currencies')
  @ApiOperation({ summary: 'Get all currencies' })
  async getCurrencies(@Query() filters: any) {
    return this.adminService.getCurrencies(filters);
  }

  @Get('currencies/:id')
  @ApiOperation({ summary: 'Get currency by ID' })
  async getCurrency(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getCurrency(id);
  }

  @Post('currencies')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create currency' })
  async createCurrency(@Body() dto: CreateCurrencyDto) {
    return this.adminService.createCurrency(dto);
  }

  @Put('currencies/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update currency' })
  async updateCurrency(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCurrencyDto) {
    return this.adminService.updateCurrency(id, dto);
  }

  @Delete('currencies/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete currency' })
  async deleteCurrency(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCurrency(id);
  }

  // Roles
  @Get('roles')
  @ApiOperation({ summary: 'Get all roles' })
  async getRoles(@Query() filters: any) {
    return this.adminService.getRoles(filters);
  }

  @Get('roles/:id')
  @ApiOperation({ summary: 'Get role by ID' })
  async getRole(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getRole(id);
  }

  @Post('roles')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create role' })
  async createRole(@Body() dto: CreateRoleDto) {
    return this.adminService.createRole(dto);
  }

  @Put('roles/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update role' })
  async updateRole(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.adminService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete role' })
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteRole(id);
  }

  // Access Rights
  @Get('rights')
  @ApiOperation({ summary: 'Get all access rights' })
  async getAccessRights(@Query() filters: any) {
    return this.adminService.getAccessRights(filters);
  }

  @Get('rights/:id')
  @ApiOperation({ summary: 'Get access right by ID' })
  async getAccessRight(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getAccessRight(id);
  }

  @Post('rights')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create access right' })
  async createAccessRight(@Body() dto: CreateAccessRightDto) {
    return this.adminService.createAccessRight(dto);
  }

  @Put('rights/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update access right' })
  async updateAccessRight(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAccessRightDto) {
    return this.adminService.updateAccessRight(id, dto);
  }

  @Delete('rights/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete access right' })
  async deleteAccessRight(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteAccessRight(id);
  }

  // Countries
  @Get('countries')
  @ApiOperation({ summary: 'Get all countries' })
  async getCountries(@Query() filters: any) {
    return this.adminService.getCountries(filters);
  }

  @Get('countries/:id')
  @ApiOperation({ summary: 'Get country by ID' })
  async getCountry(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getCountry(id);
  }

  @Post('countries')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create country' })
  async createCountry(@Body() dto: CreateCountryDto) {
    return this.adminService.createCountry(dto);
  }

  @Put('countries/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update country' })
  async updateCountry(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCountryDto) {
    return this.adminService.updateCountry(id, dto);
  }

  @Delete('countries/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete country' })
  async deleteCountry(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCountry(id);
  }

  // Cities
  @Get('cities')
  @ApiOperation({ summary: 'Get all cities' })
  async getCities(@Query() filters: any) {
    return this.adminService.getCities(filters);
  }

  @Get('cities/:id')
  @ApiOperation({ summary: 'Get city by ID' })
  async getCity(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getCity(id);
  }

  @Post('cities')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create city' })
  async createCity(@Body() dto: CreateCityDto) {
    return this.adminService.createCity(dto);
  }

  @Put('cities/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update city' })
  async updateCity(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCityDto) {
    return this.adminService.updateCity(id, dto);
  }

  @Delete('cities/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete city' })
  async deleteCity(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCity(id);
  }

  // Languages
  @Get('languages')
  @ApiOperation({ summary: 'Get all languages' })
  async getLanguages(@Query() filters: any) {
    return this.adminService.getLanguages(filters);
  }

  @Get('languages/:id')
  @ApiOperation({ summary: 'Get language by ID' })
  async getLanguage(@Param('id') id: string) {
    return this.adminService.getLanguage(id);
  }

  @Post('languages')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create language' })
  async createLanguage(@Body() dto: CreateLanguageDto) {
    return this.adminService.createLanguage(dto);
  }

  @Put('languages/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update language' })
  async updateLanguage(@Param('id') id: string, @Body() dto: UpdateLanguageDto) {
    return this.adminService.updateLanguage(id, dto);
  }

  @Delete('languages/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete language' })
  async deleteLanguage(@Param('id') id: string) {
    return this.adminService.deleteLanguage(id);
  }

  // Taxes
  @Get('taxes')
  @ApiOperation({ summary: 'Get all taxes' })
  async getTaxes(@Query() filters: any) {
    return this.adminService.getTaxes(filters);
  }

  @Get('taxes/:id')
  @ApiOperation({ summary: 'Get tax by ID' })
  async getTax(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getTax(id);
  }

  @Post('taxes')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create tax' })
  async createTax(@Body() dto: CreateTaxDto) {
    return this.adminService.createTax(dto);
  }

  @Put('taxes/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update tax' })
  async updateTax(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaxDto) {
    return this.adminService.updateTax(id, dto);
  }

  @Delete('taxes/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete tax' })
  async deleteTax(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteTax(id);
  }

  // Opening Hours
  @Get('opening-hours')
  @ApiOperation({ summary: 'Get opening hours' })
  async getOpeningHours() {
    return this.adminService.getOpeningHours();
  }

  @Get('opening-hours/dates')
  @ApiOperation({ summary: 'Get specific date opening hours' })
  async getOpeningHoursDates(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.adminService.getOpeningHoursDates(startDate, endDate);
  }

  @Put('opening-hours')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update opening hours' })
  async updateOpeningHours(@Body() dto: UpdateOpeningHoursDto) {
    return this.adminService.updateOpeningHours(dto);
  }

  // Colors (for category color selection)
  @Get('colors')
  @ApiOperation({ summary: 'Get all colors' })
  async getColors() {
    return this.adminService.getColors();
  }
}

