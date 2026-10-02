import styles from './TarefaItem.module.css';

function TarefaItem({
  texto,
  concluida = false,
  prioridade = 'media',
  status = 'pending',
  cep,
  cepInfo,
  onDeletar,
  onConcluir,
  onStatusChange,
  onEditar,
}) {
  const classeItem =
    (concluida ? styles.tarefa + ' ' + styles.concluida : styles.tarefa) +
    ' ' +
    styles[prioridade];

  const classeTexto =
    concluida
      ? styles.textoTarefa + ' ' + styles['texto-tarefa']
      : styles.textoTarefa;

  const classePrioridade =
    styles['badge-prioridade'] + ' ' + styles['badge-' + prioridade];

  const endereco = cepInfo
    ? `${cepInfo.logradouro || ''}${cepInfo.logradouro ? ', ' : ''}${cepInfo.bairro || ''}${cepInfo.bairro ? ' — ' : ''}${cepInfo.localidade || ''}${cepInfo.uf ? `/${cepInfo.uf}` : ''}`
    : cep
    ? `CEP: ${cep}`
    : null;

  return (
    <li className={classeItem}>
      <div className={styles.taskContent}>
        <div>
          <span className={classeTexto} onClick={onConcluir}>
            {texto}
          </span>
          {endereco && <span className={styles.cepDados}>{endereco}</span>}
        </div>
        <span className={classePrioridade}>{prioridade}</span>
      </div>
      <div className={styles.taskActions}>
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => onEditar && onEditar()}
        >
          Editar
        </button>
        {status !== 'pending' && (
          <button
            type='button'
            className={styles.actionButton}
            onClick={() => onStatusChange('pending')}
          >
            Pendentes
          </button>
        )}
        {status !== 'inprogress' && (
          <button
            type='button'
            className={styles.actionButton}
            onClick={() => onStatusChange('inprogress')}
          >
            Em Andamento
          </button>
        )}
        {status !== 'done' && (
          <button
            type='button'
            className={styles.actionButton}
            onClick={() => onStatusChange('done')}
          >
            Concluídas
          </button>
        )}
        <button className={styles.btnDeletar} onClick={onDeletar}>
          Excluir
        </button>
      </div>
    </li>
  );
}

export default TarefaItem;
