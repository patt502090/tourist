import { IsNotEmpty } from 'class-validator';
import { metadata } from 'src/interfaces/config.interface';

export class CreateContestDto {
  @IsNotEmpty()
  title: string;

  description: string;

  status: string;

  @IsNotEmpty()
  metadata: metadata;
}
