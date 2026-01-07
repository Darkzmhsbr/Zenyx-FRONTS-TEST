import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, MessageSquare, Clock } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input'; // Vamos improvisar um TextArea usando o CSS do Input
import './Bots.css';

export function BotConfig() {
  const { id } = useParams(); // Pega o ID do bot da URL
  const navigate = useNavigate();
  
  const [welcomeMsg, setWelcomeMsg] = useState("Olá! Seja bem-vindo ao nosso atendimento.");
  const [fallbackMsg, setFallbackMsg] = useState("Não entendi. Digite /ajuda para ver as opções.");

  return (
    <div className="bots-container">
      
      <div className="bots-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Button variant="ghost" size="icon" onClick={() => navigate('/bots')}>
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1>Configurar Bot #{id}</h1>
            <p style={{ color: 'var(--muted-foreground)' }}>Personalize as respostas automáticas.</p>
          </div>
        </div>
        <Button onClick={() => alert("Configurações Salvas!")}>
          <Save size={18} /> Salvar Alterações
        </Button>
      </div>

      <div className="bots-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Card de Boas-vindas */}
        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: 'var(--primary)' }}>
              <MessageSquare size={24} />
              <h3 style={{ margin: 0, color: 'var(--foreground)' }}>Boas-vindas</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginBottom: '15px' }}>
              Enviada assim que o usuário clica em "Começar" ou envia a primeira mensagem.
            </p>
            <textarea 
              className="input-field" 
              style={{ minHeight: '120px', resize: 'vertical', fontFamily: 'inherit' }}
              value={welcomeMsg}
              onChange={(e) => setWelcomeMsg(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Card de Resposta Padrão */}
        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#f59e0b' }}>
              <Clock size={24} />
              <h3 style={{ margin: 0, color: 'var(--foreground)' }}>Mensagem de Erro/Padrão</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginBottom: '15px' }}>
              Enviada quando o bot não entende o comando do usuário.
            </p>
            <textarea 
              className="input-field" 
              style={{ minHeight: '120px', resize: 'vertical', fontFamily: 'inherit' }}
              value={fallbackMsg}
              onChange={(e) => setFallbackMsg(e.target.value)}
            />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}