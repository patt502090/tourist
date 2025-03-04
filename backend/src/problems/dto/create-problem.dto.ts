import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
} from 'class-validator';
import { codesnipet, metadata } from 'src/interfaces/config.interface';
import { testcase } from 'src/Schemas/problem.schema'; // แก้ path เป็นตัวพิมพ์เล็กให้สอดคล้องกับ convention

export class CreateProblemDto {
  @IsNotEmpty()
  title: string;

  description: string;

  @IsEnum(['easy', 'medium', 'hard'])
  difficulty: string;

  @IsNotEmpty()
  sampleInput: string;

  @IsNotEmpty()
  sampleOutput: string;

  @IsNotEmpty()
  testCases: testcase[];

  status: string;

  @IsNotEmpty()
  starterCode: codesnipet[];

  @IsNotEmpty()
  systemCode: codesnipet[];

  @IsNotEmpty()
  metadata: metadata;

  @IsOptional()
  @IsString()
  contestId?: string;

  @IsInt({ message: 'Points must be an integer' })
  @Min(0, { message: 'Points cannot be negative' })
  @IsNotEmpty({ message: 'Points is required' })
  points: number;
}
