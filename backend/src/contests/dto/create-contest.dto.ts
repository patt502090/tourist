import { IsArray, IsDate, IsNotEmpty, IsOptional } from 'class-validator';
import { metadata } from 'src/interfaces/config.interface';
import { User } from 'src/Schemas/user.schema';

export class CreateContestDto {
  @IsNotEmpty()
  title: string;

  description: string;

  status: string;

}
