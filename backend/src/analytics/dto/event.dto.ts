import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

// Frontend-owned event names, per the ownership split in the Data Model doc
// section 5. Backend-owned names are rejected so events can never be
// double-counted from both sides.
export const FRONTEND_EVENT_NAMES = [
  'screen_viewed',
  'signup_started',
  'price_submission_started',
  'price_flag_started',
  'comparison_viewed',
  'comparison_empty_state_viewed',
  'lowest_price_displayed',
  'trend_viewed',
  'trend_insufficient_data_viewed',
  'screen_load_completed',
  'api_error_encountered',
] as const;

const RESPONSE_STATUSES = [
  'LOADING',
  'SUCCESS',
  'EMPTY',
  'VALIDATION_ERROR',
  'AUTHENTICATION_ERROR',
  'NETWORK_ERROR',
  'SERVER_ERROR',
] as const;

const DEVICE_TYPES = ['MOBILE', 'TABLET', 'DESKTOP'] as const;

export class IncomingEventDto {
  @ApiProperty({ example: '6f1c9e6a-3b4d-4e2a-9c8f-1a2b3c4d5e6f' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  clientEventId!: string;

  @ApiProperty({ example: 'comparison_viewed', enum: FRONTEND_EVENT_NAMES })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'ses_a1b2c3' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sessionId!: string;

  @ApiPropertyOptional({ example: 'comparison' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  screenName?: string;

  @ApiPropertyOptional({ example: 'SUCCESS', enum: RESPONSE_STATUSES })
  @IsOptional()
  @IsIn(RESPONSE_STATUSES)
  responseStatus?: string;

  @ApiPropertyOptional({ example: 'VALIDATION_ERROR' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  errorCode?: string;

  @ApiPropertyOptional({ example: 'MOBILE', enum: DEVICE_TYPES })
  @IsOptional()
  @IsIn(DEVICE_TYPES)
  deviceType?: string;

  @ApiPropertyOptional({ example: { itemId: 'cmrm...', marketsDisplayed: 3 } })
  @IsOptional()
  @IsObject()
  properties?: Record<string, unknown>;

  @ApiPropertyOptional({ example: '2026-07-23T10:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  occurredAt?: string;
}

export class CreateEventsDto {
  @ApiProperty({ type: [IncomingEventDto], maxItems: 20 })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20, { message: 'A batch may contain at most 20 events' })
  @ValidateNested({ each: true }) // validates every item in the array
  @Type(() => IncomingEventDto) // tells class-transformer what to instantiate
  events!: IncomingEventDto[];
}

export class EventsResultDto {
  @ApiProperty({ example: 5 })
  accepted!: number;

  @ApiProperty({ example: 1 })
  duplicates!: number;

  @ApiProperty({ example: 0 })
  rejected!: number;
}
