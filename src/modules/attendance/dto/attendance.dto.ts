// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// import { IsString, IsOptional, IsEnum, IsUUID, IsArray, IsDateString } from 'class-validator';
// import { AuthMethod } from '../../../common/enums';

// export class ClockInDto {
//   @ApiProperty({
//     description: 'Employee ID (UUID)',
//     example: '123e4567-e89b-12d3-a456-426614174000',
//   })
//   @IsUUID()
//   employeeId: string;

//   @ApiProperty({
//     description: 'Authentication method used',
//     enum: AuthMethod,
//     example: AuthMethod.RFID,
//   })
//   @IsEnum(AuthMethod)
//   method: AuthMethod;

//   @ApiPropertyOptional({
//     description: 'RFID card ID (required if method is RFID)',
//     example: 'RFID-12345',
//   })
//   @IsOptional()
//   @IsString()
//   rfidCardId?: string;

//   @ApiPropertyOptional({
//     description: 'PIN code (required if method is PIN)',
//     example: '1234',
//   })
//   @IsOptional()
//   @IsString()
//   pinCode?: string;

//   @ApiPropertyOptional({
//     description: 'Face encoding data (required if method is FACIAL)',
//   })
//   @IsOptional()
//   @IsArray()
//   faceEncoding?: number[];

//   @ApiPropertyOptional({
//     description: 'Photo URL for audit trail',
//   })
//   @IsOptional()
//   @IsString()
//   photoUrl?: string;

//   @ApiPropertyOptional({
//     description: 'Station/kiosk identifier',
//     example: 'KIOSK-01',
//   })
//   @IsOptional()
//   @IsString()
//   location?: string;
// }

// export class ClockOutDto {
//   @ApiProperty({
//     description: 'Employee ID (UUID)',
//     example: '123e4567-e89b-12d3-a456-426614174000',
//   })
//   @IsUUID()
//   employeeId: string;

//   @ApiProperty({
//     description: 'Authentication method used',
//     enum: AuthMethod,
//     example: AuthMethod.RFID,
//   })
//   @IsEnum(AuthMethod)
//   method: AuthMethod;

//   @ApiPropertyOptional({
//     description: 'RFID card ID (required if method is RFID)',
//   })
//   @IsOptional()
//   @IsString()
//   rfidCardId?: string;

//   @ApiPropertyOptional({
//     description: 'PIN code (required if method is PIN)',
//   })
//   @IsOptional()
//   @IsString()
//   pinCode?: string;

//   @ApiPropertyOptional({
//     description: 'Face encoding data (required if method is FACIAL)',
//   })
//   @IsOptional()
//   @IsArray()
//   faceEncoding?: number[];

//   @ApiPropertyOptional({
//     description: 'Photo URL for audit trail',
//   })
//   @IsOptional()
//   @IsString()
//   photoUrl?: string;

//   @ApiPropertyOptional({
//     description: 'Station/kiosk identifier',
//   })
//   @IsOptional()
//   @IsString()
//   location?: string;

//   @ApiPropertyOptional({
//     description: 'Additional notes for clock out',
//   })
//   @IsOptional()
//   @IsString()
//   notes?: string;
// }

// export class VerifyEmployeeDto {
//   @ApiProperty({
//     description: 'Authentication method to use',
//     enum: AuthMethod,
//   })
//   @IsEnum(AuthMethod)
//   method: AuthMethod;

//   @ApiPropertyOptional({
//     description: 'RFID card ID',
//   })
//   @IsOptional()
//   @IsString()
//   rfidCardId?: string;

//   @ApiPropertyOptional({
//     description: 'Employee ID and PIN code (for PIN method)',
//   })
//   @IsOptional()
//   @IsString()
//   employeeId?: string;

//   @ApiPropertyOptional({
//     description: 'PIN code',
//   })
//   @IsOptional()
//   @IsString()
//   pinCode?: string;

//   @ApiPropertyOptional({
//     description: 'Face encoding for facial recognition',
//   })
//   @IsOptional()
//   @IsArray()
//   faceEncoding?: number[];
// }

// export class GetAttendanceQueryDto {
//   @ApiPropertyOptional({
//     description: 'Employee ID',
//   })
//   @IsOptional()
//   @IsUUID()
//   employeeId?: string;

//   @ApiPropertyOptional({
//     description: 'Start date (ISO format)',
//     example: '2024-10-01',
//   })
//   @IsOptional()
//   @IsDateString()
//   startDate?: string;

//   @ApiPropertyOptional({
//     description: 'End date (ISO format)',
//     example: '2024-10-31',
//   })
//   @IsOptional()
//   @IsDateString()
//   endDate?: string;

//   @ApiPropertyOptional({
//     description: 'Department filter',
//   })
//   @IsOptional()
//   @IsString()
//   department?: string;
// }




import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID, IsArray, IsDateString } from 'class-validator';
import { AuthMethod } from '../../../common/enums';

export class ClockInDto {
  @ApiProperty({
    description: 'Employee ID (e.g., EMP-001)',
    example: 'EMP-001',
  })
  @IsString()
  employeeId: string;

  @ApiProperty({
    description: 'Authentication method used',
    enum: AuthMethod,
    example: AuthMethod.RFID,
  })
  @IsEnum(AuthMethod)
  method: AuthMethod;

  @ApiPropertyOptional({
    description: 'RFID card ID (required if method is RFID)',
    example: 'RFID-12345',
  })
  @IsOptional()
  @IsString()
  rfidCardId?: string;

  @ApiPropertyOptional({
    description: 'PIN code (required if method is PIN)',
    example: '1234',
  })
  @IsOptional()
  @IsString()
  pinCode?: string;

  @ApiPropertyOptional({
    description: 'Face encoding data (required if method is FACIAL)',
  })
  @IsOptional()
  @IsArray()
  faceEncoding?: number[];

  @ApiPropertyOptional({
    description: 'Photo URL for audit trail',
  })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({
    description: 'Station/kiosk identifier',
    example: 'KIOSK-01',
  })
  @IsOptional()
  @IsString()
  location?: string;
}

export class ClockOutDto {
  @ApiProperty({
    description: 'Employee ID (e.g., EMP-001)',
    example: 'EMP-001',
  })
  @IsString()
  employeeId: string;

  @ApiProperty({
    description: 'Authentication method used',
    enum: AuthMethod,
    example: AuthMethod.RFID,
  })
  @IsEnum(AuthMethod)
  method: AuthMethod;

  @ApiPropertyOptional({
    description: 'RFID card ID (required if method is RFID)',
  })
  @IsOptional()
  @IsString()
  rfidCardId?: string;

  @ApiPropertyOptional({
    description: 'PIN code (required if method is PIN)',
  })
  @IsOptional()
  @IsString()
  pinCode?: string;

  @ApiPropertyOptional({
    description: 'Face encoding data (required if method is FACIAL)',
  })
  @IsOptional()
  @IsArray()
  faceEncoding?: number[];

  @ApiPropertyOptional({
    description: 'Photo URL for audit trail',
  })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({
    description: 'Station/kiosk identifier',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Additional notes for clock out',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class VerifyEmployeeDto {
  @ApiProperty({
    description: 'Authentication method to use',
    enum: AuthMethod,
  })
  @IsEnum(AuthMethod)
  method: AuthMethod;

  @ApiPropertyOptional({
    description: 'RFID card ID',
  })
  @IsOptional()
  @IsString()
  rfidCardId?: string;

  @ApiPropertyOptional({
    description: 'Employee ID and PIN code (for PIN method)',
  })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({
    description: 'PIN code',
  })
  @IsOptional()
  @IsString()
  pinCode?: string;

  @ApiPropertyOptional({
    description: 'Face encoding for facial recognition',
  })
  @IsOptional()
  @IsArray()
  faceEncoding?: number[];
}

export class GetAttendanceQueryDto {
  @ApiPropertyOptional({
    description: 'Employee ID',
  })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional({
    description: 'Start date (ISO format)',
    example: '2024-10-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date (ISO format)',
    example: '2024-10-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Department filter',
  })
  @IsOptional()
  @IsString()
  department?: string;
}