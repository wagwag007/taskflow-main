import { useEffect, useState } from 'react';
import styles from './ModalTarefa.module.css';

function ModalTarefa({ isOpen, onClose, onSave, onDelete, task }) {
  const [texto, setTexto] = useState('');
  const [prioridade, setPrioridade] = useState('media');

  useEffect(() => {
    if (task) {
      setTexto(task.texto || '');
      setPrioridade(task.prioridade || 'media');
    } else {
      setTexto('');
      setPrioridade('media');
    }
  }, [task, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (texto.trim() === '') return;
    const payload = { ...(task || {}), texto, prioridade };
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
