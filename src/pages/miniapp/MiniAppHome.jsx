import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { miniappService } from '../../services/api';

export function MiniAppHome() {
  const { botId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarLoja();
  }, [botId]);

  const carregarLoja = async () => {
    try {
      console.log("Iniciando busca da loja...");
      const resposta = await miniappService.getPublicData(botId);
      console.log("Dados recebidos:", resposta);
      setData(resposta);
    } catch (err) {
      console.error("Erro no front:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <h1 style={{color: 'red', padding: 50}}>CARREGANDO... (Aguarde)</h1>;
  
  if (error) return (
    <div style={{padding: 50, color: 'red'}}>
        <h1>ERRO NO FRONTEND:</h1>
        <p>{error}</p>
    </div>
  );

  if (!data) return <h1 style={{color: 'red', padding: 50}}>DADOS VAZIOS (NULL)</h1>;

  return (
    <div style={{ backgroundColor: '#222', color: '#fff', minHeight: '100vh', padding: 20 }}>
      <h1>✅ SUCESSO! A LOJA CONECTOU!</h1>
      <hr />
      <h3>Configuração Recebida:</h3>
      <pre style={{background: '#000', padding: 10}}>
        {JSON.stringify(data.config, null, 2)}
      </pre>
      
      <h3>Categorias Recebidas:</h3>
      <pre style={{background: '#000', padding: 10}}>
        {JSON.stringify(data.categories, null, 2)}
      </pre>
    </div>
  );
}