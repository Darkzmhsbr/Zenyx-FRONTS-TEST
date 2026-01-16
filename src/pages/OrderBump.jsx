import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { orderBumpService } from '../services/api';
import { ShoppingBag, Save, AlertCircle, Image as ImageIcon, Link as LinkIcon, DollarSign, MessageSquare } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { TextArea } from '../components/TextArea';
import Swal from 'sweetalert2';
import './OrderBump.css';

export function OrderBump() {
  const { selectedBot } = useBot();
  const [loading, setLoading] = useState(false);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    ativo: false,
    nome_produto: '',
    preco: '',
    link_acesso: '',
    msg_texto: '',
    msg_media: '',
    btn_aceitar: '✅ SIM, ADICIONAR',
    btn_recusar: '❌ NÃO, OBRIGADO'
  });

  // Carrega dados quando muda o bot
  useEffect(() => {
    if (selectedBot) {
      carregarConfig();
    }
  }, [selectedBot]);

  const carregarConfig = async () => {
    setLoading(true);
    try {
      const data = await orderBumpService.get(selectedBot.id);
      if (data) {
        setFormData({
          ativo: data.ativo ?? false,
          nome_produto: data.nome_produto || '',
          preco: data.preco || '',
          link_acesso: data.link_acesso || '',
          msg_texto: data.msg_texto || '',
          msg_media: data.msg_media || '',
          btn_aceitar: data.btn_aceitar || '✅ SIM, ADICIONAR',
          btn_recusar: data.btn_recusar || '❌ NÃO, OBRIGADO'
        });
      }
    } catch (error) {
      console.error("Erro ao carregar order bump", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome_produto || !formData.preco || !formData.link_acesso) {
      return Swal.fire('Erro', 'Preencha Nome, Preço e Link de Acesso.', 'error');
    }

    try {
      await orderBumpService.save(selectedBot.id, {
        ...formData,
        preco: parseFloat(formData.preco) // Garante que vai como número
      });
      Swal.fire('Sucesso', 'Configurações de Order Bump salvas!', 'success');
    } catch (error) {
      Swal.fire('Erro', 'Falha ao salvar configurações.', 'error');
    }
  };

  if (!selectedBot) {
    return (
      <div className="order-bump-container empty-state">
        <AlertCircle size={48} color="#c333ff" />
        <h2>Nenhum Bot Selecionado</h2>
        <p>Selecione um bot no menu superior para configurar o Order Bump.</p>
      </div>
    );
  }

  return (
    <div className="order-bump-container">
      <div className="page-header">
        <div>
          <h1>Order Bump (Oferta Adicional)</h1>
          <p style={{color:'var(--muted-foreground)'}}>
            Configure uma oferta extra para aparecer no checkout do bot: <strong style={{color:'#c333ff'}}>{selectedBot.nome}</strong>
          </p>
        </div>
        <div className="status-badge">
          STATUS: <span className={formData.ativo ? "active" : "inactive"}>{formData.ativo ? "ATIVO" : "INATIVO"}</span>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="bump-grid">
          
          {/* COLUNA ESQUERDA - DADOS DO PRODUTO */}
          <div className="bump-col">
            <Card>
              <CardContent>
                <div className="card-header-title">
                  <ShoppingBag size={20} color="#c333ff"/>
                  <h3>Dados do Produto</h3>
                </div>

                {/* SWITCH DE ATIVAR */}
                <div className="form-group toggle-group">
                  <label>Ativar Order Bump?</label>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={formData.ativo}
                      onChange={e => setFormData({...formData, ativo: e.target.checked})}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <Input 
                  label="Nome do Produto Extra"
                  placeholder="Ex: Grupo de Fotos Exclusivas"
                  value={formData.nome_produto}
                  onChange={e => setFormData({...formData, nome_produto: e.target.value})}
                  required
                />

                <div className="form-row">
                  <Input 
                    label="Preço Adicional (R$)"
                    type="number"
                    placeholder="Ex: 9.90"
                    value={formData.preco}
                    onChange={e => setFormData({...formData, preco: e.target.value})}
                    icon={<DollarSign size={16}/>}
                    required
                  />
                </div>

                <Input 
                  label="Link do Canal/Grupo VIP"
                  placeholder="https://t.me/+AbCdEfGhIjKlMnOp"
                  value={formData.link_acesso}
                  onChange={e => setFormData({...formData, link_acesso: e.target.value})}
                  icon={<LinkIcon size={16}/>}
                  required
                />
                <p className="helper-text">Este é o link que será entregue junto com o produto principal se o cliente aceitar.</p>

              </CardContent>
            </Card>
          </div>

          {/* COLUNA DIREITA - APARÊNCIA */}
          <div className="bump-col">
            <Card>
              <CardContent>
                <div className="card-header-title">
                  <MessageSquare size={20} color="#c333ff"/>
                  <h3>Mensagem e Aparência</h3>
                </div>

                <TextArea 
                  label="Texto da Oferta"
                  placeholder="Ex: Gostaria de adicionar o acesso ao meu Pack de Fotos por apenas + R$ 9,90?"
                  value={formData.msg_texto}
                  onChange={e => setFormData({...formData, msg_texto: e.target.value})}
                  rows={4}
                />

                <Input 
                  label="Link da Mídia (Imagem ou Vídeo) - Opcional"
                  placeholder="https://exemplo.com/foto.jpg"
                  value={formData.msg_media}
                  onChange={e => setFormData({...formData, msg_media: e.target.value})}
                  icon={<ImageIcon size={16}/>}
                />

                <div className="form-row">
                  <Input 
                    label="Texto Botão Aceitar"
                    value={formData.btn_aceitar}
                    onChange={e => setFormData({...formData, btn_aceitar: e.target.value})}
                  />
                  <Input 
                    label="Texto Botão Recusar"
                    value={formData.btn_recusar}
                    onChange={e => setFormData({...formData, btn_recusar: e.target.value})}
                  />
                </div>

                <div className="preview-buttons">
                  <label>Prévia dos Botões:</label>
                  <div className="telegram-buttons">
                    <button type="button" className="tg-btn accept">{formData.btn_aceitar} (+ R$ {formData.preco || '0'})</button>
                    <button type="button" className="tg-btn decline">{formData.btn_recusar}</button>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>

        <div className="action-bar">
          <Button type="submit" disabled={loading} style={{minWidth: '200px'}}>
            <Save size={18} style={{marginRight:'8px'}}/>
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </form>
    </div>
  );
}