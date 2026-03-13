import { Prism as ReactSyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function SyntaxHighlighter({ code, language }) {
  const highlightCppCode = (code) => {
    // Define C++ keywords, types, and patterns
    const keywords = [
      'class', 'public', 'private', 'protected', 'virtual', 'override',
      'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
      'return', 'break', 'continue', 'goto', 'try', 'catch', 'throw',
      'new', 'delete', 'sizeof', 'typeof', 'const', 'static', 'extern',
      'inline', 'template', 'typename', 'namespace', 'using', 'typedef',
      'struct', 'union', 'enum', 'auto', 'void', 'bool', 'true', 'false',
      'nullptr', 'this'
    ];

    const types = [
      'int', 'char', 'float', 'double', 'long', 'short', 'unsigned',
      'signed', 'string', 'vector', 'map', 'unordered_map', 'set',
      'unordered_set', 'pair', 'queue', 'stack', 'deque', 'list',
      'array', 'bitset', 'priority_queue'
    ];

    const preprocessor = [
      '#include', '#define', '#ifdef', '#ifndef', '#endif', '#pragma'
    ];

    let result = code;

    // --- Step 1: Extract comments and strings, replace with placeholders ---
    const placeholders = [];
    let placeholderIdx = 0;

    // Helper to push and return placeholder
    function makePlaceholder(type, value) {
      const key = `__PLACEHOLDER_${type}_${placeholderIdx}__`;
      placeholders.push({ key, value });
      placeholderIdx++;
      return key;
    }

    // Replace multi-line comments
    result = result.replace(/\/\*[\s\S]*?\*\//g, (match) => makePlaceholder('COMMENT', match));
    // Replace single-line comments
    result = result.replace(/\/\/.*$/gm, (match) => makePlaceholder('COMMENT', match));
    // Replace string literals
    result = result.replace(/"([^"\\]|\\.)*"/g, (match) => makePlaceholder('STRING', match));

    // --- Step 2: Highlight everything else ---
    // Highlight preprocessor directives
    preprocessor.forEach(prep => {
      const regex = new RegExp(`\\b${prep}\\b`, 'g');
      result = result.replace(regex, `<span class="preprocessor">${prep}</span>`);
    });

    // Highlight include statements
    result = result.replace(
      /(#include\s*)<([^>]+)>/g,
      '$1<span class="string">&lt;$2&gt;</span>'
    );

    // Highlight numbers
    result = result.replace(
      /\b\d+(\.\d+)?f?\b/g,
      '<span class="number">$&</span>'
    );

    // Highlight keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      result = result.replace(regex, `<span class="keyword">${keyword}</span>`);
    });

    // Highlight types
    types.forEach(type => {
      const regex = new RegExp(`\\b${type}\\b`, 'g');
      result = result.replace(regex, `<span class="type">${type}</span>`);
    });

    // Highlight function calls
    result = result.replace(
      /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,
      '<span class="function">$1</span>'
    );

    // Highlight variable names in declarations
    result = result.replace(
      /(\b(?:int|char|float|double|long|short|bool|string|vector|map|unordered_map|set|auto)\s+)([a-zA-Z_][a-zA-Z0-9_]*)/g,
      '$1<span class="variable">$2</span>'
    );

    // --- Step 3: Restore comments and strings ---
    // Comments get .cpp-comment, strings get .string
    placeholders.forEach(({ key, value }) => {
      let html;
      if (value.startsWith('/*') || value.startsWith('//')) {
        html = `<span class="cpp-comment">${value}</span>`;
      } else {
        html = `<span class="string">${value}</span>`;
      }
      result = result.replace(key, html);
    });

    return result;
  }




    const formattedCode = code.split('\\n').join('\n');
    return (
      <ReactSyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers
        wrapLines
        customStyle={{ fontSize: 15, borderRadius: 8, margin: 0 }}
        codeTagProps={{ style: { fontFamily: 'Fira Code, Monaco, Consolas, monospace' } }}
      >
        {formattedCode}
      </ReactSyntaxHighlighter>
    );
}

export default SyntaxHighlighter