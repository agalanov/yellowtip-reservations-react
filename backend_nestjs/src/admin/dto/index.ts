// User DTOs
export class CreateUserDto {
  loginId: string;
  password: string;
  firstName?: string;
  lastName?: string;
  status?: 'ACTIVE' | 'LOCKED';
  roleIds?: number[];
}

export class UpdateUserDto {
  firstName?: string;
  lastName?: string;
  status?: 'ACTIVE' | 'LOCKED';
  password?: string;
  roleIds?: number[];
}

// Category DTOs
export class CreateCategoryDto {
  name: string;
  parentId?: number;
  status?: boolean;
  colorId?: number;
}

export class UpdateCategoryDto {
  name?: string;
  parentId?: number;
  status?: boolean;
  colorId?: number;
}

// Currency DTOs
export class CreateCurrencyDto {
  code: string;
  name: string;
  symbol: string;
  isBase?: boolean;
}

export class UpdateCurrencyDto {
  code?: string;
  name?: string;
  symbol?: string;
  isBase?: boolean;
}

// Role DTOs
export class CreateRoleDto {
  name: string;
  rightIds?: number[];
}

export class UpdateRoleDto {
  name?: string;
  rightIds?: number[];
}

// Access Right DTOs
export class CreateAccessRightDto {
  name: string;
  appName: string;
}

export class UpdateAccessRightDto {
  name?: string;
  appName?: string;
}

// Country DTOs
export class CreateCountryDto {
  name: string;
  code: string;
  topPulldown?: string;
  isDefault?: string;
}

export class UpdateCountryDto {
  name?: string;
  code?: string;
  topPulldown?: string;
  isDefault?: string;
}

// City DTOs
export class CreateCityDto {
  name: string;
  country: number;
  isDefault?: string;
}

export class UpdateCityDto {
  name?: string;
  country?: number;
  isDefault?: string;
}

// Language DTOs
export class CreateLanguageDto {
  id: string;
  name: string;
  available?: boolean;
  availableGuests?: boolean;
  availableReservations?: boolean;
  isDefault?: boolean;
}

export class UpdateLanguageDto {
  name?: string;
  available?: boolean;
  availableGuests?: boolean;
  availableReservations?: boolean;
  isDefault?: boolean;
}

// Tax DTOs
export class CreateTaxDto {
  code: string;
  description?: string;
  tax1?: number;
  tax1Text?: string;
  tax2?: number;
  tax2Text?: string;
  tax2On1?: boolean;
  real?: boolean;
}

export class UpdateTaxDto {
  code?: string;
  description?: string;
  tax1?: number;
  tax1Text?: string;
  tax2?: number;
  tax2Text?: string;
  tax2On1?: boolean;
  real?: boolean;
}

// Opening Hours DTO
export class UpdateOpeningHoursDto {
  days: Array<{
    weekday: number;
    startTime: number;
    endTime: number;
    enabled: boolean;
  }>;
}

