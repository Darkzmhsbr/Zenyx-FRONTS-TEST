import React from 'react';
import './Input.css'; // Reusa o estilo do Input

export function Select({ label, options, placeholder, ...props }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      {/* O React controla o valor aqui no select, não na option */}
      <select className="input-field" {...props}>
        <option value="" disabled>
          {placeholder || "Selecione..."}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
