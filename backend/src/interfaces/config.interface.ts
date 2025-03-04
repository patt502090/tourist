interface ApiConfigProps {
  apiUrl: string;
  httpTimeout: number;
}

interface MongodbConfigProps {
  connectionString: string;
  databaseName: string;
}

export interface ConfigProps {
  port: number;
  api: ApiConfigProps;
  mongodb: {
    database: MongodbConfigProps;
  };
}
export interface signup {
  access_token: string;
  message: string;
}

export interface codesnipet {
  lang_id: number;
  code: string;
}

export interface metadata {
  input_format: string;
  output_format: string;
  judge_input_temple: string;
  variable_names: Record<string, string>;
  variable_types: Record<string, string>;
}

export interface submission {
  problemId: string;
  submissionId: string;
  languageId: number;
  status: string;
  submittedAt: Date;
}
export enum supportedlanguages {
  'C' = 50,
  'C++' = 54,
  'C#' = 51,
  'Go' = 95,
  'Java' = 91,
  'JavaScript' = 93,
  'Python' = 92,
  '.NET' = 84,
  'TypeScript' = 101,
  'R' = 99,
  'Prolog' = 69,
  'Plain_Text' = 43,
  'Perl' = 85,
  'Pascal' = 67,
  'Kotlin' = 39,
  'COBOL' = 77,
  'Bash' = 46,
  'Assembly' = 45,
}
