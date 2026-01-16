import React, { useRef } from 'react';
import { Bold, Italic, Underline, Strikethrough, Code, Quote, Link as LinkIcon, EyeOff } from 'lucide-react';
import './RichInput.css';

export function RichInput({ label, value, onChange, placeholder, rows = 4 }) {
  const textareaRef = useRef(null);

  // Função que aplica a formatação HTML
  const applyFormat = (tagStart, tagEnd) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // Se não tiver nada selecionado, apenas insere as tags onde o cursor está
    // Mas a melhor UX é envolver o texto selecionado
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const newText = `${beforeText}${tagStart}${selectedText}${tagEnd}${afterText}`;
    
    // Simula evento de change para atualizar o estado do pai
    // Precisamos manter a estrutura do evento { target: { value: ... } }
    const event = { target: { value: newText } };
    onChange(event);

    // Restaura o foco e ajusta a seleção (opcional, mas bom para UX)
    setTimeout(() => {
      textarea.focus();
      // Coloca o cursor depois da tag de fechamento ou mantém seleção
      const newCursorPos = end + tagStart.length + tagEnd.length; 
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const addLink = () => {
    const url = prompt("Digite a URL do link:", "https://");
    if (url) {
      applyFormat(`<a href="${url}">`, '</a>');
    }
  };

  return (
    <div className="rich-input-container">
      {label && <label className="rich-label">{label}</label>}
      
      <div className="rich-toolbar">
        <button type="button" className="rich-btn" onClick={() => applyFormat('<b>', '</b>')} title="Negrito">
          <Bold size={16} />
        </button>
        <button type="button" className="rich-btn" onClick={() => applyFormat('<i>', '</i>')} title="Itálico">
          <Italic size={16} />
        </button>
        <button type="button" className="rich-btn" onClick={() => applyFormat('<u>', '</u>')} title="Sublinhado">
          <Underline size={16} />
        </button>
        <button type="button" className="rich-btn" onClick={() => applyFormat('<s>', '</s>')} title="Tachado">
          <Strikethrough size={16} />
        </button>
        
        <div className="rich-separator"></div>
        
        <button type="button" className="rich-btn" onClick={() => applyFormat('<span class="tg-spoiler">', '</span>')} title="Spoiler (Oculto)">
          <EyeOff size={16} />
        </button>
        <button type="button" className="rich-btn" onClick={() => applyFormat('<pre>', '</pre>')} title="Bloco de Código (Copiar)">
          <Code size={16} />
        </button>
        <button type="button" className="rich-btn" onClick={() => applyFormat('<blockquote>', '</blockquote>')} title="Citação">
          <Quote size={16} />
        </button>
        
        <div className="rich-separator"></div>

        <button type="button" className="rich-btn" onClick={addLink} title="Link">
          <LinkIcon size={16} />
        </button>
      </div>

      <textarea
        ref={textareaRef}
        className="rich-textarea"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
      <div className="rich-helper">
        * Selecione o texto e clique no ícone para formatar.
      </div>
    </div>
  );
}