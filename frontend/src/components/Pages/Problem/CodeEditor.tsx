import { Editor, OnChange, OnMount } from '@monaco-editor/react';

const CodeEditor: React.FC<{
  code: string;
  language: string;
  theme: string;
  onChange: OnChange | undefined;
  onMount: OnMount | undefined;
}> = ({ code, language, theme, onChange, onMount }) => {
  return (
    <Editor
      theme={theme}
      language={language === 'c#' ? 'csharp' : language === 'c++' ? 'cpp' : language}
      value={code}
      className='tw-max-h-full tw-overflow-x-auto tw-max-w-dvw'
      onMount={onMount}
      options={{
        automaticLayout: true,
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
      }}
      onChange={onChange}
    />
  );
};
export default CodeEditor;
