// src/modules/departments/dto/department.dto.ts
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEmail, Length } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Department name',
    example: 'Security',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Department code',
    example: 'SEC',
  })
  @IsString()
  @Length(2, 10)
  code: string;

  @ApiPropertyOptional({
    description: 'Department description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Manager name',
  })
  @IsOptional()
  @IsString()
  managerName?: string;

  @ApiPropertyOptional({
    description: 'Manager email',
  })
  @IsOptional()
  @IsEmail()
  managerEmail?: string;
}

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {
  @ApiPropertyOptional({
    description: 'Whether department is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}