import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsOptional,
  IsString,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';

export class UIPartDto {
  @IsString()
  type!: string;

  @IsString()
  @IsNotEmpty()
  text!: string;
}

export class UIMessageDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  role!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UIPartDto)
  parts!: UIPartDto[];
}

export class ChatRequestDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => UIMessageDto)
  message!: UIMessageDto;

  @IsOptional()
  @IsString()
  previousResponseId?: string;

  @IsString()
  @IsNotEmpty()
  socketId!: string;
}
