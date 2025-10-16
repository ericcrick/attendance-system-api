import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('audit_logs')
export class AuditLog {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User who performed the action' })
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({ description: 'User name for quick reference' })
  @Column({ name: 'user_name' })
  userName: string;

  @ApiProperty({ description: 'Action performed', example: 'CREATE_EMPLOYEE' })
  @Column()
  action: string;

  @ApiProperty({ description: 'Entity type affected', example: 'EMPLOYEE' })
  @Column()
  entity: string;

  @ApiProperty({ description: 'Entity ID affected', required: false })
  @Column({ nullable: true, name: 'entity_id' })
  entityId?: string;

  @ApiProperty({ description: 'Detailed description of the action' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Additional details in JSON format', required: false })
  @Column({ type: 'jsonb', nullable: true })
  details?: any;

  @ApiProperty({ description: 'IP address of the requester', required: false })
  @Column({ nullable: true, name: 'ip_address' })
  ipAddress?: string;

  @ApiProperty({ description: 'User agent string', required: false })
  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent?: string;

  @ApiProperty({ description: 'Result of the action', example: 'SUCCESS' })
  @Column({ default: 'SUCCESS' })
  result: string;

  @ApiProperty({ description: 'Error message if action failed', required: false })
  @Column({ type: 'text', nullable: true, name: 'error_message' })
  errorMessage?: string;

  @ApiProperty({ description: 'Timestamp when action occurred' })
  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;
}