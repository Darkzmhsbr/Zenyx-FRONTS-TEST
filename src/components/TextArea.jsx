import React from 'react';
import './Input.css'; // Reusa o estilo do Input

export function TextArea({ label, ...props }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <textarea 
        className="input-field" 
        style={{ minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }} 
        {...props} 
      />
    </div>
  );
}