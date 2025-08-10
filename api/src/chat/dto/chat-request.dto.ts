import { UIMessage } from "ai";
import { IsDefined, IsOptional, IsString } from "class-validator";

export class ChatRequestDto {
  @IsString()
  socketId!: string;

  @IsOptional()
  @IsString()
  previousResponseId?: string;

  @IsDefined()
  message!: UIMessage;
}

