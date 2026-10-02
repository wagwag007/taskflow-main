import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ModalTarefa.module.css';

function ModalTarefa({ isOpen, onClose, onSave, onDelete, task }) {
  const [texto, setTexto] = useState('');
  const [prioridade, setPrioridade] = useState('media');
  const [cep, setCep] = useState('');
  const [cepInfo, setCepInfo] = useState(null);
  const [cepErro, setCepErro] = useState('');

  useEffect(() => {
    if (task) {
      setTexto(task.texto || '');
      setPrioridade(task.prioridade || 'media');
      setCep(task.cep || '');
      setCepInfo(task.cepInfo || null);
      setCepErro('');
    } else {
      setTexto('');
      setPrioridade('media');
      setCep('');
      setCepInfo(null);
      setCepErro('');
    }
  }, [task, isOpen]);

  const buscarCep = async (cepValor) => {
    const cepLimpo = cepValor.replace(/\D/g, '').slice(0, 8);
    if (cepLimpo.length !== 8) {
      setCepInfo(null);
      setCepErro('CEP deve ter 8 dígitos.');
      return;
    }

    try {
      setCepErro('');
      const response = await axios.get(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );

      if (response.data.erro) {
        setCepInfo(null);
        setCepErro('CEP não encontrado.');
        return;
      }

      setCepInfo(response.data);
    } catch (error) {
      setCepInfo(null);
      setCepErro('Erro ao buscar o CEP. Tente novamente.');
    }
  };

  const handleCepChange = (e) => {
    const raw = e.target.value;
    const apenasDigitos = raw.replace(/\D/g, '').slice(0, 8);
    setCep(apenasDigitos);
    setCepInfo(null);
    setCepErro('');
    if (apenasDigitos.length === 8) buscarCep(apenasDigitos);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (texto.trim() === '') return;
    const payload = { ...(task || {}), texto, prioridade, cep, cepInfo };
    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        className={styles.modal}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className={styles.title}>{task ? 'Editar tarefa' : 'Nova tarefa'}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Tarefa
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className={styles.input}
              placeholder="Descreva a tarefa..."
            />
          </label>

          <label className={styles.label}>
            Prioridade
            <select
              value={prioridade}
              onChange={(e) => setPrioridade(e.target.value)}
              className={styles.select}
            >
              <option value="alta">🔴 Alta</option>
              <option value="media">🟡 Média</option>
              <option value="baixa">🟢 Baixa</option>
            </select>
          </label>

          <label className={styles.label}>
            CEP (opcional)
            <input
              value={cep}
              onChange={handleCepChange}
              className={styles.input}
              inputMode="numeric"
              maxLength={8}
              placeholder="CEP (opcional)"
            />
          </label>

          {cepInfo && (
            <p className={styles.cepInfo}>
              {cepInfo.logradouro ? `${cepInfo.logradouro}, ` : ''}
              {cepInfo.bairro ? `${cepInfo.bairro} — ` : ''}
              {cepInfo.localidade ? `${cepInfo.localidade}/${cepInfo.uf}` : ''}
            </p>
          )}
          {cepErro && <p className={styles.cepErro}>{cepErro}</p>}

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn}>
              {task ? 'Salvar' : 'Criar'}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            {task && (
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => onDelete && onDelete(task.id)}
              >
                Excluir
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalTarefa;
