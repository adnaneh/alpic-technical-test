import { Type, Transform } from "class-transformer";
import {
  IsArray,
  IsDefined,
  IsOptional,
  IsString,
  IsNotEmpty,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  Equals,
  IsIn,
  MinLength,
} from "class-validator";

export class UIPartDto {
  @IsString()
  @Equals("text")
  type!: string;

  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @MinLength(1)
  text!: string;
}

export class UIMessageDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsIn(["user"])
  role!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1)
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
